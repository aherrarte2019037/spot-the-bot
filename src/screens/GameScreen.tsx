import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function GameScreen({ navigation, route }: any) {
  const [message, setMessage] = useState('');
  const [messages] = useState([
    { id: '1', player: 'Alice', content: 'Hey everyone! Ready to play?', isBot: false },
    { id: '2', player: 'Bot', content: 'Greetings! I am excited to participate in this engaging social interaction!', isBot: true },
    { id: '3', player: 'Bob', content: 'lol that sounds like a bot', isBot: false },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.roomTitle}>Room: {route.params?.gameId || 'Demo'}</Text>
        <Text style={styles.playerCount}>4/7 players</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.message}>
            <Text style={[styles.playerName, msg.isBot && styles.botName]}>
              {msg.player}
            </Text>
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.votingSection}>
        <Text style={styles.votingTitle}>Who do you think is the bot?</Text>
        <View style={styles.playerList}>
          {['Alice', 'Bot', 'Bob', 'Charlie'].map((player, index) => (
            <TouchableOpacity key={index} style={styles.playerButton}>
              <Text style={styles.playerButtonText}>{player}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  playerCount: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  message: {
    marginBottom: 16,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  botName: {
    color: '#f59e0b',
  },
  messageText: {
    fontSize: 16,
    color: '#f8fafc',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
  },
  votingSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  votingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 12,
  },
  playerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playerButtonText: {
    color: '#f8fafc',
    fontSize: 14,
  },
});
