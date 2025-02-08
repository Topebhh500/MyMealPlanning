import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import {
  Title,
  TextInput,
  Button,
  Chip,
  Snackbar,
  Avatar,
  Switch,
  Text,
  Surface,
} from "react-native-paper";
import { auth, firestore, storage } from "../api/firebase";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageSourcePropType } from "react-native";
import styles from "../styles/ProfileStyle";

interface UserData {
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
  calorieGoal: number;
  profilePicture?: string;
}

interface SnackbarState {
  visible: boolean;
  message: string;
  type: "success" | "error";
}

const ProfileScreen: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [calorieGoal, setCalorieGoal] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [fingerprintEnabled, setFingerprintEnabled] = useState<boolean>(false);
  const [fingerprintSupported, setFingerprintSupported] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const allergyOptions: string[] = [
    "Dairy",
    "Eggs",
    "Nuts",
    "Shellfish",
    "Wheat",
    "Pork",
    "Garlic",
  ];

  const dietaryPreferenceOptions: string[] = [
    "Balanced",
    "High-Protein",
    "Low-Carb",
    "Vegetarian",
    "Vegan",
  ];

  useEffect(() => {
    void loadUserData();
    void checkBiometricSupport();
    void checkFingerprintSettings();
  }, []);

  const checkBiometricSupport = async (): Promise<void> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setFingerprintSupported(compatible);
  };

  const checkFingerprintSettings = async (): Promise<void> => {
    const storedSetting = await AsyncStorage.getItem("fingerprintEnabled");
    setFingerprintEnabled(storedSetting === "true");
  };

  const loadUserData = async (): Promise<void> => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data() as UserData;
          setName(userData.name || "");
          setAllergies(userData.allergies || []);
          setDietaryPreferences(userData.dietaryPreferences || []);
          setCalorieGoal(userData.calorieGoal?.toString() || "");
          setProfilePicture(userData.profilePicture || null);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showSnackbar("Failed to load user data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveUserData = async (): Promise<void> => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userData: UserData = {
          name,
          allergies,
          dietaryPreferences,
          calorieGoal: parseInt(calorieGoal) || 0,
          profilePicture: profilePicture || undefined,
        };

        await firestore.collection("users").doc(user.uid).update(userData);
        showSnackbar("Profile updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      showSnackbar("Failed to update profile. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (
    message: string,
    type: "success" | "error" = "success"
  ): void => {
    setSnackbarMessage(message);
    setVisible(true);
  };

  const toggleAllergy = (allergy: string): void => {
    setAllergies(
      allergies.includes(allergy)
        ? allergies.filter((a) => a !== allergy)
        : [...allergies, allergy]
    );
  };

  const toggleDietaryPreference = (preference: string): void => {
    setDietaryPreferences(
      dietaryPreferences.includes(preference)
        ? dietaryPreferences.filter((p) => p !== preference)
        : [...dietaryPreferences, preference]
    );
  };

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setLoading(true);
        await uploadImage(result.assets[0].uri);
        showSnackbar("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showSnackbar("Failed to update profile picture", "error");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (uri: string): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ref = storage.ref().child(`profilePictures/${user.uid}`);
      await ref.put(blob);
      const url = await ref.getDownloadURL();
      setProfilePicture(url);
    }
  };

  const toggleFingerprintLogin = async (): Promise<void> => {
    try {
      const newSetting = !fingerprintEnabled;
      await AsyncStorage.setItem("fingerprintEnabled", newSetting.toString());
      setFingerprintEnabled(newSetting);
      showSnackbar(`Fingerprint login ${newSetting ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling fingerprint:", error);
      showSnackbar("Failed to update fingerprint settings", "error");
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      showSnackbar("Failed to sign out", "error");
    }
  };

  const defaultAvatar: ImageSourcePropType = require("../assets/default-avatar.jpg");

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={profilePicture ? { uri: profilePicture } : defaultAvatar}
            style={styles.avatar}
          />
          <Button
            mode="outlined"
            onPress={pickImage}
            style={styles.uploadButton}
            icon="camera"
          >
            Change Photo
          </Button>
        </View>
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Personal Information</Title>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          outlineColor="#6200ea"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="account" color="#6200ea" />}
        />

        <TextInput
          label="Daily Calorie Target"
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          outlineColor="#6200ea"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="fire" color="#6200ea" />}
        />
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Allergies</Title>
        <View style={styles.chipsContainer}>
          {allergyOptions.map((allergy) => (
            <Chip
              key={allergy}
              selected={allergies.includes(allergy)}
              onPress={() => toggleAllergy(allergy)}
              style={[
                styles.chip,
                allergies.includes(allergy) && styles.selectedChip,
              ]}
              textStyle={{
                color: allergies.includes(allergy) ? "#fff" : "#666",
              }}
              icon={allergies.includes(allergy) ? "check" : "plus"}
            >
              {allergy}
            </Chip>
          ))}
        </View>
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Dietary Preferences</Title>
        <View style={styles.chipsContainer}>
          {dietaryPreferenceOptions.map((preference) => (
            <Chip
              key={preference}
              selected={dietaryPreferences.includes(preference)}
              onPress={() => toggleDietaryPreference(preference)}
              style={[
                styles.chip,
                dietaryPreferences.includes(preference) && styles.selectedChip,
              ]}
              textStyle={{
                color: dietaryPreferences.includes(preference)
                  ? "#fff"
                  : "#666",
              }}
              icon={dietaryPreferences.includes(preference) ? "check" : "plus"}
            >
              {preference}
            </Chip>
          ))}
        </View>
      </Surface>

      {fingerprintSupported && (
        <Surface style={styles.section}>
          <View style={styles.settingContainer}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Fingerprint Login</Text>
              <Text style={styles.settingDescription}>
                Use biometric authentication for quick login
              </Text>
            </View>
            <Switch
              value={fingerprintEnabled}
              onValueChange={toggleFingerprintLogin}
              color="#6200ea"
            />
          </View>
        </Surface>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={saveUserData}
          style={styles.saveButton}
          loading={loading}
          disabled={loading}
          icon="content-save"
        >
          Save Changes
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </View>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: "Dismiss",
          onPress: () => setVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

export default ProfileScreen;
