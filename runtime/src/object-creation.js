var buckets = require('buckets');

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
        creationCallback();
        createdObjectNames.add(objectName);
        createSubclassesOf(objectName);
    }
};

// call the construction callbacks for all objects that inherit from the given parent object
var createSubclassesOf = function(parentObjectName) {
    pendingObjects.get(parentObjectName).forEach(function(v) {
        v.creationCallback();
        createdObjectNames.add(v.childObjectName);
        createSubclassesOf(v.childObjectName);
    });
};
