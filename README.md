# AI-Powered Meal Planning App to Support Good Health

## Overview

This project, developed as part of a Bachelor of Business Information Technology thesis at Haaga-Helia University of Applied Sciences (May 2025), is an educational prototype designed to address meal planning challenges using AI-driven solutions. The app integrates the Spoonacular API to provide personalized meal suggestions based on user dietary preferences, enabling users to create weekly meal plans, access AI-suggested recipes, and generate shopping lists via a React Native interface. The project emphasizes learning modern development techniques, including TypeScript migration, component-based architecture, and API integration.

## Features

- **Personalized Meal Suggestions**: Uses the Spoonacular API to recommend recipes tailored to user dietary preferences (e.g., vegetarian, vegan, gluten-free).
- **Weekly Meal Plans**: Allows users to schedule meals using an intuitive calendar interface.
- **Shopping List Generation**: Automatically creates shopping lists based on selected recipes.
- **Nutritional Breakdowns**: Displays nutritional data (calories, protein, carbs, fat) for each meal.
- **Cross-Platform Interface**: Built with React Native for iOS and Android compatibility.

## Technology Stack

- **Frontend**: React Native with TypeScript, Expo SDK
- **Backend**: Firebase (Authentication, Cloud Firestore)
- **AI Services**: Spoonacular API (recipe and nutritional data)
- **Architecture**: Component-based with separation of concerns, unidirectional data flow

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Topebhh500/MyMealPlanning.git
   cd MyMealPlanning
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add your Firebase and Spoonacular API keys:
     ```
     FIREBASE_API_KEY=your_firebase_api_key
     SPOONACULAR_API_KEY=your_spoonacular_api_key
     GOOGLE_PLACES_API_KEY=your_google_place_api_key
     ```
4. **Run the App**:
   ```bash
   npm start
   ```
   - Use Expo Go on your iOS/Android device to scan the QR code, or run on an emulator.

## Usage

1. **Log In**: Sign in using Firebase Authentication (`screens/LoginScreen.tsx`).
2. **Set Preferences**: Input dietary preferences (e.g., calories, allergies, dietary restrictions) via `screens/ProfileScreen.tsx`.
3. **Plan Meals**: Use the weekly calendar in `screens/MealPlanScreen.tsx` to select AI-suggested recipes (e.g., "Salmon Quinoa Risotto", 405 calories).
4. **Generate Shopping List**: Automatically create a shopping list in `screens/ShoppingListScreen.tsx`.
5. **View Nutritional Data**: Check nutritional breakdowns for each meal via `components/MealCard.tsx`.

## Project Structure

Below is the file structure of the project:

```
MyMealPlanning
├─ .firebaserc                  # Firebase configuration
├─ api                          # API integration utilities
│ ├─ firebase.ts               # Firebase API setup
│ ├─ RateLimiter.ts            # API rate limiting logic
│ └─ spoonacular.ts            # Spoonacular API integration
├─ app.json                     # Expo app configuration
├─ App.tsx                      # Main app entry point
├─ assets                       # Static assets for UI
│ ├─ adaptive-icon.png
│ ├─ default-avatar.jpg
│ ├─ favicon.png
│ ├─ food-background.jpg
│ ├─ green-marker.png
│ ├─ icon.png
│ ├─ splash-icon.png
│ └─ splash.png
├─ babel.config.js              # Babel configuration
├─ components                   # Reusable UI components
│ ├─ DailyMealPlan.tsx
│ ├─ IngredientsModal.tsx
│ ├─ MealCard.tsx
│ ├─ MealPlanConfig.tsx
│ ├─ PasteMealModal.tsx
│ ├─ PrepInstructionsModal.tsx
│ └─ ShareMealPlanButton.tsx
├─ context                      # State management (Context API)
├─ eas.json                     # Expo Application Services configuration
├─ firebase.json                # Firebase project settings
├─ google-services.json         # Firebase Android configuration
├─ index.js                     # App entry point for bundling
├─ interfaces                   # TypeScript interfaces for repositories
│ ├─ MealPlanRepository.ts
│ └─ MealRecommendationGateway.ts
├─ package-lock.json            # Dependency lock file
├─ package.json                 # Project dependencies and scripts
├─ README.md                    # Project documentation
├─ screens                      # Main app screens
│ ├─ HomeScreen.tsx
│ ├─ LoginScreen.tsx
│ ├─ MealPlanScreen.tsx
│ ├─ NearbyStoresScreen.tsx
│ ├─ ProfileScreen.tsx
│ ├─ RegisterScreen.tsx
│ └─ ShoppingListScreen.tsx
├─ screenshots                  # App screenshots for documentation
│ ├─ GenerateMealPlan.jpg
│ ├─ LocationScreen.jpg
│ ├─ LoginScreen.jpg
│ ├─ MealPlan Screen.jpg
│ ├─ ProfileScreen.jpg
│ └─ ShoppingList.jpg
├─ services                     # Business logic services
│ ├─ AuthService.ts
│ ├─ MealService.ts
│ ├─ SharingService.ts
│ └─ ShoppingService.ts
├─ styles                       # Styling for screens
│ ├─ HomeStyle.ts
│ ├─ LoginStyle.ts
│ ├─ MealPlanStyle.ts
│ ├─ NearbyStoresStyle.ts
│ ├─ ProfileStyle.ts
│ ├─ RegisterStyle.ts
│ ├─ ShoppingListStyle.ts
│ └─ theme.ts
├─ tsconfig.json                # TypeScript configuration
├─ types                        # TypeScript type definitions
│ ├─ MealTypes.ts
│ └─ ShoppingTypes.ts
└─ utils                        # Utility functions
  ├─ DateUtils.ts
  ├─ firebaseListeners.ts
  └─ MealQueryHelper.ts
```

