import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  profileHeader: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
  },
  uploadButton: {
    borderColor: "#6200ea",
    borderWidth: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#6200ea",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: "#f0f0f0",
  },
  selectedChip: {
    backgroundColor: "#6200ea",
  },
  settingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#6200ea",
  },
  logoutButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#f44336",
  },
  snackbar: {
    backgroundColor: "#4caf50",
  },
  errorSnackbar: {
    backgroundColor: "#f44336",
  },

  // API Status styles
  apiStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  apiStatusLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 12,
  },
  apiStatusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusDotValid: {
    backgroundColor: "#4caf50",
  },
  statusDotInvalid: {
    backgroundColor: "#f44336",
  },
  statusDotUnknown: {
    backgroundColor: "#ffc107",
  },
  apiStatusText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // API Limit styles
  apiLimitContainer: {
    marginBottom: 16,
  },
  apiLimitLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  apiLimitValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  apiLimitProgress: {
    height: 6,
    borderRadius: 3,
  },

  // Complexity options
  complexityOption: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  complexityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  complexityTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  complexityLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  complexityDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Template styles
  templatesList: {
    maxHeight: 300,
  },
  templateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600",
  },
  templateDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  templateActions: {
    flexDirection: "row",
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },

  // Modal styles
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#6200ea",
  },
  modalDescription: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#6200ea",
  },

  // Action buttons
  actionButton: {
    marginVertical: 8,
    borderColor: "#6200ea",
  },
});

export default styles;
