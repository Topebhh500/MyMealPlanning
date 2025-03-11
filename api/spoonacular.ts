import axios, { AxiosResponse } from "axios";
import {
  getApiKey,
  withRetry,
  recordApiCall,
  canMakeApiCall,
} from "./RateLimiter";

//const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com";

// Interface definitions
interface SearchParams {
  mealType?: string;
  calories?: number;
  diet?: string;
  health?: string[];
  excluded?: string[];
}

interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

interface RecipeSearchResult {
  results: RecipeSummary[];
  offset: number;
  number: number;
  totalResults: number;
}

interface RecipeSummary {
  id: number;
  title: string;
  image: string;
  imageType: string;
}

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceName: string;
  sourceUrl: string;
  nutrition: {
    nutrients: Nutrient[];
  };
  extendedIngredients: Ingredient[];
  dishTypes: string[];
  diets: string[];
}

interface Ingredient {
  id: number;
  name: string;
  original: string;
  amount: number;
  unit: string;
}

interface RecipeInstructions {
  name: string;
  steps: {
    number: number;
    step: string;
    ingredients?: { id: number; name: string }[];
    equipment?: { id: number; name: string }[];
  }[];
}

interface MealPlanDay {
  meals: {
    id: number;
    title: string;
    imageType: string;
    readyInMinutes: number;
    servings: number;
  }[];
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

interface MealPlanResponse {
  week: {
    [day: string]: MealPlanDay;
  };
}

interface ShoppingListItem {
  name: string;
  amount: {
    metric: {
      value: number;
      unit: string;
    };
    us: {
      value: number;
      unit: string;
    };
  };
}

// Diet and health mappings to Spoonacular's terminology
const DIET_MAPPING: { [key: string]: string } = {
  "High-Protein": "high-protein",
  "Low-Carb": "low-carb",
  Vegetarian: "vegetarian",
  Vegan: "vegan",
  Balanced: "balanced",
};

// Helper function to convert our allergens to Spoonacular intolerances
const mapAllergensToIntolerances = (allergies: string[]): string => {
  const intoleranceMap: { [key: string]: string } = {
    Dairy: "dairy",
    Eggs: "egg",
    Nuts: "tree-nut",
    Shellfish: "shellfish",
    Wheat: "gluten",
  };

  return allergies
    .map((allergy) => intoleranceMap[allergy] || allergy.toLowerCase())
    .filter(Boolean)
    .join(",");
};

/**
 * Search for recipes based on query and parameters
 */
export const searchRecipes = async (
  query: string,
  params: SearchParams = {}
): Promise<Array<{ recipe: any }>> => {
  return withRetry(async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("apiKey", getApiKey());
      queryParams.append("query", query);
      queryParams.append("number", "10"); // Number of results to return
      queryParams.append("addNutrition", "true");

      // Add diet parameter if provided
      if (params.diet && DIET_MAPPING[params.diet]) {
        queryParams.append("diet", DIET_MAPPING[params.diet]);
      }

      // Add meal type if provided
      if (params.mealType) {
        queryParams.append("type", params.mealType);
      }

      // Add calorie restriction if provided
      if (params.calories) {
        const minCal = Math.max(0, params.calories - 150);
        const maxCal = params.calories + 150;
        queryParams.append("maxCalories", maxCal.toString());
        queryParams.append("minCalories", minCal.toString());
      }

      // Add allergies/intolerances if provided
      if (params.excluded && params.excluded.length > 0) {
        const intolerances = mapAllergensToIntolerances(params.excluded);
        if (intolerances) {
          queryParams.append("intolerances", intolerances);
        }
      }

      // Exclude ingredients
      if (params.excluded && params.excluded.length > 0) {
        queryParams.append("excludeIngredients", params.excluded.join(","));
      }

      const url = `${BASE_URL}/recipes/complexSearch?${queryParams.toString()}`;
      const response: AxiosResponse<RecipeSearchResult> = await axios.get(url);

      if (!response.data || !response.data.results) {
        throw new Error("Invalid response format from Spoonacular API");
      }

      // Get detailed information for each recipe
      const recipeDetails = await Promise.all(
        response.data.results.map((recipe) => getRecipeInformation(recipe.id))
      );

      // Transform to match expected format
      return recipeDetails.map((detail) => ({
        recipe: {
          id: detail.id,
          label: detail.title,
          image: detail.image,
          source: detail.sourceName,
          url: detail.sourceUrl,
          calories:
            detail.nutrition.nutrients.find((n) => n.name === "Calories")
              ?.amount || 0,
          totalTime: detail.readyInMinutes,
          ingredientLines: detail.extendedIngredients.map(
            (ing) => ing.original
          ),
          totalNutrients: {
            PROCNT: {
              quantity:
                detail.nutrition.nutrients.find((n) => n.name === "Protein")
                  ?.amount || 0,
            },
            CHOCDF: {
              quantity:
                detail.nutrition.nutrients.find(
                  (n) => n.name === "Carbohydrates"
                )?.amount || 0,
            },
            FAT: {
              quantity:
                detail.nutrition.nutrients.find((n) => n.name === "Fat")
                  ?.amount || 0,
            },
          },
          foodCategory: detail.dishTypes[0] || "",
        },
      }));
    } catch (error) {
      console.error("API Error Details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
      });
      throw error;
    }
  });
};

