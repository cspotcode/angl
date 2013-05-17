// Runtime behavior to support Angl's `with()` loops

var anglGlobalsNamespace = require('./angl-globals-namespace');
var GameObject = anglGlobalsNamespace.GameObject;

// TODO remember this with-block logic may need to be changed for performance.  This current implementation builds a
// giant array containing every single instance to be iterated over.  It would be better to use some sort of iterator
// and avoid the giant array allocation.

module.exports.resolveWithExpression = function(value) {
    var instances = [];
    
    if(_.has(value, '$instances')) { // TODO is this conditional robust enough?
        // value is a subclass of GameObject
        findInstancesOfObject(value, instances);
    } else {
        // value is an instance
        instances.push(value);
    }
    
    return instances;
    
    // TODO implement `all` and `noone`
    
    // TODO check if value is a non-GameObject and non-instance value.  If so, throw an error.
    
    // Desired Behavior Notes:
    // should accept a value that might be an instance of an AnglObject, an AnglObject, or something else
    // If something else, throw an error.  (GML throws an error when given a string, for example)
    // Return an array containing:
    //   the instance, if passed an instance
    //   an array of all instances of the AnglObject, if passed an AnglObject
}

// concat-s all instances of the given object/class, including instances of children/subclasses, onto array
var findInstancesOfObject(object, array) {
    array.concat(object.$instances.toArray());
    for(var i = 0, l = object.$childObjects.length; i < l; i++) {
        findInstancesOfObject(object.$childObjects[i], array);
    }
}

