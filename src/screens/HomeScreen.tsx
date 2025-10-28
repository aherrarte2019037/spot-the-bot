import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { authService } from "../services";
import { Avatar } from "../components/common";
import { useAuthContext } from "../contexts/AuthContext";
import { authLogger } from "../utils/logger";
import { AppStackScreenProps, NavigationRoutes } from "../types";

type Props = AppStackScreenProps<NavigationRoutes.Home>;

export default function HomeScreen({ navigation }: Props) {
	const { profile } = useAuthContext();

	const handleSignOut = async () => {
		try {
			await authService.signOut();
		} catch (error) {
			authLogger.error("Sign out error:", error);
		}
	};

	return (
		<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
			<ScrollView 
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				<Text style={styles.title}>Spot the Bot</Text>
				<Text style={styles.subtitle}>Can you spot the AI?</Text>

				<View style={styles.userInfo}>
					<Avatar profile={profile} size={60} />
					<Text style={styles.welcomeText}>Welcome, {profile.user_name}!</Text>
					<TouchableOpacity
						style={styles.signOutButton}
						onPress={handleSignOut}
					>
						<Text style={styles.signOutText}>Sign Out</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.primaryButton}
						onPress={() =>
							navigation.navigate(NavigationRoutes.Game, { gameId: "demo" })
						}
					>
						<Ionicons name="play" size={24} color="#fff" />
						<Text style={styles.buttonText}>Start Game</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.secondaryButton}>
						<Ionicons name="people" size={24} color="#6366f1" />
						<Text style={styles.secondaryButtonText}>Join Room</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 24,
		justifyContent: "center",
    alignItems: "center",
	},
	title: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#f8fafc",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 18,
		color: "#94a3b8",
		marginBottom: 48,
	},
	buttonContainer: {
		width: "100%",
		gap: 16,
	},
	primaryButton: {
		backgroundColor: "#6366f1",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 12,
		gap: 8,
	},
	secondaryButton: {
		backgroundColor: "transparent",
		borderWidth: 2,
		borderColor: "#6366f1",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 12,
		gap: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	secondaryButtonText: {
		color: "#6366f1",
		fontSize: 18,
		fontWeight: "600",
	},
	userInfo: {
		alignItems: "center",
		marginBottom: 24,
		gap: 12,
	},
	welcomeText: {
		color: "#f8fafc",
		fontSize: 16,
		marginBottom: 8,
	},
	signOutButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: "#334155",
	},
	signOutText: {
		color: "#94a3b8",
		fontSize: 14,
	},
});
