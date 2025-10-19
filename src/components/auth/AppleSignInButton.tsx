import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

interface AppleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function AppleSignInButton({ onPress, disabled = false }: AppleSignInButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name="logo-apple" size={24} color="#fff" />
      <Text style={styles.buttonText}>Continue with Apple</Text>
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
    backgroundColor: '#000',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
