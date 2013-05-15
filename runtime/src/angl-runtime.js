var _ = require('lodash');

var subModules = [
    require('./object-creation'),
    require('./with-blocks')
];

var exports = module.exports = {};

// Merge all submodules onto the runtime object
_(exports).extend.apply(subModules);
