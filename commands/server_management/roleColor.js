/**
 * @file roleColor command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  if (!args.name || !args.color) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  args.color = args.color.join('_').toUpperCase();
  let colors = [
    'DEFAULT',
    'AQUA',
    'GREEN',
    'BLUE',
    'PURPLE',
    'GOLD',
    'ORANGE',
    'RED',
    'GREY',
    'DARKER_GREY',
    'NAVY',
    'DARK_AQUA',
    'DARK_GREEN',
    'DARK_BLUE',
    'DARK_PURPLE',
    'DARK_GOLD',
    'DARK_ORANGE',
    'DARK_RED',
    'DARK_GREY',
    'LIGHT_GREY',
    'DARK_NAVY',
    'RANDOM'
  ];
  if (!colors.includes(args.color)) {
    return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'invalidRoleColor', colors.join(', ').replace(/_/g, ' ').toTitleCase()), message.channel);
  }

  args.name = args.name.join(' ');

  let role = message.guild.roles.find(role => role.name === args.name);
  if (role && message.author.id !== message.guild.ownerID && message.member.highestRole.comparePositionTo(role) <= 0) return ThotPatrol.log.info('User doesn\'t have permission to use this command on that role.');
  else if (!role) {
    return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'roleNotFound'), message.channel);
  }

  await role.setColor(args.color);

  await message.channel.send({
    embed: {
      color: role.color,
      description: ThotPatrol.i18n.info(message.guild.language, 'updateRoleColor', message.author.tag, role.name, args.color.toTitleCase())
    }
  }).catch(e => {
    ThotPatrol.log.error(e);
  });
};

exports.config = {
  aliases: [ 'roleColour' ],
  enabled: true,
  argsDefinitions: [
    { name: 'name', type: String, multiple: true, defaultOption: true },
    { name: 'color', type: String, multiple:true, alias: 'c' }
  ]
};

exports.help = {
  name: 'roleColor',
  description: 'Changes the color of the specified role of your Discord server.',
  botPermission: 'MANAGE_ROLES',
  userTextPermission: 'MANAGE_ROLES',
  userVoicePermission: '',
  usage: 'roleColor <ROLE_NAME> <-c COLOR>',
  example: [ 'roleColor Server Staffs -c Dark Orange', 'roleColor Legendary Heroes -c Random' ]
};
