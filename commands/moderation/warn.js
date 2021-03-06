/**
 * @file warn command
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


  let guildMemberModel = await message.client.database.models.guildMember.findOne({
    attributes: [ 'warnings' ],
    where: {
      userID: member.id,
      guildID: message.guild.id
    }
  });


  if (!guildMemberModel.dataValues.warnings) {
    guildMemberModel.dataValues.warnings = [];
  }

  guildMemberModel.dataValues.warnings.push({
    reason: args.reason,
    executor: message.author.id,
    time: Date.now()
  });


  await message.client.database.models.guildMember.update({
    warnings: guildMemberModel.dataValues.warnings
  },
  {
    where: {
      userID: member.id,
      guildID: message.guild.id
    },
    fields: [ 'warnings' ]
  });


  let guildModel = await message.client.database.models.guild.findOne({
    attributes: [ 'warnAction', 'warnThreshold' ],
    where: {
      guildID: message.guild.id
    }
  });

  if (guildModel && guildModel.dataValues.warnAction && guildMemberModel.dataValues.warnings.length >= guildModel.dataValues.warnThreshold) {
    let action, actionMessage = 'Warning threshold reached. Too many warnings!';
    guildModel.dataValues.warnAction = guildModel.dataValues.warnAction.toLowerCase();
    switch (guildModel.dataValues.warnAction) {
      case 'kick':
        if (member.kickable) {
          await member.kick(actionMessage);
        }
        action = 'Kicked';
        break;
      case 'ban':
        if (member.bannable) {
          await member.ban(actionMessage);
        }
        action = 'Banned';
        break;
      case 'softban':
        if (member.bannable) {
          await member.ban(actionMessage);
          await message.guild.unban(member.id);
        }
        action = 'Soft-Banned';
        break;
      default:
        break;
    }

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.RED,
        description: ThotPatrol.i18n.info(message.guild.language, guildModel.dataValues.warnAction, message.author.tag, user.tag, actionMessage),
        footer: {
          text: `ID ${user.id}`
        }
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });

    ThotPatrol.emit('moderationLog', message.guild, message.author, guildModel.dataValues.warnAction, user, actionMessage);

    await member.send({
      embed: {
        color: ThotPatrol.colors.RED,
        title: `${action} from ${message.guild.name} Server`,
        fields: [
          {
            name: 'Reason',
            value: actionMessage
          }
        ]
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });
  }
  else {
    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.ORANGE,
        description: ThotPatrol.i18n.info(message.guild.language, 'warn', message.author.tag, user.tag, args.reason)
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });

    let DMChannel = await user.createDM();
    await DMChannel.send({
      embed: {
        color: ThotPatrol.colors.ORANGE,
        description: ThotPatrol.i18n.info(message.guild.language, 'warnDM', message.author.tag, message.guild.name, args.reason)
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });

    ThotPatrol.emit('moderationLog', message, this.help.name, user, args.reason);
  }
};

exports.config = {
  aliases: [ 'w' ],
  enabled: true,
  argsDefinitions: [
    { name: 'id', type: String, defaultOption: true },
    { name: 'reason', alias: 'r', type: String, multiple: true, defaultValue: [ 'No reason given.' ] }
  ]
};

exports.help = {
  name: 'warn',
  description: 'Warns the specified user. If warning threshold reaches for a user some action, specified by the `warnAction` command, is taken.',
  botPermission: 'KICK_MEMBERS',
  userTextPermission: 'KICK_MEMBERS',
  userVoicePermission: '',
  usage: 'warn < @USER-MENTION | USER_ID > -r [Reason]',
  example: [ 'warn @user#001 -r Sharing NSFW contents', 'warn 167147569575323761 -r Advertisements' ]
};
