import React from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TextInputProps,
} from "react-native";
import { Control, Controller, FieldError } from "react-hook-form";

interface FormInputProps extends Omit<TextInputProps, "onChangeText" | "onBlur" | "value"> {
	control: Control<any>;
	name: string;
	prefix?: React.ReactNode;
	suffix?: React.ReactNode;
	error?: FieldError;
}

export default function FormInput({
	control,
	name,
	prefix,
	suffix,
	error,
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
							{...textInputProps}
						/>
						{suffix && <View style={styles.suffixContainer}>{suffix}</View>}
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
		alignItems: "center",
		backgroundColor: "#0f172a",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#334155",
		paddingHorizontal: 16,
	},
	inputError: {
		borderColor: "#ef4444",
	},
	prefixContainer: {
		marginRight: 12,
	},
	suffixContainer: {
		marginLeft: 12,
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

