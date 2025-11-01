import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GamePlayerWithProfile, MessageWithPlayer } from "../../types";
import { getPlayerName } from "../../utils";

interface GameMessageProps {
	message: MessageWithPlayer;
	isOwnMessage: boolean;
	gamePlayer: GamePlayerWithProfile;
}

export default function GameMessage({
	message,
	isOwnMessage,
	gamePlayer,
}: GameMessageProps) {
	const playerName = getPlayerName(gamePlayer);

	return (
		<View style={isOwnMessage ? styles.ownMessage : styles.otherMessage}>
			<Text style={[styles.playerName, message.is_bot && styles.botName]}>
				{playerName}
			</Text>
			<Text style={styles.messageText}>{message.content}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	ownMessage: {
		maxWidth: "80%",
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#334155",
		alignSelf: "flex-end",
		borderTopLeftRadius: 14,
		borderTopRightRadius: 14,
		borderBottomLeftRadius: 14,
		borderBottomRightRadius: 0,
	},
	otherMessage: {
		maxWidth: "80%",
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#525252",
		alignSelf: "flex-start",
		borderTopLeftRadius: 14,
		borderTopRightRadius: 14,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 14,
	},
	playerName: {
		fontSize: 12,
		lineHeight: 12,
		fontWeight: "600",
		color: "#6366f1",
		marginBottom: 6,
	},
	botName: {
		color: "#f59e0b",
	},
	messageText: {
		fontSize: 18,
		color: "#f8fafc",
		lineHeight: 18,
	},
});
