module.exports.config = {
	name: "help",
	version: "1.0.3",
	hasPermssion: 0,
	credits: "",
	description: "Beginner's Guide",
	commandCategory: "system",
	usages: "[Command Name]",
	cooldowns: 1,
	envConfig: {
		autoUnsend: true,
		delayUnsend: 300
	}
};

module.exports.languages = {
	"en": {
		"moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Waiting time: %5 seconds(s)\n❯ Permission: %6\n\n» Module code by %7 «",
		"helpList": '[ There are %1 commands on this bot, Use: "%2help nameCommand" to know how to use! ]',
		"user": "User",
        "adminGroup": "Admin group",
        "adminBot": "Admin bot"
	}
};

module.exports.handleEvent = function ({ api, event, getText }) {
	const { commands } = global.client;
	const { threadID, messageID, body } = event;

	if (!body || typeof body === "undefined" || body.indexOf("help") !== 0) return;
	const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
	if (splitBody.length === 1 || !commands.has(splitBody[1].toLowerCase())) return;

	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const command = commands.get(splitBody[1].toLowerCase());
	const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;

	return api.sendMessage(getText(
		"moduleInfo",
		command.config.name,
		command.config.description,
		`${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
		command.config.commandCategory,
		command.config.cooldowns,
		command.config.hasPermssion === 0 ? getText("user") : (command.config.hasPermssion === 1 ? getText("adminGroup") : getText("adminBot")),
		command.config.credits
	), threadID, messageID);
};

module.exports.run = function ({ api, event, args, getText }) {
	const { commands } = global.client;
	const { threadID, messageID } = event;
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
	const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;
	const command = commands.get((args[0] || "").toLowerCase());

	if (!command) {
		const arrayInfo = [];
		const page = parseInt(args[0]) || 1;
		const numberOfOnePage = 10;
		let i = 0;
		let msg = "";

		for (const [name, value] of commands) {
			arrayInfo.push(name);
		}

		arrayInfo.sort((a, b) => a.data - b.data);
		const startSlice = numberOfOnePage * page - numberOfOnePage;
		i = startSlice;
		const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

		for (const item of returnArray) {
			msg += `「 ${++i} 」${prefix}${item}\n`;
		}

		const header = `Command list 📄\nMade by Mohammed Abir 🥀\nFor More Information type /help (command name) ✨\n󰂆 󰟯 󰟰 󰟷 󰟺 󰟵 󰟫`;
		const footer = `\nPage (${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)})`;

		return api.sendMessage(header + "\n\n" + msg + footer, threadID, async (error, info) => {
			if (autoUnsend) {
				await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
				return api.unsendMessage(info.messageID);
			} else return;
		}, event.messageID);
	}

	return api.sendMessage(getText(
		"moduleInfo",
		command.config.name,
		command.config.description,
		`${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
		command.config.commandCategory,
		command.config.cooldowns,
		command.config.hasPermssion === 0 ? getText("user") : (command.config.hasPermssion === 1 ? getText("adminGroup") : getText("adminBot")),
		command.config.credits
	), threadID, messageID);
};
