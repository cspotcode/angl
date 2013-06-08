var fs = require('fs'),
    nomnom = require('nomnom'),
    parser = require('./parser/out/angl'),
    compiler = require('./compiler/lib/compiler');

module.exports = {
    parser: parser,
    compiler: compiler
};

var cliParser = nomnom();
cliParser.script('angl');

cliParser.command('parse')
    .help('Parse an Angl file into an AST.')
    .callback(function(opts) {
        parser.printAST(fs.readFileSync(opts._[1]).toString());
    });

cliParser.command('compile')
    .help('Compile Angl into JavaScript.')
    .options({
        'directory': {
            position: 1,
            help: 'Directory containing Angl source files to compile.',
            required: true,
            meta: 'DIRECTORY',
            type: 'string'
        }
    })
    .callback(function(opts) {
        var directoryPath = opts.directory;
        compiler.compileDirectory(directoryPath, function(err) {
            if(err) {
                console.error('Compilation error:');
                console.error(err.message);
                process.exit(1);
            }
            console.log('Done!');
        });
    });

cliParser.parse();

// command line
if (require.main === module) {
    if (process.argv.hasOwnProperty('2') && process.argv[2] !== '--help') {
    } else {
        console.log('Usage:');
        console.log('   node angl.js FILENAME');
    }
}
