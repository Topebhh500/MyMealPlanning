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
     ```
4. **Run the App**:
   ```bash
   npm start
   ```
   - Use Expo Go on your iOS/Android device to scan the QR code, or run on an emulator.

## Usage

1. **Log In**: Sign in using Firebase Authentication.
2. **Set Preferences**: Input dietary preferences (e.g., calories, allergies, dietary restrictions).
3. **Plan Meals**: Use the weekly calendar to select AI-suggested recipes (e.g., "Salmon Quinoa Risotto", 405 calories).
4. **Generate Shopping List**: Automatically create a shopping list from your meal plan.
5. **View Nutritional Data**: Check nutritional breakdowns for each meal.

## Project Architecture

- **Cross-Platform UI Layer**: Built with React Native and Expo SDK for a seamless user interface.
- **Application Logic Layer**: Uses Context API for state management and TypeScript for type definitions.
- **Data & AI Services Layer**: Integrates Firebase (Authentication, Firestore) and Spoonacular API for recipe and nutritional data.
- **Data Flow**: Unidirectional flow ensures predictable state management.

## Survey Insights

A survey of 56 respondents informed the app’s design:

- **Challenges**: 42.9% cited time constraints, 23.2% lacked nutrition knowledge.
- **Feature Priorities**: 80.4% desired personalized recommendations, 75.2% wanted nutritional breakdowns.
- **Dietary Preferences**:
  - Vegetarian: 83% wanted personalized recommendations, 79% nutritional breakdowns.
  - Vegan: 88% wanted personalized recommendations, 82% nutritional breakdowns.
  - Gluten-Free: 84% wanted personalized recommendations, 94% nutritional breakdowns.

## Implementation Challenges

- **Complex API Response Typing**: Used progressive typing with incremental refinement.
- **Component Prop Consistency**: Implemented shared interface definitions and prop validation.
- **Handling Nutritional Data**: Created typed data transformation utilities.
- **Reliable API Connectivity**: Added robust error handling and retry mechanisms.
- **Supervisor Change**: New supervisor’s guidance ensured continuity mid-project.

## Technical Results

- **TypeScript Benefits**:
  - Zero type safety errors post-migration.
  - 15% reduction in development errors (developer logs).
  - 100% component prop validation.
- **Performance**:
  - Spoonacular API latency: 1.6–1.8s (target: 1.5s).
  - Memory usage: 87–92 MB (20% reduction with FlatList).
  - API response success rate: 98%.

## User Testing

Tested with 8 users via Expo Go:

- Weekly calendar interface: Intuitive (7/8 users).
- AI meal recommendations: Relevant (6/8 users).
- Shopping list generation: Time-saving (8/8 users).
- Feedback: Some users noted unclear nutritional data, aligning with the 75.2% survey emphasis on nutritional breakdowns.

## Contributions

- **Typed API Integration Pattern**: A reusable model for integrating external AI services.
- **Progressive TypeScript Migration Strategy**: A practical approach for educational projects.
- **Educational Framework**: A blueprint for health tech apps in academic settings.
- **Skill Development**: Enhanced expertise in React Native, TypeScript, and AI integration.

## Future Work

- Advanced nutritional analysis across meal plans.
- Inventory management for pantry tracking.
- AI-driven meal plan optimization.
- Recipe customization for greater user personalization.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

- **Author**: Temitope Ajayi
- **GitHub**: [Topebhh500](https://github.com/Topebhh500)
- **Email**: Contact via GitHub issues for inquiries.

## Project Tree

MyMealPlanning
├─ .firebaserc
├─ api
│ ├─ firebase.ts
│ ├─ RateLimiter.ts
│ └─ spoonacular.ts
├─ app.json
├─ App.tsx
├─ assets
│ ├─ adaptive-icon.png
│ ├─ default-avatar.jpg
│ ├─ favicon.png
│ ├─ food-background.jpg
│ ├─ green-marker.png
│ ├─ icon.png
│ ├─ splash-icon.png
│ └─ splash.png
├─ babel.config.js
├─ components
│ ├─ DailyMealPlan.tsx
│ ├─ IngredientsModal.tsx
│ ├─ MealCard.tsx
│ ├─ MealPlanConfig.tsx
│ ├─ PasteMealModal.tsx
│ ├─ PrepInstructionsModal.tsx
│ └─ ShareMealPlanButton.tsx
├─ context
├─ eas.json
├─ firebase.json
├─ google-services.json
├─ index.js
├─ interfaces
│ ├─ MealPlanRepository.ts
│ └─ MealRecommendationGateway.ts
├─ package-lock.json
├─ package.json
├─ README.md
├─ screens
│ ├─ HomeScreen.tsx
│ ├─ LoginScreen.tsx
│ ├─ MealPlanScreen.tsx
│ ├─ NearbyStoresScreen.tsx
│ ├─ ProfileScreen.tsx
│ ├─ RegisterScreen.tsx
│ └─ ShoppingListScreen.tsx
├─ screenshots
│ ├─ GenerateMealPlan.jpg
│ ├─ LocationScreen.jpg
│ ├─ LoginScreen.jpg
│ ├─ MealPlan Screen.jpg
│ ├─ ProfileScreen.jpg
│ └─ ShoppingList.jpg
├─ services
│ ├─ AuthService.ts
│ ├─ MealService.ts
│ ├─ SharingService.ts
│ └─ ShoppingService.ts
├─ styles
│ ├─ HomeStyle.ts
│ ├─ LoginStyle.ts
│ ├─ MealPlanStyle.ts
│ ├─ NearbyStoresStyle.ts
│ ├─ ProfileStyle.ts
│ ├─ RegisterStyle.ts
│ ├─ ShoppingListStyle.ts
│ └─ theme.ts
├─ tsconfig.json
├─ types
│ ├─ MealTypes.ts
│ └─ ShoppingTypes.ts
└─ utils
├─ DateUtils.ts
├─ firebaseListeners.ts
└─ MealQueryHelper.ts

```

```
