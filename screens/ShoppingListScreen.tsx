import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Surface,
  TextInput,
  Button,
  IconButton,
  Dialog,
  Portal,
  Text,
  Checkbox,
} from "react-native-paper";
import { TabView, SceneMap, NavigationState } from "react-native-tab-view";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FirebaseRepository } from "../api/firebase";
import styles from "../styles/ShoppingListStyle";
import { ShoppingItem, StockItem } from "../types/MealTypes"; // Adjust import if types are elsewhere

// Interfaces
interface Route {
  key: string;
  title: string;
}

interface ShoppingListTabProps {
  shoppingList: ShoppingItem[];
  onToggleItem: (index: number) => void;
  onMoveToStock: (item: ShoppingItem) => void;
  onRemoveItem: (index: number) => void;
}

interface StockTabProps {
  stock: StockItem[];
  onEditItem: (item: StockItem) => void;
  onRemoveItem: (item: StockItem) => void;
}

const ShoppingListTab: React.FC<ShoppingListTabProps> = ({
  shoppingList,
  onToggleItem,
  onMoveToStock,
  onRemoveItem,
}) => (
  <ScrollView style={styles.container}>
    {shoppingList.length === 0 ? (
      <View style={styles.emptyState}>
        <Icon name="cart-outline" size={48} color="#6200ea" />
        <Text style={styles.emptyStateText}>Your shopping list is empty</Text>
        <Text style={styles.emptyStateSubText}>Add items to get started</Text>
      </View>
    ) : (
      shoppingList.map((item, index) => (
        <Surface key={index} style={styles.listItem}>
          <View style={styles.itemContainer}>
            <Checkbox
              status={item.checked ? "checked" : "unchecked"}
              onPress={() => onToggleItem(index)}
              color="#6200ea"
            />
            <Text
              style={[styles.itemText, item.checked && styles.checkedItemText]}
            >
              {item.name}
            </Text>
            <View style={styles.iconContainer}>
              <IconButton
                icon="check"
                color="#4CAF50"
                onPress={() => onMoveToStock(item)}
              />
              <IconButton
                icon="delete"
                color="#F44336"
                onPress={() => onRemoveItem(index)}
              />
            </View>
          </View>
        </Surface>
      ))
    )}
  </ScrollView>
);

const StockTab: React.FC<StockTabProps> = ({
  stock,
  onEditItem,
  onRemoveItem,
}) => (
  <ScrollView style={styles.container}>
    {stock.length === 0 ? (
      <View style={styles.emptyState}>
        <Icon name="package-variant" size={48} color="#6200ea" />
        <Text style={styles.emptyStateText}>No items in stock</Text>
        <Text style={styles.emptyStateSubText}>
          Move items here from your shopping list
        </Text>
      </View>
    ) : (
      stock.map((item, index) => (
        <Surface key={index} style={styles.listItem}>
          <View style={styles.itemContainer}>
            <Icon
              name="package-variant"
              size={24}
              color="#6200ea"
              style={styles.stockIcon}
            />
            <View style={styles.stockItemTextContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemDescription}>
                Quantity: {item.quantity}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <IconButton
                icon="pencil"
                color="#6200ea"
                onPress={() => onEditItem(item)}
              />
              <IconButton
                icon="delete"
                color="#F44336"
                onPress={() => onRemoveItem(item)}
              />
            </View>
          </View>
        </Surface>
      ))
    )}
  </ScrollView>
);

