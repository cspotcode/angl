var _ = require('lodash');

require('./angl-object');
require('./angl-game-object');

// Some modules export properties onto the runtime object
var subModules = [
    require('./object-creation'),
    require('./with-blocks'),
    require('./arrow-operator'),
    require('./math'),
    require('./global-other')
];

var exports = module.exports = {};

// Merge all submodules onto the runtime object
_(exports).extend.apply(subModules);
