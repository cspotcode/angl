var fs = require('fs'),
    parser = require('./parser/out/angl'),
    compiler = require('./compiler/lib/compiler');

module.exports = {
    parser: parser,
    compiler: compiler
};

// command line
if (require.main === module) {
    if (process.argv.hasOwnProperty('2') && process.argv[2] !== '--help') {
        parser.printAST(fs.readFileSync(process.argv[2]).toString());
    } else {
        console.log('Usage:');
        console.log('   node angl.js FILENAME');
    }
}
