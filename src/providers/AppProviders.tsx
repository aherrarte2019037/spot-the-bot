import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthProvider from "./AuthProvider";
import { KeyboardProvider } from "react-native-keyboard-controller";

interface AppProvidersProps {
	children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
	return (
		<SafeAreaProvider>
			<KeyboardProvider>
				<AuthProvider>{children}</AuthProvider>
			</KeyboardProvider>
		</SafeAreaProvider>
	);
}
