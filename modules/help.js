const _ = require('lodash');
const Discord = require('discord.js');

class Help {
    constructor(modules) {
        this.commands = {
					help: {
						aliases: [],
						inline: false,
						description: "Show this help message",
						help:
							"Explore the different functions of TBD (TopDecked Bot for Discord)." +
							"Look up detailed descriptions for a command by using" +
							"`!help <command>`, like `!help card`.",
						examples: ["!help", "!help card"],
					},
				};
        this.location = 'https://topdecked.com';
        this.modules = modules;
    }

    getCommands() {
        return this.commands;
    }

    handleMessage(command, parameter, msg) {
        let param = parameter.trim().toLowerCase().split(" ")[0];

        const embed = new Discord.MessageEmbed({
            title: 'List of TopDecked commands',
            // thumbnail: {url: this.thumbnail},
            url: this.location
        });

        const commands = {};
        this.modules.forEach(module => {
            _.forEach(module.getCommands(), (commandObj, command) => {
                commandObj.name = command;
                commands[command] = commandObj;
                commandObj.aliases.forEach(alias => {
                    commands[alias] = commandObj;
                });
            })
        })

        if (parameter && commands[parameter]) {
            embed.setTitle('Command "!'+commands[parameter].name+'"');
            embed.setDescription(commands[parameter].help);
            embed.addField('Examples', '`' + commands[parameter].examples.join('`\n`') + '`', true)
            if (commands[parameter].aliases && commands[parameter].aliases.length) {
                embed.addField('Aliases', '`!' + commands[parameter].aliases.join('`\n`!') + '`', true);
            }
        } else {
            let description = '';
            _.forEach(commands, (commandObj, command) => {
                if (command !== commandObj.name) return;
                description += ':purple_circle: **!'+command+'**  '+commandObj.description+'\n';
            });
            embed.setDescription(
							description +
								"\n Based on @bra1n's powerful \"judgebot.\" \n To learn more about a command, use `!help <command>`"
						);
        }

        return msg.author.send('', {embed});
    }
}
module.exports = Help;
