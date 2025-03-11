import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Container and Layout
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
  },

  // Date Navigation
  daysContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dayButton: {
    padding: 12,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDay: {
    backgroundColor: "#6200ea",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  selectedDayText: {
    color: "#fff",
  },

  // Meal Cards
  mealCard: {
    marginBottom: 16,
    padding: 10,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  warningCard: {
    borderColor: "#ff9800",
    borderWidth: 1,
  },
  mealHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
    marginTop: 16,
    marginBottom: 8,
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calories: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  warningText: {
    color: "#ff9800",
  },
  mealInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Meal Images
  mealImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  placeholderImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  // Meal Details
  mealDetails: {
    padding: 8,
  },
  mealName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6200ea",
    marginBottom: 8,
  },
  cookingTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: "center",
    flex: 1,
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  // Buttons and Actions
  generateSingleButton: {
    marginVertical: 16,
    backgroundColor: "#ccc",
    paddingVertical: 8,
    elevation: 2,
    borderRadius: 8,
  },
  generateButton: {
    marginVertical: 16,
    backgroundColor: "#6200ea",
    paddingVertical: 8,
    elevation: 2,
    borderRadius: 8,
  },
  viewIngredientsButton: {
    marginVertical: 12,
    borderRadius: 4,
    backgroundColor: "#6200ea",
  },
  buttonContainer: {
    flexDirection: "column",
    marginTop: 16,
    marginBottom: 24,
  },

  // Modals
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalScrollView: {
    maxHeight: 400,
  },

  // Form Elements
  input: {
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  checkbox: {
    marginVertical: 4,
  },
  checkboxContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },

  // Loading and Progress
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#666",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginVertical: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6200ea",
    borderRadius: 2,
  },

  // Ingredients List
  ingredientsList: {
    paddingTop: 4,
    maxHeight: 400,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ingredientTitle: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },

  // Empty States
  emptyCard: {
    margin: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },

  // Date Picker
  datePickerButton: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  datePickerButtonText: {
    textAlign: "center",
    color: "#333",
    fontSize: 16,
  },

  // Modal Buttons
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  modalCancelButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#6200ea",
  },
  modalSubmitButton: {
    backgroundColor: "#6200ea",
  },

  daysInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  daysInput: {
    width: 70,
    textAlign: "center",
    marginHorizontal: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  // Prep Instructions
  prepInstructionsContainer: {
    maxHeight: 400,
    marginVertical: 10,
  },
  prepTimeText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#6200ea",
  },

  //Daily meal plan
  dailyPlanContainer: {
    width: 320,
    padding: 16,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedDateContainer: {
    borderColor: "#6200ea",
    borderWidth: 2,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#6200ea",
  },

  // Meal sections
  mealSection: {
    marginBottom: 16,
  },
  mealTypeHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  halfButton: {
    flex: 0.48,
    borderColor: "#6200ea",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    color: "#FFFFFF !important",
  },
  instructionsLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  instructionsText: {
    color: "#6200ea",
    textDecorationLine: "underline",
  },
  // Add to your styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeIcon: {
    margin: 0,
    padding: 0,
  },
  fullWidthButton: {
    marginTop: 16,
    backgroundColor: "#6200ea",
    width: "100%",
    borderRadius: 8,
  },
  addButton: {
    margin: 0,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});

export default styles;
