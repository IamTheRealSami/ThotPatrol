/**
 * @file quake3 command
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

    let port = args.address[1] ? parseInt(args.address[1]) : 27960;

    let data = await source.query({
      type: 'quake3',
      host: host,
      port: port
    });

    let gametypes = {
      0: 'Free for All',
      1: '1v1',
      3: 'Team Deathmatch',
      4: 'Capture the Flag',
      5: 'CPM'
    };

    let gametype;
    if (gametypes.hasOwnProperty(data.raw.g_gametype)) {
      gametype = gametypes[data.raw.g_gametype];
    }
    else {
      gametype = data.raw.g_gametype;
    }

    let stats = [
      {
        name: 'Server IP',
        value: `\`${host}:${port}\``,
        inline: true
      },
      {
        name: 'Players',
        value: `${data.players.length}/${data.maxplayers}`,
        inline: true
      },
      {
        name: 'Map/Gametype',
        value: `${data.map} - ${gametype}`
      }
    ];

    if (data.players.length > 0) {
      let players = [];
      let scores = [];
      let pings = [];
      for (let i = 0; i < data.players.length; i++) {
        players.push(data.players[i].name);
      }
      for (let i = 0; i < data.players.length; i++) {
        scores.push(data.players[i].frags);
      }
      for (let i = 0; i < data.players.length; i++) {
        pings.push(`${data.players[i].ping}ms`);
      }
      stats.push(
        {
          name: 'Player',
          value: `\`\`\`http\n${players.join('\n')}\`\`\``,
          inline: true
        },
        {
          name: 'Score',
          value: `\`\`\`http\n${scores.join('\n')}\`\`\``,
          inline: true
        },
        {
          name: 'Ping',
          value: `\`\`\`http\n${pings.join('\n')}\`\`\``,
          inline: true
        },
        {
          name: 'Join',
          value: `<steam://connect/${host}:${port}>`
        }
      );
    }

    let footer;
    if (data.password === '1') {
      footer = {
        text: 'Private Server',
        icon_url: 'https://resources.ThotPatrolbot.org/images/lock.png'
      };
    }

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.BLUE,
        title: data.name,
        description: '[Quake III Arena](https://store.steampowered.com/app/2200)',
        fields: stats,
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
  aliases: [ 'q3' ],
  enabled: true,
  argsDefinitions: [
    { name: 'address', type: String, defaultOption: true }
  ]
};

exports.help = {
  name: 'quake3',
  description: 'Get stats of any Quake III Arena game server.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'quake3 <Q3_SERVER_IP:PORT>',
  example: [ 'quake3 139.59.31.128:27960' ]
};
