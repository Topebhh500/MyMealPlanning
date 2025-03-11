import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import {
  Title,
  Card,
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  IconButton,
  Checkbox,
  ActivityIndicator,
} from "react-native-paper";
import { auth, firestore } from "../api/firebase";
import styles from "../styles/MealPlanStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import components
import MealCard from "../components/MealCard";
import PasteMealModal from "../components/PasteMealModal";

// Import services
import {
  getRandomMeal,
  saveMealPlan,
  createMealPlanTemplate,
  generateShoppingListFromMealPlan,
} from "../services/MealService";

// Import utilities
import {
  getFormattedDate,
  generateDateRange,
  formatReadableDate,
} from "../utils/DateUtils";

// Import types
import {
  UserPreferences,
  Meal,
  MealPlan,
  ShoppingListItem,
  MealTimesState,
} from "../types/MealTypes";
import ShareMealPlanButton from "../components/ShareMealPlanButton";
import { searchRecipes, handleApiError } from "../api/spoonacular";

const MealPlanScreen: React.FC = () => {
  // Core state
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    calorieGoal: 0,
    allergies: [],
    dietaryPreferences: [],
  });

  // Modal states
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] =
    useState<boolean>(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] =
    useState<boolean>(false);
  const [showPrepInstructionsModal, setShowPrepInstructionsModal] =
    useState<boolean>(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] =
    useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>("");

  // Copy/Paste meal states
  const [copiedMeal, setCopiedMeal] = useState<Meal | null>(null);
  const [copiedMealType, setCopiedMealType] = useState<string | null>(null);
  const [isPasteModalVisible, setIsPasteModalVisible] =
    useState<boolean>(false);
  const [selectedPasteDate, setSelectedPasteDate] = useState<Date>(new Date());
  const [selectedPasteMealTime, setSelectedPasteMealTime] =
    useState<string>("");

  // Generation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Meal configuration states
  const [mealTimes, setMealTimes] = useState<MealTimesState>({
    breakfast: true,
    lunch: true,
    dinner: true,
  });
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [numberOfDays, setNumberOfDays] = useState<number>(7);

  // Shopping list and ingredients states
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  // Meal Instructions
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadUserPreferences(),
        loadMealPlan(),
        loadShoppingList(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      Alert.alert("Error", "Failed to load some data. Please try again.");
    }
  };

  const loadUserPreferences = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data() as UserPreferences;
          setUserPreferences({
            calorieGoal: userData.calorieGoal || 2000,
            allergies: userData.allergies || [],
            dietaryPreferences: userData.dietaryPreferences || [],
          });
        }
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
      throw error;
    }
  };

  const loadMealPlan = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("mealPlans").doc(user.uid).get();
        if (doc.exists) {
          const storedMealPlan = doc.data() as MealPlan;
          setMealPlan(storedMealPlan);
          setSelectedDate(getFormattedDate(new Date()));
        } else {
          // If no meal plan exists yet, set today as selected date
          setSelectedDate(getFormattedDate(new Date()));
        }
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
      throw error;
    }
  };

  const loadShoppingList = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const snapshot = await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .get();
        if (snapshot.exists) {
          setShoppingList(snapshot.data()?.items || []);
        }
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
      throw error;
    }
  };

  // Generate a single meal for a specific date and meal type
  const generateMeal = async (date: string, mealType: string) => {
    try {
      setIsGenerating(true);
      const newMeal = await getRandomMeal(mealType, userPreferences);

      const updatedMealPlan = { ...mealPlan };
      if (!updatedMealPlan[date]) {
        updatedMealPlan[date] = {};
      }

      updatedMealPlan[date][mealType] = newMeal;

      await saveMealPlan(updatedMealPlan);
      setMealPlan(updatedMealPlan);
    } catch (error) {
      if (__DEV__) {
        //console.error(`Error generating ${mealType} for ${date}:`, error);
      }

      // Show user-friendly message
      const userMessage = handleApiError(error);
      Alert.alert("Recipe Service Error", userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate the complete meal plan
  const generateCompleteMealPlan = async () => {
    try {
      setIsGenerating(true);
      setLoadingProgress(0);

      const dates = generateDateRange(startDate, numberOfDays);
      const mealTypes = [];

      if (mealTimes.breakfast) mealTypes.push("breakfast");
      if (mealTimes.lunch) mealTypes.push("lunch");
      if (mealTimes.dinner) mealTypes.push("dinner");

      if (mealTypes.length === 0) {
        Alert.alert(
          "No Meals Selected",
          "Please select at least one meal type to generate."
        );
        setIsGenerating(false);
        return;
      }

      const totalMeals = dates.length * mealTypes.length;
      let completedMeals = 0;

      const newMealPlan = { ...mealPlan };

      for (const date of dates) {
        if (!newMealPlan[date]) {
          newMealPlan[date] = {};
        }

        for (const mealType of mealTypes) {
          try {
            const newMeal = await getRandomMeal(mealType, userPreferences);
            newMealPlan[date][mealType] = newMeal;

            completedMeals++;
            setLoadingProgress(Math.round((completedMeals / totalMeals) * 100));
          } catch (error) {
            console.error(`Error generating ${mealType} for ${date}:`, error);
          }
        }
      }

      await saveMealPlan(newMealPlan);
      setMealPlan(newMealPlan);
      setIsGenerateModalVisible(false);
      Alert.alert("Success", "Meal plan generated successfully!");
    } catch (error) {
      console.error("Error generating meal plan:", error);
      Alert.alert("Error", "Failed to generate meal plan. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingProgress(0);
    }
  };

  const handleCopyMeal = (meal: Meal, mealType: string) => {
    setCopiedMeal(meal);
    setCopiedMealType(mealType);
    Alert.alert(
      "Success",
      "Meal copied! Select a date and meal time to paste."
    );
    setIsPasteModalVisible(true);
  };

  const handlePasteMeal = async () => {
    try {
      if (!copiedMeal || !copiedMealType) {
        Alert.alert("Error", "No meal copied");
        return;
      }

      const dateString = getFormattedDate(selectedPasteDate);

      const updatedMealPlan = { ...mealPlan };
      if (!updatedMealPlan[dateString]) {
        updatedMealPlan[dateString] = {};
      }

      updatedMealPlan[dateString][selectedPasteMealTime] = { ...copiedMeal };

      await saveMealPlan(updatedMealPlan);
      setMealPlan(updatedMealPlan);

      setIsPasteModalVisible(false);
      Alert.alert("Success", "Meal pasted successfully!");
    } catch (error) {
      console.error("Error pasting meal:", error);
      Alert.alert("Error", "Failed to paste meal");
    }
  };

  const handleAddSingleIngredient = async (ingredient: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const newItem = { name: ingredient, checked: false };

        // Get the latest shopping list data first
        const snapshot = await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .get();

        let currentList: ShoppingListItem[] = [];
        if (snapshot.exists) {
          currentList = snapshot.data()?.items || [];
        }

        // Check if item already exists
        if (currentList.some((item) => item.name === ingredient)) {
          Alert.alert(
            "Info",
            "This ingredient is already in your shopping list."
          );
          return;
        }

        // Add the new item
        const updatedList = [...currentList, newItem];

        await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .set({ items: updatedList });

        // Update local state
        setShoppingList(updatedList);
        Alert.alert("Success", `Added "${ingredient}" to shopping list!`);
      }
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      Alert.alert("Error", "Failed to add item to shopping list");
    }
  };

  const handleViewIngredients = (ingredients: string[]) => {
    setSelectedIngredients(ingredients);
    setIsIngredientsModalVisible(true);
  };

  const handleAddToShoppingList = async (ingredients: string[]) => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Get the latest shopping list data first
        const snapshot = await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .get();

        let currentList: ShoppingListItem[] = [];
        if (snapshot.exists) {
          currentList = snapshot.data()?.items || [];
        }

        // Prepare new items, avoiding duplicates
        const newItems = ingredients
          .filter(
            (ingredient) =>
              !currentList.some((item) => item.name === ingredient)
          )
          .map((name) => ({ name, checked: false }));

        if (newItems.length === 0) {
          Alert.alert(
            "Info",
            "All these ingredients are already in your shopping list."
          );
          return;
        }

        //Add the new items
        const updatedList = [...currentList, ...newItems];

        await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .set({ items: updatedList });

        // Update local state
        setShoppingList(updatedList);
        Alert.alert(
          "Success",
          `Added ${newItems.length} items to shopping list!`
        );
      }
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      Alert.alert("Error", "Failed to add items to shopping list");
    }
  };

  const handleShowPrepInstructions = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowPrepInstructionsModal(true);
  };

  const handleDeleteMeal = async (date: string, mealType: string) => {
    try {
      const updatedMealPlan = { ...mealPlan };

      if (updatedMealPlan[date] && updatedMealPlan[date][mealType]) {
        delete updatedMealPlan[date][mealType];

        // Remove date if empty
        if (Object.keys(updatedMealPlan[date]).length === 0) {
          delete updatedMealPlan[date];
        }

        await saveMealPlan(updatedMealPlan);
        setMealPlan(updatedMealPlan);
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
      Alert.alert("Error", "Failed to delete meal");
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert("Error", "Please enter a template name");
      return;
    }

    try {
      await createMealPlanTemplate(mealPlan, templateName);
      setShowSaveTemplateModal(false);
      setTemplateName("");
      Alert.alert("Success", "Meal plan template saved!");
    } catch (error) {
      console.error("Error saving template:", error);
      Alert.alert("Error", "Failed to save template");
    }
  };

  const handleGenerateShoppingList = async () => {
    try {
      const ingredients = await generateShoppingListFromMealPlan(mealPlan);
      await handleAddToShoppingList(ingredients);
    } catch (error) {
      console.error("Error generating shopping list:", error);
      Alert.alert("Error", "Failed to generate shopping list");
    }
  };

  // Generate dates for display
  const dates = generateDateRange(startDate, 7); // Show one week by default in the UI

  // Calculate daily nutritional totals for selected date
  const calculateDailyTotals = () => {
    const dayPlan = mealPlan[selectedDate] || {};
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    if (dayPlan.breakfast) {
      calories += dayPlan.breakfast.calories || 0;
      protein += dayPlan.breakfast.protein || 0;
      carbs += dayPlan.breakfast.carbs || 0;
      fat += dayPlan.breakfast.fat || 0;
    }

    if (dayPlan.lunch) {
      calories += dayPlan.lunch.calories || 0;
      protein += dayPlan.lunch.protein || 0;
      carbs += dayPlan.lunch.carbs || 0;
      fat += dayPlan.lunch.fat || 0;
    }

    if (dayPlan.dinner) {
      calories += dayPlan.dinner.calories || 0;
      protein += dayPlan.dinner.protein || 0;
      carbs += dayPlan.dinner.carbs || 0;
      fat += dayPlan.dinner.fat || 0;
    }

    return { calories, protein, carbs, fat };
  };

  const dailyTotals = calculateDailyTotals();

  // Format days for display
  const formatDayButtonLabel = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      date: `${date.getMonth() + 1}/${date.getDate()}`,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Title style={styles.title}>Meal Plan</Title>
        <ShareMealPlanButton mealPlan={mealPlan} selectedDate={selectedDate} />
      </View>

      {/* Date selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}
      >
        {dates.map((date) => {
          const dateObj = new Date(date);
          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.dayButton,
                selectedDate === date && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === date && styles.selectedDayText,
                ]}
              >
                {dateObj.toLocaleDateString(undefined, { weekday: "short" })}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDayText,
                ]}
              >
                {`${dateObj.getMonth() + 1}/${dateObj.getDate()}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Daily nutritional summary */}
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <Text style={styles.nutritionValue}>{dailyTotals.calories}</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Protein</Text>
            <Text style={styles.nutritionValue}>{dailyTotals.protein}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Carbs</Text>
            <Text style={styles.nutritionValue}>{dailyTotals.carbs}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Fat</Text>
            <Text style={styles.nutritionValue}>{dailyTotals.fat}g</Text>
          </View>
        </View>

        {/* Breakfast Section */}
        <Title style={styles.mealTitle}>Breakfast</Title>
        {mealPlan[selectedDate]?.breakfast ? (
          <MealCard
            meal={mealPlan[selectedDate].breakfast}
            onViewIngredients={() =>
              handleViewIngredients(
                mealPlan[selectedDate].breakfast.ingredients
              )
            }
            onShowInstructions={() =>
              handleShowPrepInstructions(mealPlan[selectedDate].breakfast)
            }
            onDelete={() => handleDeleteMeal(selectedDate, "breakfast")}
            onCopy={() =>
              handleCopyMeal(mealPlan[selectedDate].breakfast, "breakfast")
            }
          />
        ) : (
          <Button
            mode="contained"
            icon="plus"
            onPress={() => generateMeal(selectedDate, "breakfast")}
            style={styles.generateSingleButton}
            loading={isGenerating}
            disabled={isGenerating}
          >
            Add Breakfast
          </Button>
        )}

        {/* Lunch Section */}
        <Title style={styles.mealTitle}>Lunch</Title>
        {mealPlan[selectedDate]?.lunch ? (
          <MealCard
            meal={mealPlan[selectedDate].lunch}
            onViewIngredients={() =>
              handleViewIngredients(mealPlan[selectedDate].lunch.ingredients)
            }
            onShowInstructions={() =>
              handleShowPrepInstructions(mealPlan[selectedDate].lunch)
            }
            onDelete={() => handleDeleteMeal(selectedDate, "lunch")}
            onCopy={() =>
              handleCopyMeal(mealPlan[selectedDate].breakfast, "breakfast")
            }
          />
        ) : (
          <Button
            mode="contained"
            icon="plus"
            onPress={() => generateMeal(selectedDate, "lunch")}
            style={styles.generateSingleButton}
            loading={isGenerating}
            disabled={isGenerating}
          >
            Add Lunch
          </Button>
        )}

        {/* Dinner Section */}
        <Title style={styles.mealTitle}>Dinner</Title>
        {mealPlan[selectedDate]?.dinner ? (
          <MealCard
            meal={mealPlan[selectedDate].dinner}
            onViewIngredients={() =>
              handleViewIngredients(mealPlan[selectedDate].dinner.ingredients)
            }
            onShowInstructions={() =>
              handleShowPrepInstructions(mealPlan[selectedDate].dinner)
            }
            onDelete={() => handleDeleteMeal(selectedDate, "dinner")}
            onCopy={() =>
              handleCopyMeal(mealPlan[selectedDate].breakfast, "breakfast")
            }
          />
        ) : (
          <Button
            mode="contained"
            icon="plus"
            onPress={() => generateMeal(selectedDate, "dinner")}
            style={styles.generateSingleButton}
            loading={isGenerating}
            disabled={isGenerating}
          >
            Add Dinner
          </Button>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => setIsGenerateModalVisible(true)}
            style={styles.generateButton}
            icon="silverware-fork-knife"
          >
            Generate Meal Plan
          </Button>
        </View>
      </ScrollView>
      {/* Modals */}
      <PasteMealModal
        visible={isPasteModalVisible}
        onDismiss={() => setIsPasteModalVisible(false)}
        selectedDate={selectedPasteDate}
        setSelectedDate={setSelectedPasteDate}
        selectedMealTime={selectedPasteMealTime}
        setSelectedMealTime={setSelectedPasteMealTime}
        onPaste={handlePasteMeal}
        mealTimes={mealTimes}
      />
      {/* Generate Meal Plan Modal */}
      <Portal>
        <Modal
          visible={isGenerateModalVisible}
          onDismiss={() => setIsGenerateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Generate Meal Plan</Title>

          <Text style={styles.sectionLabel}>Start Date</Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => {}}>
            <Text style={styles.datePickerButtonText}>
              {startDate.toISOString().split("T")[0]}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Number of Days</Text>
          <View style={styles.daysInputContainer}>
            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => setNumberOfDays(Math.max(1, numberOfDays - 1))}
            >
              <Text style={styles.dayText}>-</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.daysInput}
              value={numberOfDays.toString()}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num) && num > 0) {
                  setNumberOfDays(num);
                }
              }}
              keyboardType="numeric"
              mode="outlined"
            />

            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => setNumberOfDays(numberOfDays + 1)}
            >
              <Text style={styles.dayText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Meal Periods</Text>
          <View>
            <Checkbox.Item
              label="Breakfast"
              status={mealTimes.breakfast ? "checked" : "unchecked"}
              onPress={() =>
                setMealTimes({ ...mealTimes, breakfast: !mealTimes.breakfast })
              }
            />
            <Checkbox.Item
              label="Lunch"
              status={mealTimes.lunch ? "checked" : "unchecked"}
              onPress={() =>
                setMealTimes({ ...mealTimes, lunch: !mealTimes.lunch })
              }
            />
            <Checkbox.Item
              label="Dinner"
              status={mealTimes.dinner ? "checked" : "unchecked"}
              onPress={() =>
                setMealTimes({ ...mealTimes, dinner: !mealTimes.dinner })
              }
            />
          </View>

          <View style={styles.modalButtonContainer}>
            <Button
              mode="contained"
              onPress={generateCompleteMealPlan}
              style={[styles.modalButton, styles.modalSubmitButton]}
              loading={isGenerating}
              disabled={isGenerating}
            >
              Generate
            </Button>
            <Button
              mode="outlined"
              onPress={() => setIsGenerateModalVisible(false)}
              style={[styles.modalButton, styles.modalCancelButton]}
            >
              Cancel
            </Button>
          </View>

          {isGenerating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6200ea" />
              <Text style={styles.loadingText}>
                Generating your meal plan... {loadingProgress}%
              </Text>
            </View>
          )}
        </Modal>
      </Portal>
      {/* Ingredients Modal */}
      <Portal>
        <Modal
          visible={isIngredientsModalVisible}
          onDismiss={() => setIsIngredientsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Title style={styles.modalTitle}>Ingredients</Title>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setIsIngredientsModalVisible(false)}
              style={styles.closeIcon}
            />
          </View>

          <ScrollView style={styles.ingredientsList}>
            {selectedIngredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientTitle}>{ingredient}</Text>
                <IconButton
                  icon="cart-plus"
                  size={20}
                  color="#6200ea"
                  onPress={() => handleAddSingleIngredient(ingredient)}
                  style={styles.addButton}
                />
              </View>
            ))}
          </ScrollView>

          <Button
            mode="contained"
            onPress={() => handleAddToShoppingList(selectedIngredients)}
            style={styles.fullWidthButton}
            icon="cart-plus"
          >
            Add All to Shopping List
          </Button>
        </Modal>
      </Portal>
      {/* Prep Instructions Modal */}
      <Portal>
        <Modal
          visible={showPrepInstructionsModal}
          onDismiss={() => setShowPrepInstructionsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedMeal && (
            <>
              <Title style={styles.modalTitle}>{selectedMeal.name}</Title>
              <Text style={styles.prepTimeText}>
                Preparation time: {selectedMeal.totalTime} minutes
              </Text>
              <ScrollView style={styles.prepInstructionsContainer}>
                {selectedMeal.instructions &&
                selectedMeal.instructions.length > 0 ? (
                  selectedMeal.instructions.map((instruction) => (
                    <View key={instruction.number} style={{ marginBottom: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        Step {instruction.number}
                      </Text>
                      <Text style={styles.instructionText}>
                        {instruction.step}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.instructionText}>
                    No detailed instructions available. Please check the recipe
                    source for more information.
                  </Text>
                )}
              </ScrollView>
              <Button
                mode="contained"
                onPress={() => setShowPrepInstructionsModal(false)}
                style={styles.closeButton}
              >
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
      {/* Save Template Modal */}
      <Portal>
        <Modal
          visible={showSaveTemplateModal}
          onDismiss={() => setShowSaveTemplateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Save as Template</Title>
          <TextInput
            label="Template Name"
            value={templateName}
            onChangeText={setTemplateName}
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.modalButtonContainer}>
            <Button
              mode="contained"
              onPress={handleSaveAsTemplate}
              style={styles.modalButton}
            >
              Save
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowSaveTemplateModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default MealPlanScreen;
