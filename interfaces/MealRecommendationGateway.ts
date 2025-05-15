// interfaces/MealRecommendationGateway.ts
export interface MealRecommendationGateway {
  searchRecipes(
    query: string,
    params: SearchParams
  ): Promise<Array<{ recipe: any }>>;
  getRecipeInstructions(
    id: number
  ): Promise<{ steps: { number: number; step: string }[] }>;
}

export interface SearchParams {
  mealType?: string;
  calories?: number;
  diet?: string;
  health?: string[];
  excluded?: string[];
}