const ShoppingListScreen: React.FC = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [newItem, setNewItem] = useState<string>("");
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [editedQuantity, setEditedQuantity] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<Route[]>([
    { key: "shoppingList", title: "Items to Buy" },
    { key: "stock", title: "Available Stock" },
  ]);
  const [userId, setUserId] = useState<string>("");

  const firebaseRepository = new FirebaseRepository();

  useEffect(() => {
    const unsubscribeAuth = firebaseRepository
      .auth()
      .onAuthStateChanged((user) => {
        setUserId(user?.uid || "");
        if (!user) {
          Alert.alert(
            "Authentication Required",
            "Please log in to access your shopping list."
          );
        }
      });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsubscribeShoppingList = firebaseRepository.getShoppingListRealtime(
      userId,
      (items) => setShoppingList(items),
      (error) => {
        console.error("Error in shopping list listener:", error);
        Alert.alert("Error", "Failed to sync shopping list data");
      }
    );

    const unsubscribeStock = firebaseRepository.getStockRealtime(
      userId,
      (items) => setStock(items),
      (error) => {
        console.error("Error in stock listener:", error);
        Alert.alert("Error", "Failed to sync stock data");
      }
    );

    return () => {
      unsubscribeShoppingList();
      unsubscribeStock();
    };
  }, [userId]);

  const saveShoppingList = async (items: ShoppingItem[]): Promise<void> => {
    try {
      await firebaseRepository.saveShoppingList(userId, items);
    } catch (error) {
      throw new Error(`Error saving shopping list: ${error.message}`);
    }
  };

  const saveStock = async (items: StockItem[]): Promise<void> => {
    try {
      await firebaseRepository.saveStock(userId, items);
    } catch (error) {
      throw new Error(`Error saving stock: ${error.message}`);
    }
  };

  const addItem = async (): Promise<void> => {
    if (newItem.trim()) {
      try {
        const updatedList = [
          ...shoppingList,
          { name: newItem.trim(), checked: false },
        ];
        await saveShoppingList(updatedList);
        setNewItem("");
      } catch (error) {
        Alert.alert("Error", "Failed to add item");
      }
    }
  };

  const toggleItem = async (index: number): Promise<void> => {
    try {
      const updatedList = shoppingList.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      );
      await saveShoppingList(updatedList);
    } catch (error) {
      Alert.alert("Error", "Failed to update item");
    }
  };

  const removeShoppingItem = async (index: number): Promise<void> => {
    try {
      const updatedList = shoppingList.filter((_, i) => i !== index);
      await saveShoppingList(updatedList);
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const moveToStock = async (item: ShoppingItem): Promise<void> => {
    try {
      const updatedShoppingList = shoppingList.filter(
        (listItem) => listItem.name !== item.name
      );
      const updatedStock = [...stock, { name: item.name, quantity: 1 }];
      await Promise.all([
        saveShoppingList(updatedShoppingList),
        saveStock(updatedStock),
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to move item to stock");
    }
  };

  const showEditDialog = (item: StockItem): void => {
    setSelectedItem(item);
    setEditedQuantity(item.quantity.toString());
    setEditDialogVisible(true);
  };

  const updateStockItem = async (): Promise<void> => {
    const quantity = parseInt(editedQuantity);
    if (!quantity || quantity < 1) {
      Alert.alert("Invalid Input", "Please enter a valid quantity");
      return;
    }

    try {
      const updatedStock = stock.map((item) =>
        item === selectedItem ? { ...item, quantity } : item
      );
      await saveStock(updatedStock);
      setEditDialogVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const removeStockItem = async (item: StockItem): Promise<void> => {
    try {
      const updatedStock = stock.filter((stockItem) => stockItem !== item);
      await saveStock(updatedStock);
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const clearShoppingList = async (): Promise<void> => {
    try {
      Alert.alert(
        "Clear Shopping List",
        "Are you sure you want to remove all items from your shopping list?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear All",
            style: "destructive",
            onPress: async () => {
              await saveShoppingList([]);
              Alert.alert("Success", "Shopping list cleared successfully");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      Alert.alert("Error", "Failed to clear shopping list");
    }
  };

  const renderTabBar = (props: {
    navigationState: NavigationState<Route>;
  }): JSX.Element => (
    <View style={styles.tabBarContainer}>
      {props.navigationState.routes.map((route, i) => (
        <TouchableOpacity
          key={route.key}
          style={[
            styles.tabItem,
            { borderBottomColor: index === i ? "#6200ea" : "transparent" },
          ]}
          onPress={() => setIndex(i)}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: index === i ? "#6200ea" : "#666" },
            ]}
          >
            {route.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderScene = SceneMap({
    shoppingList: () => (
      <ShoppingListTab
        shoppingList={shoppingList}
        onToggleItem={toggleItem}
        onMoveToStock={moveToStock}
        onRemoveItem={removeShoppingItem}
      />
    ),
    stock: () => (
      <StockTab
        stock={stock}
        onEditItem={showEditDialog}
        onRemoveItem={removeStockItem}
      />
    ),
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Shopping List</Text>
        {index === 0 && (
          <IconButton
            icon="trash-can-outline"
            color="#FF0000" // Fixed typo from #FFOOOO
            size={24}
            onPress={clearShoppingList}
          />
        )}
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={renderTabBar}
      />

      <Surface style={styles.addItemContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item"
          mode="outlined"
          outlineColor="#6200ea"
          activeOutlineColor="#6200ea"
          right={
            <TextInput.Icon icon="plus" color="#6200ea" onPress={addItem} />
          }
          onSubmitEditing={addItem}
        />
      </Surface>

      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
          <Dialog.Title>Edit Stock Quantity</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              value={editedQuantity}
              onChangeText={setEditedQuantity}
              keyboardType="numeric"
              mode="outlined"
              outlineColor="#6200ea"
              activeOutlineColor="#6200ea"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setEditDialogVisible(false)}
              textColor="#666"
            >
              Cancel
            </Button>
            <Button onPress={updateStockItem} textColor="#6200ea">
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default ShoppingListScreen;
