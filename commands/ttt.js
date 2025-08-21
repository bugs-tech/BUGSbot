import { sendReply } from '../lib/sendReply.js';

let tttGames = new Map(); // key: chatId, value: game state

function displayBoard(board) {
  return board.map((cell, idx) => cell || (idx + 1)).reduce((acc, val, idx) => {
    if (typeof val === 'number') val = `${val}️⃣`;
    acc += val;
    if ((idx + 1) % 3 === 0) acc += '\n';
    return acc;
  }, '');
}

function boardHint() {
  return '1️⃣2️⃣3️⃣\n4️⃣5️⃣6️⃣\n7️⃣8️⃣9️⃣';
}

function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

async function getUserName(sock, jid) {
  try {
    const contacts = await sock.onWhatsApp(jid);
    if (contacts?.length) return contacts[0].notify || contacts[0].vname || contacts[0].name || jid.split('@')[0];
  } catch {}
  return jid.split('@')[0];
}

export const name = "ttt";
export const description = "🎮 Two-player Tic Tac Toe game";

export async function execute(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const from = msg.key.participant || msg.key.remoteJid;

  if (!args[0]) return sendReply(sock, msg, 
    "🎮 Tic Tac Toe Game\nCommands:\n.ttt start - create a game\n.ttt join - join a game\n.ttt <1-9> - make a move\n.ttt end - end current game\n\nCell numbers:\n" + boardHint()
  );

  if (args[0].toLowerCase() === 'end') {
    if (!tttGames.has(chatId)) return sendReply(sock, msg, "⚠️ No ongoing Tic Tac Toe game.");
    const game = tttGames.get(chatId);
    if (!game.players.includes(from)) return sendReply(sock, msg, "❌ Only current players can end the game.");
    tttGames.delete(chatId);
    return sendReply(sock, msg, "🛑 Tic Tac Toe game ended.");
  }

  if (args[0].toLowerCase() === 'start') {
    if (tttGames.has(chatId)) return sendReply(sock, msg, "❌ A game is already in progress.");

    // Create game immediately
    tttGames.set(chatId, { players: [from], playerNames: {}, board: Array(9).fill(''), turn: null });

    await sendReply(sock, msg, "🎮 Tic Tac Toe created!");
    return sendReply(sock, msg, "⏳ Waiting for a second player to join. Type `.ttt join` to start the game.\n\nCell numbers:\n" + boardHint());
  }

  if (args[0].toLowerCase() === 'join') {
    if (!tttGames.has(chatId)) return sendReply(sock, msg, "⚠️ No game to join. Type `.ttt start` to create one.");
    const game = tttGames.get(chatId);
    if (game.players.includes(from)) return sendReply(sock, msg, "❌ You already joined the game.");
    if (game.players.length >= 2) return sendReply(sock, msg, "❌ Game already has 2 players.");

    game.players.push(from);

    // Fetch and cache player names only once
    game.playerNames[game.players[0]] = await getUserName(sock, game.players[0]);
    game.playerNames[game.players[1]] = await getUserName(sock, game.players[1]);

    game.turn = game.players[0]; // first player starts

    return sendReply(sock, msg,
      `✅ Second player joined! Game started.\nPlayers:\n1️⃣ @${game.playerNames[game.players[0]]}\n2️⃣ @${game.playerNames[game.players[1]]}\n\nIt is @${game.playerNames[game.turn]}'s turn.\n\n` + displayBoard(game.board),
      { mentions: game.players }
    );
  }

  if (!tttGames.has(chatId)) return sendReply(sock, msg, "⚠️ No ongoing game. Type `.ttt start` to create one.");
  const game = tttGames.get(chatId);
  if (game.players.length < 2) return sendReply(sock, msg, "⏳ Waiting for a second player to join.");

  const move = parseInt(args[0], 10);
  if (isNaN(move) || move < 1 || move > 9) return sendReply(sock, msg, "❌ Invalid move. Choose a number from 1-9.");
  if (from !== game.turn) return sendReply(sock, msg, "⏳ It's not your turn.");
  if (game.board[move-1]) return sendReply(sock, msg, "❌ That cell is already taken.");

  const symbol = game.players[0] === from ? '❌' : '⭕';
  game.board[move-1] = symbol;

  const winner = checkWinner(game.board);
  const playerNames = game.playerNames;

  if (winner) {
    tttGames.delete(chatId);
    return sendReply(sock, msg, displayBoard(game.board) + `\n🏆 @${playerNames[from]} wins!`, { mentions: game.players });
  }

  if (game.board.every(cell => cell)) {
    tttGames.delete(chatId);
    return sendReply(sock, msg, displayBoard(game.board) + "\n🤝 It's a draw!", { mentions: game.players });
  }

  game.turn = game.players.find(p => p !== from);

  return sendReply(sock, msg, displayBoard(game.board) + `\nIt is @${playerNames[game.turn]}'s turn.`, { mentions: [game.turn] });
}
