import React from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Control, Controller, FieldError } from "react-hook-form";

interface FormInputProps extends Omit<TextInputProps, "onChangeText" | "onBlur" | "value"> {
	control: Control<any>;
	name: string;
	prefix?: React.ReactNode;
	suffix?: React.ReactNode;
	error?: FieldError;
  onPressSuffix?: VoidFunction;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function FormInput({
	control,
	name,
	prefix,
	suffix,
	error,
	onPressSuffix,
	autoCapitalize = "none",
	...textInputProps
}: FormInputProps) {
	return (
		<View>
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, onBlur, value } }) => (
					<View style={[styles.inputContainer, error && styles.inputError]}>
						{prefix && <View style={styles.prefixContainer}>{prefix}</View>}
						<TextInput
							style={styles.input}
							placeholderTextColor="#64748b"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							autoCapitalize={autoCapitalize}
							{...textInputProps}
						/>
						{suffix && (
							<TouchableOpacity
								onPress={onPressSuffix}
								style={styles.suffixContainer}
							>
								{suffix}
							</TouchableOpacity>
						)}
					</View>
				)}
			/>
			{error && <Text style={styles.errorText}>{error.message}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: "row",
		alignItems: "stretch",
		backgroundColor: "#0f172a",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#334155",
		minHeight: 56,
	},
	inputError: {
		borderColor: "#ef4444",
	},
	prefixContainer: {
		justifyContent: "center",
		alignItems: "stretch",
		paddingLeft: 16,
		paddingRight: 16,
	},
	suffixContainer: {
		justifyContent: "center",
		alignItems: "stretch",
		paddingRight: 16,
		paddingLeft: 16,
	},
	input: {
		flex: 1,
		color: "#f8fafc",
		fontSize: 16,
		paddingVertical: 16,
	},
	errorText: {
		color: "#ef4444",
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4,
	},
});

