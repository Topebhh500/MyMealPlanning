import React from "react";
import { View, ScrollView } from "react-native";
import {
  Modal,
  Portal,
  Title,
  Button,
  List,
  IconButton,
} from "react-native-paper";
import styles from "../styles/MealPlanStyle";

interface IngredientsModalProps {
  visible: boolean;
  ingredients: string[];
  onDismiss: () => void;
  onAddToShoppingList: (ingredients: string[]) => void;
}

const IngredientsModal: React.FC<IngredientsModalProps> = ({
  visible,
  ingredients,
  onDismiss,
  onAddToShoppingList,
}) => {
  const [selectedIngredients, setSelectedIngredients] = React.useState<
    string[]
  >([]);

  // Reset selected ingredients when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setSelectedIngredients([...ingredients]);
    } else {
      setSelectedIngredients([]);
    }
  }, [visible, ingredients]);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(
      selectedIngredients.includes(ingredient)
        ? selectedIngredients.filter((item) => item !== ingredient)
        : [...selectedIngredients, ingredient]
    );
  };

  const handleAddToShoppingList = () => {
    onAddToShoppingList(selectedIngredients);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={isIngredientsModalVisible}
        onDismiss={() => setIsIngredientsModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Title style={styles.modalTitle}>Ingredients</Title>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setIsIngredientsModalVisible(false)}
            style={styles.closeIcon}
          />
        </View>

        <ScrollView style={styles.ingredientsList}>
          {selectedIngredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.ingredientTitle}>{ingredient}</Text>
              <IconButton
                icon="cart-plus"
                size={20}
                color="#6200ea"
                onPress={() => handleAddSingleIngredient(ingredient)}
                style={styles.addButton}
              />
            </View>
          ))}
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => handleAddToShoppingList(selectedIngredients)}
          style={styles.fullWidthButton}
          icon="cart-plus"
        >
          Add All to Shopping List
        </Button>
      </Modal>
    </Portal>
  );
};

export default IngredientsModal;
