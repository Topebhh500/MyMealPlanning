import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    backgroundColor: "#6200ea",
    padding: 20,
    alignItems: "center",
    elevation: 4,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 8,
  },
  uploadButton: {
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 16,
  },
  saveButton: {
    marginBottom: 12,
    backgroundColor: "#6200ea",
    padding: 8,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 8,
  },
  snackbar: {
    backgroundColor: "#323232",
  },

  templateButton: {
    marginTop: 10,
  },

  modalContainer: {
    margin: 20,
  },

  modalContent: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },

  modalTitle: {
    marginBottom: 15,
  },

  templatesList: {
    maxHeight: 300,
  },

  templateItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },

  templateInfo: {
    flex: 1,
  },

  templateName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  templateDate: {
    fontSize: 12,
    color: "#666",
  },

  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },

  closeButton: {
    marginTop: 15,
    backgroundColor: "#6200ea",
  },
} as const);

export default styles;
