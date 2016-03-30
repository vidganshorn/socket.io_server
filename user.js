function User(id, deviceID) {
  this.id = id;
  this.deviceID = deviceID;
    
  this.status = "available";
};

/*
User.prototype.getPerson = function(personID) {
  var person = null;
  for(var i = 0; i < this.people.length; i++) {
    if(this.people[i].id == personID) {
      person = this.people[i];
      break;
    }
  }
  return person;
};
 */

User.prototype.isAvailable = function() {
  return this.available === "available";
};


module.exports = User;
