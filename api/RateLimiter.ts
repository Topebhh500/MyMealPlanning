// api/RateLimiter.ts
import { auth, firestore } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants
const MAX_CALLS_PER_MINUTE = 5; // Default free tier limit
const QUOTA_RESET_INTERVAL = 60 * 1000; // 1 minute in milliseconds

// Types
interface RateLimitData {
  callsMade: number;
  lastResetTime: number;
  userApiKey?: string;
  hasCustomKey: boolean;
}

// Initialize rate limit data
let rateLimitData: RateLimitData = {
  callsMade: 0,
  lastResetTime: Date.now(),
  hasCustomKey: false,
};

/**
 * Initialize the rate limiter on app start
 */
export const initializeRateLimiter = async (): Promise<void> => {
  try {
    // Retrieve stored rate limit data
    const storedData = await AsyncStorage.getItem("rateLimitData");
    if (storedData) {
      const parsedData = JSON.parse(storedData) as RateLimitData;

      // Check if quota reset time has passed
      if (Date.now() - parsedData.lastResetTime >= QUOTA_RESET_INTERVAL) {
        // Reset the counter if the interval has passed
        rateLimitData = {
          ...parsedData,
          callsMade: 0,
          lastResetTime: Date.now(),
        };
      } else {
        rateLimitData = parsedData;
      }
    }

    // Check for user's custom API key
    const user = auth.currentUser;
    if (user) {
      const apiKeyDoc = await firestore
        .collection("apiKeys")
        .doc(user.uid)
        .get();
      if (apiKeyDoc.exists) {
        const apiKeyData = apiKeyDoc.data();
        if (
          apiKeyData?.spoonacularApiKey &&
          apiKeyData?.keyStatus === "valid"
        ) {
          rateLimitData.userApiKey = apiKeyData.spoonacularApiKey;
          rateLimitData.hasCustomKey = true;
        }
      }
    }

    // Save the initialized data
    await persistRateLimitData();
  } catch (error) {
    console.error("Error initializing rate limiter:", error);
  }
};

/**
 * Check if we can make an API call without exceeding rate limits
 */
export const canMakeApiCall = (): boolean => {
  // If the reset interval has passed, reset the counter
  if (Date.now() - rateLimitData.lastResetTime >= QUOTA_RESET_INTERVAL) {
    rateLimitData.callsMade = 0;
    rateLimitData.lastResetTime = Date.now();
    void persistRateLimitData();
  }

  // Higher limits for users with custom API keys
  const maxCalls = rateLimitData.hasCustomKey ? 150 : MAX_CALLS_PER_MINUTE;

  // Check if we've exceeded the limit
  return rateLimitData.callsMade < maxCalls;
};

/**
 * Record that an API call was made
 */
export const recordApiCall = async (): Promise<void> => {
  rateLimitData.callsMade++;
  await persistRateLimitData();

  // Update the remaining call count in Firestore if user has a custom key
  if (rateLimitData.hasCustomKey) {
    const user = auth.currentUser;
    if (user) {
      await firestore
        .collection("apiKeys")
        .doc(user.uid)
        .update({
          callsRemaining: 150 - rateLimitData.callsMade,
        });
    }
  }
};

/**
 * Get the current API key to use (user's custom key or default)
 */
export const getApiKey = (): string => {
  return rateLimitData.userApiKey || process.env.SPOONACULAR_API_KEY || "";
};

/**
 * Get the time remaining until quota reset (in seconds)
 */
export const getTimeUntilReset = (): number => {
  const elapsedTime = Date.now() - rateLimitData.lastResetTime;
  const remainingTime = Math.max(0, QUOTA_RESET_INTERVAL - elapsedTime);
  return Math.ceil(remainingTime / 1000);
};

/**
 * Get remaining API calls for this quota period
 */
export const getRemainingCalls = (): number => {
  const maxCalls = rateLimitData.hasCustomKey ? 150 : MAX_CALLS_PER_MINUTE;
  return Math.max(0, maxCalls - rateLimitData.callsMade);
};

/**
 * Save rate limit data to AsyncStorage
 */
const persistRateLimitData = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem("rateLimitData", JSON.stringify(rateLimitData));
  } catch (error) {
    console.error("Error persisting rate limit data:", error);
  }
};

/**
 * Update the user's API key
 */
export const updateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    // Here you would typically validate the key with a test call to Spoonacular
    // For now, we'll assume it's valid if it's at least 10 characters
    const isValid = apiKey.length > 10;

    // Update Firestore
    await firestore
      .collection("apiKeys")
      .doc(user.uid)
      .set({
        spoonacularApiKey: apiKey,
        keyStatus: isValid ? "valid" : "invalid",
        lastUpdated: new Date(),
        callsRemaining: isValid ? 150 : 0,
      });

    // Update local cache
    rateLimitData.userApiKey = isValid ? apiKey : undefined;
    rateLimitData.hasCustomKey = isValid;
    rateLimitData.callsMade = 0; // Reset counter with new key
    await persistRateLimitData();

    return isValid;
  } catch (error) {
    console.error("Error updating API key:", error);
    return false;
  }
};

/**
 * Implement exponential backoff for retrying API calls
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let retries = 0;

  while (true) {
    try {
      // Check if we can make an API call
      if (!canMakeApiCall()) {
        const waitTime = getTimeUntilReset();
        console.warn(
          `Rate limit reached. Waiting ${waitTime} seconds before retry...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
      }

      // Record the API call
      await recordApiCall();

      // Execute the function
      return await fn();
    } catch (error) {
      retries++;

      // If it's not a rate limit error or we've reached max retries, throw
      if (
        (error.response?.status !== 429 && error.response?.status !== 402) ||
        retries >= maxRetries
      ) {
        throw error;
      }

      // Exponential backoff: wait 2^retries seconds
      const waitTime = Math.pow(2, retries);
      console.warn(`API call failed. Retrying in ${waitTime} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    }
  }
};
