// commands/game/join.js const { SlashCommandBuilder } = require("@discordjs/builders"); const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js"); const { getGame, setGame } = require("../../utils/dbUtils");

module.exports = { data: new SlashCommandBuilder() .setName("join") .setDescription("Join the current Moonveil game."),

aliases: ["j"],

async execute(interaction) { try { const game = await getGame(interaction.guild.id); if (!game || game.phase !== "lobby") { return interaction.reply({ embeds: [ new EmbedBuilder().setColor("Red").setTitle("No Game Lobby").setDescription("There is no active game lobby to join.") ], ephemeral: true }); }

if (game.players.includes(interaction.user.id)) {
    return interaction.reply({
      content: "You have already joined the game.",
      ephemeral: true
    });
  }

  game.players.push(interaction.user.id);
  await setGame(interaction.guild.id, game);

  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setTitle("Joined Game")
        .setDescription(`<@${interaction.user.id}> has joined the game!`)
    ]
  });
} catch (error) {
  console.error("Error in join command:", error);
  return interaction.reply({
    content: "An error occurred while joining the game.",
    ephemeral: true
  });
}

}, };

// commands/game/leave.js const { SlashCommandBuilder } = require("@discordjs/builders"); const { EmbedBuilder } = require("discord.js"); const { getGame, setGame } = require("../../utils/dbUtils");

module.exports = { data: new SlashCommandBuilder() .setName("leave") .setDescription("Leave the Moonveil game."),

aliases: ["l"],

async execute(interaction) { try { const game = await getGame(interaction.guild.id); if (!game || game.phase !== "lobby") { return interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("No Game Lobby").setDescription("There's no game to leave.")], ephemeral: true }); }

if (!game.players.includes(interaction.user.id)) {
    return interaction.reply({
      content: "You're not in the game.",
      ephemeral: true
    });
  }

  game.players = game.players.filter(p => p !== interaction.user.id);
  await setGame(interaction.guild.id, game);

  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Orange")
        .setTitle("Left Game")
        .setDescription(`<@${interaction.user.id}> has left the game.`)
    ]
  });
} catch (error) {
  console.error("Error in leave command:", error);
  return interaction.reply({
    content: "An error occurred while leaving the game.",
    ephemeral: true
  });
}

}, };

// commands/game/vote.js const { SlashCommandBuilder } = require("@discordjs/builders"); const { EmbedBuilder } = require("discord.js"); const { getGame, setGame } = require("../../utils/dbUtils");

module.exports = { data: new SlashCommandBuilder() .setName("vote") .setDescription("Vote to eliminate a player.") .addUserOption(option => option.setName("target").setDescription("Choose a player to vote against").setRequired(true)),

aliases: ["v"],

async execute(interaction) { try { const game = await getGame(interaction.guild.id); if (!game || game.phase !== "voting") { return interaction.reply({ content: "It's not voting time.", ephemeral: true }); }

const target = interaction.options.getUser("target");

  if (!game.players.includes(target.id)) {
    return interaction.reply({
      content: "That user is not in the game.",
      ephemeral: true
    });
  }

  game.votes = game.votes || {};
  game.votes[interaction.user.id] = target.id;
  await setGame(interaction.guild.id, game);

  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Purple")
        .setTitle("Vote Cast")
        .setDescription(`<@${interaction.user.id}> has voted to eliminate <@${target.id}>.`)
    ]
  });
} catch (error) {
  console.error("Error in vote command:", error);
  return interaction.reply({
    content: "An error occurred during voting.",
    ephemeral: true
  });
}

}, };

// commands/game/end.js const { SlashCommandBuilder } = require("@discordjs/builders"); const { EmbedBuilder } = require("discord.js"); const { deleteGame } = require("../../utils/dbUtils");

module.exports = { data: new SlashCommandBuilder() .setName("end") .setDescription("Force end the current Moonveil game."),

aliases: ["stop", "terminate"],

async execute(interaction) { try { await deleteGame(interaction.guild.id);

return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Red")
        .setTitle("Game Ended")
        .setDescription("The game has been ended by the admin.")
    ]
  });
} catch (error) {
  console.error("Error ending the game:", error);
  return interaction.reply({
    content: "An error occurred while ending the game.",
    ephemeral: true
  });
}

}, };

