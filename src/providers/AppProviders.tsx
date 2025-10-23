import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthProvider from "./AuthProvider";

interface AppProvidersProps {
	children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
	return (
		<SafeAreaProvider>
			<AuthProvider>{children}</AuthProvider>
		</SafeAreaProvider>
	);
}
