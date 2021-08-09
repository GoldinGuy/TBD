/* eslint-disable complexity */
const rp = require("request-promise-native");
const _ = require("lodash");
const Discord = require("discord.js");
const utils = require("../utils");
const log = utils.getLogger("topdeck");
const Card = require("./card");
const cardFetcher = new Card();

class Topdeck {
	constructor(modules) {
		this.commands = {
			topdeck: {
				aliases: [],
				inline: false,
				description:
					"A variant of russian roulette where you need to topdeck the right card. If you hit a land, you get kicked.",
				help: "This command is a variant of russian roulette where if you hit a land, you get kicked.",
				examples: ["!topdeck"],
			},
		};
		this.location = "https://topdecked.com";
		this.modules = modules;
		this.tableFlipGif = "https://media.giphy.com/media/s0FsE5TsEF8g8/giphy.gif";
	}

	getCommands() {
		return this.commands;
    }
    
	handleMessage(command, parameter, msg, bot) {
		// const embed = new Discord.MessageEmbed({
		//         title: "List of TopDecked commandsYou ",
		//         thumbnail: {url: this.thumbnail},
		//         url: this.location,
		// });
		return msg.channel.send("You topdecked a plains and have been kicked!", {
			files: [this.tableFlipGif],
		});
	}
}
module.exports = Topdeck;
