import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Modal,
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
import { authService } from "../../services";
import { FormInput } from "../common";
import { signUpSchema, SignUpFormData } from "../../schemas/authSchemas";
import { authLogger } from "../../utils/logger";
import { PlatformType } from "../../types";

interface SignUpModalProps {
	visible: boolean;
	onClose: () => void;
	onSwitchToSignIn: () => void;
}

export default function SignUpModal({
	visible,
	onClose,
	onSwitchToSignIn,
}: SignUpModalProps) {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onBlur",
	});

	const handleClose = () => {
		reset();
		setShowPassword(false);
		onClose();
	};

	const onSubmit = async (data: SignUpFormData) => {
		setLoading(true);

		try {
			await authService.signUpWithEmail(
				data.email.trim(),
				data.password
			);

			Alert.alert(
				"Success",
				"Account created! Please check your email to verify your account.",
				[
					{
						text: "OK",
						onPress: () => {
							handleClose();
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

	const handleSwitchToSignIn = () => {
		handleClose();
		onSwitchToSignIn();
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={true}
			onRequestClose={handleClose}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === PlatformType.IOS ? "padding" : "height"}
				style={styles.modalContainer}
			>
				<TouchableOpacity
					style={styles.backdrop}
					activeOpacity={1}
					onPress={handleClose}
				/>

				<View style={styles.modalContent}>
					<LinearGradient
						colors={["#1e293b", "#0f172a"]}
						style={styles.gradient}
					>
						<ScrollView
							contentContainerStyle={styles.scrollContent}
							keyboardShouldPersistTaps="handled"
						>
							<View style={styles.header}>
								<Text style={styles.modalTitle}>Create Account</Text>
								<TouchableOpacity
									onPress={handleClose}
									style={styles.closeButton}
								>
									<Ionicons name="close" size={24} color="#94a3b8" />
								</TouchableOpacity>
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
									onPressSuffix={() => setShowPassword(!showPassword)}
									suffix={
										<Ionicons
											name={showPassword ? "eye-outline" : "eye-off-outline"}
											size={20}
											color="#64748b"
										/>
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
									style={[
										styles.submitButton,
										loading && styles.buttonDisabled,
									]}
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
									<Text style={styles.toggleText}>
										Already have an account?
									</Text>
									<TouchableOpacity
										onPress={handleSwitchToSignIn}
										disabled={loading}
									>
										<Text style={styles.toggleLink}>Sign In</Text>
									</TouchableOpacity>
								</View>
							</View>
						</ScrollView>
					</LinearGradient>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
	},
	modalContent: {
		backgroundColor: "#1e293b",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: "90%",
		overflow: "hidden",
	},
	gradient: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	scrollContent: {
		padding: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	modalTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#f8fafc",
	},
	closeButton: {
		padding: 4,
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
});
