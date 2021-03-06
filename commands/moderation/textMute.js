/**
 * @file textMute command
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

  args.reason = args.reason.join(' ');

  if (args.server) {
    let mutedRole = message.guild.roles.find(role => role.name === 'ThotPatrol:mute');
    if (!mutedRole) {
      mutedRole = await message.guild.createRole({ name:'ThotPatrol:mute' });
    }

    await member.addRole(mutedRole, args.reason);

    for (let channel of message.guild.channels.filter(channel => channel.type === 'text')) {
      channel = channel[1];
      if (!channel.permissionOverwrites.get(mutedRole.id)) {
        await channel.overwritePermissions(mutedRole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false
        });
      }
    }

    if (args.timeout) {
      args.timeout = Math.abs(args.timeout);

      if (!args.timeout || args.timeout > 1440) args.timeout = 1440;

      ThotPatrol.setTimeout(() => {
        member.removeRole(mutedRole, 'User auto unmuted after timeout.').catch(ThotPatrol.log.error);
      }, args.timeout * 60 * 1000);
    }
  }
  else {
    await message.channel.overwritePermissions(user, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false
    }, args.reason);

    if (args.timeout) {
      args.timeout = Math.abs(args.timeout);

      if (!args.timeout || args.timeout > 1440) args.timeout = 1440;

      ThotPatrol.setTimeout(() => {
        let permissionOverwrites = message.channel.permissionOverwrites.get(user.id);
        if (permissionOverwrites) {
          permissionOverwrites.delete().catch(ThotPatrol.log.error);
        }
      }, args.timeout * 60 * 1000);
    }
  }

  await message.channel.send({
    embed: {
      color: ThotPatrol.colors.ORANGE,
      description: `${message.author.tag} text-muted ${user.tag}${args.timeout ? ` for ${args.timeout} minutes ` : ' '}with reason **${args.reason}**`
    }
  }).catch(e => {
    ThotPatrol.log.error(e);
  });

  ThotPatrol.emit('moderationLog', message, this.help.name, user, args.reason, {
    channel: message.channel
  });
};

exports.config = {
  aliases: [ 'tm' ],
  enabled: true,
  argsDefinitions: [
    { name: 'id', type: String, defaultOption: true },
    { name: 'reason', alias: 'r', type: String, multiple: true, defaultValue: [ 'No reason given.' ] },
    { name: 'server', type: Boolean, alias: 's' },
    { name: 'timeout', type: Number, alias: 't' }
  ]
};

exports.help = {
  name: 'textMute',
  description: 'Text mutes a specified user from the specified text channel (for specified minutes) or globally on your Discord server.',
  botPermission: 'MANAGE_ROLES',
  userTextPermission: 'MUTE_MEMBERS',
  userVoicePermission: '',
  usage: 'textMute < @USER_MENTION | USER_ID > [-r Reason] [--server] [-t MINUTES]',
  example: [ 'textMute @user#0001 -r off topic discussions -t 15', 'textMute 167147569575323761 -r misbehaving with others --server' ]
};
