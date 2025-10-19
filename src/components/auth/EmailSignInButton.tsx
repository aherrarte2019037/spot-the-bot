import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

interface EmailSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function EmailSignInButton({ onPress, disabled = false }: EmailSignInButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name="mail" size={24} color="#6366f1" />
      <Text style={styles.buttonText}>Continue with Email</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
});
