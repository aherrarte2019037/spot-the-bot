import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface AvatarProps {
  profile: {
    avatar_url: string;
  };
  size?: number;
}

export default function Avatar({ 
  profile, 
  size = 40
}: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: profile.avatar_url }}
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
