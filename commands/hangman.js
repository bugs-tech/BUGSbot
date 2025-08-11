// commands/hangman.js
// 🎯 Hangman Command - Play a word guessing game with hints

export const name = 'hangman';
export const description = 'Play Hangman! Guess letters to find the hidden word.';
export const category = 'Games';

const words = [
  { word: 'javascript', hint: 'A popular programming language for the web' },
  { word: 'hangman', hint: 'The name of this guessing game' },
  { word: 'bot', hint: 'An automated program that chats or interacts' },
  { word: 'whatsapp', hint: 'A popular messaging app' },
  { word: 'nodejs', hint: 'JavaScript runtime built on Chrome’s V8 engine' },
  { word: 'programming', hint: 'What developers do to create software' },
  { word: 'openai', hint: 'The organization behind ChatGPT' },
  { word: 'chatgpt', hint: 'An AI language model you are chatting with' },
  { word: 'unicorn', hint: 'A mythical horse with a magical horn' },
  { word: 'pizza', hint: 'A delicious Italian dish with cheese and toppings' },
  { word: 'zombie', hint: 'A walking dead creature from horror movies' },
  { word: 'banana', hint: 'A yellow fruit monkeys love' },
  { word: 'toilet', hint: 'You use this when nature calls' },
  { word: 'ninja', hint: 'A stealthy warrior from Japan' },
  { word: 'pirate', hint: 'Sailor with a treasure map and a parrot' },
  { word: 'ghost', hint: 'Spooky spirit that haunts houses' },
  { word: 'cupcake', hint: 'A small, sweet baked treat with frosting' },
  { word: 'kangaroo', hint: 'Australian animal that jumps and carries babies' },
  { word: 'robot', hint: 'Machine that looks or acts like a human' },
  { word: 'wizard', hint: 'A person who casts magical spells' },
  { word: 'skeleton', hint: 'Bones without flesh' },
  { word: 'marshmallow', hint: 'Soft, sweet, and good for roasting' },
  { word: 'lollipop', hint: 'A sweet candy on a stick' },
  { word: 'bubblegum', hint: 'Candy you can blow bubbles with' },
  { word: 'avocado', hint: 'Green fruit used in guacamole' },
  { word: 'cactus', hint: 'Spiky plant that survives in the desert' },
  { word: 'mushroom', hint: 'Fungus often found in forests' },
  { word: 'penguin', hint: 'A flightless bird that loves cold places' },
  { word: 'nachos', hint: 'Tortilla chips with cheese and toppings' },
  { word: 'yoga', hint: 'Exercise that combines body and mind' },
  { word: 'sushi', hint: 'Japanese rice and fish delicacy' },
  { word: 'bagpipes', hint: 'A musical instrument from Scotland' },
  { word: 'espresso', hint: 'Strong coffee served in small cups' },
  { word: 'jellyfish', hint: 'Sea creature with stinging tentacles' },
  { word: 'taco', hint: 'Mexican dish with folded tortilla' },
  { word: 'balloon', hint: 'Inflated with air or helium' },
  { word: 'bicycle', hint: 'Two-wheeled vehicle powered by pedals' },
  { word: 'dragon', hint: 'Fire-breathing mythical creature' },
  { word: 'carnival', hint: 'Funfair with rides and games' },
  { word: 'hula', hint: 'Hawaiian dance with swaying hips' }
];

const maxAttempts = 6;
const games = new Map();

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;
  const chatId = msg.key.remoteJid;

  // Start new game if no args given
  if (args.length === 0) {
    if (games.has(chatId)) {
      return sendReply('⚠️ A game is already in progress! Guess with `.hangman <letter>` or quit first.');
    }
    const chosen = words[Math.floor(Math.random() * words.length)];
    const word = chosen.word.toLowerCase();
    const hint = chosen.hint;
    const progress = '_'.repeat(word.length).split('');
    const guessedLetters = [];

    games.set(chatId, { word, hint, progress, attemptsLeft: maxAttempts, guessedLetters });

    return sendReply(
      `🎮 *Hangman started!*\n` +
      `💡 Hint: _${hint}_\n` +
      `🔠 Word: \`${progress.join(' ')}\`\n` +
      `❤️ Attempts left: ${maxAttempts}\n` +
      `👉 Guess with: \`.hangman <letter>\``
    );
  }

  // Check no active game
  if (!games.has(chatId)) {
    return sendReply('⚠️ No active game. Start one with `.hangman`.');
  }

  const game = games.get(chatId);
  const letter = args[0].toLowerCase();

  // Validate input letter
  if (!/^[a-z]$/.test(letter)) {
    return sendReply('⚠️ Please guess a single letter (a-z).');
  }

  if (game.guessedLetters.includes(letter)) {
    return sendReply(
      `⚠️ You already guessed *${letter}*.\n` +
      `Word: \`${game.progress.join(' ')}\`\n` +
      `❤️ Attempts left: ${game.attemptsLeft}`
    );
  }

  game.guessedLetters.push(letter);

  if (game.word.includes(letter)) {
    // Reveal letter positions
    for (let i = 0; i < game.word.length; i++) {
      if (game.word[i] === letter) game.progress[i] = letter;
    }

    // Win condition
    if (!game.progress.includes('_')) {
      games.delete(chatId);
      return sendReply(
        `🎉 *Congratulations!* You guessed the word: \`${game.word}\`\n` +
        `Start a new game with \`.hangman\`.`
      );
    }

    return sendReply(
      `✅ Good guess!\n` +
      `💡 Hint: _${game.hint}_\n` +
      `🔠 Word: \`${game.progress.join(' ')}\`\n` +
      `❤️ Attempts left: ${game.attemptsLeft}\n` +
      `🔤 Guessed: ${game.guessedLetters.join(', ')}`
    );
  }

  // Wrong guess
  game.attemptsLeft--;
  if (game.attemptsLeft <= 0) {
    games.delete(chatId);
    return sendReply(
      `❌ Game over! The word was: \`${game.word}\`\n` +
      `Start a new game with \`.hangman\`.`
    );
  }

  return sendReply(
    `❌ Wrong guess!\n` +
    `💡 Hint: _${game.hint}_\n` +
    `🔠 Word: \`${game.progress.join(' ')}\`\n` +
    `❤️ Attempts left: ${game.attemptsLeft}\n` +
    `🔤 Guessed: ${game.guessedLetters.join(', ')}`
  );
}
