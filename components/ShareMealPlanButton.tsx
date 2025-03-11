// components/ShareMealPlanButton.tsx
import React, { useState } from "react";
import { IconButton } from "react-native-paper";
import sharingService from "../services/SharingService";
import { MealPlan } from "../types/MealTypes";

interface ShareMealPlanButtonProps {
  mealPlan: MealPlan;
  selectedDate: string;
  size?: number;
  color?: string;
}

const ShareMealPlanButton: React.FC<ShareMealPlanButtonProps> = ({
  mealPlan,
  selectedDate,
  size = 24,
  color = "#6200ea",
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await sharingService.shareDailyMealPlan(mealPlan, selectedDate);
    } catch (error) {
      console.error("Failed to share meal plan:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <IconButton
      icon="share-variant"
      size={size}
      color={color}
      onPress={handleShare}
      disabled={isSharing}
    />
  );
};

export default ShareMealPlanButton;
