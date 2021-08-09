const rp = require("request-promise-native");
const _ = require("lodash");
const Discord = require("discord.js");
const utils = require("../utils");
const log = utils.getLogger('card');
const cheerio = require("cheerio");

class MtgCardLoader {
    constructor() {
        this.commands = {
            card: {
                aliases: [],
                inline: true,
                description: "Search for an English Magic card by (partial) name, supports full TopDecked syntax",
                help: '',
                examples: ["!card iona", "!card t:creature o:flying", "!card goyf e:fut"]
            },
            price: {
                aliases: ["prices"],
                inline: true,
                description: "Show the price in USD, EUR and TIX for a card",
                help: '',
                examples: ["!price tarmogoyf"]
            },
            ruling: {
                aliases: ["rulings"],
                inline: true,
                description: "Show the Gatherer rulings for a card",
                help: '',
                examples: ["!ruling sylvan library"]
            },
            legal: {
                aliases: ["legality"],
                inline: true,
                description: "Show the format legality for a card",
                help: '',
                examples: ["!legal divining top"]
            },
            art: {
                aliases: [],
                inline: true,
                description: "Show just the art for a card",
                help: '',
                examples: ["!art lovisa coldeyes"]
            }
        };
        this.cardApi = "https://api.scryfall.com/cards/search?q=";
        this.cardApiFuzzy = "https://api.scryfall.com/cards/named?fuzzy=";
        // https://github.com/scryfall/thopter/tree/master/manamoji
        this.mana_symbols = {
					0: "<:0_:872667411025903647>",
					1: "<:1_:872667410816180256>",
					2: "<:2_:872667411093024798>",
					3: "<:3_:872667447499563008>",
					4: "<:4_:872667447570857994>",
					5: "<:5_:872667447537328138>",
					6: "<:6_:872667447570882580>",
					7: "<:7_:872667447600238592>",
					8: "<:8_:872667447604424754>",
					9: "<:9_:872667447575076864>",
					10: "<:10:872667447575085106>",
					11: "<:11:872667447562485810>",
					12: "<:12:872667447235313745>",
					13: "<:13:872679674088661013>",
					14: "<:14:872667447793176576>",
					15: "<:15:872667447616995368>",
					16: "<:16:872667447768014848>",
					17: "<:17:872667447621197874>",
					18: "<:18:872667447608610827>",
					19: "<:19:872667447642193971>",
					20: "<:20:872679774043111504>",
					x: "<:x_:872679893777936384>",
					y: "<:y_:872679893765337118>",
					z: "<:z_:872679893899550760>",
					t: "<:t_:872679914254524457>",
					q: "<:q_:872679934508826664>",
					w: "<:w_:793662300564881438>",
					u: "<:u_:793662251315626025>",
					b: "<:b_:793662284713951233>",
					r: "<:r_:793662237466034189>",
					g: "<:g_:793662266716585994>",
					c: "<:c_:793662330557693963>",
					p: "<:p_:793662449105764364>",
					s: "<:s_:793662411894554624>",
					// TODO: get emoji id for each of these
					br: "br:872669140358410270",
					bg: "bg:872669283539370045",
					gu: "gu:793677318790053909",
					rg: "rg:872669130833150043",
					ur: "ur:872669189112987688",
					gw: "gw:872669161883570176",
					rw: "rw:872669200655745084",
					wu: "wu:608749299135807512",
					wb: "wb:872669233895575643",
					ub: "ub:872669660028493824",
					bp: "bp:872681620006662174",
					rp: "rp:872681594161336321",
					gp: "gp:872681646145552454",
					up: "up:872681604085071942",
					wp: "wp:872681633906561065",
					chaos: "chaos:872682127865557043",
					e: "e_:872682113286172703",
					half: "half:872682147054493717",
					hr: "hr:872682069610877000",
					hw: "hw:872682085796708392",
					"2b": "2b:872681366918144092",
					"2g": "2g:872681381422063686",
					"2r": "2r:872681375319347230",
					"2u": "2u:872681387893882940",
					"2w": "2w:872681405522518067",
					infinity: "infinity:872668964826800138",
				};
        // embed border colors depending on card color(s)
        this.colors = {
            "W": 0xF8F6D8,
            "U": 0xC1D7E9,
            "B": 0x0D0F0F,
            "R": 0xE49977,
            "G": 0xA3C095,
            "GOLD": 0xE0C96C,
            "ARTIFACT": 0x90ADBB,
            "LAND": 0xAA8F84,
            "NONE": 0xDAD9DE
        };
        // cache for Discord permission lookup
        this.permissionCache = {};
    }

    getCommands() {
        return this.commands;
    }

