var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var curses = require('./curses.json');
var users = require('./db/users');

/**adding the  message constants below */
const USERMILESTONES = {
  10: curses.userMessages.message2,
  50: curses.userMessages.message3,
  100: curses.userMessages.message4,
  200: curses.userMessages.message5,
  250: curses.userMessages.message6,
  350: curses.userMessages.message7,
  500: curses.userMessages.message8,
  600: curses.userMessages.message9,
  700: curses.userMessages.message10,
  800: curses.userMessages.message11,
  1000: curses.userMessages.message12
}

const SERVERMILESTONES = {
  1: curses.serverMessages.message1,
  10: curses.serverMessages.message2,
  100: curses.serverMessages.message3,
  250: curses.serverMessages.message4,
  500: curses.serverMessages.message5,
  750: curses.serverMessages.message6,
  1000: curses.serverMessages.message7,
  1250: curses.serverMessages.message8,
  1500: curses.serverMessages.message9,
  1750: curses.serverMessages.message10,
  2000: curses.serverMessages.message11,
  2250: curses.serverMessages.message12,
  2350: curses.serverMessages.message13,
  2500: curses.serverMessages.message14
}

/**sorts the entire list of curses on server startup with longest first
 * and shortest last. this stops .match function from pushing up
 * shorter versions of words first
 */
curses.curses.sort(function(a,b) {
  return b.length - a.length ||
    a.localeCompare(b);
});

//configure the logger settings below
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

//initialize the discord bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.on('ready', function(evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(`${bot.username}-(${bot.id})`);
});

bot.on('message', function(user, userID, channelID, message, evt) {
  /**the initial if statement will separate normal comments from the CLI arguments
   * based on if the first given character is the '?' character
   */
  if (message.substring(0,1) == '?') {
    botCommand(message, evt, function(response) {
      bot.sendMessage({
        to: channelID,
        message: response
      });
    });

  } else if (userID !== bot.id){
    parseMessage(userID, channelID, message, evt);
  }
});

function botCommand(message, evt, cb) {
  var args = message.substring(1).split(' ');
  var cmd = args[0].toUpperCase();

  switch(cmd) {
    case "HELP":
      cb(curses.helpMessage);
      break;
    case "TOTAL":
      if (evt.d.mentions[0] === undefined) {
        swearTotaler(null, null, function(completed) {
          cb(completed);
        });
      } else {
        for (var i in evt.d.mentions) {
          swearTotaler(evt.d.mentions[i].id, (evt.d.mentions[i].member.nick != undefined) ? evt.d.mentions[i].member.nick : evt.d.mentions[i].username, function(completed) {
            cb(completed);
          });
        }
      }
      break;
    default :
      cb("Unkown Command, try using '?help'");
      break;
  }
}

function parseMessage(userID, channelID, message, evt) {
  users.save(userID, {}, function(err, returnedUser) {
    if (err) {console.log(err)}
    var addedObject = {};
    message = message.toUpperCase();
    message = message.replace(/[.,\/#!$'"%?\^&\*;:{}=\-_`~()\[\]]/g,' ');

    words = message.match(new RegExp(`\\b(${curses.curses.join("|")})\\b`,"gi"));

    if (words !== null) {
      if (JSON.stringify(returnedUser.jarObject) === '{}') {
        bot.sendMessage({
          to: channelID,
          message: `<@!${userID}> ${curses.userMessages.message1}`
        });
      }

      for (var i in words) {
        if (returnedUser.jarObject[words[i]] && addedObject[words[i]]) {
          returnedUser.jarObject[words[i]]++;
          addedObject[words[i]]++;
        } else if (returnedUser.jarObject[words[i]]) {
          returnedUser.jarObject[words[i]]++;
          addedObject[words[i]] = 1;
        } else {
          returnedUser.jarObject[words[i]] = 1;
          addedObject[words[i]] = 1;
        }
      }

      users.addSwear(userID, returnedUser.jarObject, function(err2, updatedUser) {
        messageEvaluator(updatedUser, addedObject, channelID);
        users.totalSwears(function(err, total) {
          serverEvaluator(total, addedObject, channelID);
        });
      });
    }
  });
}

/**this function is called when the bot is given the '?total' command.
 * checks to see if a user was provided or if it is null to determine which of the
 * database functions to call on (user or whole server).
 */
function swearTotaler(user, nickname, cb) {
  var returnString = (user == null) ? `Server total swear count\n` : `${nickname} total swear count\n`;
  if (user == null) {
    users.totalSwears(function(err, swearObject) {
      stringBuilder(swearObject, returnString, function(completed) {
        cb(completed);
      })
    });
  } else {
    users.userSwears(user, function(err, curseObject) {
      if (err) {console.log(err);}
      if (curseObject == null) {
        cb(returnString.concat(`${nickname} ${curses.curseFreeMessage}`));
      } else {
        stringBuilder(curseObject, returnString, function(completed) {
          cb(completed);
        });
      }
    });
  }
}

/**builds a string to return by looping over every item in the given curseObject */
function stringBuilder(curseObject, responseString, cb) {
  for (var i in curseObject) {
    responseString = responseString.concat(`${i.toLowerCase()}: ${curseObject[i]}\n`);
  }
  cb(responseString);
}

/**loops through each of the items in the addedObject and sends them into the message
 * decider to evaluate if a message is sent out or not. message is send out via the 
 * bot.sendMessage function
 * TODO:re-work for callback functions
 */
function messageEvaluator(user, addedObject, channelID) {
  for (var i in addedObject) {
    bot.sendMessage({
      to: channelID,
      message: messageDecider(user, i, user.jarObject[i]-addedObject[i], USERMILESTONES)
    });
  }
}

/**loops through each item in the addedObject to determine if what was added is enough
 * for a milestone message. the difference for this one is that the messages here
 * are for the whole server rather than individuals
 * TODO:re-work for callback functions
 */
function serverEvaluator(total, addedObject, channelID) {
  for (var i in addedObject) {
    bot.sendMessage({
      to: channelID,
      message: messageDecider(total, i, total[i]-addedObject[i], SERVERMILESTONES)
    });
  }
}

/**this function will decide what message to send out. this chooses by seeing if the user
 * crossed a threshold with the amount of times they cursed in the last scentence compared
 * with the total number they have saved up. 
 */
function messageDecider(user, curse, difference, MILESTONES) {
  /**rework here */
  if (user._id === undefined) {
    addressorText = 'This server';
    curseNum = user[curse];
  } else {
    addressorText = `<@!${user._id}>`;
    curseNum = user.jarObject[curse]
  }

  for (const mile in MILESTONES) {
    if (difference < mile && curseNum >= mile) {
      return `${addressorText} has used ${curse.toLowerCase()} over ${mile} times, ${MILESTONES[mile]}`;
    }
  }
  return '';
}