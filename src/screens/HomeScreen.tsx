import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { authService } from '../services';
import AuthButtons from '../components/auth/AuthButtons';
import { useAuthContext } from '../contexts/AuthContext';
import { authLogger } from '../utils/logger';

export default function HomeScreen({ navigation }: any) {
  const { user, isLoading, isLoggedIn } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      authLogger.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!isLoggedIn) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <AuthButtons />
      </LinearGradient>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Spot the Bot</Text>
          <Text style={styles.subtitle}>Can you spot the AI?</Text>
          
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Game', { gameId: 'demo' })}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="people" size={24} color="#6366f1" />
              <Text style={styles.secondaryButtonText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    minHeight: 400,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 48,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#f8fafc',
    fontSize: 18,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: '#f8fafc',
    fontSize: 16,
    marginBottom: 8,
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#334155',
  },
  signOutText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
