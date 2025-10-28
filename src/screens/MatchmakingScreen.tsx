import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useAuthContext } from '../contexts/AuthContext';
import { matchmakingService } from '../services';
import { AppStackScreenProps, NavigationRoutes } from '../types';
import { authLogger } from '../utils/logger';

type Props = AppStackScreenProps<NavigationRoutes.Matchmaking>;

export default function MatchmakingScreen({ navigation }: Props) {
  const { profile } = useAuthContext();
  const [game, setGame] = useState<any | null>(null);
  const [status, setStatus] = useState<'searching' | 'found' | 'starting'>('searching');

  useEffect(() => {
    startMatchmaking();

    // Subscribe to game updates
    if (game) {
      const channel = matchmakingService.subscribeToGameUpdates(game.id, (updatedGame) => {
        setGame(updatedGame);
        if (updatedGame.status === 'chatting') {
          navigation.replace(NavigationRoutes.Game, { gameId: updatedGame.id.toString() });
        }
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [game]);

  const startMatchmaking = async () => {
    try {
      if (!profile) {
        authLogger.error('No profile found');
        navigation.goBack();
        return;
      }

      setStatus('searching');
      const foundGame = await matchmakingService.startMatchmaking(profile.id);
      setGame(foundGame);
      setStatus('found');
      authLogger.info('Matchmaking complete:', foundGame.id);
    } catch (error) {
      authLogger.error('Matchmaking failed:', error);
      navigation.goBack();
    }
  };

  const playerCount = game?.players.length || 0;
  const botCount = game?.players.filter(p => p.isBot).length || 0;

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="search" size={64} color="#6366f1" />
        
        <Text style={styles.title}>Finding Players...</Text>
        
        {status === 'searching' && (
          <>
            <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
            <Text style={styles.subtitle}>Looking for others to play with</Text>
          </>
        )}

        {status === 'found' && (
          <>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                {playerCount - botCount} {playerCount - botCount === 1 ? 'player' : 'players'} found
              </Text>
              {botCount > 0 && (
                <Text style={styles.botText}>+ {botCount} bot{botCount > 1 ? 's' : ''}</Text>
              )}
            </View>
            
            <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
            <Text style={styles.subtitle}>Waiting for more players...</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  loader: {
    marginTop: 24,
  },
  infoContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: '#f8fafc',
    fontWeight: '600',
  },
  botText: {
    fontSize: 16,
    color: '#f59e0b',
    marginTop: 8,
  },
});
