import React, { useState } from "react";
import { View, Platform } from "react-native";
import {
  Modal,
  Portal,
  Title,
  Button,
  RadioButton,
  Text,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../styles/MealPlanStyle";

interface PasteMealModalProps {
  visible: boolean;
  onDismiss: () => void;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedMealTime: string;
  setSelectedMealTime: React.Dispatch<React.SetStateAction<string>>;
  onPaste: () => Promise<void>;
  mealTimes: { breakfast: boolean; lunch: boolean; dinner: boolean };
}

const PasteMealModal: React.FC<PasteMealModalProps> = ({
  visible,
  onDismiss,
  selectedDate,
  setSelectedDate,
  selectedMealTime,
  setSelectedMealTime,
  onPaste,
  mealTimes,
}) => {
  // State to control date picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Always hide the picker on Android after selection
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.modalTitle}>Paste Meal</Title>
        <View style={styles.modalContent}>
          <Text style={styles.sectionLabel}>Select Date:</Text>

          {/* Date button/display */}
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            {selectedDate.toLocaleDateString()}
          </Button>

          {/* Only show DateTimePicker when needed */}
          {(showDatePicker || Platform.OS === "ios") && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={new Date()}
              style={styles.datePicker}
            />
          )}

          <Text style={styles.sectionLabel}>Select Meal Time:</Text>
          <RadioButton.Group
            onValueChange={(value) => setSelectedMealTime(value)}
            value={selectedMealTime}
          >
            {mealTimes.breakfast && (
              <RadioButton.Item label="Breakfast" value="breakfast" />
            )}
            {mealTimes.lunch && (
              <RadioButton.Item label="Lunch" value="lunch" />
            )}
            {mealTimes.dinner && (
              <RadioButton.Item label="Dinner" value="dinner" />
            )}
          </RadioButton.Group>
        </View>

        <View style={styles.modalButtonContainer}>
          <Button
            mode="contained"
            onPress={onPaste}
            style={styles.modalButton}
            disabled={!selectedMealTime}
          >
            Paste Meal
          </Button>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default PasteMealModal;
