import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { MealPlanRepository } from "../interfaces/MealPlanRepository";
import {
  MealPlan,
  ShoppingListItem,
  UserPreferences,
} from "../types/MealTypes";

// Interface for Firebase configuration
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

// Firebase configuration with type annotation
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firebase services
const auth: firebase.auth.Auth = firebase.auth();
const firestore: firebase.firestore.Firestore = firebase.firestore();
const storage: firebase.storage.Storage = firebase.storage();

export class FirebaseRepository implements MealPlanRepository {
  async saveMealPlan(userId: string, mealPlan: MealPlan): Promise<void> {
    if (!userId) throw new Error("User not authenticated");
    try {
      await firestore.collection("mealPlans").doc(userId).set(mealPlan);
    } catch (error) {
      console.error("Firebase Error saving meal plan:", error);
      throw new Error("Failed to save meal plan");
    }
  }

  auth(): firebase.auth.Auth {
    return auth; // Expose the auth instance
  }

  async createMealPlanTemplate(
    userId: string,
    mealPlan: MealPlan,
    templateName: string
  ): Promise<void> {
    if (!userId) throw new Error("User not authenticated");
    try {
      const templateRef = firestore
        .collection("mealPlanTemplates")
        .doc(userId)
        .collection("templates")
        .doc();
      await templateRef.set({
        name: templateName,
        meals: mealPlan,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Firebase Error creating template:", error);
      throw new Error("Failed to create meal plan template");
    }
  }

  async loadMealPlanTemplate(
    userId: string,
    templateId: string
  ): Promise<MealPlan> {
    if (!userId) throw new Error("User not authenticated");
    try {
      const templateDoc = await firestore
        .collection("mealPlanTemplates")
        .doc(userId)
        .collection("templates")
        .doc(templateId)
        .get();
      if (!templateDoc.exists) {
        throw new Error("Template not found");
      }
      const templateData = templateDoc.data() as { meals: MealPlan };
      return templateData.meals;
    } catch (error) {
      console.error("Firebase Error loading template:", error);
      throw new Error("Failed to load meal plan template");
    }
  }

  async getMealPlan(userId: string): Promise<MealPlan | null> {
    if (!userId) throw new Error("User not authenticated");
    try {
      const doc = await firestore.collection("mealPlans").doc(userId).get();
      return doc.exists ? (doc.data() as MealPlan) : null;
    } catch (error) {
      console.error("Firebase Error getting meal plan:", error);
      throw new Error("Failed to retrieve meal plan");
    }
  }

  async updateMealPlan(userId: string, mealPlan: MealPlan): Promise<void> {
    if (!userId) throw new Error("User not authenticated");
    try {
      await firestore
        .collection("mealPlans")
        .doc(userId)
        .set(mealPlan, { merge: true });
    } catch (error) {
      console.error("Firebase Error updating meal plan:", error);
      throw new Error("Failed to update meal plan");
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (!userId) throw new Error("User not authenticated");
    try {
      const doc = await firestore.collection("users").doc(userId).get();
      return doc.exists ? (doc.data() as UserPreferences) : null;
    } catch (error) {
      console.error("Firebase Error getting user preferences:", error);
      throw new Error("Failed to retrieve user preferences");
    }
  }

  async getShoppingList(userId: string): Promise<ShoppingListItem[] | null> {
    if (!userId) throw new Error("User not authenticated");
    try {
      const doc = await firestore.collection("shoppingLists").doc(userId).get();
      return doc.exists
        ? (doc.data()?.items as ShoppingListItem[]) || []
        : null;
    } catch (error) {
      console.error("Firebase Error getting shopping list:", error);
      throw new Error("Failed to retrieve shopping list");
    }
  }

  async saveShoppingList(
    userId: string,
    list: ShoppingListItem[]
  ): Promise<void> {
    if (!userId) throw new Error("User not authenticated");
    try {
      await firestore
        .collection("shoppingLists")
        .doc(userId)
        .set({ items: list });
    } catch (error) {
      console.error("Firebase Error saving shopping list:", error);
      throw new Error("Failed to save shopping list");
    }
  }

  async getShoppingListRealtime(
    userId: string,
    onUpdate: (items: ShoppingItem[]) => void,
    onError: (error: Error) => void
  ): () => void {
    if (!userId) throw new Error("User not authenticated");
    const ref = firestore.collection("shoppingLists").doc(userId);
    const unsubscribe = ref.onSnapshot(
      (doc) =>
        onUpdate(doc.exists ? (doc.data()?.items as ShoppingItem[]) || [] : []),
      (error) => onError(error)
    );
    return unsubscribe;
  }

  async getStockRealtime(
    userId: string,
    onUpdate: (items: StockItem[]) => void,
    onError: (error: Error) => void
  ): () => void {
    if (!userId) throw new Error("User not authenticated");
    const ref = firestore.collection("stocks").doc(userId);
    const unsubscribe = ref.onSnapshot(
      (doc) =>
        onUpdate(doc.exists ? (doc.data()?.items as StockItem[]) || [] : []),
      (error) => onError(error)
    );
    return unsubscribe;
  }

  async saveShoppingList(userId: string, list: ShoppingItem[]): Promise<void> {
    if (!userId) throw new Error("User not authenticated");
    try {
      await firestore
        .collection("shoppingLists")
        .doc(userId)
        .set({ items: list });
    } catch (error) {
      console.error("Firebase Error saving shopping list:", error);
      throw new Error("Failed to save shopping list");
    }
  }

  async saveStock(userId: string, stock: StockItem[]): Promise<void> {
    if (!userId) throw new Error("User not authenticated");
    try {
      await firestore.collection("stocks").doc(userId).set({ items: stock });
    } catch (error) {
      console.error("Firebase Error saving stock:", error);
      throw new Error("Failed to save stock");
    }
  }
}

// Export Firebase services for legacy use (optional, can be phased out)
export { auth, firestore, storage };

// Type exports (optional, for legacy compatibility)
export type FirebaseAuth = firebase.auth.Auth;
export type FirebaseFirestore = firebase.firestore.Firestore;
export type FirebaseStorage = firebase.storage.Storage;
export type FirebaseUser = firebase.User;
export type FirebaseDocument = firebase.firestore.DocumentData;
