/**
 * @file streamers command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  let streamersModel = await ThotPatrol.database.models.streamers.findOne({
    attributes: [ 'channelID', 'twitch' ],
    where: {
      guildID: message.guild.id
    }
  });

  let twitchStreamers = [], color, title, description;

  if (streamersModel && streamersModel.dataValues.twitch) {
    twitchStreamers = streamersModel.dataValues.twitch;
  }

  if (!args.streamers) {
    if (twitchStreamers.length) {
      color = ThotPatrol.colors.BLUE;
      title = 'Followed streamers';
      description = twitchStreamers.join(', ');
    }
    else {
      color = ThotPatrol.colors.RED;
      description = 'You\'re not following any streamers in this server.';
    }
  }
  else {
    if (args.remove) {
      color = ThotPatrol.colors.RED;
      title = 'Removed from followed streamers';
      twitchStreamers = twitchStreamers.filter(streamer => args.streamers.indexOf(streamer) < 0);
    }
    else {
      color = ThotPatrol.colors.GREEN;
      title = 'Added to followed streamers';
      twitchStreamers = twitchStreamers.concat(args.streamers);
    }
    description = args.streamers.join(' ');
    twitchStreamers = [ ...new Set(twitchStreamers) ];

    await ThotPatrol.database.models.streamers.upsert({
      guildID: message.guild.id,
      channelID: message.channel.id,
      twitch: twitchStreamers
    },
    {
      where: {
        guildID: message.guild.id
      },
      fields: [ 'guildID', 'channelID', 'twitch' ]
    });
  }

  await message.channel.send({
    embed: {
      color: color,
      title: title,
      description: description
    }
  });
};

exports.config = {
  aliases: [],
  enabled: true,
  argsDefinitions: [
    { name: 'streamers', type: String, multiple: true, defaultOption: true },
    { name: 'remove', type: Boolean, alias: 'r' }
  ]
};

exports.help = {
  name: 'streamers',
  description: 'Adds/removes/displays the list of streamers followed by the server to get notified when they are live.',
  botPermission: '',
  userTextPermission: 'MANAGE_GUILD',
  userVoicePermission: '',
  usage: 'streamers [user1 [user2]] [--remove]',
  example: [ 'streamers', 'streamers k3rn31p4nic Wipe Taafe', 'streamers k3rn31p4nic --remove' ]
};