/**
 * Get detailed information about a specific recipe
 */
export const getRecipeInformation = async (
  id: number
): Promise<RecipeDetail> => {
  try {
    const url = `${BASE_URL}/recipes/${id}/information?apiKey=${getApiKey()}&includeNutrition=true`;
    const response: AxiosResponse<RecipeDetail> = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching recipe information:", error);
    throw error;
  }
};

/**
 * Get recipe instructions (step by step)
 */
export const getRecipeInstructions = async (
  id: number
): Promise<{ steps: { number: number; step: string }[] }> => {
  try {
    const url = `${BASE_URL}/recipes/${id}/analyzedInstructions?apiKey=${getApiKey()}`;
    const response: AxiosResponse<RecipeInstructions[]> = await axios.get(url);

    if (!response.data || response.data.length === 0) {
      return { steps: [] };
    }

    // Return steps from the first instruction set
    return {
      steps: response.data[0].steps.map((step) => ({
        number: step.number,
        step: step.step,
      })),
    };
  } catch (error) {
    console.error("Error fetching recipe instructions:", error);
    throw error;
  }
};

/**
 * Generate a meal plan for given parameters
 */
export const generateMealPlan = async (
  timeFrame: "day" | "week",
  targetCalories: number,
  diet?: string,
  exclude?: string[]
): Promise<MealPlanResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("apiKey", getApiKey());
    queryParams.append("timeFrame", timeFrame);
    queryParams.append("targetCalories", targetCalories.toString());

    if (diet && DIET_MAPPING[diet]) {
      queryParams.append("diet", DIET_MAPPING[diet]);
    }

    if (exclude && exclude.length > 0) {
      queryParams.append("exclude", exclude.join(","));
    }

    const url = `${BASE_URL}/mealplanner/generate?${queryParams.toString()}`;
    const response: AxiosResponse<MealPlanResponse> = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
};

/**
 * Generate a shopping list from recipes
 */
export const generateShoppingList = async (
  recipeIds: number[]
): Promise<ShoppingListItem[]> => {
  try {
    const url = `${BASE_URL}/recipes/computeShoppingList?apiKey=${getApiKey()}`;
    const response: AxiosResponse<{ aisles: { items: ShoppingListItem[] }[] }> =
      await axios.post(url, {
        items: recipeIds.map((id) => ({ id, aisle: "unknown" })),
      });

    // Flatten all items from all aisles
    const items = response.data.aisles.flatMap((aisle) => aisle.items);
    return items;
  } catch (error) {
    console.error("Error generating shopping list:", error);
    throw error;
  }
};

/**
 * Formats API errors into user-friendly messages
 */
export const handleApiError = (error: any): string => {
  // Check if it's an Axios error with a response
  if (error.response) {
    const statusCode = error.response.status;

    // Handle common status codes
    switch (statusCode) {
      case 401:
        return "Authentication failed. Please check your API key in settings.";
      case 402:
        return "API quota exceeded. Please try again later or update your plan.";
      case 404:
        return "The requested recipe or information couldn't be found.";
      case 429:
        return "Too many requests. Please try again in a few minutes.";
      case 500:
        return "The recipe service is experiencing issues. Please try again later.";
      default:
        return "Something went wrong with the recipe service. Please try again.";
    }
  }

  // Handle network errors
  if (error.message && error.message.includes("Network Error")) {
    return "Cannot connect to the recipe service. Please check your internet connection.";
  }

  // Generic error message as fallback
  return "Something went wrong. Please try again.";
};
