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

client.db = db;
client.commands = new Collection();

// Load commands
for (const folder of fs.readdirSync('./commands')) {
  const folderPath = path.join(__dirname, 'commands', folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(folderPath, file));
    if (cmd.data) client.commands.set(cmd.data.name, cmd);
  }
}

// Load client events
for (const file of fs.readdirSync('./events/client').filter(f => f.endsWith('.js'))) {
  const evt = require(`./events/client/${file}`);
  client[evt.once ? 'once' : 'on'](evt.name, (...args) => evt.execute(...args, client));
}

// Load interaction handlers
for (const file of fs.readdirSync('./events/interaction').filter(f => f.endsWith('.js'))) {
  const handler = require(`./events/interaction/${file}`);
  client.on('interactionCreate', (i) => handler.execute(i, client));
}

process.on('unhandledRejection', console.error);
client.login(process.env.TOKEN);
