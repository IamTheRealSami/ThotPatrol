/**
 * @file report command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  if (!args.user || !args.reason) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }


  let guildModel = await ThotPatrol.database.models.guild.findOne({
    attributes: [ 'reportChannel' ],
    where: {
      guildID: message.guild.id
    }
  });

  if (guildModel && guildModel.dataValues.reportChannel && message.guild.channels.has(guildModel.dataValues.reportChannel)) {
    let user;
    if (args.user.startsWith('<@') && message.mentions.users.size) {
      user = message.mentions.users.first();
    }
    else {
      let member = message.guild.members.get(args.user);
      if (member) {
        user = member.user;
      }
    }

    if (!user) {
      return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'notFound', 'user'), message.channel);
    }

    if (message.author.id === user.id) return;

    args.reason = args.reason.join(' ');


    let reportChannel = message.guild.channels.get(guildModel.dataValues.reportChannel);
    await reportChannel.send({
      embed: {
        color: ThotPatrol.colors.ORANGE,
        title: 'User Report',
        fields: [
          {
            name: 'User',
            value: user.tag,
            inline: true
          },
          {
            name: 'User ID',
            value: user.id,
            inline: true
          },
          {
            name: 'Report',
            value: args.reason
          }
        ],
        footer: {
          text: `Reported by ${message.author.tag} / ${message.author.id}`
        },
        timestamp: new Date()
      }
    });


    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.GREEN,
        title: 'User Reported',
        description: ThotPatrol.i18n.info(message.guild.language, 'report', message.author.tag, user.tag, args.reason)
      }
    }).then(successMessage => {
      if (message.deletable) message.delete().catch(() => {});
      successMessage.delete(10000).catch(() => {});
    }).catch(e => {
      ThotPatrol.log.error(e);
    });
  }
  else {
    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.RED,
        description: ThotPatrol.i18n.error(message.guild.language, 'noReportChannel', message.author.tag)
      }
    });
    if (message.deletable) message.delete().catch(() => {});
  }
};

exports.config = {
  aliases: [],
  enabled: true,
  argsDefinitions: [
    { name: 'user', type: String, defaultOption: true },
    { name: 'reason', alias: 'r', type: String, multiple: true }
  ]
};

exports.help = {
  name: 'report',
  description: 'Reports a user of your Discord server to the server staffs. *Report Channel needs to be set.*',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'report < @USER_MENTION | USER_ID > < -r REASON >',
  example: [ 'report 215052539542571701 -r DM advertisement', 'report @user#0001 -r Trolling everyone' ]
};
