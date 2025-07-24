// commands/wordscramble.js

export const name = 'wordscramble';
export const description = 'Play Word Scramble game! Unscramble the letters to find the word.';
export const category = 'Games';

// Sample words with hints
const wordList = [
  { word: 'javascript', hint: 'Programming language' },
  { word: 'bicycle', hint: 'Two wheels' },
  { word: 'elephant', hint: 'Largest land animal' },
  { word: 'computer', hint: 'Used to code' },
  { word: 'guitar', hint: 'String instrument' },
  { word: 'mountain', hint: 'High landform' },
  { word: 'pyramid', hint: 'Ancient Egyptian structure' },
  { word: 'rainbow', hint: 'Colors in the sky after rain' },
  { word: 'butterfly', hint: 'Insect with colorful wings' },
  { word: 'chocolate', hint: 'Sweet treat' },
];

// Store game states per chat
const games = new Map();

// Helper to shuffle letters
function shuffle(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;
  const chatId = msg.key.remoteJid;

  let game = games.get(chatId);

  const subcommand = args[0]?.toLowerCase();

  if (!subcommand || subcommand === 'help') {
    return sendReply(chatId,
      `🧩 *Word Scramble Game* 🧩\n\n` +
      `Commands:\n` +
      `• .wordscramble start - Start a new game\n` +
      `• .wordscramble guess <word> - Guess the unscrambled word\n` +
      `• .wordscramble hint - Get a hint\n` +
      `• .wordscramble quit - Quit the current game`
    );
  }

  if (subcommand === 'start') {
    if (game && game.status === 'playing') {
      return sendReply(chatId, '⚠️ A game is already in progress! Use `.wordscramble quit` to end it first.');
    }

    // Pick a random word
    const selection = wordList[Math.floor(Math.random() * wordList.length)];
    const scrambled = shuffle(selection.word);

    games.set(chatId, {
      status: 'playing',
      word: selection.word,
      scrambled,
      hint: selection.hint,
      attempts: 0,
    });

    return sendReply(chatId,
      `🎉 New Word Scramble game started!\n` +
      `Unscramble this word:\n\n` +
      `*${scrambled.toUpperCase()}*\n\n` +
      `Use \`.wordscramble guess <word>\` to guess.`
    );
  }

  if (!game || game.status !== 'playing') {
    return sendReply(chatId, '❗ No active game. Start one with `.wordscramble start`.');
  }

  if (subcommand === 'guess') {
    if (!args[1]) {
      return sendReply(chatId, '❗ Please provide a guess.\nExample: `.wordscramble guess bicycle`');
    }

    const guess = args.slice(1).join(' ').toLowerCase();
    game.attempts++;

    if (guess === game.word.toLowerCase()) {
      games.delete(chatId);
      return sendReply(chatId,
        `🎊 Correct! The word was *${game.word}*.\n` +
        `You guessed it in *${game.attempts}* attempt(s).\n` +
        `Start a new game with \`.wordscramble start\`.`
      );
    } else {
      return sendReply(chatId,
        `❌ Wrong guess! Try again.\n` +
        `Use \`.wordscramble hint\` if you need help.\n` +
        `Attempts: ${game.attempts}`
      );
    }
  }

  if (subcommand === 'hint') {
    if (!game) {
      return sendReply(chatId, '❗ No active game. Start one with `.wordscramble start`.');
    }
    return sendReply(chatId, `💡 Hint: ${game.hint}`);
  }

  if (subcommand === 'quit') {
    if (!game) {
      return sendReply(chatId, '❗ No active game to quit.');
    }
    games.delete(chatId);
    return sendReply(chatId, '🛑 Game ended. Thanks for playing!\nStart again with `.wordscramble start`.');
  }

  return sendReply(chatId, '❓ Unknown command. Use `.wordscramble help` for instructions.');
}
