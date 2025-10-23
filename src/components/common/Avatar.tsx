import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface AvatarProps {
  user: {
    avatarUrl: string;
  };
  size?: number;
}

export default function Avatar({ 
  user, 
  size = 40
}: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: user.avatarUrl }}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 50,
  },
});
