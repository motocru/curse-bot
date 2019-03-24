/**data model for storing server objects in mongodb */

function Server(id, userObject) {
  this._id = id;
  this.users = [userObject];
}
module.exports = Server;