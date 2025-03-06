import React from "react";
import { View } from "react-native";
import {
  Surface,
  Title,
  Checkbox,
  Text,
  Button,
  TouchableRipple,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MealTimesState } from "../types/MealTypes";
import styles from "../styles/MealPlanStyle";

interface MealPlanConfigProps {
  mealTimes: MealTimesState;
  setMealTimes: React.Dispatch<React.SetStateAction<MealTimesState>>;
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  numberOfDays: number;
  setNumberOfDays: React.Dispatch<React.SetStateAction<number>>;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  onGeneratePlan: () => Promise<void>;
  isGenerating: boolean;
  useAiPlanning: boolean;
  setUseAiPlanning: React.Dispatch<React.SetStateAction<boolean>>;
}

const MealPlanConfig: React.FC<MealPlanConfigProps> = ({
  mealTimes,
  setMealTimes,
  startDate,
  setStartDate,
  numberOfDays,
  setNumberOfDays,
  showDatePicker,
  setShowDatePicker,
  onGeneratePlan,
  isGenerating,
  useAiPlanning,
  setUseAiPlanning,
}) => {
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  return (
    <Surface style={styles.configContainer}>
      <Title style={styles.configTitle}>Meal Plan Settings</Title>

      <TouchableRipple onPress={() => setShowDatePicker(true)}>
        <View style={styles.configRow}>
          <Text>Start Date:</Text>
          <Text style={styles.configValue}>
            {startDate.toLocaleDateString()}
          </Text>
        </View>
      </TouchableRipple>

      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.configRow}>
        <Text>Number of Days:</Text>
        <View style={styles.daysSelector}>
          {[1, 3, 5, 7, 14].map((days) => (
            <TouchableRipple
              key={days}
              onPress={() => setNumberOfDays(days)}
              style={[
                styles.dayButton,
                numberOfDays === days && styles.selectedDayButton,
              ]}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  numberOfDays === days && styles.selectedDayButtonText,
                ]}
              >
                {days}
              </Text>
            </TouchableRipple>
          ))}
        </View>
      </View>

      <Title style={styles.sectionTitle}>Meals to Include</Title>
      <View style={styles.checkboxContainer}>
        <Checkbox.Item
          label="Breakfast"
          status={mealTimes.breakfast ? "checked" : "unchecked"}
          onPress={() =>
            setMealTimes({ ...mealTimes, breakfast: !mealTimes.breakfast })
          }
          style={styles.checkbox}
        />

        <Checkbox.Item
          label="Lunch"
          status={mealTimes.lunch ? "checked" : "unchecked"}
          onPress={() =>
            setMealTimes({ ...mealTimes, lunch: !mealTimes.lunch })
          }
          style={styles.checkbox}
        />

        <Checkbox.Item
          label="Dinner"
          status={mealTimes.dinner ? "checked" : "unchecked"}
          onPress={() =>
            setMealTimes({ ...mealTimes, dinner: !mealTimes.dinner })
          }
          style={styles.checkbox}
        />
      </View>

      <TouchableRipple
        onPress={() => setUseAiPlanning(!useAiPlanning)}
        style={styles.aiPlanningOption}
      >
        <View style={styles.aiPlanningRow}>
          <View style={styles.aiPlanningTextContainer}>
            <Text style={styles.aiPlanningTitle}>AI-Powered Planning</Text>
            <Text style={styles.aiPlanningDescription}>
              Let AI suggest a balanced meal plan based on your nutritional
              goals
            </Text>
          </View>
          <Checkbox
            status={useAiPlanning ? "checked" : "unchecked"}
            onPress={() => setUseAiPlanning(!useAiPlanning)}
          />
        </View>
      </TouchableRipple>

      <Button
        mode="contained"
        onPress={onGeneratePlan}
        loading={isGenerating}
        disabled={isGenerating}
        style={styles.generatePlanButton}
        icon="silverware-fork-knife"
      >
        Generate Meal Plan
      </Button>
    </Surface>
  );
};

export default MealPlanConfig;
