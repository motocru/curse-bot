import * as dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Message, Events, Interaction, TextChannel } from "discord.js";
import { installCommands } from './commands/install-commands';
import { SlashCommand } from "./types";
import { helpCommand } from './commands/help';
import { totalCommand } from './commands/total';
import { addCommand } from './commands/add';
import { removeCommand } from './commands/remove';
import { countCommand } from './commands/count';
import { firstCommand } from './commands/first';
import { rankCommand } from './commands/rank';
import { addServerMilestoneCommand } from './commands/add-server-milestone';
import { addUserMilestoneCommand } from './commands/add-user-milestone';
import { getServerCustomSwearList, getServerSwearTotal, setServerSealBreaker, getServerMilestones, getUserMilestones } from './db/servers';
import { getUserSwearRecord, addUserSwear } from './db/users';
import * as Curses from '../curses.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent]
});

let serverRecords: Record<string, Record<string, boolean>> = {};
let baseCurseRecord: Record<string, boolean> = {};

client.once(Events.ClientReady, handleReady);
client.on(Events.MessageCreate, handleMessage);
client.on(Events.InteractionCreate, handleInteraction);

// A collection or map to store your commands
const commands = new Map<string, SlashCommand>();
commands.set(helpCommand.data.name, helpCommand);
commands.set(totalCommand.data.name, totalCommand);
commands.set(addCommand.data.name, addCommand);
commands.set(removeCommand.data.name, removeCommand);
commands.set(countCommand.data.name, countCommand);
commands.set(firstCommand.data.name, firstCommand);
commands.set(rankCommand.data.name, rankCommand);
commands.set(addServerMilestoneCommand.data.name, addServerMilestoneCommand);
commands.set(addUserMilestoneCommand.data.name, addUserMilestoneCommand);

// Login to Discord with your client's token
client.login(process.env.TOKEN);

async function handleReady(client: Client<true>) {
    console.log(`curse bot ${client.user?.username} online`);

    //loading up our base curse records
    for (const curse of Curses.curses) {
        baseCurseRecord[curse] = true;
    }
    var guilds = await client.guilds.fetch();
    guilds.forEach(async guild => {
        //collect each custom swear list for the server and build the overall records
        let serverSwears = await getServerCustomSwearList(guild.id);
        let serverRecord: Record<string, boolean> = {};
        serverSwears.forEach(swear => {
            serverRecord[swear] = true;
        });
        serverRecords[guild.id] = serverRecord;
    });

    //load our slash commands for each guild for instant updates
    guilds.forEach(guild => {
        installCommands(client.application!.id, guild.id);
    });
}

async function handleMessage(msg: Message) {
    if (msg.author.id === client.user?.id) {
        return;
    }

    //everything in here will be checked for containing curse words and messages to the bot
    if (msg.mentions.has(client.user!.id)) handleBotPing(msg);
    await parseMessage(msg);
}

async function handleInteraction(interaction: Interaction) {
    if (!(interaction.channel instanceof TextChannel)) {
        return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

function handleBotPing(msg: Message) {
    msg.channel.send(Curses.botResponses[Math.floor(Math.random() * Math.floor(Curses.botResponses.length))]);
}

async function parseMessage(msg: Message) {
    let message = msg.content.toLocaleUpperCase();
    let parsedCurses: string[] = [];
    message = message.replace(/[.,\/#!$'"%?\^&\*;:{}=\-_`~()\[\]]/g, ' ');
    message = message.replace(/<@[0-9]+>/gi, '');
    const baseWords = message.match(new RegExp(`\\b(${Curses.curses.join("|")})\\b`, "gi"));
    const serverCurseList = await getServerCustomSwearList(msg.guildId!);
    const serverWords = message.match(new RegExp(`\\b(${serverCurseList.join("|")})\\b`, "gi"));
    //TODO: is there a better way to combine these so we don't create empty strings in this list?
    if (baseWords !== null) {
        parsedCurses = [...parsedCurses, ...baseWords];
    }
    if (serverWords !== null) {
        parsedCurses = [...parsedCurses, ...serverWords];
    }
    parsedCurses = parsedCurses.filter(x => x !== '');
    if (parsedCurses.length > 0) await incrementSwearsAndSendMessage(parsedCurses, msg);
}

async function incrementSwearsAndSendMessage(curses: string[], msg: Message) {
    const priorUserSwearRecord = await getUserSwearRecord(msg.guildId!, msg.author.id);
    const priorServerSwearRecord = await getServerSwearTotal(msg.guildId!);
    if (Object.keys(priorServerSwearRecord).length === 0) {
        //save the user as the first person to swear on the server
        await setServerSealBreaker(msg.guildId!, msg.author.id);
    }
    if (Object.keys(priorUserSwearRecord).length === 0) {
        //send a message for a user cursing for the first time
        msg.channel.send(`<@${msg.author.id}> ${Curses.userFirstSwearMessage}`);
    }
    const newUserSwearRecord = await addUserSwear(msg.guildId!, msg.author.id, curses);
    const newServerSwearRecord = await getServerSwearTotal(msg.guildId!);
    curses = curses.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
    });
    const userMilestones = await getUserMilestones(msg.guildId!);
    const serverMilestones = await getServerMilestones(msg.guildId!);

    const userMessage = userMessageEvaluator(curses, msg.author.id, priorUserSwearRecord, newUserSwearRecord, userMilestones);
    const serverMessage = serverMessageEvaluator(curses, msg.guild?.name!, priorServerSwearRecord, newServerSwearRecord, serverMilestones);
    if ((userMessage + serverMessage).length > 0) {
        msg.channel.send(userMessage + serverMessage);
    }
}

/**
 * Evaluates the user's curses count to see if they've reached any milestones
 * @param curses The list of curses used in the message
 * @param userId The user's ID
 * @param priorRecord The prior user's curse record
 * @param currentRecord The current user's curse record
 * @returns 
 */
function userMessageEvaluator(curses: string[], userId: string, priorRecord: Record<string, number>, currentRecord: Record<string, number>, milestones: Record<number, string>) {
    let responseString = ``;
    const addresserText = `<@${userId}>`;
    for (let i = 0; i < curses.length; i++) {
        const priorCount = priorRecord[curses[i]] ?? 0;
        const currentCount = currentRecord[curses[i]];
        for (const k in milestones) {
            const mile = +k;
            if (priorCount < mile && currentCount >= mile) {
                responseString += `${addresserText} has used ${curses[i].toLowerCase()} over ${mile} times, ${milestones[k]}\n`;
            }
        }
    }
    return responseString;
}

/**
 * Evaluates the server's curses count to see if they've reached any milestones
 * @param curses The list of curses used in the message
 * @param serverName The name of the server
 * @param priorRecord The prior server's curse record
 * @param currentRecord The current server's curse record
 * @returns 
 */
function serverMessageEvaluator(curses: string[], serverName: string, priorRecord: Record<string, number>, currentRecord: Record<string, number>, milestones: Record<number, string>) {
    let responseString = ``;
    const addresserText = `${serverName}`;
    for (let i = 0; i < curses.length; i++) {
        const priorCount = priorRecord[curses[i]] ?? 0;
        const currentCount = currentRecord[curses[i]];
        for (const k in milestones) {
            const mile = +k;
            if (priorCount < mile && currentCount >= mile) {
                if (mile === 1) {
                    responseString += `${addresserText} has used ${curses[i].toLowerCase()} for the first time, ${milestones[k]}\n`;
                } else {
                    responseString += `${addresserText} has used ${curses[i].toLowerCase()} over ${mile} times, ${milestones[k]}\n`;
                }

            }
        }
    }
    return responseString;
}