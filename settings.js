// settings.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  prefix: process.env.BOT_PREFIX || '.',
  botName: process.env.BOT_NAME || 'Bugs_bot',
  version: process.env.BOT_VERSION || '1.0.0',
  welcomeMessage:
    process.env.WELCOME_MESSAGE ||
    `👋 *Welcome to Bugs_Bot-MD!*\nType *.menu* to get started.`,
  allowPrivateCommands: process.env.ALLOW_PRIVATE_COMMANDS === 'true',
  allowSelfCommands: process.env.ALLOW_SELF_COMMANDS === 'true',
  commandCooldown: parseInt(process.env.COMMAND_COOLDOWN) || 2,

  // Owners (WhatsApp JIDs)
  botOwnerNumbers: (process.env.BOT_OWNER_NUMBERS || '')
    .split(',')
    .map(num => num.trim())
    .filter(Boolean),

  // AI settings
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    endpoint: process.env.AI_ENDPOINT || 'https://api.openai.com/v1/',
    apiKey: process.env.AI_API_KEY || '',
  },

  // Remove.bg for background removal
  removebg: {
    apiKey: process.env.REMOVEBG_API_KEY || '',
  },

  // YouTube API (for .play, .yta, .ytv)
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
  },
};
