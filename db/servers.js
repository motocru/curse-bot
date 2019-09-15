var db = require('./db');
var users = require('./users');
var User = require('./userModel');
var Server = require('./serverModel');

/**checks if a server already exists and then adds it if it doesn't exist
 * and returns the newly created server. Or returns the existing server
 * if one already exists
 */
function saveServer(guild, id, swear, cb) {
  db.collection('servers').findOne({'_id': guild}, function(err, existingServer) {
    if (err) {console.log(err);}
    if (existingServer === null) {
      db.collection('servers').insertOne(new Server(guild, new User(id, swear, true)), function(err2, newServer) {
        if (err2) {console.log(err2);}
        cb(err2, newServer.ops[0].users[0]);
      });
    } else {
      users.findUserById(guild, id, function(err3, foundUser) {
        if (err3) {console.log(err3);}
        if (foundUser === undefined) {
          existingServer.users.push(new User(id, swear, false));
          updateUserListAndReturnUser(guild, id, existingServer.users, cb);
        } else {
          cb(err3, foundUser);
        }
      });
    }
  });
}
module.exports.saveServer = saveServer;

function updateUserSwears(guild, id, swearObject, cb) {
  db.collection('servers').findOne({'_id': guild}, function(err, server) {
    if (err) {console.log(err);} 
    for (var i in server.users) {
      if (server.users[i].id === id) {
        server.users[i].jarObject = swearObject; 
        break;
      }
    }
    updateUserListAndReturnUser(guild, id, server.users, cb);
  });
}
module.exports.updateUserSwears = updateUserSwears;

/**returns the list of total curse words from the given server id */
function totalServerSwears(guild, cb) {
  db.collection('servers').findOne({'_id': guild}, function(err, server) {
    if (err) {console.log(err);}
    if (server === null) cb(err, null);
    else {
      var totalServerCurses = {};
      for (var i in server.users) {
        for (var j in server.users[i].jarObject) {
          totalServerCurses[j] = (totalServerCurses[j]) ? totalServerCurses[j] += server.users[i].jarObject[j] : server.users[i].jarObject[j];
        }
      }
      cb(err, totalServerCurses);
    }
  });
}
module.exports.totalServerSwears = totalServerSwears;

/**returns the server if found by Id, else it returns null if not found */
function findById(guild, cb) {
  db.collection('servers').findOne({'_id': guild}, function(err, foundServer) {
    if (err) {console.log(err);}
    cb(err, foundServer);
  });
}
module.exports.findById = findById;

/**retuns the array of users from the found serverId */
function findUsersByServerId(guild, cb) {
  db.collection('servers').findOne({'_id': guild}, function(err, foundServer) {
    if (err) {console.log(err);}
    cb(err, foundServer.users);
  });
}
module.exports.findUsersByServerId = findUsersByServerId;

function serverSwearCount(guild, cb) {
  findById(guild, function(err, server) {
    if (err) {console.log(err);}
    if (server === null) {cb(err, 0);}
    else {
      var swearCount = 0;
      for (var i in server.users) {
        for (var j in server.users[i].jarObject) {
          swearCount += server.users[i].jarObject[j];
        }
      }
      cb(err, swearCount);
    }
  });
}
module.exports.serverSwearCount = serverSwearCount;

/**Returns the first person to swear on a server */
function returnSealBreaker(guild, cb) {
  findById(guild, function(err, server) {
    if (err) {console.log(err);}
    if (server === null) {cb(err, null);}
    else {
      var user = server.users.filter(user => user.cherry === true);
      cb(err, user[0]);
    }
  });
}
module.exports.returnSealBreaker = returnSealBreaker;

/**loops through the list of swears to search for and then returrns the server based
 * total for the swears in the provided list
 */
function specificSwearCountList(guild, list, cb) {
  findById(guild, function(err, server) {
    if (err) {console.log(err);}
    if (server === null) (cb(err, null));
    else {
      var curses = {};
      for (var i in server.users) {
        for (var j in server.users[i].jarObject) {
          if (list.indexOf(j) > -1) {curses[j] = (curses[j]) ? curses[j] += server.users[i].jarObject[j] : server.users[i].jarObject[j];}
        }
      }
      cb(err, curses);
    }
  });
}
module.exports.specificSwearCountList = specificSwearCountList;

/**NON-EXPORTED FUNCTIONS */
function updateUserListAndReturnUser(guild, id, userList, cb) {
  var newUserArray = {$set: {'users': userList}};
  db.collection('servers').updateOne({'_id': guild}, newUserArray, function(err, updatedStatus) {
    if (err) {console.log(err);}
    users.findUserById(guild, id, function(err2, returnedUser) {
      if (err2) {console.log(err2);}
      cb(err2, returnedUser);
    });
  });
}