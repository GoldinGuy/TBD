const log4js = require("log4js");
const request = require("request");
const chalk = require("chalk");

const planes = [
	"Dominaria",
	"Ravnica",
	"Ixalan",
	"Kaladesh",
	"Zendikar",
	"Amonkhet",
	"Alara",
	"Mirrodin",
	"New Phyrexia",
	"Vryn",
	"Eldraine",
	"Regatha",
	"Ikoria",
	"Innistrad",
	"Zendikar",
	"Tarkir",
	"Lorwyn",
	"Shadowmoor",
	"Kaldheim",
	"Theros",
	"Kamigawa",
	"Strixhaven",
	"Shandalar",
	"Fiora",
	"Rath",
	"Kylem",
	"Rabiah",
	"TopDeckia",
	"TopDeckistrad",
	"TopDeckadesh",
	"TopDeckistrad",
	"TopDeckica"
];

// setup logger
const getLogger = (name) => {
    let logPattern = '%[[%p]%] '+chalk.red('[%c]') +' - %m';
    if (!process.env.PAPERTRAIL_API_TOKEN) {
        logPattern = '[%d{yy/MM/dd hh:mm:ss}] ' + logPattern;
    }
    // configure pattern
    log4js.configure({
        appenders: {out: {type: 'stdout', layout: {type: 'pattern', pattern: logPattern}}},
        categories: { default: { appenders: ['out'], level: process.env.LOG_LEVEL || "info" } }
    });
    return log4js.getLogger(name + '-' + process.pid);
}

// create a pretty log message for a user / guild
const prettyLog = ({guild, channel = {}, author = {}}, action, log = '') => {
    const logMessage = [
        chalk.blue('[' + (guild ? guild.name : 'direct message') + '#' + (channel.name || '') +']'),
        chalk.yellow('[' + (author.username ? author.username + '#' + author.discriminator : 'server') + ']'),
        chalk.magenta('[' + action + ']'),
        log
    ];
    return logMessage.join(' ');
}

const getTopDeckedCardUrl = (currentUrl) => {
return `https://www.topdecked.com/cards(detail:cards/details/${currentUrl.substring(
	currentUrl.indexOf("/card/") + 6,
	currentUrl.indexOf("?") || currentUrl.length - 1
)})`;
}

// send updated stats to bots.discord.com
const updatePresence = (bot) => {
    if(bot.user)
        bot.user.setPresence({
                activity: {
                    name: "MTG on " + planes[Math.floor(Math.random() * planes.length)], //TopDecked Simulator
                    type: "PLAYING",
                    url: "https://www.topdecked.com/"
                }
            });

    // const options = {
    //     url: 'https://bots.discord.pw/api/bots/240537940378386442/stats',
    //     method: 'POST',
    //     headers: {'Authorization': process.env.BOT_TOKEN},
    //     body: {"server_count": bot.guilds.size || 0},
    //     json: true
    // };

    // // post stats to bots.discord.pw
    // if (process.env.BOT_TOKEN) {
    //     request(options);
    // }

    // // post stats to discordbots.org
    // if (process.env.BOT_TOKEN2) {
    //     options.url = 'https://discordbots.org/api/bots/240537940378386442/stats';
    //     options.headers['Authorization'] = process.env.BOT_TOKEN2;
    //     request(options);
    // }
};

module.exports = {
	getLogger,
	prettyLog,
	updatePresence,
	getTopDeckedCardUrl,
};


//    this.mana_symbols = {
// 			bp: "bp:872681620006662174",
// 			rp: "rp:872681594161336321",
// 			gp: "gp:872681646145552454",
// 			up: "up:872681604085071942",
// 			wp: "wp:872681633906561065",
// 			chaos: "chaos:872682127865557043",
// 			e: "e_:872682113286172703",
// 			half: "half:872682147054493717",
// 			hr: "hr:872682069610877000",
// 			hw: "hw:872682085796708392",
// 			0: "0_:872668491004657715",
// 			1: "1_:872668622110195734",
// 			2: "2_:872668633388707920",
// 			3: "3_:872668643366961152",
// 			4: "4_:872668651793289216",
// 			5: "5_:872668659892510810",
// 			6: "6_:872668856286576690",
// 			7: "7_:872680615219175454",
// 			8: "8_:872680625818189834",
// 			9: "9_:872668900570050560",
// 			10: "10:872680715618254901",
// 			11: "11:872680723260268634",
// 			12: "12:872680729962762331",
// 			13: "13:872680737869021254",
// 			14: "14:872680747281047632",
// 			15: "15:872680753706713178",
// 			16: "16:872680846065295380",
// 			17: "17:872680761206132746",
// 			18: "18:872680767363371058",
// 			19: "19:872680773302485052",
// 			20: "20:872680779447156856",
// 			x: "x_:872680454451519508",
// 			y: "y_:872680475506905099",
// 			z: "z_:872680499045335082",
// 			t: "t_:872681168582115358",
// 			q: "q_:872681184096817213",
// 			"2b": "2b:872681366918144092",
// 			"2g": "2g:872681381422063686",
// 			"2r": "2r:872681375319347230",
// 			"2u": "2u:872681387893882940",
// 			"2w": "2w:872681405522518067",
// 			w: "w_:793662300564881438",
// 			u: "u_:793662251315626025",
// 			b: "b_:793662284713951233",
// 			r: "r_:793662237466034189",
// 			g: "g_:793662266716585994",
// 			c: "c_:793662330557693963",
// 			br: "br:872669140358410270",
// 			bg: "bg:872669283539370045",
// 			gu: "gu:793677318790053909",
// 			rg: "rg:872669130833150043",
// 			ur: "ur:872669189112987688",
// 			gw: "gw:872669161883570176",
// 			rw: "rw:872669200655745084",
// 			wu: "wu:608749299135807512",
// 			wb: "wb:872669233895575643",
// 			ub: "ub:872669660028493824",
// 			p: "p_:872669807764443167",
// 			s: "s_:872669059068600330",
// 			infinity: "infinity:872668964826800138",
// 		};