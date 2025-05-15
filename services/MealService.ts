// services/MealService.ts
import { Meal, UserPreferences, MealPlan } from "../types/MealTypes";
import { getMealQueries } from "../utils/MealQueryHelper";
import { withRetry } from "../api/RateLimiter";

// Define gateway interfaces (these should be moved to separate files: interfaces/MealRecommendationGateway.ts and interfaces/MealPlanRepository.ts)
// For now, included here for completeness; you'll move them later
interface MealRecommendationGateway {
  searchRecipes(
    query: string,
    params: SearchParams
  ): Promise<Array<{ recipe: any }>>;
  getRecipeInstructions(
    id: number
  ): Promise<{ steps: { number: number; step: string }[] }>;
}

interface MealPlanRepository {
  saveMealPlan(userId: string, mealPlan: MealPlan): Promise<void>;
  createMealPlanTemplate(
    userId: string,
    mealPlan: MealPlan,
    templateName: string
  ): Promise<void>;
  loadMealPlanTemplate(userId: string, templateId: string): Promise<MealPlan>;
  getMealPlan(userId: string): Promise<MealPlan | null>;
  updateMealPlan(userId: string, mealPlan: MealPlan): Promise<void>;
}

interface SearchParams {
  mealType?: string;
  calories?: number;
  diet?: string;
  health?: string[];
  excluded?: string[];
}

/**
 * Generate a random meal based on user preferences
 */
