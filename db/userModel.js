/**Data model for the user object that gets stored inside of the
 * server objects 'users' array
 */

function User(id, jarObject, cherry) {
  this.id = id;
  this.jarObject = jarObject;
  this.cherry = cherry;
}

module.exports = User;