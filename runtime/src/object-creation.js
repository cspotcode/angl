var buckets = require('buckets');
var anglGlobalsNamespace = require('./angl-globals-namespace');

// Set of all objects that have already been created
var createdObjectNames = new buckets.Set();

// Multi-map of all objects that are waiting for their parent to be created
var pendingObjects = new buckets.MultiDictionary();


module.exports.createAnglObject = function(objectName, parentObjectName, creationCallback) {
    if(parentObjectName && !createdObjectNames.contains(parentObjectName)) {
        // we must wait for the parent to be constructed
        pendingObjects.set(parentObjectName, {
            childObjectName: objectName,
            creationCallback: creationCallback
        });
    } else {
        // Call the creation callback to immediately create the object
        createObject(objectName, creationCallback);
    }
};

// call the construction callbacks for all objects that inherit from the given parent object
var createSubclassesOf = function(parentObjectName) {
    pendingObjects.get(parentObjectName).forEach(function(v) {
        createObject(v.childObjectName, v.creationCallback);
    });
};

var createObject = function(objectName, creationCallback) {
    creationCallback();
    createdObjectNames.add(objectName);
    createSubclassesOf(objectName);
}

// Sets up inheritance from parentObject to object
// Creates and assigns a prototype, and copies all fields from parentObject onto object
module.exports.inherit = function(object, parentObject) {
    object.prototype = Object.create(parentObject.prototype, {
        constructor: {
            value: object,
            writable: false
        }
    });
    // Copy own enumerable properties from parent
    _.extend(object, parentObject);
};
