const BOT_NAMES = [
  'BotMcBotface',
  'RoboReply',
  'ChatGPTea',
  'ByteMe',
  'HelloWorld',
  'SyntaxError',
  'NullPointer',
  'BinaryBuddy',
  'PixelPal',
  'CodeMonkey',
  'BugHunter',
  'AlgoRhythm',
  'DataDan',
  'LogicLarry',
  'StackOverflow',
  'MemoryLeak',
  'RecursiveRay',
  'AsyncAwait',
  'JSONJason',
  'APIAnna',
];

export function generateBotNames(count: number, existingNames: string[] = []): string[] {
  const availableNames = BOT_NAMES.filter(name => !existingNames.includes(name));
  const shuffled = availableNames.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

