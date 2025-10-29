import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GamePlayerWithProfile, MessageWithPlayer } from "../../types";

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
	const playerName = useMemo(() => {
		if (message.is_bot || !gamePlayer.profile) return "Bot";

		return gamePlayer.profile.user_name;
	}, [message.is_bot, gamePlayer.profile]);

	return (
		<View style={[styles.message, isOwnMessage && styles.ownMessage]}>
			<Text style={[styles.playerName, message.is_bot && styles.botName]}>
				{playerName}
			</Text>
			<Text style={styles.messageText}>{message.content}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	message: {
		marginBottom: 16,
		padding: 12,
		backgroundColor: "#1e293b",
		borderRadius: 12,
	},
	ownMessage: {
		backgroundColor: "#334155",
		marginLeft: 40,
	},
	playerName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#6366f1",
		marginBottom: 4,
	},
	botName: {
		color: "#f59e0b",
	},
	messageText: {
		fontSize: 16,
		color: "#f8fafc",
		lineHeight: 22,
	},
});