    // replace mana and other symbols with actual emojis
    renderEmojis(text) {
        return text.replace(/{[^}]+?}/gi, (match) => {
					const code = match.replace(/[^a-z0-9]/gi, "").toLowerCase();
					return this.mana_symbols[code] ? this.mana_symbols[code] : "";
				});
    }

    // determine embed border color
    getBorderColor(card) {
        let color;
        if (!card.colors || card.colors.length === 0) {
            color = this.colors.NONE;
            if (card.type_line && card.type_line.match(/artifact/i)) color = this.colors.ARTIFACT;
            if (card.type_line && card.type_line.match(/land/i)) color = this.colors.LAND;
        } else if (card.colors.length > 1) {
            color = this.colors.GOLD;
        } else {
            color = this.colors[card.colors[0]];
        }
        return color;
    }

    // parse Gatherer rulings
    parseGathererRulings(gatherer) {
        const $ = cheerio.load(gatherer);
        const rulings = [];
        $('.rulingsTable tr').each((index,elem) => {
            rulings.push('**'+$(elem).find('td:nth-child(1)').text()+':** '+$(elem).find('td:nth-child(2)').text());
            if (rulings.join('\n').length > 2040) {
                rulings[rulings.length - 1] = '...';
                return false;
            }
        });
        return rulings.join('\n');
    }

    // generate description text from a card object
    generateDescriptionText(card) {
        const ptToString = (card) =>
            '**'+card.power.replace(/\*/g, '\\*') + "/" + card.toughness.replace(/\*/g, '\\*')+'**';

        const description = [];
        if (card.type_line) { // bold type line
            let type = `**${card.printed_type_line || card.type_line}** `;
            type += `(${card.set.toUpperCase()} ${_.capitalize(card.rarity)}`;
            type += `${card.lang && card.lang !== 'en' ? ' :flag_' + card.lang + ':':''})`;
            description.push(type);
        }
        if (card.oracle_text) { // reminder text in italics
            const text = card.printed_text || card.oracle_text;
            description.push(text.replace(/[()]/g, m => m === '(' ? '*(':')*'));
        }
        if (card.flavor_text) { // flavor text in italics
            description.push('*' + card.flavor_text+'*');
        }
        if (card.loyalty) { // bold loyalty
            description.push('**Loyalty: ' + card.loyalty+'**');
        }
        if (card.power) { // bold P/T
            description.push(ptToString(card));
        }
        if (card.card_faces) {
            // split cards are special
            card.card_faces.forEach(face => {
                description.push('**'+face.type_line+'**');
                if (face.oracle_text) {
                    description.push(face.oracle_text.replace(/[()]/g, m => m === '(' ? '*(':')*'));
                }
                if (face.power) {
                    description.push(ptToString(face));
                }
                description.push('');
            });
        }
        return description.join('\n');
    }

    // generate the embed card
    generateEmbed(cards, command, hasEmojiPermission) {
        return new Promise(resolve => {
            const card = cards[0];

            // generate embed title and description text
            // use printed name (=translated) over English name, if available
            let title = card.printed_name || card.name;

            if (card.mana_cost) {
                title += ' ' + card.mana_cost;
            }

            // DFC use card_faces array for each face
            if (card.card_faces && (card.layout === 'transform' || card.layout === 'modal_dfc')) {
                if (card.card_faces[0].mana_cost) {
                    title += ' ' + card.card_faces[0].mana_cost;
                }
                // Modal DFCs might have spells on both sides at some point so putting this here just in case
                if (card.layout === 'modal_dfc' && card.card_faces[1].mana_cost) {
                    title += ' // ' + card.card_faces[1].mana_cost;
                }
                card.image_uris = card.card_faces[0].image_uris;
            }

            let description = this.generateDescriptionText(card);

            // are we allowed to use custom emojis? cool, then do so, but make sure the title still fits
            if (hasEmojiPermission) {
                title = this.renderEmojis(title)
                title = _.truncate(title, {
									length: 256,
									separator: "<",
								});
                description = this.renderEmojis(description);
            }

            // footer
            let footer = "Use !help to get a list of available commands.";
            if(cards.length > 1) {
                footer = (cards.length - 1) + ' other hits:\n';
                footer += cards.slice(1,6).map(cardObj => (cardObj.printed_name || cardObj.name)).join('; ');
                if (cards.length > 6) footer += '; ...';
            }

            // instantiate embed object
            const embed = new Discord.MessageEmbed({
							title,
							description,
							footer: { text: footer },
							url: utils.getTopDeckedCardUrl(card.scryfall_uri), //,
							color: this.getBorderColor(
								card.layout === "transform" || card.layout === "modal_dfc"
									? card.card_faces[0]
									: card
							),
							thumbnail: card.image_uris
								? { url: card.image_uris.small }
								: null,
							image:
								card.zoom && card.image_uris
									? { url: card.image_uris.normal }
									: null,
						});

            // show crop art only
            if (command.match(/^art/) && card.image_uris) {
                embed.setImage(card.image_uris.art_crop);
                embed.setDescription('🖌️ ' + card.artist);
                embed.setThumbnail(null);
            }

            // add pricing, if requested
            if (command.match(/^price/) && card.prices) {
                let prices = [];
                if(card.prices.usd) prices.push('$' + card.prices.usd);
                if(card.prices.usd_foil) prices.push('**Foil** $' + card.prices.usd_foil);
                if(card.prices.eur) prices.push(card.prices.eur + '€');
                if(card.prices.tix) prices.push(card.prices.tix + ' Tix');
                embed.addField('Prices', prices.join(' / ') || 'No prices found');
            }

            // add legalities, if requested
            if (command.match(/^legal/)) {
                const legalities = (_.invertBy(card.legalities).legal || []).map(_.capitalize).join(', ');
                embed.addField('Legal in', legalities || 'Nowhere');
            }

            // add rulings loaded from Gatherer, if needed
            if(command.match(/^ruling/) && card.related_uris.gatherer) {
                rp(card.related_uris.gatherer).then(gatherer => {
                    embed.setAuthor('Gatherer rulings for');
                    embed.setDescription(this.parseGathererRulings(gatherer));
                    resolve(embed);
                });
            } else {
                resolve(embed);
            }
        });
    }

    /**
     * Fetch the cards from Scryfall
     * @param cardName
     * @returns {Promise<Object>}
     */
    getCards(cardName) {
        let requestPromise;
        requestPromise = new Promise((resolve, reject) => {
            rp({url: this.cardApi + encodeURIComponent(cardName + ' include:extras'), json: true}).then(body => {
                if(body.data && body.data.length) {
                    // sort the cards to better match the search query (issue #87)
                    body.data.sort((a, b) => this.scoreHit(b, cardName) - this.scoreHit(a, cardName));
                }
                resolve(body);
            }, () => {
                log.info('Falling back to fuzzy search for '+cardName);
                rp({url: this.cardApiFuzzy + encodeURIComponent(cardName), json: true})
                    .then(response => resolve({data: [response]}), reject);
            });
        });
        return requestPromise;
    }

    /**
     * Calculate the hit score for a card and a search query
     * @param card
     * @param query
     */
    scoreHit(card, query) {
        const name = (card.printed_name || card.name).toLowerCase().replace(/[^a-z0-9]/g, '');
        const nameQuery = query.split(" ").filter(q => !q.match(/[=:()><]/)).join(" ").toLowerCase().replace(/[^a-z0-9]/g, '');
        let score = 0;
        if (name === nameQuery) {
            // exact match - to the top!
            score = 10000;
        } else if(name.match(new RegExp('^'+nameQuery))) {
            // match starts at the beginning of the name
            score = 1000 * nameQuery.length / name.length;
        } else {
            // match anywhere but the beginning
            score = 100 * nameQuery.length / name.length;
        }
        return score;
    }

    /**
     * Handle an incoming message
     * @param command
     * @param parameter
     * @param msg
     * @returns {Promise}
     */
    handleMessage(command, parameter, msg) {
        const cardName = parameter.toLowerCase();
        // no card name, no lookup
        if (!cardName) return;
        const permission = true; // assume we have custom emoji permission for now
        // fetch data from API
        this.getCards(cardName).then(body => {
            // check if there are results
            if (body.data && body.data.length) {
                // generate embed
                this.generateEmbed(body.data, command, permission).then(embed => {
                    return msg.channel.send('', {embed});
                }, err => log.error(err)).then(async sentMessage => {
                    // add reactions for zoom and paging
                    if (!command.match(/^art/)){
                      await sentMessage.react('🔍');
                    }
                    if (body.data.length > 1) {
                      await sentMessage.react('⬅');
                      await sentMessage.react('➡');
                    }

                    const handleReaction = reaction => {
                        if (reaction.emoji.toString() === '⬅') {
                            body.data.unshift(body.data.pop());
                        } else if (reaction.emoji.toString() === '➡') {
                            body.data.push(body.data.shift());
                        } else {
                            // toggle zoom
                            body.data[0].zoom = !body.data[0].zoom;
                        }
                        // edit the message to update the current card
                        this.generateEmbed(body.data, command, permission).then(embed => {
                            sentMessage.edit('', {embed});
                        }).catch(() => {});
                    }

                    sentMessage.createReactionCollector(
                        ({emoji} , user) => ['⬅','➡','🔍'].indexOf(emoji.toString()) > -1 && user.id === msg.author.id,
                        {time: 60000, max: 20}
                    ).on('collect', handleReaction).on('remove', handleReaction);
                }, err => log.error(err)).catch(() => {});
            }
        }).catch(err => {
            let description = 'No cards matched `'+cardName+'`.';
            if (err.statusCode === 503) {
                description = 'TopDecked is currently offline, please try again later.'
            }
            return msg.channel.send('', {embed: new Discord.MessageEmbed({
                title: 'Error',
                description,
                color: 0xff0000
            })});
        });
    }
}

module.exports = MtgCardLoader;