export const getRandomMeal = async (
  mealType: string,
  userPreferences: UserPreferences,
  gateway: MealRecommendationGateway
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

    let queryParams: SearchParams = {
      mealType: mealType.toLowerCase(),
      calories: targetCalories,
      health: [],
      excluded: [],
    };

    if (userPreferences.dietaryPreferences) {
      if (userPreferences.dietaryPreferences.includes("Vegetarian"))
        queryParams.health!.push("vegetarian");
      if (userPreferences.dietaryPreferences.includes("Vegan"))
        queryParams.health!.push("vegan");
      if (userPreferences.dietaryPreferences.includes("Low-Carb"))
        queryParams.diet = "low-carb";
      if (userPreferences.dietaryPreferences.includes("High-Protein"))
        queryParams.diet = "high-protein";
    }

    if (userPreferences.allergies) {
      queryParams.excluded = userPreferences.allergies.map((allergy) =>
        allergy.toLowerCase()
      );
    }

    const queries = getMealQueries(userPreferences.dietaryPreferences || []);
    const mealOptions = queries[mealType as keyof typeof queries];
    const randomQuery =
      mealOptions[Math.floor(Math.random() * mealOptions.length)];

    let results = await withRetry(() =>
      gateway.searchRecipes(randomQuery, queryParams)
    );
    if (!results || results.length === 0) {
      results = await withRetry(() =>
        gateway.searchRecipes(randomQuery, {
          ...queryParams,
          diet: undefined,
          health: [],
        })
      );
    }
    if (!results || results.length === 0) {
      results = await withRetry(() =>
        gateway.searchRecipes(randomQuery, {
          mealType: mealType.toLowerCase(),
          calories: targetCalories,
        })
      );
    }
    if (!results || results.length === 0) {
      results = await withRetry(() => gateway.searchRecipes(mealType, {}));
    }

    if (!results || results.length === 0) {
      throw new Error(`Unable to find ${mealType} recipes.`);
    }

    const selectedRecipe =
      results[Math.floor(Math.random() * results.length)].recipe;
    const instructions = await withRetry(() =>
      gateway.getRecipeInstructions(selectedRecipe.id || 0)
    ).catch(() => ({ steps: [] }));

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
      instructions: instructions.steps,
    };
  } catch (error) {
    console.error(`Error getting ${mealType} recipe:`, error);
    throw error instanceof Error && error.message.includes("Unable to find")
      ? new Error(
          `Unable to find ${mealType} recipes matching your preferences. Try adjusting your dietary restrictions.`
        )
      : new Error(
          `Failed to get ${mealType} recipe. Please check your internet connection and try again.`
        );
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

/**
 * Save meal plan to storage
 */
export const saveMealPlan = async (
  mealPlan: MealPlan,
  repository: MealPlanRepository,
  userId: string
): Promise<void> => {
  try {
    await repository.saveMealPlan(userId, mealPlan);
  } catch (error) {
    console.error("Error saving meal plan:", error);
    throw error; // Let the UI layer handle user feedback
  }
};

/**
 * Create a meal plan template from the current meal plan
 */
export const createMealPlanTemplate = async (
  mealPlan: MealPlan,
  templateName: string,
  repository: MealPlanRepository,
  userId: string
): Promise<void> => {
  try {
    await repository.createMealPlanTemplate(userId, mealPlan, templateName);
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};

/**
 * Generate shopping list from meal plan
 */
export const generateShoppingListFromMealPlan = async (
  mealPlan: MealPlan
): Promise<ShoppingItem[]> => {
  const ingredientsSet = new Set<string>();
  Object.values(mealPlan).forEach((dayPlan) => {
    Object.values(dayPlan).forEach((meal) => {
      meal.ingredients.forEach((ingredient) => ingredientsSet.add(ingredient));
    });
  });
  return Array.from(ingredientsSet).map((name) => ({ name, checked: false }));
};

/**
 * Load a meal plan template and apply it to the current meal plan
 */
export const loadMealPlanTemplate = async (
  templateId: string,
  repository: MealPlanRepository,
  userId: string
): Promise<MealPlan> => {
  try {
    if (!userId) throw new Error("User not authenticated");
    const mealPlan = await repository.loadMealPlanTemplate(userId, templateId);
    if (!mealPlan) throw new Error("Template not found");
    return mealPlan;
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
  meal: Meal,
  repository: MealPlanRepository,
  userId: string
): Promise<void> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const currentMealPlan = await repository.getMealPlan(userId);
    if (!currentMealPlan) throw new Error("Meal plan not found");

    const updatedMealPlan = { ...currentMealPlan };
    if (!updatedMealPlan[date]) updatedMealPlan[date] = {};
    updatedMealPlan[date][mealType as keyof (typeof updatedMealPlan)[string]] =
      meal;

    await repository.updateMealPlan(userId, updatedMealPlan);
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

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    Object.entries(mealPlan).forEach(([dateStr, dayPlan]) => {
      const dateTime = new Date(dateStr).getTime();
      if (dateTime >= start && dateTime <= end) {
        if (dayPlan.breakfast) {
          totalCalories += dayPlan.breakfast.calories || 0;
          totalProtein += dayPlan.breakfast.protein || 0;
          totalCarbs += dayPlan.breakfast.carbs || 0;
          totalFat += dayPlan.breakfast.fat || 0;
          mealCount++;
        }
        if (dayPlan.lunch) {
          totalCalories += dayPlan.lunch.calories || 0;
          totalProtein += dayPlan.lunch.protein || 0;
          totalCarbs += dayPlan.lunch.carbs || 0;
          totalFat += dayPlan.lunch.fat || 0;
          mealCount++;
        }
        if (dayPlan.dinner) {
          totalCalories += dayPlan.dinner.calories || 0;
          totalProtein += dayPlan.dinner.protein || 0;
          totalCarbs += dayPlan.dinner.carbs || 0;
          totalFat += dayPlan.dinner.fat || 0;
          mealCount++;
        }
      }
    });

    const avgProtein = mealCount > 0 ? Math.round(totalProtein / mealCount) : 0;
    const avgCarbs = mealCount > 0 ? Math.round(totalCarbs / mealCount) : 0;
    const avgFat = mealCount > 0 ? Math.round(totalFat / mealCount) : 0;

    return { totalCalories, avgProtein, avgCarbs, avgFat };
  } catch (error) {
    console.error("Error calculating meal plan stats:", error);
    return { totalCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };
  }
};
