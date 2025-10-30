import React, { useState, useEffect, useRef, useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { gameService, messageService } from "../services";
import { useAuthContext } from "../contexts/AuthContext";
import {
	AppStackScreenProps,
	NavigationRoutes,
	GameWithPlayers,
	MessageWithPlayer,
	PlatformType,
} from "../types";
import { gameLogger } from "../utils/logger";
import { RealtimeChannel } from "@supabase/supabase-js";
import { EmptyMessageList, GameMessage } from "../components/game";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { LegendList } from "@legendapp/list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = AppStackScreenProps<NavigationRoutes.Game>;

export default function GameScreen({ navigation, route }: Props) {
	const { profile } = useAuthContext();
	const [game, setGame] = useState<GameWithPlayers | null>(null);
	const [messages, setMessages] = useState<MessageWithPlayer[]>([]);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const flatListRef = useRef<FlatList<MessageWithPlayer>>(null);
	const currentPlayerId = useRef<number | null>(null);
	const insets = useSafeAreaInsets();

	useEffect(() => {
		loadGame();
	}, []);

	useEffect(() => {
		if (!game) return;

		loadMessages();

		let subscription: RealtimeChannel;
		const setupSubscription = async () => {
			subscription = await gameService.subscribeToMessages(
				game.id,
				(newMessage: MessageWithPlayer) =>
					setMessages((prev) => [...prev, newMessage])
			);
		};

		setupSubscription();

		return () => {
			if (subscription) subscription.unsubscribe();
		};
	}, [game]);

	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);

	const loadGame = async () => {
		try {
			const gameId = parseInt(route.params.gameId);
			const gameData = await gameService.get(gameId);
			setGame(gameData);

			const player = gameData.players.find((p) => p.profile_id === profile.id);
			if (!player) throw new Error("Current player not found");

			currentPlayerId.current = player.id;
			setLoading(false);
		} catch (error) {
			gameLogger.error("Failed to load game:", error);
			navigation.goBack();
		}
	};

	const loadMessages = async () => {
		if (!game) return;

		try {
			const messagesData = await messageService.getByGameId(game.id);
			setMessages(messagesData);
		} catch (error) {
			gameLogger.error("Failed to load messages:", error);
		}
	};

	const enableSendMessage = useMemo(() => {
		return !sending && !!message.trim();
	}, [sending, message]);

	const handleSendMessage = async () => {
		if (!currentPlayerId.current || !game) return;

		try {
			setSending(true);
			await messageService.send({
				game_id: game.id,
				player_id: currentPlayerId.current,
				content: message.trim(),
			});
			setMessage("");
		} catch (error) {
			gameLogger.error("Failed to send message:", error);
		} finally {
			setSending(false);
		}
	};

	if (loading) {
		return (
			<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6366f1" />
					<Text style={styles.loadingText}>Loading game...</Text>
				</View>
			</LinearGradient>
		);
	}

	if (!game) return null;

	const playerCount = game.players.length;
	const humanCount = playerCount - game.bot_count;
	const botCount = game.bot_count;

	return (
		<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
			<View style={{ paddingTop: insets.top }}>
				<View style={styles.header}>
					<View style={styles.topicPill}>
						<Text style={styles.topicLabel}>Topic</Text>
						<Text style={styles.topicText}>{game.topic}</Text>
					</View>
					<View style={styles.chipsRow}>
						<View style={styles.chip}>
							<Text style={styles.chipText}>Players: {playerCount}</Text>
						</View>
						<View style={styles.chip}>
							<Text style={styles.chipText}>Humans: {humanCount}</Text>
						</View>
						<View style={styles.chip}>
							<Text style={styles.chipText}>Bots: {botCount}</Text>
						</View>
					</View>
				</View>
			</View>

			<KeyboardAvoidingView
				style={styles.keyboardAvoidingView}
				behavior={Platform.OS === PlatformType.IOS ? "padding" : "height"}
			>
				<LegendList
					contentContainerStyle={styles.legendListContent}
					data={messages}
					renderItem={({ item }) => (
						<GameMessage
							message={item}
							isOwnMessage={item.player_id === currentPlayerId.current}
							gamePlayer={item.player}
						/>
					)}
					ListEmptyComponent={<EmptyMessageList />}
					keyExtractor={(item) => item.id.toString()}
					alignItemsAtEnd
					maintainScrollAtEnd
					maintainVisibleContentPosition
					estimatedItemSize={100}
				/>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.textInput}
						value={message}
						onChangeText={setMessage}
						placeholder="Type your message..."
						placeholderTextColor="#64748b"
						multiline
						maxLength={500}
						editable={!sending}
					/>
					<TouchableOpacity
						style={[styles.sendButton, sending && styles.sendButtonDisabled]}
						onPress={handleSendMessage}
						disabled={!enableSendMessage}
					>
						{sending ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Ionicons name="send" size={20} color="#fff" />
						)}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#94a3b8",
	},
	header: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#334155",
		gap: 12,
	},
	topicPill: {
		backgroundColor: "#0b1220",
		borderColor: "#334155",
		borderWidth: 1,
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	topicLabel: {
		fontSize: 12,
		color: "#94a3b8",
		marginBottom: 4,
	},
	topicText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#f8fafc",
	},
	chipsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	chip: {
		borderRadius: 999,
		backgroundColor: "#0b1220",
		borderWidth: 1,
		borderColor: "#334155",
		paddingVertical: 6,
		paddingHorizontal: 10,
	},
	chipText: {
		fontSize: 12,
		color: "#94a3b8",
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	legendListContent: {
		flex: 1,
		gap: 16,
		padding: 16,
		paddingBottom: 0,
	},
	inputContainer: {
		position: "static",
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#334155",
		alignItems: "flex-end",
		backgroundColor: "#0f172a",
	},
	textInput: {
		flex: 1,
		backgroundColor: "#334155",
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		color: "#f8fafc",
		fontSize: 16,
		maxHeight: 100,
	},
	sendButton: {
		backgroundColor: "#6366f1",
		borderRadius: 20,
		padding: 12,
		marginLeft: 8,
		justifyContent: "center",
		alignItems: "center",
		width: 44,
		height: 44,
	},
	sendButtonDisabled: {
		opacity: 0.5,
	},
});
