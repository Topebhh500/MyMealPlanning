export interface UserPreferences {
  calorieGoal: number;
  allergies: string[];
  dietaryPreferences: string[];
}

export interface Meal {
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
}

export interface MealPlan {
  [date: string]: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
  };
}

export interface MealTimes {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface ShoppingListItem {
  name: string;
  checked: boolean;
}

export interface StockItem {
  name: string;
  quantity: number;
}

export interface QueryParams {
  mealType: string;
  calories: number;
  health: string[];
  excluded: string[];
  diet?: string;
}

export type MealPeriod = "breakfast" | "lunch" | "dinner";

export type DietaryPreference =
  | "default"
  | "vegan"
  | "vegetarian"
  | "low-carb"
  | "high-protein";

export interface QueryBank {
  [mealType: string]: {
    [preference in DietaryPreference]: string[];
  };
}

export interface GenerateConfig {
  startDate: Date;
  numberOfDays: number;
  mealTimes: MealTimes;
}
