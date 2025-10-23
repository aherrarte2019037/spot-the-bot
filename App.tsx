import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "./src/providers";
import HomeScreen from "./src/screens/HomeScreen";
import GameScreen from "./src/screens/GameScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createStackNavigator();

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AppProviders>
				<NavigationContainer>
					<StatusBar style="light" />
					<Stack.Navigator
						initialRouteName="Home"
						screenOptions={{
							headerStyle: {
								backgroundColor: "#1e293b",
							},
							headerTintColor: "#f8fafc",
							headerTitleStyle: {
								fontWeight: "bold",
							},
						}}
					>
						<Stack.Screen
							name="Home"
							component={HomeScreen}
							options={{ title: "Spot the Bot" }}
						/>
						<Stack.Screen
							name="Game"
							component={GameScreen}
							options={{ title: "Game Room" }}
						/>
						<Stack.Screen
							name="Results"
							component={ResultsScreen}
							options={{ title: "Game Results" }}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</AppProviders>
		</GestureHandlerRootView>
	);
}
