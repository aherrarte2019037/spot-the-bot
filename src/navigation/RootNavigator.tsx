import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationRoutes, RootStackParamList } from "../types/navigation";
import GameScreen from "../screens/GameScreen";
import HomeScreen from "../screens/HomeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ResultsScreen from "../screens/ResultsScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
	const { isLoading, isLoggedIn, profile } = useAuthContext();

	const isSignedOut = !isLoggedIn && !isLoading;
	const needsOnboarding = !isLoading && profile && profile.id && !profile.onboardingComplete;
	const onboardingComplete = !isLoading && profile && profile.id && profile.onboardingComplete;

	const screenOptions = {
		headerStyle: { backgroundColor: "#1e293b" },
		headerTintColor: "#f8fafc",
		headerTitleStyle: { fontWeight: "bold" as const },
	};

	const getScreens = () => {
		if (isSignedOut) {
			return (
				<>
					<RootStack.Screen
						name={NavigationRoutes.SignIn}
						component={SignInScreen}
						options={{ headerShown: false }}
					/>
					<RootStack.Screen
						name={NavigationRoutes.SignUp}
						component={SignUpScreen}
						options={{ headerShown: false }}
					/>
				</>
			);
		}

		if (needsOnboarding) {
			return (
				<RootStack.Screen
					name={NavigationRoutes.Onboarding}
					component={OnboardingScreen}
					options={{ headerShown: false }}
				/>
			);
		}

		if (onboardingComplete) {
			return (
				<>
					<RootStack.Screen
						name={NavigationRoutes.Home}
						component={HomeScreen}
					/>
					<RootStack.Screen
						name={NavigationRoutes.Game}
						component={GameScreen}
					/>
					<RootStack.Screen
						name={NavigationRoutes.Results}
						component={ResultsScreen}
					/>
				</>
			);
		}
    
		return (
			<RootStack.Screen
				name={NavigationRoutes.SignIn}
				component={SignInScreen}
				options={{ headerShown: false }}
			/>
		);
	};

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#6366f1" />
			</View>
		);
	}

	return (
		<RootStack.Navigator screenOptions={screenOptions}>
			{getScreens()}
		</RootStack.Navigator>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#0f172a",
	},
});
