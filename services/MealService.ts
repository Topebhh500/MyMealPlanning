// services/MealService.ts
import { Alert } from "react-native";
import { auth, firestore } from "../api/firebase";
import {
  searchRecipes,
  getRecipeInformation,
  getRecipeInstructions,
} from "../api/spoonacular";
import { Meal, UserPreferences, MealPlan } from "../types/MealTypes";
import { getMealQueries } from "../utils/MealQueryHelper";
import { withRetry } from "../api/RateLimiter";

/**
 * Generate a random meal based on user preferences
 */
export const getRandomMeal = async (
  mealType: string,
  userPreferences: UserPreferences
): Promise<Meal> => {
  try {
    const mealCalorieDistribution = {
      breakfast: 0.3,
      lunch: 0.35,
      dinner: 0.35,
    };

    const targetCalories = Math.round(
      userPreferences.calorieGoal * mealCalorieDistribution[mealType]
    );

    // Setup base query parameters
    let queryParams = {
      mealType: mealType.toLowerCase(),
      calories: targetCalories,
      health: [] as string[],
      excluded: [] as string[],
      cuisines: userPreferences.cuisinePreferences || [],
      maxReadyTime: getMaxReadyTimeByComplexity(userPreferences.mealComplexity),
    };

    // Add dietary preferences
    if (userPreferences.dietaryPreferences) {
      if (userPreferences.dietaryPreferences.includes("Vegetarian")) {
        queryParams.health.push("vegetarian");
      }
      if (userPreferences.dietaryPreferences.includes("Vegan")) {
        queryParams.health.push("vegan");
      }
      if (userPreferences.dietaryPreferences.includes("Low-Carb")) {
        queryParams.diet = "low-carb";
      }
      if (userPreferences.dietaryPreferences.includes("High-Protein")) {
        queryParams.diet = "high-protein";
      }
    }

    // Add allergy restrictions
    if (userPreferences.allergies) {
      userPreferences.allergies.forEach((allergy) => {
        queryParams.excluded.push(allergy.toLowerCase());
      });
    }

    const queries = getMealQueries(userPreferences.dietaryPreferences || []);
    const mealOptions = queries[mealType];
    const randomQuery =
      mealOptions[Math.floor(Math.random() * mealOptions.length)];

    // Try with all preferences first
    let results = await withRetry(async () => {
      return searchRecipes(randomQuery, queryParams);
    });

    // If no results, try with just the meal type and allergies (remove dietary restrictions)
    if (!results || results.length === 0) {
      console.log(
        `No results with full preferences, trying with fewer restrictions...`
      );

      const simplifiedParams = {
        ...queryParams,
        diet: undefined,
        health: [] as string[],
      };

      results = await withRetry(async () => {
        return searchRecipes(randomQuery, simplifiedParams);
      });
    }

    // If still no results, try with just meal type (no dietary restrictions or allergies)
    if (!results || results.length === 0) {
      console.log(`Still no results, trying with minimal restrictions...`);

      const minimalParams = {
        mealType: mealType.toLowerCase(),
        calories: targetCalories,
      };

      results = await withRetry(async () => {
        return searchRecipes(randomQuery, minimalParams);
      });
    }

    // If we still don't have results, try a completely generic search
    if (!results || results.length === 0) {
      console.log(`Last attempt with generic search...`);

      results = await withRetry(async () => {
        return searchRecipes(mealType, {});
      });
    }

    if (!results || results.length === 0) {
      throw new Error(
        `Unable to find ${mealType} recipes. Please check your internet connection or try again later.`
      );
    }

    const selectedRecipe =
      results[Math.floor(Math.random() * results.length)].recipe;

    // Fetch detailed instructions if available
    let instructions = [];
    if (selectedRecipe.id) {
      try {
        const recipeInstructions = await withRetry(() =>
          getRecipeInstructions(selectedRecipe.id)
        );
        instructions = recipeInstructions.steps;
      } catch (error) {
        console.error(
          `Error fetching instructions for recipe ${selectedRecipe.id}:`,
          error
        );
      }
    }

    return {
      id: selectedRecipe.id,
      name: selectedRecipe.label || "Untitled Recipe",
      calories: Math.round(selectedRecipe.calories || 0),
      protein: Math.round(selectedRecipe.totalNutrients?.PROCNT?.quantity || 0),
      carbs: Math.round(selectedRecipe.totalNutrients?.CHOCDF?.quantity || 0),
      fat: Math.round(selectedRecipe.totalNutrients?.FAT?.quantity || 0),
      image: selectedRecipe.image || null,
      ingredients: selectedRecipe.ingredientLines || [],
      url: selectedRecipe.url || "",
      source: selectedRecipe.source || "",
      totalTime: selectedRecipe.totalTime || 0,
      foodCategory: selectedRecipe.foodCategory || null,
      instructions: instructions,
    };
  } catch (error) {
    console.error(`Error getting ${mealType} recipe:`, error);

    // Provide a more user-friendly error message
    if (error.message && error.message.includes("Unable to find")) {
      throw new Error(
        `Unable to find ${mealType} recipes matching your preferences. Try adjusting your dietary restrictions.`
      );
    } else {
      throw new Error(
        `Failed to get ${mealType} recipe. Please check your internet connection and try again.`
      );
    }
  }
};

