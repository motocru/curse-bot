var db = require('./db');
//var User = require('./userModel');
var servers = require('./servers');
//var mongo = require('mongodb');

/**Returns the specific user object searched for */
function findUserById(guild, id, cb) {
  db.collection('servers').findOne({'_id': guild}, function(err, foundServer) {
    if (err) {console.log(err);}
    if (foundServer === null) {cb(err, null)}
    else {
      var result = foundServer.users.filter(user => user.id === id);
      cb(err, result[0]);
    }
  });
}
module.exports.findUserById = findUserById;

function getUserServerSwearList(guild, id, cb) {
  findUserById(guild, id, function(err, foundUser) {
    if (err) {console.log(err);}
    if (foundUser === null || foundUser === undefined) {
      cb(err, null);
    } else {
      cb(err, foundUser.jarObject);
    }
  });
}
module.exports.getUserServerSwearList = getUserServerSwearList;

//TODO: function not completed
function getUserTotalSwearList(id, cb) {
  var totalSwearList = {};
  db.collection('servers').find({}).toArray(function(err, docs) {
    if (err) {console.log(err);}
    console.log(docs);
    cb(err, docs);
  });
}
module.exports.getUserTotalSwearList = getUserTotalSwearList;

function swearCountByServer(guild, id, cb) {
  servers.findById(guild, function(err, server) {
    if (err) {console.log(err);}
    var swearTotal = 0;
    if (server === null) cb(err, 0);
    else {
      var user = server.users.filter(user => user.id === id);
      if (user[0] === undefined) cb(err, 0);
      else {
        for (var i in user[0].jarObject) {
          swearTotal += user[0].jarObject[i];
        }
        cb(err, swearTotal);
      }
    }
  });
}
module.exports.swearCountByServer = swearCountByServer;

function specificSwearCountList(guild, id, list, cb) {
  findUserById(guild, id, function(err, user) {
    if (err) {console.log(err);}
    if (user === null || user === undefined) {cb(err, null);}
    else {
      var curses = {};
      for (var i in user.jarObject) {
        if (list.indexOf(i) > -1) {curses[i] = (curses[i]) ? curses[i] += user.jarObject[i] : user.jarObject[i];}
      }
      cb(err, curses);
    }
  });
}
module.exports.specificSwearCountList = specificSwearCountList;