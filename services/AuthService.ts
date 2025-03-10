import { auth, firestore } from "../api/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

// Interface for user data
export interface UserData {
  name: string;
  email: string;
  preferences: {
    allergies: string[];
    dietType: string;
    calorieGoal: number;
  };
}

class AuthService {
  // Register a new user
  public async registerUser(
    email: string,
    password: string,
    name: string
  ): Promise<void> {
    if (!name || !email || !password) {
      throw new Error("All fields are required.");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );

    const userData: UserData = {
      name,
      email,
      preferences: {
        allergies: [],
        dietType: "",
        calorieGoal: 2000,
      },
    };

    await firestore
      .collection("users")
      .doc(userCredential.user.uid)
      .set(userData);
  }

  // Login with email and password
  public async loginWithEmailPassword(
    email: string,
    password: string
  ): Promise<void> {
    if (!email || !password) {
      throw new Error("Please fill in all fields");
    }

    await auth.signInWithEmailAndPassword(email, password);

    // Store credentials for fingerprint login
    await this.storeCredentials(email, password);
  }

  // Store credentials securely for fingerprint login
  private async storeCredentials(
    email: string,
    password: string
  ): Promise<void> {
    await AsyncStorage.setItem("email", email);
    await AsyncStorage.setItem("password", password);
    await AsyncStorage.setItem("fingerprintEnabled", "true");
  }

  // Check if fingerprint login is enabled
  public async isFingerprintEnabled(): Promise<boolean> {
    try {
      const storedSetting = await AsyncStorage.getItem("fingerprintEnabled");
      return storedSetting === "true";
    } catch (error) {
      console.error("Error checking fingerprint settings:", error);
      return false;
    }
  }

  // Get stored credentials (email and password)
  public async getStoredCredentials(): Promise<{
    email: string;
    password: string;
  } | null> {
    try {
      const email = await AsyncStorage.getItem("email");
      const password = await AsyncStorage.getItem("password");

      if (email && password) {
        return { email, password };
      }
      return null;
    } catch (error) {
      console.error("Error retrieving stored credentials:", error);
      return null;
    }
  }

  // Authenticate with fingerprint
  public async authenticateWithFingerprint(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Login with fingerprint",
      fallbackLabel: "Use password",
    });

    return result.success;
  }

  // Login with fingerprint
  public async loginWithFingerprint(): Promise<void> {
    const authenticated = await this.authenticateWithFingerprint();

    if (!authenticated) {
      throw new Error("Fingerprint authentication failed");
    }

    const credentials = await this.getStoredCredentials();

    if (!credentials) {
      throw new Error("No credentials stored for fingerprint login.");
    }

    await auth.signInWithEmailAndPassword(
      credentials.email,
      credentials.password
    );
  }

  // Logout
  public async logout(): Promise<void> {
    await auth.signOut();
  }

  // Get current user
  public getCurrentUser() {
    return auth.currentUser;
  }

  // Get user data from Firestore
  public async getUserData(userId: string): Promise<UserData | null> {
    try {
      const doc = await firestore.collection("users").doc(userId).get();

      if (doc.exists) {
        return doc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }
}

// Export as singleton
const authService = new AuthService();
export default authService;
