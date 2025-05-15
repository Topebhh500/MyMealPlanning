// interfaces/MealPlanRepository.ts
import { MealPlan, ShoppingListItem } from "../types/MealTypes";

export interface MealPlanRepository {
  saveMealPlan(userId: string, mealPlan: MealPlan): Promise<void>;
  createMealPlanTemplate(
    userId: string,
    mealPlan: MealPlan,
    templateName: string
  ): Promise<void>;
  loadMealPlanTemplate(userId: string, templateId: string): Promise<MealPlan>;
  getMealPlan(userId: string): Promise<MealPlan | null>;
  updateMealPlan(userId: string, mealPlan: MealPlan): Promise<void>;
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  getShoppingList(userId: string): Promise<ShoppingListItem[] | null>;
  saveShoppingList(userId: string, list: ShoppingListItem[]): Promise<void>;
}
