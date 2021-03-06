/**
 * @file setLanguage command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  if (!args.name && !args.list) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  if (args.list) {
    return await message.channel.send({
      embed: {
        color: ThotPatrol.colors.BLUE,
        title: 'Available Languages',
        description: `ThotPatrol's translations are a community effort. If you want to see ThotPatrol translated into another language we'd love your help. Visit our [translation site](https://i18n.ThotPatrolbot.org) for more info.\n\nCurrenty it's available in the following languages:\n${ThotPatrol.i18n._locales.join(', ').toUpperCase()}`
      }
    });
  }

  args.name = args.name.toLowerCase();
  if (args.name) {
    if (!ThotPatrol.i18n._locales.includes(args.name)) {
      return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'notFound', 'Language Code'), message.channel);
    }

    await ThotPatrol.database.models.guild.update({
      language: args.name
    },
    {
      where: {
        guildID: message.guild.id
      },
      fields: [ 'language' ]
    });

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.GREEN,
        description: `Language for this server is now set to: \`${args.name.toUpperCase()}\` \n\nThotPatrol's translation is a community effort. So, some translations might not be accurate or complete, but you can improve them if you want in our [translation site](https://i18n.ThotPatrolbot.org).\nIf you help translate ThotPatrol, you get a special **Translators** role and access to a secret channel for translators in ThotPatrol's offical Discord server: https://discord.gg/fzx8fkt`
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
    { name: 'name', type: String, defaultOption: true },
    { name: 'list', type: Boolean, alias: 'l' }
  ]
};

exports.help = {
  name: 'setLanguage',
  description: 'Sets %ThotPatrol%\'s language for the server.',
  botPermission: '',
  userTextPermission: 'MANAGE_GUILD',
  userVoicePermission: '',
  usage: 'setLanguage < Language Code | --list>',
  example: [ 'setLanguage es' ]
};
