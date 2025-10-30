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
    maxWidth: "80%",
		paddingVertical: 10,
		paddingHorizontal: 18,
		backgroundColor: "#525252",
		borderRadius: 12,
    alignSelf: "flex-start",
	},
	ownMessage: {
		backgroundColor: "#334155",
		alignSelf: "flex-end",
	},
	playerName: {
		fontSize: 12,
		fontWeight: "600",
		color: "#6366f1",
		marginBottom: 2,
	},
	botName: {
		color: "#f59e0b",
	},
	messageText: {
		fontSize: 18,
		color: "#f8fafc",
		lineHeight: 22,
	},
});
