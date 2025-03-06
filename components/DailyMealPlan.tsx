import React from "react";
import { View, ScrollView } from "react-native";
import { Card, Title, Button, Text } from "react-native-paper";
import MealCard from "./MealCard";
import { Meal } from "../types/MealTypes";
import styles from "../styles/MealPlanStyle";

interface DailyMealPlanProps {
  date: string;
  selectedDate: string;
  mealPlan: { [date: string]: { [meal: string]: Meal } };
  mealTimes: { breakfast: boolean; lunch: boolean; dinner: boolean };
  onGenerate: (date: string, mealType: string) => Promise<void>;
  onViewIngredients: (ingredients: string[]) => void;
  onShowPrepInstructions: (meal: Meal) => void;
  onCopyMeal: (meal: Meal, mealType: string) => void;
  onDeleteMeal: (date: string, mealType: string) => void;
}

const DailyMealPlan: React.FC<DailyMealPlanProps> = ({
  date,
  selectedDate,
  mealPlan,
  mealTimes,
  onGenerate,
  onViewIngredients,
  onShowPrepInstructions,
  onCopyMeal,
  onDeleteMeal,
}) => {
  // Format date for display
  const displayDate = new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Get current day's plan
  const dayPlan = mealPlan[date] || {};

  // Calculate daily nutrition totals
  const calculateDailyTotals = () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    if (dayPlan.breakfast) {
      calories += dayPlan.breakfast.calories || 0;
      protein += dayPlan.breakfast.protein || 0;
      carbs += dayPlan.breakfast.carbs || 0;
      fat += dayPlan.breakfast.fat || 0;
    }

    if (dayPlan.lunch) {
      calories += dayPlan.lunch.calories || 0;
      protein += dayPlan.lunch.protein || 0;
      carbs += dayPlan.lunch.carbs || 0;
      fat += dayPlan.lunch.fat || 0;
    }

    if (dayPlan.dinner) {
      calories += dayPlan.dinner.calories || 0;
      protein += dayPlan.dinner.protein || 0;
      carbs += dayPlan.dinner.carbs || 0;
      fat += dayPlan.dinner.fat || 0;
    }

    return { calories, protein, carbs, fat };
  };

  const dailyTotals = calculateDailyTotals();

  return (
    <ScrollView
      style={[
        styles.dailyPlanContainer,
        selectedDate === date && styles.selectedDateContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Title style={styles.dateHeader}>{displayDate}</Title>

      <Card style={styles.dailySummaryCard}>
        <Card.Content style={styles.dailySummaryContent}>
          <Text style={styles.dailySummaryTitle}>Daily Totals</Text>
          <View style={styles.nutritionInfo}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{dailyTotals.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {mealTimes.breakfast && (
        <View style={styles.mealSection}>
          <Title style={styles.mealTypeHeader}>Breakfast</Title>
          {dayPlan.breakfast ? (
            <MealCard
              meal={dayPlan.breakfast}
              mealType="breakfast"
              date={date}
              onViewIngredients={onViewIngredients}
              onShowPrepInstructions={onShowPrepInstructions}
              onCopyMeal={onCopyMeal}
              onDeleteMeal={onDeleteMeal}
            />
          ) : (
            <Button
              mode="outlined"
              onPress={() => onGenerate(date, "breakfast")}
              style={styles.generateButton}
              icon="plus"
            >
              Add Breakfast
            </Button>
          )}
        </View>
      )}

      {mealTimes.lunch && (
        <View style={styles.mealSection}>
          <Title style={styles.mealTypeHeader}>Lunch</Title>
          {dayPlan.lunch ? (
            <MealCard
              meal={dayPlan.lunch}
              mealType="lunch"
              date={date}
              onViewIngredients={onViewIngredients}
              onShowPrepInstructions={onShowPrepInstructions}
              onCopyMeal={onCopyMeal}
              onDeleteMeal={onDeleteMeal}
            />
          ) : (
            <Button
              mode="outlined"
              onPress={() => onGenerate(date, "lunch")}
              style={styles.generateButton}
              icon="plus"
            >
              Add Lunch
            </Button>
          )}
        </View>
      )}

      {mealTimes.dinner && (
        <View style={styles.mealSection}>
          <Title style={styles.mealTypeHeader}>Dinner</Title>
          {dayPlan.dinner ? (
            <MealCard
              meal={dayPlan.dinner}
              mealType="dinner"
              date={date}
              onViewIngredients={onViewIngredients}
              onShowPrepInstructions={onShowPrepInstructions}
              onCopyMeal={onCopyMeal}
              onDeleteMeal={onDeleteMeal}
            />
          ) : (
            <Button
              mode="outlined"
              onPress={() => onGenerate(date, "dinner")}
              style={styles.generateButton}
              icon="plus"
            >
              Add Dinner
            </Button>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default DailyMealPlan;
