import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Title, Text, Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth } from "../api/firebase";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import styles from "../styles/LoginStyle";

// Define the navigation type
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

// Define props type for the component
type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Login">;
};

// Interface for component state
interface LoginState {
  email: string;
  password: string;
  visible: boolean;
  snackbarMessage: string;
  fingerprintEnabled: boolean;
  isLoading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // State with type definitions
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [fingerprintEnabled, setFingerprintEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    void checkFingerprintSettings();
  }, []);

  const checkFingerprintSettings = async (): Promise<void> => {
    try {
      const storedSetting = await AsyncStorage.getItem("fingerprintEnabled");
      setFingerprintEnabled(storedSetting === "true");

      const savedEmail = await AsyncStorage.getItem("email");
      const savedPassword = await AsyncStorage.getItem("password");

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
      }
    } catch (error) {
      console.error("Error checking fingerprint settings:", error);
    }
  };

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setSnackbarMessage("Please fill in all fields");
      setVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("password", password);
      await AsyncStorage.setItem("fingerprintEnabled", "true");
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
      setVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintLogin = async (): Promise<void> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with fingerprint",
        fallbackLabel: "Use password",
      });

      if (result.success) {
        setIsLoading(true);
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPassword = await AsyncStorage.getItem("password");

        if (storedEmail && storedPassword) {
          await auth.signInWithEmailAndPassword(storedEmail, storedPassword);
        } else {
          setSnackbarMessage("No credentials stored for fingerprint login.");
          setVisible(true);
        }
      } else {
        setSnackbarMessage("Fingerprint authentication failed");
        setVisible(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred during fingerprint authentication");
      setVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Tervetuloa!</Title>
        <Title style={styles.appTitle}>Meal Planning Mate!</Title>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Icon name="food-variant" size={80} color="#6200ea" />
        </View>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          mode="outlined"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="email" color="#6200ea" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="lock" color="#6200ea" />}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.loginButton}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>

        {fingerprintEnabled && (
          <Button
            mode="outlined"
            onPress={handleFingerprintLogin}
            style={styles.fingerprintButton}
            icon="fingerprint"
          >
            Login with Fingerprint
          </Button>
        )}

        <Button
          onPress={() => navigation.navigate("Register")}
          style={styles.registerButton}
          labelStyle={styles.registerButtonText}
        >
          Don't have an account? Register
        </Button>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: "Close",
            onPress: () => setVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </View>
  );
};

export default LoginScreen;
