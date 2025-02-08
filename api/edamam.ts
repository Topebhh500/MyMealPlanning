import axios, { AxiosResponse } from "axios";

const APP_ID = process.env.EDAMAM_APP_ID;
const APP_KEY = process.env.EDAMAM_API_KEY;

interface DietMapping {
  [key: string]: string;
}

interface HealthMapping {
  [key: string]: string;
}

interface AllergyMapping {
  [key: string]: string;
}

interface SearchParams {
  mealType?: string;
  calories?: number;
  dietaryPreferences?: string[];
  allergies?: string[];
  diet?: string;
  health?: string[];
  excluded?: string[];
}

interface Nutrient {
  label: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  label: string;
  image: string;
  source: string;
  url: string;
  calories: number;
  totalTime: number;
  ingredientLines: string[];
  totalNutrients: {
    PROCNT: Nutrient;
    CHOCDF: Nutrient;
    FAT: Nutrient;
    [key: string]: Nutrient;
  };
}

interface EdamamResponse {
  hits: Array<{
    recipe: Recipe;
  }>;
}

// Map our preferences to Edamam API parameters
const DIET_MAPPING: DietMapping = {
  Balanced: "balanced",
  "High-Protein": "high-protein",
  "Low-Carb": "low-carb",
};

const HEALTH_MAPPING: HealthMapping = {
  Vegetarian: "vegetarian",
  Vegan: "vegan",
};

const ALLERGY_MAPPING: AllergyMapping = {
  Dairy: "dairy-free",
  Eggs: "egg-free",
  Nuts: "tree-nut-free",
  Shellfish: "shellfish-free",
  Wheat: "wheat-free",
  Pork: "pork-free",
};

export const searchRecipes = async (
  query: string,
  params: SearchParams = {}
): Promise<Array<{ recipe: Recipe }>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    // Required parameters
    queryParams.append("type", "public");
    queryParams.append("q", query);
    queryParams.append("app_id", APP_ID as string);
    queryParams.append("app_key", APP_KEY as string);

    // Add mealType if provided
    if (params.mealType) {
      queryParams.append("mealType", params.mealType);
    }

    // Add calories if provided
    if (params.calories) {
      const minCal = Math.max(0, params.calories - 150); // Allow 150 cal range
      const maxCal = params.calories + 150;
      queryParams.append("calories", `${minCal}-${maxCal}`);
    }

    // Add dietary preferences
    if (params.dietaryPreferences) {
      // Handle diet parameter (only one can be applied)
      const diets = params.dietaryPreferences.filter(
        (pref) => DIET_MAPPING[pref]
      );
      if (diets.length > 0) {
        queryParams.append("diet", DIET_MAPPING[diets[0]]);
      }

      // Handle health parameters (multiple can be applied)
      params.dietaryPreferences.forEach((pref) => {
        if (HEALTH_MAPPING[pref]) {
          queryParams.append("health", HEALTH_MAPPING[pref]);
        }
      });
    }

    // Add allergy restrictions
    if (params.allergies) {
      params.allergies.forEach((allergy) => {
        if (ALLERGY_MAPPING[allergy]) {
          queryParams.append("health", ALLERGY_MAPPING[allergy]);
        }
        // Also exclude the allergen from ingredients
        queryParams.append("excluded", allergy.toLowerCase());
      });
    }

    const url = `https://api.edamam.com/api/recipes/v2?${queryParams.toString()}`;

    const response: AxiosResponse<EdamamResponse> = await axios.get(url);

    if (!response.data || !response.data.hits) {
      throw new Error("Invalid response format from Edamam API");
    }

    return response.data.hits;
  } catch (error) {
    console.error("API Error Details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });
    throw error;
  }
};
