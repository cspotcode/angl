// GameObject, the parent of all objects that need a sprite, events, collisions, etc.

var _ = require('lodash');
var anglGlobalsNamespace = require('./angl-globals-namespace');
var anglRuntime = require('./object-creation');
require('./angl-object');

var AnglObject = anglGlobalsNamespace.$AnglObject;


var GameObject = anglGlobalsNamespace.GameObject = function() {
    AnglObject.call(this);
};

anglRuntime.inherit(GameObject, AnglObject);

GameObject.prototype.$registerInstance = function() {
    // Grab a reference to the object/class
    var object = this.constructor;
    // Give self a unique ID, used for storage in the Set data structure
    this.$id = _.uniqueId();
    // Store a reference to self into the set of all instances for this object
    object.$instances.add(this);
};
