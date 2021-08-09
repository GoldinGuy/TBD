class JAR {
    constructor() {
        this.Location = "https://blogs.magicjudges.org/rules/jar/";
        this.commands = {
            jar: {
                aliases: [],
                inline: false,
                description: "Get a link to the \"Judging at Regular\" document",
                help: 'Returns the link to the JAR document.',
                examples: ["!jar"]
            }
        };
    }

    getCommands() {
        return this.commands;
    }

    handleMessage(command, parameter, msg) {
        return msg.channel.send('**Judging at Regular Events**: <' + this.Location + '>');
    }
}
module.exports = JAR;
