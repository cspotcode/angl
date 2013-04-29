import scope = module('./angl-scope');
import scopeVariable = module('./scope-variable');

export function createGlobalScope():scope.AnglScope {
    var globalScope = new scope.AnglScope();

    // TODO what values should I be adding?  Gotta invent an object/type/schema for values.
    globalScope.addVariable(new scopeVariable.Variable('global'));

    return globalScope;
};

