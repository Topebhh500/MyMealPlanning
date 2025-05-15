// api/spoonacular.ts
import axios, { AxiosResponse } from "axios";
import { getApiKey, withRetry } from "./RateLimiter";
import {
  MealRecommendationGateway,
  SearchParams,
} from "../interfaces/MealRecommendationGateway";

const BASE_URL = "https://api.spoonacular.com";

interface Nutrient {
  name: string;
  amount: number;
  unit: string;
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
  nutrition: { nutrients: Nutrient[] };
  extendedIngredients: { original: string }[];
  dishTypes: string[];
  diets: string[];
}

const DIET_MAPPING: { [key: string]: string } = {
  "High-Protein": "high-protein",
  "Low-Carb": "low-carb",
  Vegetarian: "vegetarian",
  Vegan: "vegan",
  Balanced: "balanced",
};

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

export class SpoonacularGateway implements MealRecommendationGateway {
  async searchRecipes(
    query: string,
    params: SearchParams = {}
  ): Promise<Array<{ recipe: any }>> {
    return withRetry(async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("apiKey", getApiKey());
      queryParams.append("query", query);
      queryParams.append("number", "10");
      queryParams.append("addNutrition", "true");

      if (params.diet && DIET_MAPPING[params.diet])
        queryParams.append("diet", DIET_MAPPING[params.diet]);
      if (params.mealType) queryParams.append("type", params.mealType);
      if (params.calories) {
        const minCal = Math.max(0, params.calories - 150);
        const maxCal = params.calories + 150;
        queryParams.append("maxCalories", maxCal.toString());
        queryParams.append("minCalories", minCal.toString());
      }
      if (params.excluded && params.excluded.length > 0) {
        const intolerances = mapAllergensToIntolerances(params.excluded);
        if (intolerances) queryParams.append("intolerances", intolerances);
        queryParams.append("excludeIngredients", params.excluded.join(","));
      }

      const url = `${BASE_URL}/recipes/complexSearch?${queryParams.toString()}`;
      const response: AxiosResponse<{ results: RecipeSummary[] }> =
        await axios.get(url);

      if (!response.data?.results)
        throw new Error("Invalid response format from Spoonacular API");

      const recipeDetails = await Promise.all(
        response.data.results.map((recipe) => this.getRecipeDetails(recipe.id))
      );

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
    });
  }

  async getRecipeInstructions(
    id: number
  ): Promise<{ steps: { number: number; step: string }[] }> {
    try {
      const url = `${BASE_URL}/recipes/${id}/analyzedInstructions?apiKey=${getApiKey()}`;
      const response: AxiosResponse<
        { steps: { number: number; step: string }[] }[]
      > = await axios.get(url);
      return response.data?.[0] || { steps: [] };
    } catch (error) {
      console.error("Error fetching recipe instructions:", error);
      return { steps: [] };
    }
  }

  private async getRecipeDetails(id: number): Promise<RecipeDetail> {
    const url = `${BASE_URL}/recipes/${id}/information?apiKey=${getApiKey()}&includeNutrition=true`;
    const response: AxiosResponse<RecipeDetail> = await axios.get(url);
    return response.data;
  }
}
