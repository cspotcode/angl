// $AnglObject, the parent of all Angl objects

var anglGlobalNamespace = require('./angl-globals-namespace');

var AnglObject = anglGlobalNamespace.$AnglObject = function() {
    
    // Set the `id` value as a reference to self
    this.id = this;
    
    // Initialize all object properties
    this.$initProperties(this);
    
    // Execute any instance registration logic.  Intended for GameObjects, but could be implemented by other classes
    this.$registerInstance();
    
    // Call the create event
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    this.$create.apply(this, args);
};

// No-op implementations of methods
AnglObject.prototype.$initProperties = function() {};
AnglObject.prototype.$registerInstance = function() {};
