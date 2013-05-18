var withBlocks = require('./with-blocks');

// Used to implement `A->b = 2;`
// Generated as, for example, `$ART.arrowSet(A, 'b', 2);`
module.exports.arrowAssign = function(objectOrInstance, fieldName, value) {
    var instances = withBlocks.resolveWithExpression(objectOrInstance);
    for(var i = 0, l = instances.length; i < l; i++) {
        instances[i][fieldName] = value;
    }
};

module.exports.arrowResolve = function(objectOrInstance) {
    // performance? Bah!
    // TODO fix this later
    var instances = withBlocks.resolveWithExpression(objectOrInstance);
    return instances[0] || null;
}
