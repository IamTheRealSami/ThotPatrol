/**
 * @file tapCode command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  if (!args.length) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  args = args.join(' ').toLowerCase();
  const tap = '•';
  const sp = ' ';
  const tapCode = {
    'a': tap + sp + tap,
    'b': tap + sp + tap + tap,
    'c': tap + sp + tap + tap + tap,
    'd': tap + sp + tap + tap + tap + tap,
    'e': tap + sp + tap + tap + tap + tap + tap,
    'f': tap + tap + sp + tap,
    'g': tap + tap + sp + tap + tap,
    'h': tap + tap + sp + tap + tap + tap,
    'i': tap + tap + sp + tap + tap + tap + tap,
    'j': tap + tap + sp + tap + tap + tap + tap + tap,
    'k': tap + sp + tap + tap + tap,
    'l': tap + tap + tap + sp + tap,
    'm': tap + tap + tap + sp + tap + tap,
    'n': tap + tap + tap + sp + tap + tap + tap,
    'o': tap + tap + tap + sp + tap + tap + tap + tap,
    'p': tap + tap + tap + sp + tap + tap + tap + tap + tap,
    'q': tap + tap + tap + tap + sp + tap,
    'r': tap + tap + tap + tap + sp + tap + tap,
    's': tap + tap + tap + tap + sp + tap + tap + tap,
    't': tap + tap + tap + tap + sp + tap + tap + tap + tap,
    'u': tap + tap + tap + tap + sp + tap + tap + tap + tap + tap,
    'v': tap + tap + tap + tap + tap + sp + tap,
    'w': tap + tap + tap + tap + tap + sp + tap + tap,
    'x': tap + tap + tap + tap + tap + sp + tap + tap + tap,
    'y': tap + tap + tap + tap + tap + sp + tap + tap + tap + tap,
    'z': tap + tap + tap + tap + tap + sp + tap + tap + tap + tap + tap,
    ' ': '\u2001'
  };
  args = args.replace(/\. /g, ' x ');
  args = args.replace(/./g, x => `${tapCode[x]}\u2001`).trim();

  await message.channel.send({
    embed: {
      color: ThotPatrol.colors.BLUE,
      title: 'Tap Code',
      description: `**${args}**`
    }
  });
};

exports.config = {
  aliases: [ 'tap' ],
  enabled: true
};

exports.help = {
  name: 'tapCode',
  description: 'Encodes a given text in Tap Code.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'tapCode <text>',
  example: [ 'tapCode Knock Knock' ]
};
