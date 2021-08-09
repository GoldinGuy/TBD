const _ = require("lodash");
const Discord = require("discord.js");
const utils = require("../utils");

class Presence {
	constructor(modules) {
		this.commands = {
			planeswalk: {
				aliases: [],
				inline: false,
				description:
					"Planewalk TBD's presence to a different part of the multiverse",
				help: "This command changes the bot status to a different plane from MTG's vast history",
				examples: ["!planeswalk"]
			}
		};
		this.location = "https://topdecked.com";
		this.modules = modules;
	}

	getCommands() {
		return this.commands;
	}

	handleMessage(command, parameter, msg, bot) {
		utils.updatePresence(bot);
		return msg.channel.send(
			"Planeswalked to a different part of the multiverse!"
		);
	}
}
module.exports = Presence;
