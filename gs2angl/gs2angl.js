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

var processScripts = logging(function (indir, outdir) {
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
            processScript(indir + '/' + fn + '.gml', outdir + '/' + fn + '.angl', child.attr.name);
        } else if (child.attr.type === 'GROUP') {
            processScripts(indir + '/' + fn, outdir + '/' + fn);
        } else {
            throw new Error("_resources.list.xml has non-RESOURCE/GROUP type for <resource>");
        }
    });
});


var processScript = logging(function (inpath, outpath, name) {
    var gml, angl;

    gml = fs.readFileSync(inpath).toString();
    angl = 'script ' + name + '() {\n';
    angl += '    ' + gml.split('\n').join('\n    ') + '\n';
    angl += '}';

    fs.writeFileSync(outpath, angl);
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

    data = {
        create: null,
        destroy: null
    };

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

    data.events = [];
    if (fs.existsSync(inpath + '.events')) {
        eventfiles = fs.readdirSync(inpath + '.events');
        eventfiles.forEach(function (fn) {
            var xml = new xmldoc.XmlDocument(fs.readFileSync(inpath + '.events/' + fn)),
                eventdata, constants, constantName, i;

            if (xml.name !== 'event') {
                throw new Error("Event XML doesn't have <event> at top-level");
            }

            eventdata = {
                type: 'ev_' + xml.attr.category.toLowerCase(),
                numb: (xml.attr.category === 'COLLISION' ? xml.attr.with : parseInt(xml.attr.id)),
                code: ''
            };

            // For ev_mouse, ev_other and ev_step, find event number constant
            if (eventdata.type === 'ev_mouse'
                || eventdata.type === 'ev_step'
                || eventdata.type === 'ev_other') {
                constants = require({
                    'ev_mouse': '../runtime/src/event-mouse-constants',
                    'ev_step': '../runtime/src/event-step-constants',
                    'ev_other': '../runtime/src/event-other-constants',
                }[eventdata.type]);

                for (constantName in constants) {
                    if (constants.hasOwnProperty(constantName)) {
                        if (constants[constantName] === eventdata.numb) {
                            eventdata.numb = constantName;
                            break;
                        }
                    }
                }
            }

            if (eventdata.type === 'ev_collision') {
                eventdata.funcName = 'onCollisionWith' + eventdata.numb;
            } else if (eventdata.type === 'ev_step') {
                eventdata.funcName = 'on' + {
                    'ev_step_normal': 'Step',
                    'ev_step_begin': 'BeginStep',
                    'ev_step_end': 'EndStep'
                }[eventdata.numb];
            } else if (eventdata.type === 'ev_alarm') {
                eventdata.funcName = 'onAlarm' + eventdata.numb;
            } else if (eventdata.type === 'ev_keyboard') {
                eventdata.funcName = 'onKeyboard' + eventdata.numb;
            } else if (eventdata.type === 'ev_keypress') {
                eventdata.funcName = 'onKeyPress' + eventdata.numb;
            } else if (eventdata.type === 'ev_keyrelease') {
                eventdata.funcName = 'onKeyRelease' + eventdata.numb;
            } else if (eventdata.type === 'ev_mouse' || eventdata.type === 'ev_other') {
                if (typeof eventdata.numb === 'number') {
                    eventdata.funcName = 'on' + {
                        ev_mouse: 'Mouse',
                        ev_other: 'Other'
                    }[eventdata.type] + eventdata.numb;
                } else {
                    eventdata.funcName = 'on' + eventdata.numb.slice(2).replace(/_[a-z]/g, function (text) {
                        return text.charAt(1).toUpperCase();
                    });
                }
            } else if (eventdata.type === 'ev_draw') {
                eventdata.funcName = 'onDraw';
            } else {
                eventdata.funcName = eventdata.type + (eventdata.type === 'ev_collision' ? '_with_' : '_') + eventdata.numb;
            }

            xml.children.forEach(function (child) {
                if (child.name !== 'actions') {
                    throw new Error("Event XML has non-<actions> tag in <event>");
                }

                child.children.forEach(function (child) {
                    var actiondata = {
                        arguments: []
                    };

                    if (child.name !== 'action') {
                        throw new Error("Event XML has non-<action> tag in <actions>");
                    }
                
                    child.children.forEach(function (child) {
                        if (child.name === 'kind') {
                            actiondata.kind = child.val;
                        } else if (child.name === 'actionType') {
                            actiondata.actionType = child.val;
                        } else if (child.name === 'functionName') {
                            actiondata.functionName = child.val;
                        } else if (child.name === 'arguments') {
                            if (actiondata.kind === 'CODE') {
                                child.children.forEach(function (child) {
                                    if (child.name !== 'argument') {
                                        throw new Error("Event XML has non-<argument> tag in <arguments>");
                                    }
                                    if (child.attr.kind !== 'STRING') {
                                        echo('Skipping non-STRING argument type: ' + child.attr.kind);
                                    } else {
                                        actiondata.arguments.push(child.val);
                                    }
                                });
                            }
                        }
                    });

                    if (actiondata.kind === 'CODE') {
                        eventdata.code += actiondata.arguments.join('\n') + '\n';
                    } else if (actiondata.kind === 'NORMAL'
                        && actiondata.actionType === 'FUNCTION'
                        && actiondata.functionName === 'action_inherited') {
                        if (eventdata.type === 'ev_create') {
                            eventdata.code += 'super(x, y);\n';
                        } else {
                            eventdata.code += 'super();\n';
                        }
                    } else {
                        echo('Skipping non-CODE action: ' + actiondata.kind);
                    }
                });
            });

            if (eventdata.type === 'ev_create') {
                data.create = eventdata;
            } else if (eventdata.type === 'ev_destroy') {
                data.destroy = eventdata;
            } else {
                data.events.push(eventdata);
            }
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

    if (data.create) {
        angl += '    create(x, y) {\n';
        angl += '       ' + data.create.code.split('\n').join('\n        ') + '\n\n';
        angl += '    }\n\n';
    }

    if (data.destroy) {
        angl += '    destroy {\n';
        angl += '       ' + data.destroy.code.split('\n').join('\n        ') + '\n\n';
        angl += '    }\n\n';
    }

    data.events.forEach(function (eventdata) {
        angl += '    script ' + eventdata.funcName + '() {\n';
        angl += '       ' + eventdata.code.split('\n').join('\n        ') + '\n';
        angl += '    }\n\n';
    });

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
        processScripts(indir + '/Scripts', outdir + '/Scripts');
    })(indir, outdir);
} else {
    echo('Usage:');
    echo('   node gs2angl.js <input directory> <output directory>');
    echo('(output directory will be created)');
}
