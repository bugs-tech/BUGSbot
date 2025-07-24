// commands/hangman.js
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

  // New words below
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

export const name = 'hangman';
export const description = 'Play Hangman! Guess letters to find the hidden word.';
export const category = 'Game';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;
  const chatId = msg.key.remoteJid;

  if (args.length === 0) {
    if (games.has(chatId)) {
      await sendReply(chatId, '⚠️ A game is already in progress. Guess a letter with `.hangman <letter>` or finish the current game first.');
      return;
    }
    const chosen = words[Math.floor(Math.random() * words.length)];
    const word = chosen.word.toLowerCase();
    const hint = chosen.hint;
    const progress = '_'.repeat(word.length).split('');
    const attemptsLeft = maxAttempts;
    const guessedLetters = [];

    games.set(chatId, { word, hint, progress, attemptsLeft, guessedLetters });

    await sendReply(chatId, 
      `🎮 *Hangman started!*\n` +
      `Hint: _${hint}_\n` +
      `Word: \`${progress.join(' ')}\`\n` +
      `Attempts left: ${attemptsLeft}\n` +
      `Guess a letter with: \`.hangman <letter>\``);
    return;
  }

  if (!games.has(chatId)) {
    await sendReply(chatId, '⚠️ No game in progress. Start a new one with `.hangman`');
    return;
  }

  const game = games.get(chatId);
  const letter = args[0].toLowerCase();

  if (!letter.match(/^[a-z]$/)) {
    await sendReply(chatId, '⚠️ Please guess a single letter (a-z).');
    return;
  }

  if (game.guessedLetters.includes(letter)) {
    await sendReply(chatId, `⚠️ You've already guessed the letter *${letter}*.\nWord: \`${game.progress.join(' ')}\`\nAttempts left: ${game.attemptsLeft}`);
    return;
  }

  game.guessedLetters.push(letter);

  if (game.word.includes(letter)) {
    for (let i = 0; i < game.word.length; i++) {
      if (game.word[i] === letter) {
        game.progress[i] = letter;
      }
    }

    if (!game.progress.includes('_')) {
      await sendReply(chatId, `🎉 *Congratulations!* You guessed the word:\n\`${game.word}\`\n\nType \`.hangman\` to start a new game.`);
      games.delete(chatId);
      return;
    } else {
      await sendReply(chatId, 
        `✅ Good guess!\n` +
        `Hint: _${game.hint}_\n` +
        `Word: \`${game.progress.join(' ')}\`\n` +
        `Attempts left: ${game.attemptsLeft}\n` +
        `Guessed letters: ${game.guessedLetters.join(', ')}`);
      return;
    }
  } else {
    game.attemptsLeft--;

    if (game.attemptsLeft <= 0) {
      await sendReply(chatId, `❌ Game over! You ran out of attempts.\nThe word was: \`${game.word}\`\n\nType \`.hangman\` to start a new game.`);
      games.delete(chatId);
      return;
    } else {
      await sendReply(chatId, 
        `❌ Wrong guess!\n` +
        `Hint: _${game.hint}_\n` +
        `Word: \`${game.progress.join(' ')}\`\n` +
        `Attempts left: ${game.attemptsLeft}\n` +
        `Guessed letters: ${game.guessedLetters.join(', ')}`);
      return;
    }
  }
}