// Helper function to convert complexity preference to max cooking time
const getMaxReadyTimeByComplexity = (complexity?: string): number => {
  switch (complexity) {
    case "simple":
      return 30; // 30 minutes or less
    case "complex":
      return 120; // Up to 2 hours
    case "moderate":
    default:
      return 60; // Up to 1 hour
  }
};

// Other functions in MealService remain the same...

/**
 * Save meal plan to Firebase
 */
export const saveMealPlan = async (mealPlan: MealPlan): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (user) {
      await firestore.collection("mealPlans").doc(user.uid).set(mealPlan);
    }
  } catch (error) {
    console.error("Error saving meal plan:", error);
    Alert.alert("Error", "Failed to save meal plan. Please try again.");
    throw error;
  }
};

/**
 * Create a meal plan template from the current meal plan
 */
export const createMealPlanTemplate = async (
  mealPlan: MealPlan,
  templateName: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (user) {
      const templateRef = firestore
        .collection("mealPlanTemplates")
        .doc(user.uid)
        .collection("templates")
        .doc();

      await templateRef.set({
        name: templateName,
        meals: mealPlan,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error creating template:", error);
    Alert.alert("Error", "Failed to create template. Please try again.");
    throw error;
  }
};

/**
 * Generate shopping list from meal plan
 */
export const generateShoppingListFromMealPlan = async (
  mealPlan: MealPlan
): Promise<string[]> => {
  try {
    // Get all recipes from the meal plan
    const allMeals: Meal[] = [];

    // Extract all meals from the plan
    Object.values(mealPlan).forEach((dayPlan) => {
      if (dayPlan.breakfast) allMeals.push(dayPlan.breakfast);
      if (dayPlan.lunch) allMeals.push(dayPlan.lunch);
      if (dayPlan.dinner) allMeals.push(dayPlan.dinner);
    });

    // Collect all ingredients
    const ingredientSet = new Set<string>();
    allMeals.forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        ingredientSet.add(ingredient);
      });
    });

    return Array.from(ingredientSet);
  } catch (error) {
    console.error("Error generating shopping list:", error);
    throw error;
  }
};

/**
 * Load a meal plan template and apply it to the current meal plan
 */
export const loadMealPlanTemplate = async (
  templateId: string
): Promise<MealPlan> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const templateDoc = await firestore
      .collection("mealPlanTemplates")
      .doc(user.uid)
      .collection("templates")
      .doc(templateId)
      .get();

    if (!templateDoc.exists) {
      throw new Error("Template not found");
    }

    const template = templateDoc.data() as MealPlanTemplate;
    return template.meals;
  } catch (error) {
    console.error("Error loading template:", error);
    throw error;
  }
};

/**
 * Update a specific meal in the meal plan
 */
export const updateMeal = async (
  date: string,
  mealType: string,
  meal: Meal
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get current meal plan
    const mealPlanDoc = await firestore
      .collection("mealPlans")
      .doc(user.uid)
      .get();

    if (!mealPlanDoc.exists) {
      throw new Error("Meal plan not found");
    }

    const mealPlan = mealPlanDoc.data() as MealPlan;

    // Create date entry if it doesn't exist
    if (!mealPlan[date]) {
      mealPlan[date] = {};
    }

    // Update specific meal
    mealPlan[date][mealType] = meal;

    // Save updated meal plan
    await saveMealPlan(mealPlan);
  } catch (error) {
    console.error("Error updating meal:", error);
    throw error;
  }
};

/**
 * Get meal plan statistics (calories, macros) for a date range
 */
export const getMealPlanStats = (
  mealPlan: MealPlan,
  startDate: string,
  endDate: string
): {
  totalCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
} => {
  try {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let mealCount = 0;

    // Convert dates to timestamps for comparison
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    // Iterate through meal plan
    Object.entries(mealPlan).forEach(([dateStr, dayPlan]) => {
      const dateTime = new Date(dateStr).getTime();

      // Check if date is in range
      if (dateTime >= start && dateTime <= end) {
        // Add breakfast stats if exists
        if (dayPlan.breakfast) {
          totalCalories += dayPlan.breakfast.calories || 0;
          totalProtein += dayPlan.breakfast.protein || 0;
          totalCarbs += dayPlan.breakfast.carbs || 0;
          totalFat += dayPlan.breakfast.fat || 0;
          mealCount++;
        }

        // Add lunch stats if exists
        if (dayPlan.lunch) {
          totalCalories += dayPlan.lunch.calories || 0;
          totalProtein += dayPlan.lunch.protein || 0;
          totalCarbs += dayPlan.lunch.carbs || 0;
          totalFat += dayPlan.lunch.fat || 0;
          mealCount++;
        }

        // Add dinner stats if exists
        if (dayPlan.dinner) {
          totalCalories += dayPlan.dinner.calories || 0;
          totalProtein += dayPlan.dinner.protein || 0;
          totalCarbs += dayPlan.dinner.carbs || 0;
          totalFat += dayPlan.dinner.fat || 0;
          mealCount++;
        }
      }
    });

    // Calculate averages (prevent division by zero)
    const avgProtein = mealCount > 0 ? Math.round(totalProtein / mealCount) : 0;
    const avgCarbs = mealCount > 0 ? Math.round(totalCarbs / mealCount) : 0;
    const avgFat = mealCount > 0 ? Math.round(totalFat / mealCount) : 0;

    return {
      totalCalories,
      avgProtein,
      avgCarbs,
      avgFat,
    };
  } catch (error) {
    console.error("Error calculating meal plan stats:", error);
    return { totalCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };
  }
};
