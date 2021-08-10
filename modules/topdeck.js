/* eslint-disable complexity */
const rp = require("request-promise-native");
const _ = require("lodash");
const Discord = require("discord.js");
const utils = require("../utils");
const log = utils.getLogger("topdeck");
const Card = require("./card");
const cardFetcher = new Card();

const randomCardUrl = "https://api.scryfall.com/cards/random";

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
        const topN = Math.floor(Math.random() * 6) + 1;
        let card = ""
        // 1/6 chance of getting a land
        if (topN){ //=== 6) {
            const basics = ['plains', 'island', 'swamp', 'mountain', 'forest']
            card = basics[Math.floor(Math.random() * 5)];
            // kick user
            msg.channel.createInvite().then((invite) => {
            console.log(invite);
             msg.member.send(
                    `You topdecked a **${card}** and have been kicked! 💥 \nRejoin the server with ${invite}`
             ).then(() => {
                msg.member.kick();
             }).catch((err) => {
                log.error(err);
            });
            return msg.channel.send(
                `You topdecked a **${card}** and have been kicked! 💥`,
                {
                    files: [this.tableFlipGif],
                }
            );
            }).catch((err) => {
                log.error(err);
            });
            
          
         
        } else {
            rp(randomCardUrl).then((res) => {
                console.log(JSON.stringify(res));
            })
            .catch((err) => {
                log.error(err);
            });
              return msg.channel.send(
                `💥 You topdecked a **${card}** and have been kicked!`,
                {
                    files: [this.tableFlipGif],
                });
        }
        
		// const embed = new Discord.MessageEmbed({
		//         title: "List of TopDecked commandsYou ",
		//         thumbnail: {url: this.thumbnail},
		//         url: this.location,
		// });
		
	}
}
module.exports = Topdeck;
