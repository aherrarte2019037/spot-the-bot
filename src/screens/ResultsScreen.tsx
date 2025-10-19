import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function ResultsScreen({ navigation }: any) {
  const results = {
    botPlayer: 'Bot',
    correctVotes: 2,
    totalVotes: 4,
    xpGained: 20,
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.resultCard}>
          <Ionicons name="trophy" size={48} color="#f59e0b" />
          <Text style={styles.title}>Game Over!</Text>
          
          <View style={styles.resultInfo}>
            <Text style={styles.botReveal}>
              The bot was: <Text style={styles.botName}>{results.botPlayer}</Text>
            </Text>
            
            <Text style={styles.voteStats}>
              {results.correctVotes}/{results.totalVotes} players guessed correctly
            </Text>
            
            <Text style={styles.xpGained}>
              +{results.xpGained} XP gained
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Game', { gameId: 'new' })}
          >
            <Ionicons name="refresh" size={24} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
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
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 16,
    marginBottom: 24,
  },
  resultInfo: {
    alignItems: 'center',
    gap: 12,
  },
  botReveal: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
  },
  botName: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  voteStats: {
    fontSize: 16,
    color: '#f8fafc',
    textAlign: 'center',
  },
  xpGained: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
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
