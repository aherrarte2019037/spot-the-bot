import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	BackHandler,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { profileService } from "../services";
import { FormInput } from "../components/common";
import { authLogger } from "../utils/logger";
import { UsernameFormData, usernameSchema } from "../schemas";
import { AppStackScreenProps, NavigationRoutes } from "../types/navigation";
import { useAuthContext } from "../contexts";
import { PlatformType } from "../types";

type Props = AppStackScreenProps<NavigationRoutes.Onboarding>;

export default function OnboardingScreen({ navigation }: Props) {
	const [currentStep, setCurrentStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const { profile, refreshProfile } = useAuthContext();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<UsernameFormData>({
		resolver: zodResolver(usernameSchema),
		defaultValues: {
			username: "",
		},
		mode: "onBlur",
	});

	const handleUsernameSubmit = async (data: UsernameFormData) => {
		setLoading(true);

		try {
			await profileService.update(profile.id, {
				username: data.username.trim(),
			});

			nextStep();
		} catch (error) {
			authLogger.error("Username setup failed: ", error);
			Alert.alert("Error", "Failed to set up username. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCompleteOnboarding = async () => {
		setLoading(true);

		try {
			await profileService.update(profile.id, {
				onboardingComplete: true,
			});

			await refreshProfile();
		} catch (error) {
			authLogger.error("Onboarding completion failed: ", error);
			Alert.alert("Error", "Failed to complete onboarding. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const nextStep = () => {
		setCurrentStep(currentStep + 1);
	};

	useEffect(() => {
		const backAction = () => {
			Alert.alert(
				"Complete Onboarding",
				"Please complete the onboarding process to continue.",
				[{ text: "OK" }]
			);
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);
		return () => backHandler.remove();
	}, []);

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<View style={styles.stepContainer}>
						<View style={styles.iconContainer}>
							<Ionicons name="person-add" size={64} color="#6366f1" />
						</View>
						<Text style={styles.stepTitle}>Choose Your Username</Text>
						<Text style={styles.stepDescription}>
							Pick a username that other players will see in the game. You can
							change this later in your profile.
						</Text>

						<View style={styles.form}>
							<FormInput
								control={control}
								name="username"
								prefix={
									<Ionicons name="person-outline" size={20} color="#64748b" />
								}
								placeholder="Enter username"
								error={errors.username}
								editable={!loading}
								autoCapitalize="none"
								autoCorrect={false}
							/>

							<TouchableOpacity
								style={[styles.primaryButton, loading && styles.buttonDisabled]}
								onPress={handleSubmit(handleUsernameSubmit)}
								disabled={loading}
							>
								{loading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<>
										<Text style={styles.buttonText}>Continue</Text>
										<Ionicons name="arrow-forward" size={20} color="#fff" />
									</>
								)}
							</TouchableOpacity>
						</View>
					</View>
				);

			case 2:
				return (
					<View style={styles.stepContainer}>
						<View style={styles.iconContainer}>
							<Ionicons name="play-circle" size={64} color="#6366f1" />
						</View>
						<Text style={styles.stepTitle}>How to Play</Text>
						<Text style={styles.stepDescription}>
							Spot the Bot is a multiplayer game where you try to identify which
							player is an AI bot.
						</Text>

						<View style={styles.tutorialContainer}>
							<View style={styles.tutorialStep}>
								<View style={styles.stepNumber}>
									<Text style={styles.stepNumberText}>1</Text>
								</View>
								<Text style={styles.tutorialText}>
									Join a game room with other players
								</Text>
							</View>

							<View style={styles.tutorialStep}>
								<View style={styles.stepNumber}>
									<Text style={styles.stepNumberText}>2</Text>
								</View>
								<Text style={styles.tutorialText}>
									Chat and interact with other players
								</Text>
							</View>

							<View style={styles.tutorialStep}>
								<View style={styles.stepNumber}>
									<Text style={styles.stepNumberText}>3</Text>
								</View>
								<Text style={styles.tutorialText}>
									Vote for who you think is the AI bot
								</Text>
							</View>

							<View style={styles.tutorialStep}>
								<View style={styles.stepNumber}>
									<Text style={styles.stepNumberText}>4</Text>
								</View>
								<Text style={styles.tutorialText}>
									See if you guessed correctly!
								</Text>
							</View>
						</View>

						<TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
							<Text style={styles.buttonText}>Got it!</Text>
							<Ionicons name="arrow-forward" size={20} color="#fff" />
						</TouchableOpacity>
					</View>
				);

			case 3:
				return (
					<View style={styles.stepContainer}>
						<View style={styles.iconContainer}>
							<Ionicons name="trophy" size={64} color="#6366f1" />
						</View>
						<Text style={styles.stepTitle}>You're All Set!</Text>
						<Text style={styles.stepDescription}>
							You're ready to start playing Spot the Bot! Join a game room and
							start your first game.
						</Text>

						<View style={styles.featuresContainer}>
							<View style={styles.feature}>
								<Ionicons name="people" size={24} color="#6366f1" />
								<Text style={styles.featureText}>Play with friends</Text>
							</View>
							<View style={styles.feature}>
								<Ionicons name="chatbubbles" size={24} color="#6366f1" />
								<Text style={styles.featureText}>Chat and interact</Text>
							</View>
							<View style={styles.feature}>
								<Ionicons name="bulb" size={24} color="#6366f1" />
								<Text style={styles.featureText}>
									Test your AI detection skills
								</Text>
							</View>
						</View>

						<TouchableOpacity
							style={styles.primaryButton}
							onPress={handleCompleteOnboarding}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<>
									<Text style={styles.buttonText}>Start Playing</Text>
									<Ionicons name="play" size={20} color="#fff" />
								</>
							)}
						</TouchableOpacity>
					</View>
				);

			default:
				return null;
		}
	};

	return (
		<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === PlatformType.IOS ? "padding" : "height"}
				style={styles.keyboardView}
			>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<View style={styles.header}>
						<View style={styles.progressContainer}>
							{Array.from({ length: 3 }, (_, index) => (
								<View
									key={index}
									style={[
										styles.progressDot,
										index < currentStep && styles.progressDotActive,
									]}
								/>
							))}
						</View>
						<Text style={styles.progressText}>Step {currentStep} of 3</Text>
					</View>

					{renderStep()}
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
	},
	header: {
		alignItems: "center",
		marginBottom: 48,
	},
	progressContainer: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 16,
	},
	progressDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#334155",
	},
	progressDotActive: {
		backgroundColor: "#6366f1",
	},
	progressText: {
		color: "#94a3b8",
		fontSize: 14,
	},
	stepContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	iconContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#1e293b",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 32,
	},
	stepTitle: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#f8fafc",
		textAlign: "center",
		marginBottom: 16,
	},
	stepDescription: {
		color: "#94a3b8",
		fontSize: 18,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 48,
		maxWidth: 300,
	},
	form: {
		width: "100%",
		maxWidth: 300,
		gap: 16,
	},
	primaryButton: {
		backgroundColor: "#6366f1",
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	tutorialContainer: {
		width: "100%",
		maxWidth: 300,
		gap: 24,
		marginBottom: 48,
	},
	tutorialStep: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	stepNumber: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#6366f1",
		justifyContent: "center",
		alignItems: "center",
	},
	stepNumberText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	tutorialText: {
		color: "#f8fafc",
		fontSize: 16,
		flex: 1,
	},
	featuresContainer: {
		width: "100%",
		maxWidth: 300,
		gap: 16,
		marginBottom: 48,
	},
	feature: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	featureText: {
		color: "#f8fafc",
		fontSize: 16,
	},
});
