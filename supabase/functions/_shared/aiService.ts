import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BotMessageSchema, GamePlayerWithProfile, type BotMessage, type BotPersonality } from "./schemas.ts";

interface GenerateMessageOptions {
  personality: BotPersonality;
  topic: string;
  conversationHistory: Array<{ player: GamePlayerWithProfile; message: string }>;
}

const PersonalityPrompts: Record<BotPersonality, string> = {
  casual: `You are a casual, friendly person chatting in an online game. You write like a real human - use lowercase sometimes, occasional typos, emojis naturally, and casual slang. Keep responses short (1-2 sentences max). Be authentic and conversational.`,
  formal: `You are a well-spoken, articulate person. You write with proper grammar, complete sentences, and thoughtful responses. Keep it professional but friendly. Responses should be 1-2 sentences max.`,
  quirky: `You are a quirky, creative person with a unique personality. You might use unusual expressions, creative language, or interesting perspectives. Keep responses short (1-2 sentences max) and memorable.`,
  none: `None`,
};

export class AIService {
  private model: ChatGoogleGenerativeAI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private async initializeModel(): Promise<void> {
    if (this.model) return;

    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = Promise.resolve().then(() => {
      const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables");
      }

      this.model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: apiKey,
      });
    });

    await this.initializationPromise;
  }

  async generateMessage(options: GenerateMessageOptions): Promise<string> {
    await this.initializeModel();

    if (!this.model) throw new Error("Chat model not initialized");

    const personalityPrompt = PersonalityPrompts[options.personality];

    const conversationContext = options.conversationHistory.length > 0
      ? options.conversationHistory
        .map(({ player, message }) => `${player}: ${message}`)
        .join("\n")
      : "No messages yet.";

    const agent = createAgent({
      model: this.model,
      tools: [],
      systemPrompt: `${personalityPrompt}

You are participating in a conversation about: "${options.topic}"

Recent conversation:
${conversationContext}

Generate a natural, human-like response to this conversation. Keep it short (1-2 sentences), authentic, and match your personality style. Do NOT mention that you are a bot or AI.`,
      responseFormat: BotMessageSchema,
    });

    try {
      const result = await agent.invoke({
        messages: [
          {
            role: "user",
            content: "Generate a response to the conversation above.",
          },
        ],
      });

      const structuredResponse = result.structuredResponse as BotMessage;

      if (structuredResponse?.message) {
        return structuredResponse.message.trim();
      }

      throw new Error("No response from the agent");
    } catch (error) {
      throw new Error(`Failed to generate message: ${error}`);
    }
  }
}
