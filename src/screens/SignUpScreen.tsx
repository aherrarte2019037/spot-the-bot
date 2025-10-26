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
import { signUpSchema, SignUpFormData } from "../schemas/authSchemas";
import { authLogger } from "../utils/logger";
import { PlatformType } from "../types";
import { AuthStackScreenProps, NavigationRoutes } from "../types/navigation";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import AppleSignInButton from "../components/auth/AppleSignInButton";

type Props = AuthStackScreenProps<NavigationRoutes.SignUp>;

export default function SignUpScreen({ navigation }: Props) {
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
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onBlur",
	});

	const onSubmit = async (data: SignUpFormData) => {
		setLoading(true);

		try {
			await authService.signUpWithEmail(data.email.trim(), data.password);

			Alert.alert(
				"Success",
				"Account created! Please check your email to verify your account.",
				[
					{
						text: "OK",
						onPress: () => {
							navigation.navigate(NavigationRoutes.SignIn);
						},
					},
				]
			);
		} catch (error: any) {
			authLogger.error("Email sign up failed: " + error.message);
			Alert.alert("Error", error.message || "Failed to sign up");
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

	const handleSwitchToSignIn = () => {
		navigation.navigate(NavigationRoutes.SignIn);
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
						<TouchableOpacity
							onPress={() => navigation.goBack()}
							style={styles.backButton}
						>
							<Ionicons name="arrow-back" size={24} color="#94a3b8" />
						</TouchableOpacity>
						<Text style={styles.title}>Create Account</Text>
						<View style={styles.placeholder} />
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

						<FormInput
							control={control}
							name="confirmPassword"
							prefix={
								<Ionicons
									name="lock-closed-outline"
									size={20}
									color="#64748b"
								/>
							}
							placeholder="Confirm Password"
							error={errors.confirmPassword}
							secureTextEntry={!showPassword}
							editable={!loading}
						/>

						<TouchableOpacity
							style={[styles.submitButton, loading && styles.buttonDisabled]}
							onPress={handleSubmit(onSubmit)}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.submitButtonText}>Sign Up</Text>
							)}
						</TouchableOpacity>

						<View style={styles.toggleContainer}>
							<Text style={styles.toggleText}>Already have an account?</Text>
							<TouchableOpacity
								onPress={handleSwitchToSignIn}
								disabled={loading}
							>
								<Text style={styles.toggleLink}>Sign In</Text>
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 48,
	},
	backButton: {
		padding: 4,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#f8fafc",
	},
	placeholder: {
		width: 32,
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
