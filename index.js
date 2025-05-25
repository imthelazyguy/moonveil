require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Firestore Init using ENV-encoded JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_JSON);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();
client.aliases = new Collection();
client.db = db;

// Load Commands
for (const folder of fs.readdirSync('./commands')) {
  const folderPath = path.join(__dirname, 'commands', folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(folderPath, file));
    if (cmd.data) client.commands.set(cmd.data.name, cmd);
    if (cmd.name && cmd.aliases) {
      client.aliases.set(cmd.name, cmd);
      for (const a of cmd.aliases) client.aliases.set(a, cmd);
    }
  }
}

// Load Events from events/client
for (const file of fs.readdirSync(path.join(__dirname, 'events', 'client')).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(__dirname, 'events', 'client', file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Global unhandled rejection handler
process.on('unhandledRejection', console.error);

client.login(process.env.TOKEN);
