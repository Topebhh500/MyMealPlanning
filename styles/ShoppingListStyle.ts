import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  listItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 8,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  checkedItemText: {
    textDecorationLine: "line-through",
    color: "#9E9E9E",
  },
  stockItemTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#757575",
  },
  iconContainer: {
    flexDirection: "row",
  },
  stockIcon: {
    marginLeft: 8,
  },
  addItemContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    elevation: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#757575",
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
} as const);

export default styles;
