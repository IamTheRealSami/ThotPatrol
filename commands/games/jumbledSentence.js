/**
 * @file jumbledSentence command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

let activeChannels = [];

exports.exec = async (ThotPatrol, message) => {
  if (activeChannels.includes(message.channel.id)) {
    return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'isGameInUse', 'jumbled sentence'), message.channel);
  }

  let quotes = xrequire('./assets/quotes.json');

  let quote = quotes[Number.random(1, Object.keys(quotes).length)];

  let jumbledSentence = quote.quote.split(' ').shuffle().join(' ');

  let question = await message.channel.send({
    embed: {
      color: ThotPatrol.colors.BLUE,
      description: `Here's your jumbled sentence:\n**${jumbledSentence}**\nFirst person to unscramble it within 5 minutes wins the game.`
    }
  });

  activeChannels.push(message.channel.id);

  const wordsCollector = message.channel.createMessageCollector(
    msg => !msg.author.bot && msg.content.trim().toLowerCase() === quote.quote.toLowerCase(),
    { maxMatches: 1, time: 5 * 60 * 1000 }
  );

  wordsCollector.on('end', (answers, reason) => {
    if (reason === 'time') {
      message.channel.send({
        embed: {
          color: ThotPatrol.colors.RED,
          title: 'Jumbled Sentence',
          description: 'The game was ended as no one was able to answer within the given 5 minutes.'
        }
      }).then(() => {
        question.delete().catch(() => {});
      }).catch(e => {
        ThotPatrol.log.error(e);
      });
    }
    else if (reason === 'matchesLimit') {
      let answer = answers.first();

      message.channel.send({
        embed: {
          color: ThotPatrol.colors.BLUE,
          title: 'Jumbled Sentence',
          description: `Congratulations ${answer.author}! You solved the jumbled sentence.`
        }
      }).then(() => {
        question.delete().catch(() => {});
      }).catch(e => {
        ThotPatrol.log.error(e);
      });
    }

    activeChannels.splice(activeChannels.indexOf(message.channel.id), 1);
  });
};

exports.config = {
  aliases: [ 'scrambleSentence' ],
  enabled: true
};

exports.help = {
  name: 'jumbledSentence',
  description: 'Unscramble the given jumbled sentence and increase your sentence building skills while having fun with your friends.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'jumbledSentence',
  example: []
};
