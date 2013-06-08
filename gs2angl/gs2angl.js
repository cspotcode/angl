var xmldoc = require('xmldoc'),
    fs = require('fs');

indent = '';

// Indented console.log
function echo(msg) {
    console.log(indent + msg);
}

// Decorator to add "processing <file>.." and "-> <file> done" console messages
function logging(func) {
    return (function (i, o) {
        echo('Processing "' + i + '"...');
        indent += ' ';
        func.apply(undefined, arguments);
        indent = indent.slice(0, indent.length - 1);
        echo('-> "' + o + '" done.');
    });
}

var processConstants = logging(function (infile, outfile) {
    var xml, angl;

    xml = new xmldoc.XmlDocument(fs.readFileSync(infile));
    angl = '';

    if (xml.name !== 'constants') {
        throw new Error("Constants.xml doesn't have <constants> at top-level");
    }

    xml.children.forEach(function (child) {
        if (child.name !== 'constant') {
            throw new Error("Constants.xml has non-<constant> as child of <constants> at top-level");
        }

        angl += 'const ' + child.attr.name + ' = ' + child.attr.value + ';\n';
    });

    fs.writeFileSync(outfile, angl);
});

var processObjects = logging(function (indir, outdir) {
    var xml;

    xml = new xmldoc.XmlDocument(fs.readFileSync(indir + '/_resources.list.xml'));

    if (xml.name !== 'resources') {
        throw new Error("_resources.list.xml doesn't have <resources> at top-level");
    }

    fs.mkdirSync(outdir);

    xml.children.forEach(function (child) {
        var fn = child.attr.filename || child.attr.name;

        if (child.name !== 'resource') {
            throw new Error("_resources.list.xml has non-<resource> as child of <resources> at top-level");
        }

        if (child.attr.type === 'RESOURCE') {
            processObject(indir + '/' + fn, outdir + '/' + fn, child.attr.name);
        } else if (child.attr.type === 'GROUP') {
            processObjects(indir + '/' + fn, outdir + '/' + fn);
        } else {
            throw new Error("_resources.list.xml has non-RESOURCE/GROUP type for <resource>");
        }
    });
});

var processObject = logging(function (inpath, outpath, name) {
    var xml, angl, data, eventfiles;

    xml = new xmldoc.XmlDocument(fs.readFileSync(inpath + '.xml'));

    if (xml.name !== 'object') {
        throw new Error("Object XML doesn't have <object> at top-level");
    }

    data = {};

    xml.children.forEach(function (child) {
        if (child.name === 'solid') {
            data.solid = Boolean(child.val);
        } else if (child.name === 'visible') {
            data.visible = Boolean(child.val);
        } else if (child.name === 'depth') {
            data.depth = parseInt(child.val);
        } else if (child.name === 'persistent') {
            data.persistent = Boolean(child.val);
        } else if (child.name === 'sprite') {
            data.sprite = child.val || null;
        } else if (child.name === 'mask') {
            data.mask = child.val || null;
        } else if (child.name === 'parent') {
            data.parent = child.val || null;
        } else {
            throw new Error("Object XML has unrecognised tag contained in <object>");
        }
    });
    
    if (fs.existsSync(inpath + '.events')) {
        data.events = [];
        eventfiles = fs.readdirSync(inpath + '.events');
        eventfiles.forEach(function (fn) {
            var xml = new xmldoc.XmlDocument(fs.readFileSync(inpath + '.events/' + fn)), eventdata;

            if (xml.name !== 'event') {
                throw new Error("Event XML doesn't have <event> at top-level");
            }

            eventdata = {
                type: xml.attr.category,
                code: ''
            };

            xml.children.forEach(function (child) {
                var kind;

                if (child.name !== 'actions') {
                    throw new Error("Event XML has non-<actions> tag in <event>");
                }

                child.children.forEach(function (child) {
                    if (child.name !== 'action') {
                        throw new Error("Event XML has non-<action> tag in <actions>");
                    }
                
                    child.children.forEach(function (child) {
                        if (child.name === 'kind') {
                            kind = child.val;
                        } else if (child.name === 'arguments') {
                            if (kind !== 'CODE') {
                                echo('Skipping non-CODE action: ' + kind);
                            } else {
                                child.children.forEach(function (child) {
                                    if (child.name !== 'argument') {
                                        throw new Error("Event XML has non-<argument> tag in <arguments>");
                                    }
                                    if (child.attr.kind !== 'STRING') {
                                        echo('Skipping non-STRING argument type: ' + child.attr.kind);
                                    } else {
                                        eventdata.code += child.val + '\n';
                                    }
                                });
                            }
                        }
                    });
                });
            });

            data.events.push(eventdata);
        });
    }

    angl = 'object ' + name + ' parent ' + (data.parent || 'GameObject') + ' {\n';
    angl += '    solid = ' + (data.solid ? 'true' : 'false') + ';\n';
    angl += '    visible = ' + (data.visible ? 'true' : 'false') + ';\n';
    angl += '    depth = ' + data.depth + ';\n';
    angl += '    persistent = ' + (data.persistent ? 'true' : 'false') + ';\n';
    if (data.sprite) {
        angl += '    sprite_index = ' + data.sprite + ';\n';
    }
    if (data.mask) {
        angl += '    mask_index = ' + data.mask + ';\n';
    }

    if (data.events) {
        angl += '    create(x, y) {\n';
        data.events.forEach(function (eventdata) {
            angl += '        bind_event(' + eventdata.type + ', script () {\n';
            angl += '            ' + eventdata.code.split('\n').join('\n            ') + '\n';
            angl += '        });\n';
        });
        angl += '    }\n';
    }

    angl += '}';

    fs.writeFileSync(outpath + '.angl', angl);
});

// Main
if (process.argv.length === 4 && process.argv[2] !== '--help') {
    var indir = process.argv[2],
        outdir = process.argv[3];

    if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
        echo('Creating output directory "' + outdir + '"');
    } else {
        throw new Error('Output directory already exists');
    }

    logging(function (indir, outdir) {
        processConstants(indir + '/Constants.xml', outdir + '/Constants.angl');
        processObjects(indir + '/Objects', outdir + '/Objects');
    })(indir, outdir);
} else {
    echo('Usage:');
    echo('   node gs2angl.js <input directory> <output directory>');
    echo('(output directory will be created)');
}
