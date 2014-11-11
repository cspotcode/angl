/// <reference path="../../typings/all.d.ts"/>
"use strict";

// AST transformation phase one

import _ = require('lodash');
import FastSet = require('collections/fast-set');

import treeWalker = require('./tree-walker');
import scope = require('./angl-scope');
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import scopeVariable = require('./scope-variable');
import variableTypes = require('./variable-types');
import strings = require('./strings');
import ModuleExportsType = require('./module-exports-type');
import options = require('./options');
import operators = require('./operator-precedence-and-associativity');
import identifierManipulations = require('./identifier-manipulations');
var Ident = identifierManipulations.Identifier;
var walk = treeWalker.walk;

// Create scopes for all nodes

export var transform = (ast:astTypes.AstNode, options: options.Options) => {
    var fileNode: astTypes.FileNode;
    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent):any => {

        var replacement: Array<astTypes.AstNode>;

        // TODO convert all scriptdefs into consts
        // Will be a good test of replacing nodes

        // Cache the file node that we currently reside in.
        if(node.type === 'file') {
            fileNode = <astTypes.FileNode>node;
        }
        
        // Script definitions, constants, and object definitions might be exported.
        // If they're exported, they register an identifier into the global scope.
        // If they're not exported, they register an identifier into the parent scope. 
        if(node.type === 'scriptdef' || node.type === 'const' || node.type === 'object') {
            var exportableNode = <astTypes.AbstractExportableNode>node;
            if(exportableNode.parentNode.type !== 'file' && (exportableNode.parentNode.type !== 'object' || exportableNode.type !== 'scriptdef')) {
                throw new Error(exportableNode.type + ' must be at the root level of a file.');
            }
            var jsIdentifier: string;
            if(options.renameUnderscoreToCamelCaseForGlobals) {
                jsIdentifier = identifierManipulations.autoConvertUnderscoreToCamel(exportableNode.name);
            }
            
            // Create type information to attach to the variable.
            var variableType: variableTypes.AbstractVariableType;
            if(exportableNode.type === 'object') variableType = new variableTypes.ClassType();
            // TODO set types for scriptdef or const nodes?
            
            var variable: scopeVariable.Variable;
            if(exportableNode.exported) {
                // This variable is destined for the global scope.
                // We must make a local version of the variable to be used in local file scope.
                // This version is attached to the exports object.
                // Additionally, we must make a global version of the variable to be used by other files.
                // This second version is set as "provided" by this file, such that other files using
                // the variable will require() this module/file.
                if(options.generateTypeScript) {
                    variable = new scopeVariable.Variable(exportableNode.name, scopeVariable.AllocationType.NONE, scopeVariable.AccessType.BARE);
                } else {
                    variable = new scopeVariable.Variable(exportableNode.name, scopeVariable.AllocationType.PROP_ASSIGNMENT, scopeVariable.AccessType.PROP_ACCESS);
                    variable.setContainingObjectIdentifier('exports');
                }
                if(jsIdentifier) {
                    variable.setJsIdentifier(null);
                    variable.setDesiredJsIdentifier(jsIdentifier);
                }
                var globalVariable = new scopeVariable.GlobalVersionOfExportedVariable(variable, exportableNode.name, scopeVariable.AllocationType.PROP_ASSIGNMENT, scopeVariable.AccessType.PROP_ACCESS);
                if(jsIdentifier) {
                    globalVariable.setJsIdentifier(null);
                    globalVariable.setDesiredJsIdentifier(jsIdentifier);
                }
                globalVariable.setProvidedByModule(fileNode.moduleDescriptor);
                astUtils.getGlobalAnglScope(exportableNode).addVariable(globalVariable);
            } else {
                // This variable is in local scope
                if(options.generateTypeScript) {
                    // No need for a "var" declaration in TypeScript; we use a declarative syntax that automatically
                    // creates the local variable.
                    variable = new scopeVariable.Variable(exportableNode.name, scopeVariable.AllocationType.NONE, scopeVariable.AccessType.BARE);
                } else {
                    variable = new scopeVariable.Variable(exportableNode.name, scopeVariable.AllocationType.LOCAL, scopeVariable.AccessType.BARE);
                }
                variable.setJsIdentifier(null);
                variable.setDesiredJsIdentifier(jsIdentifier || exportableNode.name);
            }
            variable.setDataType(variableType);
            exportableNode.variable = variable;
            astUtils.getAnglScope(exportableNode).addVariable(variable);
            
            if(exportableNode.exported) {
                if(fileNode.moduleDescriptor.exportsType === ModuleExportsType.UNKNOWN)
                    fileNode.moduleDescriptor.exportsType = ModuleExportsType.MULTI;
                if(fileNode.moduleDescriptor.exportsType !== ModuleExportsType.MULTI)
                    throw new Error('Module cannot have both "export =" and "export object|const|script" statements.');
                fileNode.moduleDescriptor.exports.push(exportableNode.variable);
            }
        }
        
        // Notice if this file exports a single export
        if(node.type === 'export') {
            var exportDeclarationNode = <astTypes.ExportDeclarationNode>node;
            if(fileNode.moduleDescriptor.exportsType === ModuleExportsType.SINGLE)
                throw new Error('Module cannot have multiple "export = " statements.');
            if(fileNode.moduleDescriptor.exportsType === ModuleExportsType.UNKNOWN)
                fileNode.moduleDescriptor.exportsType = ModuleExportsType.SINGLE;
            if(fileNode.moduleDescriptor.exportsType !== ModuleExportsType.SINGLE)
                throw new Error('Module cannot have both "export =" and "export object|const|script" statements.');
            var localVariable = fileNode.moduleDescriptor.singleExport = <scopeVariable.Variable>astUtils.getAnglScope(exportDeclarationNode).getVariableByIdentifier(exportDeclarationNode.name);
            if(!fileNode.moduleDescriptor.singleExport)
                throw new Error('Cannot export "' + exportDeclarationNode.name + '": no such variable.');
            fileNode.moduleDescriptor.preferredIdentifier = exportDeclarationNode.name;
            // Since this is an export, add a variable to global scope.
            var globalVar = new scopeVariable.GlobalVersionOfExportedVariable(localVariable, exportDeclarationNode.name, scopeVariable.AllocationType.NONE, scopeVariable.AccessType.BARE);
            globalVar.setProvidedByModule(fileNode.moduleDescriptor);
            astUtils.getGlobalAnglScope(fileNode).addVariable(globalVar);
            return null;
        }

        // Scripts create a new scope
        if(node.type === 'script' || node.type === 'scriptdef') {
            var scriptNode = <astTypes.ScriptNode>node;
            var newScope = new scope.AnglScope();
            newScope.setParentScope(astUtils.getAnglScope(scriptNode));
            scriptNode.anglScope = newScope;
            // Register script arguments into the local scope
            // TODO how to handle self and other?
            var thisVar = new scopeVariable.Variable('self', scopeVariable.AllocationType.ARGUMENT);
            thisVar.setJsIdentifier('this');
            newScope.addVariable(thisVar);
            _.each(scriptNode.args, (argName) => {
                var argumentVar = new scopeVariable.Variable(argName, scopeVariable.AllocationType.ARGUMENT);
                newScope.addVariable(argumentVar);
            });
        }

        // Var declarations register local variables into their scope
        if(node.type === 'var') {
            var varNode = <astTypes.VarDeclarationNode>node;
            replacement = [];
            _.each(varNode.list, (var_item) => {
                if(astUtils.getAnglScope(varNode).hasIdentifier(var_item.name)) {
                    throw new Error('Attempt to declare local variable with the name ' + JSON.stringify(var_item.name) + ' more than once.');
                }
                var localVar = new scopeVariable.Variable(var_item.name);
                localVar.setJsIdentifier(null);
                localVar.setDesiredJsIdentifier(
                    options.renameUnderscoreToCamelCase
                    ? identifierManipulations.autoConvertUnderscoreToCamel(var_item.name, true)
                    : var_item.name
                );
                astUtils.getAnglScope(varNode).addVariable(localVar);
                if(var_item.expr) {
                    replacement.push({
                        type: 'assign',
                        lval: {
                            type: 'identifier',
                            variable: localVar
                        },
                        rval: var_item.expr
                    });
                }
            });
            replacement.length || replacement.push({type: 'nop'});
            return replacement;
        }
        
        // globalVar declarations register variables into the global scope
        if(node.type === 'globalvar') {
            var globalVarNode = <astTypes.GlobalVarDeclarationNode>node;
            // Add all variables into global scope
            _.each(globalVarNode.list, (var_item) => {
                if(astUtils.getGlobalAnglScope(globalVarNode).hasIdentifier(var_item.name)) {
                    throw new Error('Attempt to declare global variable with the name ' + JSON.stringify(var_item.name) + ' more than once.');
                }
                var globalVar = new scopeVariable.Variable(var_item.name, scopeVariable.AllocationType.PROP_ASSIGNMENT, scopeVariable.AccessType.PROP_ACCESS);
                globalVar.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
                astUtils.getGlobalAnglScope(globalVarNode).addVariable(globalVar);
            });
            // Remove globalvar declaration from the code
            return null;
        }

        // repeat loops are replaced by a for loop
        if(node.type === 'repeat') {
            var repeatNode = <astTypes.RepeatNode>node;
            // construct a new AstNode to replace it.
            // allocate a temporary Javascript counter variable
            var counterVariable = new scopeVariable.Variable();
            counterVariable.setDesiredJsIdentifier('i');
            astUtils.getAnglScope(repeatNode).addVariable(counterVariable);
            var timesVariable = new scopeVariable.Variable();
            timesVariable.setDesiredJsIdentifier('l');
            astUtils.getAnglScope(repeatNode).addVariable(timesVariable);
            replacement = [
                {
                    type: 'assign',
                    lval: {
                        type: 'identifier',
                        variable: timesVariable
                    },
                    rval: astUtils.cleanNode(repeatNode.expr)
                },
                {
                    type: 'for',
                    initstmt: {
                        type: 'assign',
                        lval: {
                            type: 'identifier',
                            variable: counterVariable
                        },
                        rval: {
                            type: 'number',
                            val: 0
                        }
                    },
                    contexpr: {
                        type: 'binop',
                        op: '<',
                        expr1: {
                            type: 'identifier',
                            variable: counterVariable
                        },
                        expr2: {
                            type: 'identifier',
                            variable: timesVariable
                        }
                    },
                    stepstmt: {
                        type: 'cmpassign',
                        op: '+',
                        lval: {
                            type: 'identifier',
                            variable: counterVariable
                        },
                        rval: {
                            type: 'number',
                            val: 1
                        }
                    },
                    stmt: astUtils.cleanNode(repeatNode.stmt)
                }
            ];
            return replacement;

        }

        // with loops are replaced by:
        // Converting the argument into an array of objects at runtime
        // for-loop over each object
        // within the loop, `other` maps to the outer `self`
        // and `self` maps to each object from the array, one after the other
        if(node.type === 'with' && !(<astTypes.WithNode>node).alreadyVisited) {
            var withNode = <astTypes.WithNode>node;

            // Grab a reference to the outer scope
            var outerScope = astUtils.getAnglScope(withNode);

            // Create an inner scope for the with loop
            var innerScope = new scope.WithScope();
            innerScope.setParentScope(outerScope);
            withNode.anglScope = innerScope;

            // Create variable to hold the full list of matched objects to be iterated over
            var allObjectsVariable = new scopeVariable.Variable();
            allObjectsVariable.setDesiredJsIdentifier('wObjects');
            outerScope.addVariable(allObjectsVariable);

            // Create variable to hold the current subject of iteration, the current `self` value
            var selfVariable = new scopeVariable.Variable();
            selfVariable.setIdentifier('self');
            selfVariable.setDesiredJsIdentifier('wSelf');
            innerScope.addVariable(selfVariable);
            
            // Create variable to hold the inner `other` value
            var innerOtherIsThis = outerScope.getVariableByIdentifier('self').getJsIdentifier() === 'this';
            var innerOtherVariable = new scopeVariable.Variable(null, innerOtherIsThis ? scopeVariable.AllocationType.NONE : scopeVariable.AllocationType.LOCAL);
            innerOtherVariable.setIdentifier('other');
            if(innerOtherIsThis) {
                innerOtherVariable.setJsIdentifier('this');
            } else {
                innerOtherVariable.setDesiredJsIdentifier('wOther');
            }
            innerScope.addVariable(innerOtherVariable);

            // Create variable to cache the outer `other` value.  This will be used to restore the value of `other`
            // after `with` has finished looping.
            var outerOtherVariable = new scopeVariable.Variable();
            outerOtherVariable.setDesiredJsIdentifier('wPrevOther');
            outerScope.addVariable(outerOtherVariable);

            // Store variables onto the with node, for using during code generation
            withNode.allObjectsVariable = allObjectsVariable;
            withNode.outerOtherVariable = outerOtherVariable;
            withNode.innerOtherVariable = innerOtherVariable;

            // Prepend with() AST node with an assignment statement that creates the array of matched objects.
            // By doing this, we ensure that the with() expression is evaluated in the outer scope.
            var assignmentNode = {
                type: 'assign',
                lval: {
                    type: 'identifier',
                    variable: allObjectsVariable
                },
                rval: {
                    type: 'jsfunccall',
                    expr: strings.ANGL_RUNTIME_IDENTIFIER + '.resolveWithExpression',
                    args: [ astUtils.cleanNode(withNode.expr) ],
                    op: operators.JavascriptOperatorsEnum.MEMBER_ACCESS
                }
            };
            
            // Ensure that future transformations don't transform the with node's expr twice.
            // The expression has already been moved into an assignment node, so remove it from the with() node
            withNode.expr = null;

            // After replacement, this node will be visited again.  Mark it with a flag so that we can skip processing
            // next time.
            withNode.alreadyVisited = true;

            var withReplacement:astTypes.AstNode[] = [assignmentNode, withNode];
            return withReplacement;
        }

        if(node.type === 'object') {
            var objectNode = <astTypes.ObjectNode>node;
            // If no parent is specified, use the default
            if (!objectNode.parent) objectNode.parent = strings.SUPER_OBJECT_NAME;
            // Create parentIdentifier node
            objectNode.parentIdentifier = {
                type: 'identifier',
                name: objectNode.parent
            };

            // Initialize some basic containers for storing methods, create, destroy, and property assignments
            var objectPropertyNames = new FastSet();
            objectNode.properties = [];
            var objectMethodNames = new FastSet();
            objectNode.methods = [];
            // TODO can't have properties with the same names as methods

            // process all contained statements, storing them onto the object node
            _.each(objectNode.stmts, (stmt) => {
                switch (stmt.type) {
                    case 'scriptdef':
                        var scriptDefStmt = <astTypes.ScriptDefNode>stmt;
                        if (objectMethodNames.contains(scriptDefStmt.name)) {
                            throw new Error('Method ' + JSON.stringify(scriptDefStmt.name) + ' defined more than once for object ' + JSON.stringify(objectNode.name));
                        }
                        objectMethodNames.add(scriptDefStmt.name);
                        astUtils.cleanNode(scriptDefStmt);
                        var newMethod: astTypes.MethodNode = {
                            type: 'script',
                            args: scriptDefStmt.args,
                            stmts: scriptDefStmt.stmts,
                            methodname: scriptDefStmt.name
                        };
                        astUtils.migrateComments(newMethod, scriptDefStmt);
                        objectNode.methods.push(newMethod);
                        break;

                    case 'createdef':
                        var createDefStmt = <astTypes.CreateDefNode>stmt;
                        if (objectNode.createscript) {
                            throw new Error('Multiple create scripts defined for object ' + JSON.stringify(objectNode.name));
                        }
                        objectNode.createscript = {
                            type: 'script',
                            args: createDefStmt.args,
                            stmts: createDefStmt.stmts,
                            methodname: '$create'
                        };
                        astUtils.migrateComments(objectNode.createscript, createDefStmt);
                        break;

                    case 'destroydef':
                        var destroyDefStmt = <astTypes.DestroyDefNode>stmt;
                        if (objectNode.destroyscript) {
                            throw new Error('Multiple destroy scripts defined for object ' + JSON.stringify(objectNode.name));
                        }
                        objectNode.destroyscript = {
                            type: 'script',
                            args: [],
                            stmts: destroyDefStmt.stmts,
                            methodname: '$destroy'
                        };
                        astUtils.migrateComments(objectNode.destroyscript, destroyDefStmt);
                        break;

                    case 'property':
                        var propertyStmt = <astTypes.PropertyNode>stmt;
                        
                        if (objectPropertyNames.contains(propertyStmt.name)) {
                            throw new Error('Cannot initialize object property ' + JSON.stringify(propertyStmt.name) + ' more than once for object ' + JSON.stringify(objectNode.name));
                        }
                        objectPropertyNames.add(propertyStmt.name);
                        var propertyNode: astTypes.AssignNode = {
                            type: 'assign',
                            lval: {
                                type: 'binop',
                                op: '.',
                                expr1: {
                                    type: 'identifier',
                                    name: 'self'
                                },
                                expr2: {
                                    type: 'identifier',
                                    name: propertyStmt.name
                                }
                            },
                            rval: astUtils.cleanNode(propertyStmt.expr)
                        };
                        astUtils.migrateComments(propertyNode, propertyStmt);
                        objectNode.properties.push(propertyNode);
                        break;

                    default:
                        throw new Error('Unexpected child node of "object": ' + JSON.stringify(propertyStmt.type));
                }
            });

            // Create the script that will initialize all properties
            objectNode.propertyinitscript = {
                type: 'script',
                args: [],
                methodname: strings.OBJECT_INITPROPERTIES_METHOD_NAME,
                stmts: {
                    type: 'statements',
                    list: <Array<astTypes.StatementNode>>_.flatten([
                        [
                            {
                                type: 'super',
                                //expr: 'this.' + strings.OBJECT_INITPROPERTIES_METHOD_NAME,
                                args: []
                            }
                        ],
                        objectNode.properties], true)
                }
            };

            // We've placed all statements into their respective containers, so now we empty the stmts array so that the
            // walker doesn't traverse it.
            // The walker will still traverse all methods, properties, create, and destroy via their new locations
            // on the object node.
            objectNode.stmts = [];
        }

        if(node.type === 'super') {
            var superNode = <astTypes.SuperNode>node;
            
            // Find the containing object (which will tell us the super-class) and the containing method's name

            var methodNode = <astTypes.MethodNode>astUtils.findParent(superNode, (parentNode) => parentNode.type === 'script' && null != (<astTypes.MethodNode>parentNode).methodname);
            if (!methodNode) {
                throw new Error('"super" calls only allowed within object methods.');
            }
            var containingObjectNode = <astTypes.ObjectNode>astUtils.findParent(methodNode, (parentNode) => parentNode.type === 'object');
            var methodName = methodNode.methodname;
            var parentName = containingObjectNode.parent;
            var parentIdentifier = containingObjectNode.parentIdentifier;

            // Special case for destroy() scripts: Since an object's destroy script can't have arguments, the super()
            // call can't have arguments either.
            if(methodName === '$destroy' && superNode.args.length) {
                throw new Error('Can\'t pass arguments to "super" call within a "destroy" script.');
            }

            // replace `super` calls with a funccall node that calls the parent object's method
            var replacementForSuper: astTypes.FuncCallNode = {
                type: 'funccall',
                expr: options.generateTypeScript
                    ?   {
                            type: 'jsexpr',
                            expr: 'super.' + methodName,
                            op: operators.JavascriptOperatorsEnum.MEMBER_ACCESS
                        }
                    :   {
                            type: 'binop',
                            op: '.',
                            expr1: {
                                type: 'binop',
                                op: '.',
                                expr1: parentIdentifier,
                                expr2: {
                                    type: 'identifier',
                                    name: 'prototype'
                                }
                            },
                            expr2: {
                                type: 'identifier',
                                name: methodName
                            }
                        },
                args: superNode.args,
                isMethodCall: options.generateTypeScript
            };
            return replacementForSuper;
        }
        
        // Replace all cmpassign with the equivalent assign and binop combo
        // TODO this does not properly prevent lvalue expressions from being evaluated twice
        if(node.type === 'cmpassign') {
            var cmpAssignNode = <astTypes.CmpAssignNode>node;
            // We don't want to output the comments attached to the lval twice.
            // Therefore we create a copy of the lval.  All comments are migrated to the copy, so the original has
            // no comments.
            var copyOfLval = _.clone(cmpAssignNode.lval);
            copyOfLval.comments = null;
            astUtils.migrateComments(copyOfLval, cmpAssignNode.lval);
            var replacements = new FastSet<astTypes.AstNode>();
            walk(copyOfLval, (node: astTypes.AstNode): astTypes.AstNode => {
                if(replacements.has(node) || node === copyOfLval) return;
                var replacement = _.clone(node);
                replacement.comments = null;
                replacements.add(replacement);
                return replacement;
            });
            var binopNode:astTypes.BinOpNode = {
                type: 'binop',
                op: cmpAssignNode.op,
                expr1: cmpAssignNode.lval,
                expr2: cmpAssignNode.rval
            };
            var assignNode:astTypes.AssignNode = {
                type: 'assign',
                lval: copyOfLval,
                rval: binopNode
            };
            return assignNode;
        }
        
        // Replace all if nodes with the equivalent ifelse node with null else statement
        if(node.type === 'if') {
            var ifNode = <astTypes.IfNode>node;
            var ifElseNode: astTypes.IfElseNode = {
                type: 'ifelse',
                expr: ifNode.expr,
                stmt1: ifNode.stmt,
                stmt2: null
            };
            return ifElseNode;
        }

    });
};
