import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { authService } from "../../services";
import GoogleSignInButton from "./GoogleSignInButton";
import AppleSignInButton from "./AppleSignInButton";
import EmailSignInButton from "./EmailSignInButton";

interface AuthButtonsProps {
	onAuthSuccess: (user: any) => void;
}

export default function AuthButtons({ onAuthSuccess }: AuthButtonsProps) {
	const [isAppleAvailable, setIsAppleAvailable] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		checkAppleAvailability();
	}, []);

	const checkAppleAvailability = async () => {
		const available = await authService.isAppleSignInAvailable();
		setIsAppleAvailable(available);
	};

	const handleGoogleSignIn = async () => {
		setLoading(true);
		try {
			const { user } = await authService.signInWithGoogle();
			onAuthSuccess(user);
		} catch (error) {
			Alert.alert("Sign In Error", "Failed to sign in with Google");
		} finally {
			setLoading(false);
		}
	};

	const handleAppleSignIn = async () => {
		setLoading(true);
		try {
			const { user } = await authService.signInWithApple();
			onAuthSuccess(user);
		} catch (error) {
			Alert.alert("Sign In Error", "Failed to sign in with Apple");
		} finally {
			setLoading(false);
		}
	};

	const handleEmailSignIn = () => {
		Alert.alert("Coming Soon", "Email sign-in will be available soon!");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to Spot the Bot</Text>
			<Text style={styles.subtitle}>Sign in to start playing</Text>

			<View style={styles.buttonContainer}>
				<GoogleSignInButton onPress={handleGoogleSignIn} disabled={loading} />

				{isAppleAvailable && (
					<AppleSignInButton onPress={handleAppleSignIn} disabled={loading} />
				)}

				<EmailSignInButton onPress={handleEmailSignIn} disabled={loading} />
			</View>

			{loading && <Text style={styles.loadingText}>Signing in...</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#f8fafc",
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#94a3b8",
		marginBottom: 32,
		textAlign: "center",
	},
	buttonContainer: {
		width: "100%",
		gap: 16,
	},
	loadingText: {
		color: "#94a3b8",
		fontSize: 14,
		marginTop: 16,
	},
});
