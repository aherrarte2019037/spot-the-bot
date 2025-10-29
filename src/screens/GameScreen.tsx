import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
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
} from "../types";
import { gameLogger } from "../utils/logger";
import { RealtimeChannel } from "@supabase/supabase-js";

type Props = AppStackScreenProps<NavigationRoutes.Game>;

export default function GameScreen({ navigation, route }: Props) {
	const { profile } = useAuthContext();
	const [game, setGame] = useState<GameWithPlayers | null>(null);
	const [messages, setMessages] = useState<MessageWithPlayer[]>([]);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const currentPlayerId = useRef<number | null>(null);

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
		scrollViewRef.current?.scrollToEnd({ animated: true });
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

	const getPlayerName = (message: MessageWithPlayer): string =>
		message.player.profile?.user_name || "Bot";

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
			<View style={styles.header}>
				<View>
					<Text style={styles.roomTitle}>Topic: {game.topic}</Text>
					<Text style={styles.playerCount}>
						Players: {playerCount}
					</Text>
          <Text style={styles.playerCount}>
						Humans: {humanCount}
					</Text>
          <Text style={styles.playerCount}>
						Bots: {botCount}
					</Text>
				</View>
			</View>

			<ScrollView
				ref={scrollViewRef}
				style={styles.messagesContainer}
				contentContainerStyle={styles.messagesContent}
			>
				{messages.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							Be the first to send a message!
						</Text>
					</View>
				) : (
					messages.map((msg) => {
						const isOwnMessage = msg.player_id === currentPlayerId.current;

						return (
							<View
								key={msg.id}
								style={[styles.message, isOwnMessage && styles.ownMessage]}
							>
								<Text style={[styles.playerName, msg.is_bot && styles.botName]}>
									{getPlayerName(msg)}
								</Text>
								<Text style={styles.messageText}>{msg.content}</Text>
							</View>
						);
					})
				)}
			</ScrollView>

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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#334155",
	},
	roomTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#f8fafc",
		marginBottom: 4,
	},
	playerCount: {
		fontSize: 12,
		color: "#94a3b8",
		marginTop: 2,
	},
	messagesContainer: {
		flex: 1,
	},
	messagesContent: {
		padding: 16,
	},
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
	inputContainer: {
		flexDirection: "row",
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#334155",
		alignItems: "flex-end",
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
