import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../contexts';
import { AppStackScreenProps, NavigationRoutes } from '../types';
import { gameService, voteService } from '../services';
import { gameLogger, getPlayerName } from '../utils';

type Props = AppStackScreenProps<NavigationRoutes.Results>;

interface ResultsData {
  botPlayers: string[];
  currentPlayerCorrectVotes: number;
  currentPlayerTotalVotes: number;
  currentPlayerScore: number;
  xpGained: number;
  totalCorrectPlayers: number;
}

export default function ResultsScreen({ navigation, route }: Props) {
  const { profile, refreshProfile } = useAuthContext();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
    refreshProfile();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const gameId = parseInt(route.params.gameId);
      
      // Fetch game with players
      const game = await gameService.get(gameId);
      
      // Fetch votes
      const votes = await voteService.getByGameId(gameId);

      // Find current player
      const currentPlayer = game.players.find((p) => p.profile_id === profile.id);
      if (!currentPlayer) {
        throw new Error('Current player not found in game');
      }

      // Identify bot players
      const botPlayers = game.players.filter((p) => p.is_bot);
      const botPlayerIds = new Set(botPlayers.map((p) => p.id));
      const botPlayerNames = botPlayers.map((p) => getPlayerName(p));

      // Get current player's votes
      const currentPlayerVotes = votes.filter((v) => v.voter_id === currentPlayer.id);
      const correctVotes = currentPlayerVotes.filter((v) => 
        v.target_id !== null && botPlayerIds.has(v.target_id)
      );

      // Get current player's score
      const currentPlayerScore = currentPlayer.score;

      // Calculate XP gained (score / 10, minimum 10)
      const xpGained = Math.max(10, Math.floor(currentPlayerScore / 10));

      // Calculate total players who guessed correctly
      const humanPlayers = game.players.filter((p) => !p.is_bot);
      let totalCorrectPlayers = 0;
      
      for (const player of humanPlayers) {
        const playerVotes = votes.filter((v) => v.voter_id === player.id);
        const playerCorrectVotes = playerVotes.filter((v) => 
          v.target_id !== null && botPlayerIds.has(v.target_id)
        );
        if (playerCorrectVotes.length > 0) {
          totalCorrectPlayers++;
        }
      }

      setResults({
        botPlayers: botPlayerNames,
        currentPlayerCorrectVotes: correctVotes.length,
        currentPlayerTotalVotes: currentPlayerVotes.length,
        currentPlayerScore,
        xpGained,
        totalCorrectPlayers,
      });
    } catch (err) {
      gameLogger.error('Failed to load results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error || !results) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Failed to load results'}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate(NavigationRoutes.Home)}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.resultCard}>
            <Ionicons name="trophy" size={48} color="#f59e0b" />
            <Text style={styles.title}>Game Over!</Text>
            
            <View style={styles.resultInfo}>
              {/* Bot Reveal */}
              <View style={styles.botRevealContainer}>
                <Text style={styles.botRevealLabel}>
                  {results.botPlayers.length === 1 ? 'The bot was:' : 'The bots were:'}
                </Text>
                <Text style={styles.botName}>
                  {results.botPlayers.join(', ')}
                </Text>
              </View>

              {/* Your Performance */}
              <View style={styles.performanceContainer}>
                <Text style={styles.performanceLabel}>Your Performance</Text>
                <Text style={styles.voteStats}>
                  {results.currentPlayerCorrectVotes}/{results.currentPlayerTotalVotes} correct guesses
                </Text>
                <Text style={styles.scoreText}>
                  Score: {results.currentPlayerScore} points
                </Text>
                <Text style={styles.xpGained}>
                  +{results.xpGained} XP gained
                </Text>
              </View>

              {/* Overall Stats */}
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  {results.totalCorrectPlayers} player{results.totalCorrectPlayers !== 1 ? 's' : ''} guessed correctly
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate(NavigationRoutes.Home)}
            >
              <Ionicons name="home" size={24} color="#fff" />
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate(NavigationRoutes.Matchmaking)}
            >
              <Ionicons name="refresh" size={24} color="#6366f1" />
              <Text style={styles.secondaryButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 32,
  },
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 16,
    marginBottom: 24,
  },
  resultInfo: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  botRevealContainer: {
    alignItems: 'center',
    gap: 8,
  },
  botRevealLabel: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
  },
  botName: {
    fontSize: 20,
    color: '#f59e0b',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  performanceContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  performanceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  voteStats: {
    fontSize: 16,
    color: '#f8fafc',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    textAlign: 'center',
  },
  xpGained: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '600',
  },
});