## Project Architecture

- **Cross-Platform UI Layer**: Built with React Native (`screens/`, `components/`) and Expo SDK for a seamless user interface.
- **Application Logic Layer**: Uses Context API (`context/`) for state management and TypeScript for type definitions (`types/`).
- **Data & AI Services Layer**: Integrates Firebase (`api/firebase.ts`) and Spoonacular API (`api/spoonacular.ts`) for recipe and nutritional data.
- **Data Flow**: Unidirectional flow ensures predictable state management, implemented via Context API.

## Survey Insights

A survey of 56 respondents informed the app’s design:

- **Challenges**: 42.9% cited time constraints, 23.2% lacked nutrition knowledge (Slide 3).
- **Feature Priorities**: 80.4% desired personalized recommendations, 75.2% wanted nutritional breakdowns (Slide 4).
- **Dietary Preferences** (Slide 4):
  - Vegetarian: 83% wanted personalized recommendations, 79% nutritional breakdowns.
  - Vegan: 88% wanted personalized recommendations, 82% nutritional breakdowns.
  - Gluten-Free: 84% wanted personalized recommendations, 94% nutritional breakdowns.

## Implementation Challenges

- **Complex API Response Typing**: Used progressive typing with incremental refinement (`types/MealTypes.ts`).
- **Component Prop Consistency**: Implemented shared interface definitions and prop validation (`components/`).
- **Handling Nutritional Data**: Created typed data transformation utilities (`services/MealService.ts`).
- **Reliable API Connectivity**: Added robust error handling and retry mechanisms (`api/RateLimiter.ts`).
- **Supervisor Change**: New supervisor’s guidance ensured continuity mid-project (Slide 11).

## Technical Results

- **TypeScript Benefits** (Slide 9):
  - Zero type safety errors post-migration.
  - 15% reduction in development errors (developer logs).
  - 100% component prop validation.
- **Performance** (Slide 9):
  - Spoonacular API latency: 1.6–1.8s (target: 1.5s).
  - Memory usage: 87–92 MB (20% reduction with FlatList).
  - API response success rate: 98%.

## User Testing

Tested with 8 users via Expo Go (Slide 10):

- Weekly calendar interface (`screens/MealPlanScreen.tsx`): Intuitive (7/8 users).
- AI meal recommendations (`services/MealService.ts`): Relevant (6/8 users).
- Shopping list generation (`screens/ShoppingListScreen.tsx`): Time-saving (8/8 users).
- Feedback: Some users noted unclear nutritional data, aligning with the 75.2% survey emphasis on nutritional breakdowns.

## Contributions

- **Typed API Integration Pattern**: A reusable model for integrating external AI services (`api/`).
- **Progressive TypeScript Migration Strategy**: A practical approach for educational projects (`tsconfig.json`, `types/`).
- **Educational Framework**: A blueprint for health tech apps in academic settings.
- **Skill Development**: Enhanced expertise in React Native, TypeScript, and AI integration.

## Future Work

- Advanced nutritional analysis across meal plans (`services/MealService.ts`).
- Inventory management for pantry tracking.
- AI-driven meal plan optimization (`api/spoonacular.ts`).
- Recipe customization for greater user personalization (`components/MealCard.tsx`).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

- **Author**: Temitope Ajayi
- **GitHub**: [Topebhh500](https://github.com/Topebhh500)
- **Email**: Contact via GitHub issues for inquiries.
