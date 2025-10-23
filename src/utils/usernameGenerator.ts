import 'react-native-get-random-values';
import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateUsername(): string {
  const random = customAlphabet(alphabet, 12)();
  return `bot_${random}`;
}