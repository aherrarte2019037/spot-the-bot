import { View, Text, StyleSheet } from "react-native";

export default function EmptyMessageList() {
	return (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>Be the first to send a message!</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyText: {
		fontSize: 16,
		color: "#64748b",
		fontStyle: "italic",
	},
});
