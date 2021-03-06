/**
 * @file exec command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

const util = xrequire('util');
const exec = util.promisify(xrequire('child_process').exec);

exports.exec = async (ThotPatrol, message, args) => {
  try {
    if (!args.length) {
      return ThotPatrol.emit('commandUsage', message, this.help);
    }
    args = args.join(' ');

    let { stdout, stderr } = await exec(args, { timeout: 60 * 1000 });

    let output = [
      {
        name: ':inbox_tray: INPUT',
        value: `\`\`\`bash\n${args}\`\`\``
      }
    ];
    let color;

    if (stdout) {
      color = ThotPatrol.colors.GREEN;
      output.push({
        name: ':outbox_tray: OUTPUT',
        value: `\`\`\`bash\n${sanitize(stdout)}\`\`\``
      });
    }
    else if (stderr) {
      color = ThotPatrol.colors.RED;
      output.push({
        name: ':no_entry: ERROR',
        value: `\`\`\`bash\n${sanitize(stdout)}\`\`\``
      });
    }
    else {
      color = ThotPatrol.colors.GREEN;
      output.push({
        name: ':outbox_tray: OUTPUT',
        value: '```bash\n# Command executed successfully but returned no output.```'
      });
    }

    await message.channel.send({
      embed: {
        color: color,
        fields: output
      }
    }).catch(e => {
      ThotPatrol.log.error(e);
    });
  }
  catch (e) {
    if (e.cmd) {
      let output = [
        {
          name: ':inbox_tray: INPUT',
          value: `\`\`\`bash\n${args}\`\`\``
        }
      ];
      let color;

      if (e.stdout) {
        color = ThotPatrol.colors.GREEN;
        output.push({
          name: ':outbox_tray: OUTPUT',
          value: `\`\`\`bash\n${sanitize(e.stdout)}\`\`\``
        });
      }
      else if (e.stderr) {
        color = ThotPatrol.colors.RED;
        output.push({
          name: ':no_entry: ERROR',
          value: `\`\`\`bash\n${sanitize(e.stderr)}\`\`\``
        });
      }
      else {
        color = ThotPatrol.colors.RED;
        output.push({
          name: ':outbox_tray: OUTPUT',
          value: '```bash\n# Command was terminated after running for 1 minute and returned no output.```'
        });
      }

      await message.channel.send({
        embed: {
          color: color,
          fields: output
        }
      }).catch(e => {
        ThotPatrol.log.error(e);
      });
    }
    else {
      ThotPatrol.log.error(e);
    }
  }
};

exports.config = {
  aliases: [],
  enabled: true,
  argsDefinitions: null,
  ownerOnly: true
};

exports.help = {
  name: 'exec',
  description: 'Executes a command in the Terminal (Linux/macOS) or Command Prompt (Windows) and shows the output. Note that it will terminate the command if it runs for more than 1 minute.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'exec <command>',
  example: [ 'exec ls -l', 'exec DIR /B' ]
};


/**
 * Limits the string length to 1000 characters
 * @function sanitize
 * @param {string} text The stdout/stderr output
 * @returns {string} Trimmed stdout/stderr string
 */
function sanitize(text) {
  text = text.toString();
  return text.substring(0, 1000);
}
