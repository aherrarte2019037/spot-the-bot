import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppProviders } from "./src/providers";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AppProviders>
				<NavigationContainer>
					<StatusBar style="light" />
					<RootNavigator />
				</NavigationContainer>
			</AppProviders>
		</GestureHandlerRootView>
	);
}
