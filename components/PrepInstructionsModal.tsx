import React from "react";
import { ScrollView, View } from "react-native";
import { Modal, Portal, Title, Button, List, Text } from "react-native-paper";
import { Meal } from "../types/MealTypes";
import styles from "../styles/MealPlanStyle";

interface PrepInstructionsModalProps {
  visible: boolean;
  meal: Meal | null;
  onDismiss: () => void;
}

const PrepInstructionsModal: React.FC<PrepInstructionsModalProps> = ({
  visible,
  meal,
  onDismiss,
}) => {
  if (!meal) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.modalTitle}>{meal.name}</Title>
        <View style={styles.modalSubtitleContainer}>
          <Text style={styles.modalSubtitle}>
            {meal.totalTime > 0
              ? `Preparation time: ${meal.totalTime} minutes`
              : "Preparation time not specified"}
          </Text>
        </View>

        <ScrollView style={styles.modalScrollView}>
          {meal.instructions && meal.instructions.length > 0 ? (
            meal.instructions.map((instruction) => (
              <List.Item
                key={instruction.number}
                title={`Step ${instruction.number}`}
                description={instruction.step}
                titleStyle={styles.instructionTitle}
                descriptionStyle={styles.instructionDescription}
                style={styles.instructionItem}
              />
            ))
          ) : (
            <Text style={styles.noInstructionsText}>
              No detailed instructions available. Please check the recipe source
              for more information.
            </Text>
          )}

          {meal.url && (
            <Text style={styles.sourceLink}>
              View full recipe at: {meal.source}
            </Text>
          )}
        </ScrollView>

        <Button
          mode="contained"
          onPress={onDismiss}
          style={styles.closeModalButton}
        >
          Close
        </Button>
      </Modal>
    </Portal>
  );
};

export default PrepInstructionsModal;
