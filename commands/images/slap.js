/**
 * @file slap command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message) => {
  let user = message.mentions.users.first();
  if (!user) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  let slaps = [
    'https://i.giphy.com/media/3XlEk2RxPS1m8/giphy.gif',
    'https://i.giphy.com/media/mEtSQlxqBtWWA/giphy.gif',
    'https://i.giphy.com/media/j3iGKfXRKlLqw/giphy.gif',
    'https://i.giphy.com/media/2M2RtPm8T2kOQ/giphy.gif',
    'https://i.giphy.com/media/l3YSimA8CV1k41b1u/giphy.gif',
    'https://i.giphy.com/media/WLXO8OZmq0JK8/giphy.gif'
  ];

  await message.channel.send({
    embed: {
      color: ThotPatrol.colors.BLUE,
      description: `${message.author.username} slapped ${user.username}!`,
      image: {
        url: slaps[Math.floor(Math.random() * slaps.length)]
      }
    }
  });
};

exports.config = {
  aliases: [],
  enabled: true
};

exports.help = {
  name: 'slap',
  description: 'Give a slap to another user.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'slap <@USER_MENTION>',
  example: [ 'slap @user#0001' ]
};
