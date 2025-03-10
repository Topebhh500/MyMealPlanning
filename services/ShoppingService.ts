import { firestore, auth } from "../api/firebase";

// Interfaces
export interface ShoppingItem {
  name: string;
  checked: boolean;
}

export interface StockItem {
  name: string;
  quantity: number;
}

class ShoppingService {
  // Get current user ID
  private getCurrentUserId(): string | null {
    const user = auth.currentUser;
    return user ? user.uid : null;
  }

  // Save data to Firebase
  private async saveToFirebase(
    collection: string,
    items: ShoppingItem[] | StockItem[]
  ): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }
      await firestore.collection(collection).doc(userId).set({ items });
    } catch (error) {
      throw new Error(
        `Error saving to ${collection}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Set up real-time listeners for shopping list
  public setupShoppingListListener(
    onUpdate: (items: ShoppingItem[]) => void,
    onError: (error: string) => void
  ): () => void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      onError("User not authenticated");
      return () => {};
    }

    return firestore
      .collection("shoppingLists")
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            onUpdate(doc.data()?.items || []);
          } else {
            onUpdate([]);
          }
        },
        (error) => {
          console.error("Error in shopping list listener:", error);
          onError("Failed to sync shopping list data");
        }
      );
  }

  // Set up real-time listeners for stock
  public setupStockListener(
    onUpdate: (items: StockItem[]) => void,
    onError: (error: string) => void
  ): () => void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      onError("User not authenticated");
      return () => {};
    }

    return firestore
      .collection("stocks")
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            onUpdate(doc.data()?.items || []);
          } else {
            onUpdate([]);
          }
        },
        (error) => {
          console.error("Error in stock listener:", error);
          onError("Failed to sync stock data");
        }
      );
  }

  // Add item to shopping list
  public async addShoppingItem(
    item: string,
    currentItems: ShoppingItem[]
  ): Promise<ShoppingItem[]> {
    if (!item.trim()) {
      throw new Error("Item name cannot be empty");
    }

    const updatedList = [
      ...currentItems,
      { name: item.trim(), checked: false },
    ];
    await this.saveToFirebase("shoppingLists", updatedList);
    return updatedList;
  }

  // Toggle item checked status
  public async toggleShoppingItem(
    index: number,
    currentItems: ShoppingItem[]
  ): Promise<ShoppingItem[]> {
    const updatedList = currentItems.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    await this.saveToFirebase("shoppingLists", updatedList);
    return updatedList;
  }

  // Remove item from shopping list
  public async removeShoppingItem(
    index: number,
    currentItems: ShoppingItem[]
  ): Promise<ShoppingItem[]> {
    const updatedList = currentItems.filter((_, i) => i !== index);
    await this.saveToFirebase("shoppingLists", updatedList);
    return updatedList;
  }

  // Move item from shopping list to stock
  public async moveItemToStock(
    item: ShoppingItem,
    currentShoppingList: ShoppingItem[],
    currentStock: StockItem[]
  ): Promise<{ shoppingList: ShoppingItem[]; stock: StockItem[] }> {
    const updatedShoppingList = currentShoppingList.filter(
      (listItem) => listItem.name !== item.name
    );
    const updatedStock = [...currentStock, { name: item.name, quantity: 1 }];

    await Promise.all([
      this.saveToFirebase("shoppingLists", updatedShoppingList),
      this.saveToFirebase("stocks", updatedStock),
    ]);

    return { shoppingList: updatedShoppingList, stock: updatedStock };
  }

  // Update stock item quantity
  public async updateStockItemQuantity(
    item: StockItem,
    quantity: number,
    currentStock: StockItem[]
  ): Promise<StockItem[]> {
    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be a positive number");
    }

    const updatedStock = currentStock.map((stockItem) =>
      stockItem.name === item.name ? { ...stockItem, quantity } : stockItem
    );
    await this.saveToFirebase("stocks", updatedStock);
    return updatedStock;
  }

  // Remove item from stock
  public async removeStockItem(
    item: StockItem,
    currentStock: StockItem[]
  ): Promise<StockItem[]> {
    const updatedStock = currentStock.filter(
      (stockItem) => stockItem.name !== item.name
    );
    await this.saveToFirebase("stocks", updatedStock);
    return updatedStock;
  }

  // Clear entire shopping list
  public async clearShoppingList(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await firestore.collection("shoppingLists").doc(userId).set({ items: [] });
  }
}

// Export as singleton
const shoppingService = new ShoppingService();
export default shoppingService;
