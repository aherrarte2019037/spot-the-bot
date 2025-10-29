import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuthContext } from "../contexts/AuthContext";
import { matchmakingService } from "../services";
import {
	AppStackScreenProps,
	NavigationRoutes,
	GameWithPlayers,
	MatchmakingStatus,
} from "../types";
import { authLogger } from "../utils/logger";

type Props = AppStackScreenProps<NavigationRoutes.Matchmaking>;

export default function MatchmakingScreen({ navigation }: Props) {
	const { profile } = useAuthContext();
	const [game, setGame] = useState<GameWithPlayers | null>(null);
	const [status, setStatus] = useState<MatchmakingStatus>("searching");
	const [playerCount, setPlayerCount] = useState<number>(0);
	const [botCount, setBotCount] = useState<number>(0);

	useEffect(() => {
		startMatchmaking();
	}, []);

	useEffect(() => {
		if (!game) return;

		const handleGameUpdate = (updatedGame: GameWithPlayers) => {
			setGame(updatedGame);
			setPlayerCount(updatedGame.players.length);
			setBotCount(updatedGame.players.filter((p) => p.is_bot).length);

			if (updatedGame.status === "chatting") {
				navigation.replace(NavigationRoutes.Game, {
					gameId: updatedGame.id.toString(),
				});
			}
		};

		const channel = matchmakingService.subscribeToGameUpdates(
			game.id,
			handleGameUpdate
		);
		return () => {
			channel.unsubscribe();
		};
	}, [game]);

	// [TESTING] Auto-start immediately when game is found
	useEffect(() => {
		if (status === "found" && game) {
			const timer = setTimeout(() => {
				startGame();
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [status, game]);

	const startMatchmaking = async () => {
		try {
			setStatus("searching");
			const foundGame = await matchmakingService.startMatchmaking(profile.id);
			setGame(foundGame);
			setPlayerCount(foundGame.players.length);
			setBotCount(foundGame.players.filter((p) => p.is_bot).length);
			setStatus("found");

			authLogger.info("Matchmaking complete:", foundGame.id);
		} catch (error) {
			authLogger.error("Matchmaking failed:", error);
			navigation.goBack();
		}
	};

	const startGame = () => {
		if (!game) return;
		authLogger.info("Starting game:", game.id);
		navigation.replace(NavigationRoutes.Game, {
			gameId: game.id.toString(),
		});
	};

	return (
		<LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
			<View style={styles.content}>
				<Ionicons name="search" size={64} color="#6366f1" />

				<Text style={styles.title}>Finding Players...</Text>

				{status === "searching" && (
					<>
						<ActivityIndicator
							size="large"
							color="#6366f1"
							style={styles.loader}
						/>
						<Text style={styles.subtitle}>Looking for others to play with</Text>
					</>
				)}

				{status === "found" && (
					<>
						<View style={styles.infoContainer}>
							<Text style={styles.infoText}>
								{playerCount - botCount}{" "}
								{playerCount - botCount === 1 ? "player" : "players"} found
							</Text>
							{botCount > 0 && (
								<Text style={styles.botText}>
									+ {botCount} bot{botCount > 1 ? "s" : ""}
								</Text>
							)}
						</View>

						<ActivityIndicator
							size="large"
							color="#6366f1"
							style={styles.loader}
						/>
						<Text style={styles.subtitle}>Starting game...</Text>

						{/* TESTING: Manual start button */}
						<TouchableOpacity
							style={styles.testButton}
							onPress={startGame}
						>
							<Text style={styles.testButtonText}>Start Now (Test)</Text>
						</TouchableOpacity>
					</>
				)}
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#f8fafc",
		marginTop: 24,
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 16,
		color: "#94a3b8",
		marginTop: 16,
	},
	loader: {
		marginTop: 24,
	},
	infoContainer: {
		marginTop: 24,
		alignItems: "center",
	},
	infoText: {
		fontSize: 18,
		color: "#f8fafc",
		fontWeight: "600",
	},
	botText: {
		fontSize: 16,
		color: "#f59e0b",
		marginTop: 8,
	},
	testButton: {
		marginTop: 32,
		backgroundColor: "#10b981",
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
	},
	testButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
