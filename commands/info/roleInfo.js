/**
 * @file roleInfo command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  if (!args.length) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  let role = message.mentions.roles.first();
  if (!role) {
    role = message.guild.roles.find(role => role.name === args.join(' '));
  }

  if (!role) {
    return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'roleNotFound'), message.channel);
  }
  let permissions = [];
  let serializedPermissions = role.serialize();
  for (let permission in serializedPermissions) {
    if (serializedPermissions[permission]) {
      permissions.push(permission.replace(/_/g, ' ').toTitleCase());
    }
  }

  let roleModel = await ThotPatrol.database.models.role.findOne({
    attributes: [ 'description' ],
    where: {
      roleID: role.id,
      guildID: message.guild.id
    }
  });
  let roleDescription;
  if (roleModel && roleModel.dataValues.description) {
    roleDescription = await ThotPatrol.utils.decompressString(roleModel.dataValues.description);
  }

  await message.channel.send({
    embed: {
      color: ThotPatrol.colors.BLUE,
      author: {
        name: role.name
      },
      title: 'Role info',
      description: roleDescription,
      fields: [
        {
          name: 'ID',
          value: role.id,
          inline: true
        },
        {
          name: 'Members',
          value: role.members.size,
          inline: true
        },
        {
          name: 'Hoisted',
          value: role.hoist ? 'Yes' : 'No',
          inline: true
        },
        {
          name: 'External',
          value: role.managed ? 'Yes' : 'No',
          inline: true
        },
        {
          name: 'Created At',
          value: role.createdAt.toUTCString(),
          inline: true
        },
        {
          name: 'Permissions',
          value: permissions.length ? permissions.join(', ') : 'None'
        }
      ],
      thumbnail: {
        url: `https://dummyimage.com/250/${role.hexColor.slice(1)}/&text=%20`
      }
    }
  });
};

exports.config = {
  aliases: [ 'rinfo' ],
  enabled: true
};

exports.help = {
  name: 'roleInfo',
  description: 'Shows information of a specified role of your Discord server.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'roleInfo <@role-mention|role_name>',
  example: [ 'roleInfo @Dark Knigths', 'roleInfo The Legends' ]
};
