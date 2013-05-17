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
        createObject(objectName, parentObjectName, creationCallback);
    }
};

// call the construction callbacks for all objects that inherit from the given parent object
var createSubclassesOf = function(parentObjectName) {
    pendingObjects.get(parentObjectName).forEach(function(v) {
        createObject(v.childObjectName, parentObjectName, v.creationCallback);
    });
};

var createObject = function(objectName, parentObjectName, creationCallback) {
    // Execute callback, which will create the object/class
    creationCallback();
    
    createdObjectNames.add(objectName);
    var object = anglGlobalsNamespace[objectName];
    var parentObject = anglGlobalsNamespace[parentObjectName];
    
    // Create an array of each subclass that directly inherits from this object/class
    object.$childObjects = [];
    
    // Add ourselves to the list of subclasses for our parent
    parentObject.$childObjects.push(object);
    
    // If this object inherits from GameObject, initialize it as a GameObject type in the runtime
    if(object.prototype instanceof anglGlobalsNamespace.GameObject) {
        registerGameObject(objectName, object);
    }
    
    // Create any subclasses that were waiting
    createSubclassesOf(objectName);
}

var registerGameObject = function(objectName, object) {
    object.$name = objectName;
    object.$instances = new buckets.Set(function(instance) { return instance.$id; });
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
