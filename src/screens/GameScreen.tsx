import React, { useState, useRef, useMemo, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Platform,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useAuthContext } from "../contexts";
import {
	AppStackScreenProps,
	GameWithPlayers,
	MessageWithPlayer,
	NavigationRoutes,
	PlatformType,
} from "../types";
import { gameService, messageService } from "../services";
import { gameLogger } from "../utils";
import { EmptyMessageList, GameMessage } from "../components/game";
import { RealtimeChannel } from "@supabase/supabase-js";
import { LegendList, LegendListRef } from "@legendapp/list";
import { parseISO, differenceInSeconds } from "date-fns";

type Props = AppStackScreenProps<NavigationRoutes.Game>;

export default function GameScreen({ navigation, route }: Props) {
	const { profile } = useAuthContext();
	const insets = useSafeAreaInsets();
	const legendListRef = useRef<LegendListRef>(null);
	const currentPlayerId = useRef<number>(0);

	const [game, setGame] = useState<GameWithPlayers | null>(null);
	const [messages, setMessages] = useState<MessageWithPlayer[]>([]);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

	useEffect(() => {
		loadGame();
	}, []);

	// Auto-start game if status is waiting
	useEffect(() => {
		if (!game || game.status !== "waiting") return;

		const startGame = async () => {
			try {
				await gameService.startGame(game.id);
				const fullGame = await gameService.get(game.id);
				setGame(fullGame);
			} catch (error) {
				gameLogger.error("Failed to start game:", error);
			}
		};

		startGame();
	}, [game]);

	// Subscribe to game updates for status changes
	useEffect(() => {
		if (!game) return;

		const channel = gameService.subscribeToGame(game.id, (updatedGame) => {
			setGame((prev) => {
				if (!prev) return prev;
				return { ...prev, ...updatedGame };
			});

			// Handle status transitions
			if (updatedGame.status === "voting") {
				navigation.replace(NavigationRoutes.Voting, {
					gameId: game.id.toString(),
				});
			}
		});

		return () => {
			channel.unsubscribe();
		};
	}, [game]);

	// Timer logic
	useEffect(() => {
		if (!game || !game.started_at || game.chat_duration === null) {
			setTimeRemaining(null);
			return;
		}

		const calculateRemaining = () => {
			const startTime = parseISO(game.started_at!);
			const duration = game.chat_duration!; // Duration in seconds
			const elapsed = differenceInSeconds(new Date(), startTime);
			const remaining = Math.max(0, duration - elapsed);
			return remaining;
		};

		setTimeRemaining(calculateRemaining());

		const interval = setInterval(() => {
			const remaining = calculateRemaining();
			setTimeRemaining(remaining);

			if (remaining <= 0) {
				clearInterval(interval);
				endChatPhase();
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [game?.started_at, game?.chat_duration, game?.id]);

	// Subscribe to messages
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

	const endChatPhase = async () => {
		if (!game) return;

		try {
			await gameService.endChatPhase(game.id);
			// The subscription will handle navigation when status changes
		} catch (error) {
			gameLogger.error("Failed to end chat phase:", error);
		}
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const scrollToBottom = () => {
		legendListRef.current?.scrollToEnd({ animated: true });
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
			scrollToBottom();
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

	if (!game) {
		return (
			<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Failed to load game</Text>
				</View>
			</LinearGradient>
		);
	}

	const playerCount = game.players.length;
	const humanCount = playerCount - game.bot_count;
	const botCount = game.bot_count;
	const isEmpty = messages.length === 0;

	return (
		<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top }]}>
				<View style={styles.topicPill}>
					<Text style={styles.topicLabel}>Topic</Text>
					<Text style={styles.topicText}>{game.topic}</Text>
				</View>
				<View style={styles.chipsRow}>
					{timeRemaining !== null && (
						<View style={[styles.chip, styles.timerChip]}>
							<Ionicons name="time-outline" size={14} color="#f59e0b" />
							<Text style={[styles.chipText, styles.timerText]}>
								{formatTime(timeRemaining)}
							</Text>
						</View>
					)}
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

			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === PlatformType.IOS ? "padding" : "height"}
			>
				<LegendList
					ref={legendListRef}
					style={styles.container}
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
					contentContainerStyle={[
						styles.messagesContent,
						isEmpty && styles.emptyContent,
					]}
					onContentSizeChange={scrollToBottom}
					showsVerticalScrollIndicator={false}
					maintainScrollAtEndThreshold={0.5}
					maintainScrollAtEnd
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
	timerChip: {
		borderColor: "#f59e0b",
		backgroundColor: "#1e1a0f",
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	timerText: {
		color: "#f59e0b",
		fontWeight: "600",
	},
	header: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#334155",
		gap: 12,
	},
	messagesContent: {
		paddingTop: 16,
		paddingHorizontal: 12,
		gap: 16,
	},
	inputContainer: {
		flexDirection: "row",
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#334155",
		alignItems: "flex-end",
		backgroundColor: "#0f172a",
	},
	input: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 10,
		marginRight: 8,
		fontSize: 16,
		maxHeight: 100,
	},
	emptyContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
