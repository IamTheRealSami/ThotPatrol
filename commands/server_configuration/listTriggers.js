/**
 * @file listTriggers command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

exports.exec = async (ThotPatrol, message, args) => {
  let triggerModels = await ThotPatrol.database.models.trigger.findAll({
    attributes: [ 'trigger' ],
    where: {
      guildID: message.guild.id
    }
  });

  if (!triggerModels.length) {
    return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'triggerNotFound'), message.channel);
  }

  let triggers = triggerModels.map((t, i) => `${i + 1}. ${t.dataValues.trigger}`);

  let noOfPages = triggers.length / 10;
  let i = (args.page > 0 && args.page < noOfPages + 1) ? args.page : 1;
  i = i - 1;

  message.channel.send({
    embed: {
      color: ThotPatrol.colors.BLUE,
      title: 'List of triggers',
      description: triggers.slice(i * 10, (i * 10) + 10).join('\n'),
      footer: {
        text: `Page: ${i + 1} of ${noOfPages > parseInt(noOfPages) ? parseInt(noOfPages) + 1 : parseInt(noOfPages)}`
      }
    }
  });
};

exports.config = {
  aliases: [ 'listtrips' ],
  enabled: true,
  argsDefinitions: [
    { name: 'page', type: Number, alias: 'p', defaultOption: true, defaultValue: 1 }
  ]
};

exports.help = {
  name: 'listTriggers',
  description: 'Lists all the message triggers.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'listTriggers [page_no]',
  example: [ 'listTriggers', 'listTriggers 2' ]
};
