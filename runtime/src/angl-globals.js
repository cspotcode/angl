var _ = require('lodash');
var anglGlobalsNamespace = require('./angl-globals-namespace');

// This file is responsible for populating the global namespace with all built-in global values
// true, false, all, noone, instance_create, etc.

// A few modules independently add items to the global namespace
// TODO rewrite these modules; this loading behavior is too messy
require('./angl-game-object');
require('./angl-object');

// load all submodules
var subModules = [
    require('./special-constants'),
    require('./console')
];

// Copy all own enumerable properties from all submodules into the global namespace
_(subModules).each(function(subModule) {
    _.extend(anglGlobalsNamespace, subModule);
});

