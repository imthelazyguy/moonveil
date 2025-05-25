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
client.legacyCommands = new Collection();
client.aliases = new Collection();
client.db = db;

// Load Commands
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.data) {
      client.commands.set(command.data.name, command);
    }
    if (command.name && command.aliases) {
      client.legacyCommands.set(command.name, command);
      command.aliases.forEach(alias => client.aliases.set(alias, command.name));
    }
  }
}

// Load Events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.login(process.env.TOKEN);
