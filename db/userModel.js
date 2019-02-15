/**Data model for the user object stored in mongoDB */

function User(id, jarObject) {
  this._id = id;
  this.jarObject = jarObject;
}

module.exports = User;