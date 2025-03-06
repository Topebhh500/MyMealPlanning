import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Card, Text, Button, IconButton } from "react-native-paper";
import { Meal } from "../types/MealTypes";
import styles from "../styles/MealPlanStyle";

interface MealCardProps {
  meal: Meal;
  onViewIngredients: () => void;
  onShowInstructions: () => void;
  onDelete: () => void;
  onCopy: () => void; // Add this
}
const MealCard = ({
  meal,
  onViewIngredients,
  onShowInstructions,
  onDelete,
  onCopy,
}) => {
  return (
    <Card style={styles.mealCard}>
      {meal.image && (
        <Image
          source={{ uri: meal.image }}
          style={styles.mealImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.mealDetails}>
        <View style={styles.mealHeaderContainer}>
          <Text style={styles.mealName}>{meal.name}</Text>
        </View>

        <View style={styles.mealInfoContainer}>
          <Text style={styles.cookingTime}>
            Cooking time: {meal.totalTime} minutes
          </Text>
          <Text style={styles.calories}>{meal.calories} calories</Text>
        </View>

        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{meal.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{meal.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={onViewIngredients}
          icon="food-variant"
          style={styles.viewIngredientsButton}
        >
          View Ingredients
        </Button>

        <View style={styles.actionButtonsRow}>
          <Button
            mode="outlined"
            onPress={onCopy}
            icon="content-copy"
            style={styles.halfButton}
          >
            Copy
          </Button>
          <Button
            mode="contained"
            onPress={onDelete}
            icon="delete"
            style={[styles.halfButton, styles.deleteButton]}
          >
            Delete
          </Button>
        </View>

        <TouchableOpacity
          onPress={onShowInstructions}
          style={styles.instructionsLink}
        >
          <Text style={styles.instructionsText}>View Cooking Instructions</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default MealCard;
