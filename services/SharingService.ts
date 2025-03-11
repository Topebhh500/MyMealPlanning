// services/SharingService.ts
import { Share, ShareContent } from "react-native";
import { Meal, MealPlan } from "../types/MealTypes";
import { formatReadableDate } from "../utils/DateUtils";

class SharingService {
  /**
   * Share a single day's meal plan
   */
  public async shareDailyMealPlan(
    mealPlan: MealPlan,
    date: string
  ): Promise<void> {
    try {
      // Format the day's meal plan into a readable text format
      const content = this.formatDailyMealPlanForSharing(mealPlan, date);

      const shareOptions: ShareContent = {
        title: "My Daily Meal Plan - Meal Planning Mate",
        message: content,
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        console.log("Shared successfully");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing meal plan:", error);
      throw error;
    }
  }

  /**
   * Format a single day's meal plan into a readable text format
   */
  private formatDailyMealPlanForSharing(
    mealPlan: MealPlan,
    date: string
  ): string {
    // Check if the date exists in the meal plan
    if (!mealPlan || !mealPlan[date]) {
      return "No meal plan available for this date.";
    }

    const dayPlan = mealPlan[date];
    const formattedDate = formatReadableDate(new Date(date));

    let content = `📆 MY MEAL PLAN FOR ${formattedDate.toUpperCase()}\n\n`;

    // Add breakfast if available
    if (dayPlan.breakfast) {
      content += `🍳 BREAKFAST\n${dayPlan.breakfast.name}\n`;
      if (dayPlan.breakfast.calories) {
        content += `Calories: ${dayPlan.breakfast.calories} | Protein: ${dayPlan.breakfast.protein}g | Carbs: ${dayPlan.breakfast.carbs}g | Fat: ${dayPlan.breakfast.fat}g\n`;
      }
      content += "\n";
    }

    // Add lunch if available
    if (dayPlan.lunch) {
      content += `🥗 LUNCH\n${dayPlan.lunch.name}\n`;
      if (dayPlan.lunch.calories) {
        content += `Calories: ${dayPlan.lunch.calories} | Protein: ${dayPlan.lunch.protein}g | Carbs: ${dayPlan.lunch.carbs}g | Fat: ${dayPlan.lunch.fat}g\n`;
      }
      content += "\n";
    }

    // Add dinner if available
    if (dayPlan.dinner) {
      content += `🍽️ DINNER\n${dayPlan.dinner.name}\n`;
      if (dayPlan.dinner.calories) {
        content += `Calories: ${dayPlan.dinner.calories} | Protein: ${dayPlan.dinner.protein}g | Carbs: ${dayPlan.dinner.carbs}g | Fat: ${dayPlan.dinner.fat}g\n`;
      }
      content += "\n";
    }

    // Add daily totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    if (dayPlan.breakfast) {
      totalCalories += dayPlan.breakfast.calories || 0;
      totalProtein += dayPlan.breakfast.protein || 0;
      totalCarbs += dayPlan.breakfast.carbs || 0;
      totalFat += dayPlan.breakfast.fat || 0;
    }

    if (dayPlan.lunch) {
      totalCalories += dayPlan.lunch.calories || 0;
      totalProtein += dayPlan.lunch.protein || 0;
      totalCarbs += dayPlan.lunch.carbs || 0;
      totalFat += dayPlan.lunch.fat || 0;
    }

    if (dayPlan.dinner) {
      totalCalories += dayPlan.dinner.calories || 0;
      totalProtein += dayPlan.dinner.protein || 0;
      totalCarbs += dayPlan.dinner.carbs || 0;
      totalFat += dayPlan.dinner.fat || 0;
    }

    content += `📊 DAILY TOTALS\n`;
    content += `Calories: ${totalCalories} | Protein: ${totalProtein}g | Carbs: ${totalCarbs}g | Fat: ${totalFat}g\n\n`;

    content +=
      "Shared from Meal Planning Mate - Your AI-powered meal planning companion! Developed by Ajayi Temitope.";

    return content;
  }
}

// Export as singleton
const sharingService = new SharingService();
export default sharingService;
