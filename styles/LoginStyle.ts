import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Background
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(98, 0, 234, 0.3)", // Purple-tinted overlay that matches your brand color
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  // Header
  header: {
    backgroundColor: "rgba(98, 0, 234, 0.85)", // Slightly more transparent
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 22,
  },
  appTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 5,
  },

  // Form
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignSelf: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    marginBottom: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 2,
    borderRadius: 8,
  },

  // Buttons
  loginButton: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: "#6200ea",
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fingerprintButton: {
    marginBottom: 15,
    borderColor: "#6200ea",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 5,
    elevation: 2,
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingVertical: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Snackbar
  snackbar: {
    backgroundColor: "#323232",
    elevation: 6,
  },
  forgotPasswordButton: {
    marginTop: 10,
    marginBottom: 5,
  },
});

export default styles;
