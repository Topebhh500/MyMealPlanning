// MealTypes.ts - Common type definitions for the meal planning feature

// Define interfaces for the data structures
export interface UserPreferences {
  calorieGoal: number;
  allergies: string[];
  dietaryPreferences: string[];
}

export interface Meal {
  id?: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string | null;
  ingredients: string[];
  url: string;
  source: string;
  totalTime: number;
  foodCategory: string;
  instructions?: { number: number; step: string }[];
}

export interface MealPlan {
  [date: string]: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
  };
}

export interface MealPlanTemplate {
  id: string;
  name: string;
  meals: MealPlan;
  createdAt: Date;
}

export interface MealPrepInstructions {
  mealId: string;
  instructions: string[];
  prepTime: number;
  cookingTips: string[];
}

export interface ShoppingListItem {
  name: string;
  checked: boolean;
}

export interface StockItem {
  name: string;
}

export interface MealTimesState {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

// Type definition for getMealQueries helper function
export interface MealQueries {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}
