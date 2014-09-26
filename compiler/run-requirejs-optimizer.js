var requirejs = require('requirejs');
var path = require('path');

/**
 * Gets the path to a module as it would be located when require()'d from another module residing in the given path.
 * @param moduleName name of module to be located
 * @param relativeToPath oath to the root directory of a module.
 * @returns {string} The root path of the module (the directory containing package.json)
 */
function getLocationOfModule(moduleName, relativeToPath) {
    // Backup module.paths and replace it with our search path
    var newModulePaths = [],
        oldModulePaths = module.paths,
        acc = path.resolve(relativeToPath),
        acc2;
    while(true) {
        // Skip "node_modules/node_modules" directories
        if(!(path.basename(acc) === 'node_modules' && path.extname(acc) === '')) {
            newModulePaths.push(path.join(acc, 'node_modules'));
        }
        // Step up one directory
        acc2 = path.resolve(acc, '..');
        // Stop looping if we've reached the filesystem root
        if(acc2 === acc) break;
        acc = acc2;
    }
    module.paths = newModulePaths;
    
    // Query Node's require for the module's location
    var ret = path.join(require.resolve(moduleName + '/package.json'), '..');
    
    // Restore the previous module.paths
    module.paths = oldModulePaths;
    
    return ret;
}

function describeCommonjsPackage(name, main, resolveFrom) {
    // Normalize arguments
    if(!resolveFrom) {
        resolveFrom = [];
    }
    if(typeof resolveFrom === 'string') {
        resolveFrom = [resolveFrom];
    }
    
    // Find the module's root
    var location = resolveFrom.reduce(function(location, moduleName) {
        return getLocationOfModule(moduleName, location);
    }, '.');
    location = getLocationOfModule(name, location);
    
    var descriptor = {
        name: name,
        location: location
    };
    if(main) {
        var main = require(path.join(location, 'package.json')).main;
        descriptor.main = main ? main.replace(/\.js$/, '') : 'index.js';
    }
    return descriptor;
}

var config = {
    baseUrl: '.',
    out: './out/demo/index.js',
    // Automatically wrap Node-style .js files in an AMD wrapping.
    cjsTranslate: true,
    // Main module: the Almond AMD loader.  This ugliness finds its exact path on the filesystem
    name: path.relative('.', require.resolve('almond')).replace(/\.js$/, ''),
    // Include and execute our RequireJS configuration and our main module
    include: ['set-require-config', 'demo/index'],
    insertRequire: ['demo/index'],
    // Describe NodeJS packages to Require
    packages: [
        describeCommonjsPackage('lodash', true),
        describeCommonjsPackage('collections'),
        describeCommonjsPackage('weak-map', true, 'collections')
    ],
    
    // ABOUT PATH MAPPING
    // 
    // We must write code that can both be loaded by Node.js's require() and be located by the RequireJS optimizer.
    // The former requires all module names to be relative paths (unless we're loading something from "node_modules")
    // 
    // Also, for some reason the RequireJS optimizer thinks that "./foo/bar", "foo/bar", and "./build/../foo/bar" are all
    // different paths.  This causes it to include and execute those modules multiple times in the bundled JS file.
    // 
    // To solve this, all our JS code uses relative paths that Node's require() can handle.  Then we use the "map"
    // configuration object below to map those relative paths onto short-and-sweet RequireJS-style paths without any
    // dots.  Finally we use the "paths" configuration object below to map those short-and-sweet RequireJS-style paths
    // onto relative filesystem paths.
    //
    // The end result of this magic dance is:
    // a) NodeJS is happy because all paths are relative
    // b) RequireJS understands that multiple relative paths to the same file really point at the same module ("map" config)
    // c) RequireJS knows where to find all modules on the filesystem ("path" config)
    
    // Map short-and-sweet module names to full paths and names
    paths: {
        // jQuery and Knockout are only used in the browser.  Therefore they don't need paths compatible with Node-require
        jquery: 'demo/vendor/jquery-1.9.1.min',
        knockout: 'demo/vendor/knockout-2.2.1.min',
        
        // Map from short-and-sweet names to the proper relative paths, so that RequireJS's optimizer can find these files
        runtime: '../runtime/src',
        'angl-parser': '../parser/out'
    },
    map: {
        '*': {
            // For when the compiler references the runtime
            '../compiler-build/lib/../../runtime/src': 'runtime',
            // For when the compiler references the parser
            '../parser/out/angl': 'angl-parser/angl',
            // For when the runtime references the buckets library
            'runtime/../../compiler/vendor/buckets': 'vendor/buckets',
            
            // For when the demo tries to load the compiler
            'lib': '../compiler-build/lib'
        }
    },
    shim: {
        // Force jQuery to load before Knockout.
        // Knockout caches a reference to jQuery when it loads, so window.jQuery must already exist.
        knockout: {
            deps: ['jquery']
        }
    },
    // Allow these modules to resolve in the browser without actually loading any code.
    // They're require()d by angl's parser but only actually used when running in NodeJS.
    rawText: {
        'fs': '',
        'path': '',
        'fileset': '',
        
        // This will be assigned a string below.
        'set-require-config': null
    },
    // Some of the collections library's source code declares and uses a function called define().
    // This prevents RequireJS's cjsTransform option from adding the proper AMD define() wrapper.
    // Therefore, we add the wrapper manually if it is not present.  Hacky, but it works.
    onBuildRead: function(moduleName, path, contents) {
        if(/^collections\//.test(moduleName) && !/^define\(function \(require, exports, module\)/.test(contents)) {
            return 'define(function (require, exports, module) {\n'+ contents + '\n});';
        }
        return contents;
    },
    // Change this to 'uglify2' to minify output.
    optimize: 'none',
    // These two options are both required for sourcemap generation.
    preserveLicenseComments: false,
    generateSourceMaps: true
};

// Our "map" config from above is also needed at runtime.
// Therefore, we generate JavaScript that will pass this configuration into Almond at runtime.
// We add this JavaScript code to the rawText section above.  It's included by the "include" configuration above.
config.rawText['set-require-config'] = 'require.config(' + JSON.stringify({map: config.map}) + ');';

// Perform the optimization.
console.log('Optimizing with RequireJS...');
requirejs.optimize(config, function(buildResponse) {
    console.log('Done!');
    console.log(buildResponse);
}, function(err) {
    console.error('Error!');
    console.error(err.message);
});
