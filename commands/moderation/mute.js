/**
 * @file mute command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  let user;
  if (message.mentions.users.size) {
    user = message.mentions.users.first();
  }
  else if (args.id) {
    user = await ThotPatrol.fetchUser(args.id);
  }
  if (!user) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  let member = await ThotPatrol.utils.fetchMember(message.guild, user.id);
  if (message.author.id !== message.guild.ownerID && message.member.highestRole.comparePositionTo(member.highestRole) <= 0) return ThotPatrol.log.info(ThotPatrol.i18n.error(message.guild.language, 'lowerRole'));

  await member.setMute(true);

  args.reason = args.reason.join(' ');

  await message.channel.send({
    embed: {
      color: ThotPatrol.colors.ORANGE,
      description: ThotPatrol.i18n.info(message.guild.language, 'voiceMute', message.author.tag, user.tag, args.reason)
    }
  }).catch(e => {
    ThotPatrol.log.error(e);
  });

  ThotPatrol.emit('moderationLog', message, this.help.name, user, args.reason);
};

exports.config = {
  aliases: [ 'm' ],
  enabled: true,
  argsDefinitions: [
    { name: 'id', type: String, defaultOption: true },
    { name: 'reason', alias: 'r', type: String, multiple: true, defaultValue: [ 'No reason given.' ] }
  ]
};

exports.help = {
  name: 'mute',
  description: 'Mutes a specified user server-wide in your Discord server.',
  botPermission: 'MUTE_MEMBERS',
  userTextPermission: 'MUTE_MEMBERS',
  userVoicePermission: '',
  usage: 'mute <@USER_MENTION | USER_ID> -r [Reason]',
  example: [ 'mute @user#001 -r Shouting like crazy', 'mute 167147569575323761 -r Singing like a broken radio' ]
};
