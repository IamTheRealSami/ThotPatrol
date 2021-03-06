/**
 * @file ignoreLinkFilter command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  if (args.channel) {
    args.channel = message.mentions.channels.size
      ? message.mentions.channels.first()
      : message.guild.channels.get(args.channel);

    if (!args.channel) {
      return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'channelNotFound'), message.channel);
    }

    await ThotPatrol.database.models.textChannel.upsert({
      channelID: args.channel.id,
      guildID: message.guild.id,
      ignoreLinkFilter: !args.remove
    },
    {
      where: {
        channelID: args.channel.id,
        guildID: message.guild.id
      },
      fields: [ 'ignoreLinkFilter' ]
    });

    let description;
    if (args.remove) {
      description = `Removed the ${args.channel} text channel from the link filter ignore list.`;
    }
    else {
      description = `Added the ${args.channel} text channel to the link filter ignore list.`;
    }

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.BLUE,
        description: description
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });
  }
  else if (args.role) {
    args.role = message.guild.roles.get(args.role);

    if (!args.role) {
      return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'roleNotFound'), message.channel);
    }

    await ThotPatrol.database.models.role.upsert({
      roleID: args.role.id,
      guildID: message.guild.id,
      ignoreLinkFilter: !args.remove
    },
    {
      where: {
        roleID: args.role.id,
        guildID: message.guild.id
      },
      fields: [ 'ignoreLinkFilter' ]
    });

    let description;
    if (args.remove) {
      description = `Removed the ${args.role} role from the link filter ignore list.`;
    }
    else {
      description = `Added the ${args.role} role to the link filter ignore list.`;
    }

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.BLUE,
        description: description
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });
  }
  else {
    let fields = [];

    let textChannelModel = await ThotPatrol.database.models.textChannel.findAll({
      attributes: [ 'channelID' ],
      where: {
        guildID: message.guild.id,
        ignoreLinkFilter: true
      }
    });

    let ignoredChannels = 'No channels are being ignored by link filter.';
    if (textChannelModel.length) {
      ignoredChannels = `<#${textChannelModel.map(model => model.dataValues.channelID).join('>\n<#')}>`;
    }
    fields.push({
      name: 'Ignored Channels',
      value: ignoredChannels
    });

    let roleModel = await ThotPatrol.database.models.role.findAll({
      attributes: [ 'roleID' ],
      where: {
        guildID: message.guild.id,
        ignoreLinkFilter: true
      }
    });

    let ignoredRoles = 'No roles are being ignored by link filter.';
    if (roleModel.length) {
      ignoredRoles = `<@&${roleModel.map(model => model.dataValues.roleID).join('>\n<@&')}>`;
    }
    fields.push({
      name: 'Ignored Roles',
      value: ignoredRoles
    });

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.BLUE,
        title: 'Link Filter Ignored List',
        fields: fields
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });
  }
};

exports.config = {
  aliases: [],
  enabled: true,
  argsDefinitions: [
    { name: 'channel', type: String, defaultOption: true },
    { name: 'role', type: String },
    { name: 'remove', type: Boolean, alias: 'r' }
  ]
};

exports.help = {
  name: 'ignoreLinkFilter',
  description: 'Add/remove channels/roles to/from the link filter ignored list. ThotPatrol will not filter links posted in these channels or by these roles.',
  botPermission: '',
  userTextPermission: 'MANAGE_GUILD',
  userVoicePermission: '',
  usage: 'ignoreLinkFilter [--channel #CHANNEL_MENTION | CHANNEL_ID] [--role ROLE_ID] [--remove]',
  example: []
};
