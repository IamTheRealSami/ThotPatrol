/**
 * @file paladins command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

const fs = require('fs');
const YAML = require('yaml');

// eslint-disable-next-line no-sync
const credentialsFile = fs.readFileSync('./settings/credentials.yaml', 'utf8');
const credentials = YAML.parse(credentialsFile);

const HiRez = xrequire('hirez.js');
const hirez = new HiRez({
  devId: credentials.HiRezDevId,
  authKey: credentials.HiRezAuthKey
});

let generatedSession = null;

exports.exec = async (ThotPatrol, message, args) => {
  if (!args.player) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  if (!generatedSession) {
    let session = await hirez.paladins('pc').session.generate().catch(e => {
      ThotPatrol.log.error(e);
    });
    generatedSession = session;

    setTimeout(() => {
      generatedSession = null;
    }, 15 * 60 * 1000);
  }

  await fetchAndSend(message, args);
};

exports.config = {
  aliases: [],
  enabled: true,
  argsDefinitions: [
    { name: 'player', type: String, alias: 'p', defaultOption: true }
  ]
};

exports.help = {
  name: 'paladins',
  description: 'Get stats of any Paladins player.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'paladins <player_name>',
  example: [ 'paladins SaffronPants' ]
};

/**
 * Fetches a player's Paladins stats and sends it.
 * @function fetchAndSend
 * @param {Object} message The message object
 * @param {Object} args The args object
 * @returns {void}
 */
async function fetchAndSend(message, args) {
  let player = await hirez.paladins('pc').getPlayer(args.player);
  let playerStatus = await hirez.paladins('pc').getPlayerStatus(args.player);
  let championRanks = await hirez.paladins('pc').getChampionRanks(args.player);

  playerStatus = playerStatus[0];

  if (playerStatus.status_string.toLowerCase().includes('unknown') || player.length === 0 || championRanks === 0) {
    return message.client.emit('error', '', message.client.i18n.error(message.guild.language, 'notFound', 'player'), message.channel);
  }

  player = player[0];
  championRanks = championRanks[0];

  await message.channel.send({
    embed: {
      color: message.client.colors.BLUE,
      author: {
        name: player.Name
      },
      description: playerStatus.status_string.toLowerCase().includes('offline') ? `${playerStatus.status_string} - Last Seen: ${player.Last_Login_Datetime}` : playerStatus.status_string,
      fields: [
        {
          name: 'Level',
          value: `${player.Level}`,
          inline: true
        },
        {
          name: 'Mastery Level',
          value: `${player.MasteryLevel}`,
          inline: true
        },
        {
          name: 'Region',
          value: player.Region,
          inline: true
        },
        {
          name: 'Wins',
          value: `${player.Wins}`,
          inline: true
        },
        {
          name: 'Losses',
          value: `${player.Losses}`,
          inline: true
        },
        {
          name: 'Leaves',
          value: `${player.Leaves}`,
          inline: true
        },
        {
          name: 'Win %',
          value: `${player.Wins / (player.Wins + player.Losses) * 100}`,
          inline: true
        },
        {
          name: 'Total Achievements',
          value: `${player.Total_Achievements}`,
          inline: true
        },
        {
          name: 'Main Champion',
          value: `${championRanks.champion} - Level ${championRanks.Rank}\n` +
          `${championRanks.Kills} Kills, ${championRanks.Deaths} Deaths and ${championRanks.Assists} Assists (${(championRanks.Kills / championRanks.Deaths).toFixed(2)} K/D)\n` +
          `${championRanks.Wins} Wins and ${championRanks.Losses} Losses (${(championRanks.Wins / (championRanks.Wins + championRanks.Losses) * 100).toFixed(2)} Win %)`,
          inline: true
        }
      ],
      footer: {
        text: 'Powered by Hi-Rez Studios'
      }
    }
  });
}
