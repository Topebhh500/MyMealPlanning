import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
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
  Portal,
  Modal,
  IconButton,
  ProgressBar,
  TouchableRipple,
  RadioButton,
} from "react-native-paper";
import { auth, firestore, storage } from "../api/firebase";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageSourcePropType } from "react-native";
import styles from "../styles/ProfileStyle";
import { updateApiKey, getRemainingCalls } from "../api/RateLimiter";

interface MealPlanTemplate {
  id: string;
  name: string;
  meals: Record<string, any>;
  createdAt: Date;
}

interface UserData {
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
  cuisinePreferences?: string[];
  mealComplexity?: "simple" | "moderate" | "complex";
  calorieGoal: number;
  profilePicture?: string;
  isDarkMode?: boolean;
}

const ProfileScreen: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [mealComplexity, setMealComplexity] = useState<
    "simple" | "moderate" | "complex"
  >("moderate");
  const [calorieGoal, setCalorieGoal] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">(
    "success"
  );
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [fingerprintEnabled, setFingerprintEnabled] = useState<boolean>(false);
  const [fingerprintSupported, setFingerprintSupported] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedTemplates, setSavedTemplates] = useState<MealPlanTemplate[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyStatus, setApiKeyStatus] = useState<
    "valid" | "invalid" | "unknown"
  >("unknown");
  const [apiCallsRemaining, setApiCallsRemaining] = useState<number | null>(
    null
  );

  // Expanded allergy options
  const allergyOptions: string[] = [
    "Dairy",
    "Eggs",
    "Gluten",
    "Grain",
    "Peanut",
    "Seafood",
    "Sesame",
    "Shellfish",
    "Soy",
    "Sulfite",
    "Tree Nut",
    "Wheat",
    "Pork",
    "Garlic",
  ];

  // Expanded dietary preference options
  const dietaryPreferenceOptions: string[] = [
    "Balanced",
    "High-Protein",
    "Low-Carb",
    "Low-Fat",
    "Low-Sodium",
    "Vegetarian",
    "Vegan",
    "Paleo",
    "Ketogenic",
    "Mediterranean",
  ];

  // Cuisine preference options
  const cuisinePreferenceOptions: string[] = [
    "American",
    "Asian",
    "Chinese",
    "French",
    "Greek",
    "Indian",
    "Italian",
    "Japanese",
    "Mediterranean",
    "Mexican",
    "Middle Eastern",
    "Thai",
  ];

  // Complexity options
  const complexityOptions = [
    {
      label: "Simple",
      value: "simple",
      description: "Quick, easy recipes with few ingredients",
    },
    {
      label: "Moderate",
      value: "moderate",
      description: "Balanced complexity and preparation time",
    },
    {
      label: "Complex",
      value: "complex",
      description: "Gourmet recipes with advanced techniques",
    },
  ];

  useEffect(() => {
    void loadUserData();
    void checkBiometricSupport();
    void checkFingerprintSettings();
    void loadSavedTemplates();
    void checkApiKey();
    void updateApiCallsRemaining();
  }, []);

  // Update API calls remaining periodically
  useEffect(() => {
    const interval = setInterval(() => {
      void updateApiCallsRemaining();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const updateApiCallsRemaining = async () => {
    const remaining = getRemainingCalls();
    setApiCallsRemaining(remaining);
  };

  const checkApiKey = async (): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("apiKeys").doc(user.uid).get();
        if (doc.exists) {
          const data = doc.data();
          setApiKey(data?.spoonacularApiKey || "");
          setApiKeyStatus(data?.keyStatus || "unknown");
          setApiCallsRemaining(data?.callsRemaining || null);
        }
      }
    } catch (error) {
      console.error("Error checking API key:", error);
    }
  };

  const saveApiKey = async (): Promise<void> => {
    try {
      setLoading(true);
      if (apiKey.trim()) {
        const isValid = await updateApiKey(apiKey);

        if (isValid) {
          setApiKeyStatus("valid");
          setShowApiKeyModal(false);
          showSnackbar("API key saved successfully!", "success");
        } else {
          setApiKeyStatus("invalid");
          showSnackbar("Invalid API key", "error");
        }
      } else {
        showSnackbar("Please enter a valid API key", "error");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      showSnackbar("Failed to save API key", "error");
    } finally {
      setLoading(false);
    }
  };

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
          setCuisinePreferences(userData.cuisinePreferences || []);
          setMealComplexity(userData.mealComplexity || "moderate");
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
          cuisinePreferences,
          mealComplexity,
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
    setSnackbarType(type);
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

  const toggleCuisinePreference = (cuisine: string): void => {
    setCuisinePreferences(
      cuisinePreferences.includes(cuisine)
        ? cuisinePreferences.filter((c) => c !== cuisine)
        : [...cuisinePreferences, cuisine]
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

  const loadSavedTemplates = async (): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (user) {
        const templatesSnapshot = await firestore
          .collection("mealPlanTemplates")
          .doc(user.uid)
          .collection("templates")
          .orderBy("createdAt", "desc")
          .get();

        const templates = templatesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as MealPlanTemplate[];

        setSavedTemplates(templates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      showSnackbar("Failed to load meal plan templates", "error");
    }
  };

  const deleteTemplate = async (templateId: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore
          .collection("mealPlanTemplates")
          .doc(user.uid)
          .collection("templates")
          .doc(templateId)
          .delete();

        setSavedTemplates((prev) =>
          prev.filter((template) => template.id !== templateId)
        );
        showSnackbar("Template deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      showSnackbar("Failed to delete template", "error");
    }
  };

  const applyTemplate = async (templateId: string): Promise<void> => {
    try {
      Alert.alert(
        "Apply Template",
        "This will replace your current meal plan. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Apply",
            onPress: async () => {
              const user = auth.currentUser;
              if (user) {
                const template = savedTemplates.find(
                  (t) => t.id === templateId
                );
                if (template) {
                  await firestore
                    .collection("mealPlans")
                    .doc(user.uid)
                    .set(template.meals);
                  showSnackbar("Template applied successfully!");
                  setShowTemplatesModal(false);
                }
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error applying template:", error);
      showSnackbar("Failed to apply template", "error");
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
          left={<TextInput.Icon icon="account" />}
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
          left={<TextInput.Icon icon="fire" />}
        />
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Allergies & Intolerances</Title>
        <Text style={styles.sectionDescription}>
          Select any foods you need to avoid:
        </Text>
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
        <Text style={styles.sectionDescription}>
          Select your preferred eating styles:
        </Text>
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

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Cuisine Preferences</Title>
        <Text style={styles.sectionDescription}>
          Select your favorite cuisines:
        </Text>
        <View style={styles.chipsContainer}>
          {cuisinePreferenceOptions.map((cuisine) => (
            <Chip
              key={cuisine}
              selected={cuisinePreferences.includes(cuisine)}
              onPress={() => toggleCuisinePreference(cuisine)}
              style={[
                styles.chip,
                cuisinePreferences.includes(cuisine) && styles.selectedChip,
              ]}
              textStyle={{
                color: cuisinePreferences.includes(cuisine) ? "#fff" : "#666",
              }}
              icon={cuisinePreferences.includes(cuisine) ? "check" : "plus"}
            >
              {cuisine}
            </Chip>
          ))}
        </View>
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Recipe Complexity</Title>
        <Text style={styles.sectionDescription}>
          Choose the complexity level of recipes:
        </Text>
        {complexityOptions.map((option) => (
          <TouchableRipple
            key={option.value}
            onPress={() => setMealComplexity(option.value as any)}
            style={styles.complexityOption}
          >
            <View style={styles.complexityRow}>
              <RadioButton
                value={option.value}
                status={
                  mealComplexity === option.value ? "checked" : "unchecked"
                }
                onPress={() => setMealComplexity(option.value as any)}
                color="#6200ea"
              />
              <View style={styles.complexityTextContainer}>
                <Text style={styles.complexityLabel}>{option.label}</Text>
                <Text style={styles.complexityDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
          </TouchableRipple>
        ))}
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>API Key Management</Title>
        <Text style={styles.sectionDescription}>
          Add your Spoonacular API key to increase rate limits:
        </Text>

        <View style={styles.apiStatusContainer}>
          <Text style={styles.apiStatusLabel}>API Status:</Text>
          <View style={styles.apiStatusIndicator}>
            <View
              style={[
                styles.statusDot,
                apiKeyStatus === "valid"
                  ? styles.statusDotValid
                  : apiKeyStatus === "invalid"
                  ? styles.statusDotInvalid
                  : styles.statusDotUnknown,
              ]}
            />
            <Text style={styles.apiStatusText}>
              {apiKeyStatus === "valid"
                ? "Valid Key"
                : apiKeyStatus === "invalid"
                ? "Invalid Key"
                : "No Key Configured"}
            </Text>
          </View>
        </View>

        {apiCallsRemaining !== null && (
          <View style={styles.apiLimitContainer}>
            <Text style={styles.apiLimitLabel}>API Calls Remaining:</Text>
            <Text style={styles.apiLimitValue}>{apiCallsRemaining}</Text>
            <ProgressBar
              progress={apiCallsRemaining / 150}
              color={apiCallsRemaining < 20 ? "#f44336" : "#4caf50"}
              style={styles.apiLimitProgress}
            />
          </View>
        )}

        <Button
          mode="outlined"
          onPress={() => setShowApiKeyModal(true)}
          style={styles.actionButton}
          icon="key"
        >
          {apiKey ? "Update API Key" : "Set API Key"}
        </Button>
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Meal Plan Templates</Title>
        <Text style={styles.sectionDescription}>
          Manage your saved meal plan templates:
        </Text>
        <Button
          mode="outlined"
          onPress={() => setShowTemplatesModal(true)}
          style={styles.actionButton}
          icon="format-list-bulleted"
        >
          View Saved Templates ({savedTemplates.length})
        </Button>
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

      {/* Templates Modal */}
      <Portal>
        <Modal
          visible={showTemplatesModal}
          onDismiss={() => setShowTemplatesModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Saved Templates</Title>
          <ScrollView style={styles.templatesList}>
            {savedTemplates.length > 0 ? (
              savedTemplates.map((template) => (
                <Surface key={template.id} style={styles.templateItem}>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDate}>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.templateActions}>
                    <IconButton
                      icon="check"
                      size={20}
                      onPress={() => applyTemplate(template.id)}
                      color="#4caf50"
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => deleteTemplate(template.id)}
                      color="#f44336"
                    />
                  </View>
                </Surface>
              ))
            ) : (
              <Text style={styles.emptyText}>No saved templates</Text>
            )}
          </ScrollView>
          <Button
            mode="contained"
            onPress={() => setShowTemplatesModal(false)}
            style={styles.closeButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>

      {/* API Key Modal */}
      <Portal>
        <Modal
          visible={showApiKeyModal}
          onDismiss={() => setShowApiKeyModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Spoonacular API Key</Title>
          <Text style={styles.modalDescription}>
            Enter your Spoonacular API key to increase your rate limits and
            avoid throttling. You can get a free API key at
            spoonacular.com/food-api
          </Text>
          <TextInput
            label="API Key"
            value={apiKey}
            onChangeText={setApiKey}
            style={styles.input}
            mode="outlined"
            secureTextEntry
            outlineColor="#6200ea"
            activeOutlineColor="#6200ea"
          />
          <View style={styles.modalButtonContainer}>
            <Button
              mode="outlined"
              onPress={() => setShowApiKeyModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={saveApiKey}
              style={styles.modalButton}
              loading={loading}
              disabled={loading || !apiKey.trim()}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          snackbarType === "error" && styles.errorSnackbar,
        ]}
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
