/**
 * @file resetModerationLogs command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message) => {
  await ThotPatrol.database.models.guild.update({
    moderationCaseNo: 1
  },
  {
    where: {
      guildID: message.guild.id
    },
    fields: [ 'moderationCaseNo' ]
  });

  await message.channel.send({
    embed: {
      color: ThotPatrol.colors.GREEN,
      description: ThotPatrol.i18n.info(message.guild.language, 'resetModerationLogCases', message.author.tag)
    }
  }).catch(e => {
    ThotPatrol.log.error(e);
  });
};

exports.config = {
  aliases: [ 'resetModLogs' ],
  enabled: true
};

exports.help = {
  name: 'resetModerationLogs',
  description: 'Resets the moderation log cases back to 1.',
  botPermission: '',
  userTextPermission: 'MANAGE_GUILD',
  userVoicePermission: '',
  usage: 'resetModerationLogs',
  example: []
};
