import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { authService } from "../services";
import { FormInput } from "../components/common";
import { signInSchema, SignInFormData } from "../schemas/authSchemas";
import { authLogger } from "../utils/logger";
import { PlatformType } from "../types";
import { AuthStackScreenProps, NavigationRoutes } from "../types/navigation";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import AppleSignInButton from "../components/auth/AppleSignInButton";

type Props = AuthStackScreenProps<NavigationRoutes.SignIn>;

export default function SignInScreen({ navigation }: Props) {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isAppleAvailable, setIsAppleAvailable] = useState(false);

	useEffect(() => {
		checkAppleAvailability();
	}, []);

	const checkAppleAvailability = async () => {
		const available = await authService.isAppleSignInAvailable();
		setIsAppleAvailable(available);
	};

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onBlur",
	});

	const onSubmit = async (data: SignInFormData) => {
		setLoading(true);

		try {
			const { user } = await authService.signInWithEmail(
				data.email.trim(),
				data.password
			);
			if (user) reset();
		} catch (error) {
			authLogger.error(`Email sign in failed: ${error}`);
			Alert.alert("Error", `Failed to sign in: ${error}`);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setLoading(true);
		try {
			await authService.signInWithGoogle();
		} catch (error) {
			Alert.alert("Sign In Error", "Failed to sign in with Google");
		} finally {
			setLoading(false);
		}
	};

	const handleAppleSignIn = async () => {
		setLoading(true);
		try {
			await authService.signInWithApple();
		} catch (error) {
			Alert.alert("Sign In Error", "Failed to sign in with Apple");
		} finally {
			setLoading(false);
		}
	};

	const handleSwitchToSignUp = () => {
		navigation.navigate(NavigationRoutes.SignUp);
	};

	return (
		<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === PlatformType.IOS ? "padding" : "height"}
				style={styles.keyboardView}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.header}>
						<Text style={styles.title}>Welcome to Spot the Bot</Text>
						<Text style={styles.subtitle}>Sign in to start playing</Text>
					</View>

					<View style={styles.socialAuthContainer}>
						<GoogleSignInButton
							onPress={handleGoogleSignIn}
							disabled={loading}
						/>
						{isAppleAvailable && (
							<AppleSignInButton
								onPress={handleAppleSignIn}
								disabled={loading}
							/>
						)}
					</View>

					<View style={styles.divider}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>or</Text>
						<View style={styles.dividerLine} />
					</View>

					<View style={styles.form}>
						<FormInput
							control={control}
							name="email"
							prefix={
								<Ionicons name="mail-outline" size={20} color="#64748b" />
							}
							placeholder="Email"
							error={errors.email}
							keyboardType="email-address"
							autoComplete="email"
							editable={!loading}
						/>

						<FormInput
							control={control}
							name="password"
							prefix={
								<Ionicons
									name="lock-closed-outline"
									size={20}
									color="#64748b"
								/>
							}
							placeholder="Password"
							error={errors.password}
							secureTextEntry={!showPassword}
							autoComplete="password"
							editable={!loading}
							suffix={
								<TouchableOpacity
									style={styles.eyeButton}
									onPress={() => setShowPassword(!showPassword)}
								>
									<Ionicons
										name={showPassword ? "eye-outline" : "eye-off-outline"}
										size={20}
										color="#64748b"
									/>
								</TouchableOpacity>
							}
						/>

						<TouchableOpacity
							style={[styles.submitButton, loading && styles.buttonDisabled]}
							onPress={handleSubmit(onSubmit)}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.submitButtonText}>Sign In</Text>
							)}
						</TouchableOpacity>

						<View style={styles.toggleContainer}>
							<Text style={styles.toggleText}>Don't have an account?</Text>
							<TouchableOpacity
								onPress={handleSwitchToSignUp}
								disabled={loading}
							>
								<Text style={styles.toggleLink}>Sign Up</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 24,
		justifyContent: "center",
	},
	header: {
		alignItems: "center",
		marginBottom: 32,
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
		textAlign: "center",
	},
	socialAuthContainer: {
		width: "100%",
		gap: 16,
		marginBottom: 24,
	},
	divider: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 24,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#334155",
	},
	dividerText: {
		color: "#94a3b8",
		fontSize: 14,
		marginHorizontal: 16,
	},
	form: {
		gap: 16,
	},
	submitButton: {
		backgroundColor: "#6366f1",
		borderRadius: 12,
		minHeight: 54,
		padding: 16,
		alignItems: "center",
		marginTop: 8,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	toggleContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 8,
		marginTop: 8,
	},
	toggleText: {
		color: "#94a3b8",
		fontSize: 14,
	},
	toggleLink: {
		color: "#6366f1",
		fontSize: 14,
		fontWeight: "600",
	},
	eyeButton: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
