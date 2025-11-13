import { BasePrompt } from "./base.ts";
import { BotCasualPrompt } from "./bot_casual.ts";
import { BotFormalPrompt } from "./bot_formal.ts";
import { BotQuirkyPrompt } from "./bot_quirky.ts";
import { BotNonePrompt } from "./bot_none.ts";
import type { BotPersonality } from "../schemas.ts";

export { BasePrompt };

export const PersonalityPrompts: Record<BotPersonality, string> = {
  casual: BotCasualPrompt,
  formal: BotFormalPrompt,
  quirky: BotQuirkyPrompt,
  none: BotNonePrompt,
};

