// MealQueryHelper.ts - Provides meal query lists based on dietary preferences
import { MealQueries } from "../types/MealTypes";

/**
 * Returns meal-specific query terms based on dietary preferences
 */
export const getMealQueries = (preferences: string[]): MealQueries => {
  const queryBank = {
    breakfast: {
      default: [
        "breakfast",
        "morning meal",
        "breakfast bowl",
        "breakfast sandwich",
        "breakfast recipes",
        "eggs",
        "pancakes",
        "waffles",
        "bacon eggs",
        "breakfast burrito",
      ],
      vegan: [
        "vegan breakfast",
        "plant based breakfast",
        "breakfast smoothie",
        "oatmeal breakfast",
        "avocado toast",
        "vegan pancakes",
        "chia pudding",
        "granola bowl",
        "fruit breakfast",
        "breakfast quinoa",
      ],
      vegetarian: [
        "vegetarian breakfast",
        "egg breakfast",
        "yogurt breakfast",
        "cheese breakfast",
        "vegetarian omelette",
        "breakfast muffins",
        "french toast",
        "breakfast parfait",
        "cottage cheese breakfast",
        "vegetable frittata",
      ],
      "low-carb": [
        "keto breakfast",
        "low carb breakfast",
        "protein breakfast",
        "egg bowl",
        "breakfast protein",
        "keto eggs",
        "low carb omelette",
        "breakfast salad",
        "keto pancakes",
        "breakfast without bread",
      ],
      "high-protein": [
        "protein breakfast",
        "high protein morning",
        "protein bowl",
        "protein oatmeal",
        "protein pancakes",
        "egg white omelette",
        "protein smoothie bowl",
        "greek yogurt breakfast",
        "protein french toast",
        "cottage cheese protein bowl",
      ],
    },
    lunch: {
      default: [
        "lunch",
        "sandwich",
        "salad",
        "soup",
        "wrap",
        "bowl",
        "pasta lunch",
        "rice bowl",
        "noodles",
        "lunch plate",
      ],
      vegan: [
        "vegan lunch",
        "buddha bowl",
        "vegan salad",
        "plant based lunch",
        "quinoa bowl",
        "vegan wrap",
        "chickpea lunch",
        "lentil bowl",
        "vegan soup",
        "vegetable stir fry",
      ],
      vegetarian: [
        "vegetarian lunch",
        "veggie sandwich",
        "vegetable soup",
        "mediterranean bowl",
        "vegetarian wrap",
        "falafel plate",
        "vegetable curry",
        "bean bowl",
        "tofu lunch",
        "vegetarian pasta",
      ],
      "low-carb": [
        "keto lunch",
        "low carb meal",
        "protein salad",
        "lettuce wrap",
        "zucchini noodles",
        "cauliflower rice bowl",
        "keto bowl",
        "protein plate",
        "low carb soup",
        "vegetable stir fry no rice",
      ],
      "high-protein": [
        "high protein lunch",
        "chicken salad",
        "tuna bowl",
        "protein plate",
        "quinoa protein bowl",
        "turkey wrap",
        "protein pasta",
        "salmon lunch",
        "lean protein bowl",
        "egg lunch",
      ],
    },
    dinner: {
      default: [
        "dinner",
        "chicken dinner",
        "fish dinner",
        "beef dinner",
        "pork dinner",
        "pasta dinner",
        "rice dinner",
        "stir fry",
        "roasted dinner",
        "grilled dinner",
      ],
      vegan: [
        "vegan dinner",
        "plant based dinner",
        "vegan curry",
        "tofu dinner",
        "tempeh dinner",
        "vegan pasta",
        "vegetable dinner",
        "vegan stir fry",
        "vegan bowl",
        "lentil dinner",
      ],
      vegetarian: [
        "vegetarian dinner",
        "veggie pasta",
        "vegetable curry",
        "vegetarian stir fry",
        "bean dinner",
        "vegetable lasagna",
        "eggplant dinner",
        "mushroom dinner",
        "quinoa dinner",
        "vegetarian casserole",
      ],
      "low-carb": [
        "keto dinner",
        "low carb dinner",
        "protein dinner",
        "zucchini pasta",
        "cauliflower rice dinner",
        "keto bowl",
        "low carb stir fry",
        "protein plate dinner",
        "vegetable dinner no carb",
        "grilled protein dinner",
      ],
      "high-protein": [
        "high protein dinner",
        "lean protein dinner",
        "chicken breast dinner",
        "fish protein dinner",
        "protein bowl dinner",
        "lean meat dinner",
        "protein rich dinner",
        "turkey dinner",
        "seafood protein dinner",
        "protein pasta dinner",
      ],
    },
  };

  // Determine the primary preference
  let primaryPreference: keyof typeof queryBank.breakfast = "default";
  if (preferences.includes("Vegan")) {
    primaryPreference = "vegan";
  } else if (preferences.includes("Vegetarian")) {
    primaryPreference = "vegetarian";
  } else if (preferences.includes("Low-Carb")) {
    primaryPreference = "low-carb";
  } else if (preferences.includes("High-Protein")) {
    primaryPreference = "high-protein";
  }

  // Return meal-specific queries based on preference
  return {
    breakfast:
      queryBank.breakfast[primaryPreference] || queryBank.breakfast.default,
    lunch: queryBank.lunch[primaryPreference] || queryBank.lunch.default,
    dinner: queryBank.dinner[primaryPreference] || queryBank.dinner.default,
  };
};
