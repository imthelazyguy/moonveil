const { sendPhaseEmbed } = require("./interactionUtils");
const db = require("../db/dbUtils");
const { sleep } = require("./generalUtils");

module.exports = {
  async startDiscussionPhase(client, game) {
    try {
      const { discussionVC, players } = game;

      await sendPhaseEmbed(game.publicChannel, "Discussion Phase", "Players will now discuss who they think the werewolves are.");

      // Mute everyone except first speaker
      let alivePlayers = players.filter((p) => !p.isDead);
      for (const p of alivePlayers) {
        const member = await game.guild.members.fetch(p.id);
        await member.voice.setMute(true, "Discussion phase started");
      }

      // Timed speaking
      for (const [index, player] of alivePlayers.entries()) {
        const member = await game.guild.members.fetch(player.id);

        await member.voice.setMute(false);
        await sendPhaseEmbed(game.publicChannel, "Speaker Time", `**${member.displayName}** has the mic for 30 seconds.`);

        await sleep(30000);
        await member.voice.setMute(true);
      }

      // Rebuttal phase
      for (const player of alivePlayers) {
        const member = await game.guild.members.fetch(player.id);
        await member.voice.setMute(false);
      }

      await sendPhaseEmbed(game.publicChannel, "Rebuttal Time", "All players can now speak for 60 seconds.");
      await sleep(60000);

      for (const player of alivePlayers) {
        const member = await game.guild.members.fetch(player.id);
        await member.voice.setMute(true);
      }

      await sendPhaseEmbed(game.publicChannel, "Discussion Phase Ended", "Proceeding to the Voting Phase...");
    } catch (err) {
      console.error("[phaseManager.startDiscussionPhase]", err);
    }
  },

  async startVotingPhase(client, game) {
    try {
      const alivePlayers = game.players.filter((p) => !p.isDead);

      await sendPhaseEmbed(game.publicChannel, "Voting Phase", "Vote to eliminate a suspected player. Use the interactive UI below.");

      // Send embed with voting buttons/dropdown
      // This can be handled by interactionUtils

      // Example for logic trigger:
      setTimeout(() => {
        this.endVotingPhase(client, game);
      }, 45000);
    } catch (err) {
      console.error("[phaseManager.startVotingPhase]", err);
    }
  },

  async endVotingPhase(client, game) {
    try {
      await sendPhaseEmbed(game.publicChannel, "Voting Ended", "Votes are being counted...");
      // Handle vote results and update DB
      const voteResults = await db.countVotes(game.guildId);

      // Update game state, mark dead player, etc.
      if (voteResults.eliminated) {
        const eliminated = await game.guild.members.fetch(voteResults.eliminated.id);
        await eliminated.voice.setMute(true, "Eliminated");
        await sendPhaseEmbed(game.publicChannel, "Elimination", `**${eliminated.displayName}** was eliminated. They were **${voteResults.eliminated.role}**.`);
      }

      await sleep(5000);
      this.startNightPhase(client, game);
    } catch (err) {
      console.error("[phaseManager.endVotingPhase]", err);
    }
  },

  async startNightPhase(client, game) {
    try {
      await sendPhaseEmbed(game.publicChannel, "Night Phase", "Everyone goes to sleep. Roles with night abilities, check your DMs.");

      for (const player of game.players) {
        if (!player.isDead && player.hasNightAction) {
          await require("./interactionUtils").sendActionPrompt(client, player, game);
        }
        const member = await game.guild.members.fetch(player.id);
        await member.voice.setMute(true, "Night silence");
      }

      // After some time, resolve all night actions
      setTimeout(() => {
        this.resolveNightActions(client, game);
      }, 45000);
    } catch (err) {
      console.error("[phaseManager.startNightPhase]", err);
    }
  },

  async resolveNightActions(client, game) {
    try {
      await sendPhaseEmbed(game.publicChannel, "Night Ends", "The sun rises and a new day begins...");

      // Fetch resolved actions from DB and apply effects
      const nightResults = await db.getNightActions(game.guildId);

      for (const action of nightResults) {
        const target = await game.guild.members.fetch(action.targetId);
        if (action.effect === "kill") {
          await target.voice.setMute(true, "Killed");
          game.players.find((p) => p.id === target.id).isDead = true;
          await sendPhaseEmbed(game.publicChannel, "A Tragedy", `**${target.displayName}** was found dead. They were **${action.role}**.`);
        }
      }

      await sleep(5000);
      this.startDiscussionPhase(client, game);
    } catch (err) {
      console.error("[phaseManager.resolveNightActions]", err);
    }
  },
};
