import React, { useState, useEffect, useMemo, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useAuthContext } from "../contexts";
import {
	AppStackScreenProps,
	GameWithPlayers,
	GamePlayerWithProfile,
	NavigationRoutes,
	Vote,
} from "../types";
import { gameService, voteService } from "../services";
import { gameLogger, getPlayerName } from "../utils";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../core/supabase";

type Props = AppStackScreenProps<NavigationRoutes.Voting>;

export default function VotingScreen({ navigation, route }: Props) {
	const { profile } = useAuthContext();
	const insets = useSafeAreaInsets();
	const currentPlayerId = useRef<number>(0);

	const [game, setGame] = useState<GameWithPlayers | null>(null);
	const [votes, setVotes] = useState<Vote[]>([]);
	const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		loadGame();
	}, []);

	useEffect(() => {
		if (!game) return;

		loadVotes();

		// Subscribe to vote updates
		const channel = subscribeToVotes();
		return () => {
			if (channel && typeof channel.unsubscribe === "function") {
				channel.unsubscribe();
			}
		};
	}, [game?.id]);

	// Subscribe to game status changes
	useEffect(() => {
		if (!game) return;

		const channel = gameService.subscribeToGame(game.id, (updatedGame) => {
			setGame((prev) => {
				if (!prev) return prev;
				return { ...prev, ...updatedGame };
			});

			// Navigate to results when game is completed
			if (updatedGame.status === "completed") {
				navigation.replace(NavigationRoutes.Results, {
					gameId: game.id.toString(),
					score: 0, // TODO: Calculate actual score
				});
			}
		});

		return () => {
			channel.unsubscribe();
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

	const loadVotes = async () => {
		if (!game) return;

		try {
			const votesData = await voteService.getByGameId(game.id);
			setVotes(votesData);
		} catch (error) {
			gameLogger.error("Failed to load votes:", error);
		}
	};

	const subscribeToVotes = (): RealtimeChannel => {
		if (!game) {
			// Return a dummy channel that does nothing
			return {
				unsubscribe: () => {},
			} as RealtimeChannel;
		}

		return supabase
			.channel(`votes:${game.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "votes",
					filter: `game_id=eq.${game.id}`,
				},
				(payload: { new: Vote }) => {
					setVotes((prev) => {
						// Check if vote already exists
						if (prev.some((v) => v.id === payload.new.id)) {
							return prev;
						}
						return [...prev, payload.new];
					});
				}
			)
			.subscribe();
	};

	const otherPlayers = useMemo(() => {
		if (!game) return [];
		return game.players.filter((p) => p.id !== currentPlayerId.current);
	}, [game, currentPlayerId.current]);

	const requiredVotes = useMemo(() => {
		if (!game) return 0;
		return game.bot_count;
	}, [game]);

	const hasVoted = useMemo(() => {
		return votes.some((v) => v.voter_id === currentPlayerId.current);
	}, [votes, currentPlayerId.current]);

	const votedPlayers = useMemo(() => {
		return new Set(
			votes.filter((v) => v.voter_id === currentPlayerId.current).map((v) => v.target_id)
		);
	}, [votes, currentPlayerId.current]);

	const votingProgress = useMemo(() => {
		if (!game) return { voted: 0, total: 0 };
		const humanPlayers = game.players.filter((p) => !p.is_bot);
		const uniqueVoters = new Set(votes.map((v) => v.voter_id));
		return {
			voted: uniqueVoters.size,
			total: humanPlayers.length,
		};
	}, [game, votes]);


	const togglePlayerSelection = (playerId: number) => {
		if (hasVoted) return; // Can't change votes after submitting

		setSelectedPlayers((prev) => {
			if (prev.includes(playerId)) {
				// Deselect
				return prev.filter((id) => id !== playerId);
			} else {
				// Select (max requiredVotes)
				if (prev.length >= requiredVotes) {
					return prev; // Can't select more
				}
				return [...prev, playerId];
			}
		});
	};

	const handleSubmitVotes = async () => {
		if (!game || selectedPlayers.length !== requiredVotes || hasVoted) return;

		try {
			setSubmitting(true);

			await voteService.submitVotes({
				game_id: game.id,
				voter_id: currentPlayerId.current,
				target_ids: selectedPlayers,
			});

			await loadVotes();

			gameLogger.info("Votes submitted successfully");
		} catch (error) {
			gameLogger.error("Failed to submit votes:", error);
		} finally {
			setSubmitting(false);
		}
	};

	const canSubmit = useMemo(() => {
		return (
			!hasVoted &&
			!submitting &&
			selectedPlayers.length === requiredVotes &&
			game?.status === "voting"
		);
	}, [hasVoted, submitting, selectedPlayers.length, requiredVotes, game?.status]);

	if (loading) {
		return (
			<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6366f1" />
					<Text style={styles.loadingText}>Loading voting...</Text>
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

	return (
		<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
			<View style={[styles.header, { paddingTop: insets.top }]}>
				<Text style={styles.title}>Who are the {requiredVotes} AIs?</Text>
				<Text style={styles.subtitle}>
					Select {requiredVotes} {requiredVotes === 1 ? "player" : "players"} you suspect
				</Text>
				{hasVoted && (
					<View style={styles.votedBadge}>
						<Ionicons name="checkmark-circle" size={16} color="#10b981" />
						<Text style={styles.votedText}>You've voted!</Text>
					</View>
				)}
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.playersGrid}>
					{otherPlayers.map((player) => {
						const isSelected = selectedPlayers.includes(player.id);
						const wasVotedFor = votedPlayers.has(player.id);

						return (
							<TouchableOpacity
								key={player.id}
								style={[
									styles.playerCard,
									isSelected && styles.playerCardSelected,
									wasVotedFor && styles.playerCardVoted,
									hasVoted && styles.playerCardDisabled,
								]}
								onPress={() => togglePlayerSelection(player.id)}
								disabled={hasVoted}
							>
							<View style={styles.playerAvatar}>
								<Ionicons
									name={player.is_bot ? "construct" : "person"}
									size={32}
									color={player.is_bot ? "#f59e0b" : "#6366f1"}
								/>
							</View>
								<Text style={styles.playerName} numberOfLines={1}>
									{getPlayerName(player)}
								</Text>
								{isSelected && (
									<View style={styles.selectedIndicator}>
										<Ionicons name="checkmark-circle" size={24} color="#10b981" />
									</View>
								)}
								{wasVotedFor && !isSelected && (
									<View style={styles.votedIndicator}>
										<Text style={styles.votedIndicatorText}>Your pick</Text>
									</View>
								)}
							</TouchableOpacity>
						);
					})}
				</View>

				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>
						{votingProgress.voted}/{votingProgress.total} players voted
					</Text>
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
					onPress={handleSubmitVotes}
					disabled={!canSubmit}
				>
					{submitting ? (
						<ActivityIndicator size="small" color="#fff" />
					) : hasVoted ? (
						<>
							<Ionicons name="checkmark-circle" size={20} color="#fff" />
							<Text style={styles.submitButtonText}>Voted</Text>
						</>
					) : (
						<>
							<Text style={styles.submitButtonText}>
								Submit ({selectedPlayers.length}/{requiredVotes})
							</Text>
						</>
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
		padding: 24,
		borderBottomWidth: 1,
		borderBottomColor: "#334155",
		alignItems: "center",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#f8fafc",
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#94a3b8",
		textAlign: "center",
	},
	votedBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginTop: 12,
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: "#065f46",
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#10b981",
	},
	votedText: {
		fontSize: 14,
		color: "#10b981",
		fontWeight: "600",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
	},
	playersGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "center",
	},
	playerCard: {
		width: "45%",
		aspectRatio: 1,
		backgroundColor: "#1e293b",
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#334155",
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
	},
	playerCardSelected: {
		backgroundColor: "#1e3a5f",
		borderColor: "#6366f1",
		borderWidth: 3,
	},
	playerCardVoted: {
		borderColor: "#10b981",
	},
	playerCardDisabled: {
		opacity: 0.7,
	},
	playerAvatar: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#0b1220",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	playerName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#f8fafc",
		textAlign: "center",
	},
	selectedIndicator: {
		position: "absolute",
		top: 8,
		right: 8,
	},
	votedIndicator: {
		position: "absolute",
		bottom: 8,
		left: 8,
		right: 8,
		backgroundColor: "#065f46",
		borderRadius: 8,
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	votedIndicatorText: {
		fontSize: 10,
		color: "#10b981",
		fontWeight: "600",
		textAlign: "center",
	},
	progressContainer: {
		marginTop: 24,
		alignItems: "center",
	},
	progressText: {
		fontSize: 16,
		color: "#94a3b8",
		fontWeight: "600",
	},
	footer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#334155",
		backgroundColor: "#0f172a",
	},
	submitButton: {
		backgroundColor: "#6366f1",
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	submitButtonDisabled: {
		backgroundColor: "#334155",
		opacity: 0.5,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
});

