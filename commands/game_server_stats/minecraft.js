/**
 * @file minecraft command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

const source = xrequire('gamedig');

exports.exec = async (ThotPatrol, message, args) => {
  try {
    if (!/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(args.address)) {
      return ThotPatrol.emit('commandUsage', message, this.help);
    }

    args.address = args.address.split(':');
    let host = args.address[0];

    if (host === '127.0.0.1') {
      return message.channel.send({
        embed: {
          description: 'There is no place like `127.0.0.1`'
        }
      });
    }

    let port = args.address[1] ? parseInt(args.address[1]) : port = 25565;

    let data = await source.query({
      type: 'minecraft',
      host: host,
      port: port
    });

    let footer;
    if (data.password) {
      footer = {
        text: `Private Server • Version: ${data.raw.version}`,
        icon_url: 'https://resources.ThotPatrolbot.org/images/lock.png'
      };
    }
    else {
      footer = {
        text: `Version: ${data.raw.version}`
      };
    }

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.BLUE,
        title: data.name,
        description: '[Minecraft](https://minecraft.net/)',
        fields: [
          {
            name: 'Server',
            value: `\`${host}:${port}\``,
            inline: true
          },
          {
            name: 'Players',
            value: `${data.players.length}/${data.maxplayers}`,
            inline: true
          },
          {
            name: 'Map',
            value: data.raw.map,
            inline: true
          },
          {
            name: 'Gametype',
            value: data.raw.gametype,
            inline: true
          }
        ],
        footer: footer
      }
    });
  }
  catch (e) {
    if (e.toString() === 'UDP Watchdog Timeout') {
      return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'invalidIPPort'), message.channel);
    }
    throw e;
  }
};

exports.config = {
  aliases: [ 'mc' ],
  enabled: true,
  argsDefinitions: [
    { name: 'address', type: String, defaultOption: true }
  ]
};

exports.help = {
  name: 'minecraft',
  description: 'Get stats of any Minecraft game server.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'minecraft <MC_SERVER_IP:PORT>',
  example: [ 'minecraft 139.59.31.129:25565' ]
};
