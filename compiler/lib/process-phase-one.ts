/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

// AST transformation phase one

import treeWalker = module('./tree-walker');
import scope = module('./angl-scope');
import astTypes = module('./ast-types');
import astUtils = module('./ast-utils');
import scopeVariable = module('./scope-variable');
import strings = module('./strings');
var buckets = require('../vendor/buckets');
var _ = require('lodash');
var walk = treeWalker.walk;

// Create scopes for all nodes

export var transform = (ast:astTypes.AstNode) => {
    // TODO fix the typing on node.  I don't know how to access arbitrary properties of an object implementing an interface.
    walk(ast, (node:any, parent:astTypes.AstNode, locationInParent):any => {

        var replacement:any[];

        // TODO convert all scriptdefs into consts
        // Will be a good test of replacing nodes

        // Script definitions register an identifier into the parent scope
        if(node.type === 'scriptdef' || node.type === 'const') {
            if(node.parentNode.type !== 'file' && (node.parentNode.type !== 'object' || node.type !== 'scriptdef')) {
                throw new Error(node.type + ' must be at the root level of a file.');
            }
            var globalVar = new scopeVariable.Variable(node.name, 'PROP_ASSIGNMENT', 'PROP_ACCESS');
            globalVar.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
            astUtils.getGlobalAnglScope(node).addVariable(globalVar);
        }

        // Const definitions register an identifier into the parent scope

        // Scripts create a new scope
        if(node.type === 'script' || node.type === 'scriptdef') {
            var newScope = new scope.AnglScope();
            newScope.setParentScope(astUtils.getAnglScope(node));
            node.anglScope = newScope;
            // Register script arguments into the local scope
            // TODO how to handle self and other?
            var thisVar = new scopeVariable.Variable('self', 'ARGUMENT');
            thisVar.setJsIdentifier('this');
            newScope.addVariable(thisVar);
/*            var otherVar = new scopeVariable.Variable('other', 'ARGUMENT');
            newScope.addVariable(otherVar);*/
            _.each(node.args, (argName) => {
                var argumentVar = new scopeVariable.Variable(argName, 'ARGUMENT');
                newScope.addVariable(argumentVar);
            });
        }

        // Var declarations register local variables into their scope
        if(node.type === 'var') {
            replacement = [];
            _.each(node.list, (var_item) => {
                if(astUtils.getAnglScope(node).hasIdentifier(var_item.name)) {
                    throw new Error('Attempt to declare local variable with the name ' + JSON.stringify(var_item.name) + ' more than once.');
                }
                var localVar = new scopeVariable.Variable(var_item.name);
                astUtils.getAnglScope(node).addVariable(localVar);
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
            return replacement;
        }

        // repeat loops are replaced by a for loop
        if(node.type === 'repeat') {
            // construct a new AstNode to replace it.
            // allocate a temporary Javascript counter variable
            var counterVariable = new scopeVariable.Variable();
            counterVariable.setDesiredJsIdentifier('$i');
            astUtils.getAnglScope(node).addVariable(counterVariable);
            var timesVariable = new scopeVariable.Variable();
            timesVariable.setDesiredJsIdentifier('$l');
            astUtils.getAnglScope(node).addVariable(timesVariable);
            replacement = [
                {
                    type: 'assign',
                    lval: {
                        type: 'identifier',
                        variable: timesVariable
                    },
                    rval: astUtils.cleanNode(node.expr)
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
                    stmt: astUtils.cleanNode(node.stmt)
                }
            ];
            return replacement;


        }

        // with loops are replaced by:
        // Converting the argument into an array of objects at runtime
        // for-loop over each object
        // within the loop, `other` maps to the outer `self`
        // and `self` maps to each object from the array, one after the other
        if(node.type === 'with' && !node.alreadyVisited) {
            
            var withNode:astTypes.WithNode = node;

            // Grab a reference to the outer scope
            var outerScope = astUtils.getAnglScope(withNode);

            // Create an inner scope for the with loop
            var innerScope = new scope.WithScope();
            innerScope.setParentScope(outerScope);
            withNode.anglScope = innerScope;

            // Create variable to hold the full list of matched objects to be iterated over
            var allObjectsVariable = new scopeVariable.Variable();
            allObjectsVariable.setDesiredJsIdentifier('$objects');
            outerScope.addVariable(allObjectsVariable);
            
            // Create variable to hold the index (integer) for iteration over the array of objects
            var indexVariable = new scopeVariable.Variable();
            indexVariable.setDesiredJsIdentifier('$i');
            outerScope.addVariable(indexVariable);

            // Create variable to hold the current subject of iteration, the current `self` value
            var selfVariable = new scopeVariable.Variable();
            selfVariable.setIdentifier('self');
            selfVariable.setDesiredJsIdentifier('$withSelf');
            innerScope.addVariable(selfVariable);
            
            // Create variable to cache the outer `other` value.  This will be used to restore the value of `other`
            // after `with` has finished looping.
            var outerOtherVariable = new scopeVariable.Variable();
            outerOtherVariable.setDesiredJsIdentifier('$withOuterOther');
            outerScope.addVariable(outerOtherVariable);

            // Store variables onto the with node, for using during code generation
            withNode.allObjectsVariable = allObjectsVariable;
            withNode.indexVariable = indexVariable;
            withNode.outerOtherVariable = outerOtherVariable;

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
                    args: [ astUtils.cleanNode(withNode.expr) ]
                }
            };

            // After replacement, this node will be visited again.  Mark it with a flag so that we can skip processing
            // next time.
            withNode.alreadyVisited = true;

            var withReplacement:astTypes.AstNode[] = [assignmentNode, withNode];
            return withReplacement;
        }

        if(node.type === 'object') {

            // If no parent is specified, use the default
            if(!node.parent) node.parent = strings.SUPER_OBJECT_NAME;

            // Initialize some basic containers for storing methods, create, destroy, and property assignments
            node.propertyNames = new buckets.Set();
            node.properties = [];
            node.methodNames = new buckets.Set();
            node.methods = [];
            // TODO can't have properties with the same names as methods

            // process all contained statements, storing them onto the object node
            _.each(node.stmts, (stmt) => {
                switch(stmt.type) {
                    case 'scriptdef':
                        if(node.methodNames.contains(stmt.name)) {
                            throw new Error('Method ' + JSON.stringify(stmt.name) + ' defined more than once for object ' + JSON.stringify(node.name));
                        }
                        node.methodNames.add(stmt.name);
                        var stmt = astUtils.cleanNode(stmt);
                        node.methods.push({
                            type: 'script',
                            args: stmt.args,
                            stmts: stmt.stmts,
                            methodname: stmt.name
                        });
                        break;

                    case 'createdef':
                        if(node.createscript) {
                            throw new Error('Multiple create scripts defined for object ' + JSON.stringify(node.name));
                        }
                        node.createscript = {
                            type: 'script',
                            args: stmt.args,
                            stmts: stmt.stmts,
                            methodname: '$create'
                        };
                        break;

                    case 'destroydef':
                        if(node.destroyscript) {
                            throw new Error('Multiple destroy scripts defined for object ' + JSON.stringify(node.name));
                        }
                        node.destroyscript = {
                            type: 'script',
                            args: [],
                            stmts: stmt.stmts,
                            methodname: '$destroy'
                        };
                        break;

                    case 'property':
                        if(node.propertyNames.contains(stmt.name)) {
                            throw new Error('Cannot initialize object property ' + JSON.stringify(stmt.name) + 'more than once for object ' + JSON.stringify(node.name));
                        }
                        node.propertyNames.add(stmt.name);
                        node.properties.push({
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
                                    name: stmt.name
                                }
                            },
                            rval: astUtils.cleanNode(stmt.expr)
                        });
                        break;

                    default:
                        throw new Error('Unexpected child node of "object": ' + JSON.stringify(stmt.type));
                }
            });

            // Create the script that will initialize all properties
            node.propertyinitscript = {
                type: 'script',
                args: [],
                methodname: strings.OBJECT_INITPROPERTIES_METHOD_NAME,
                stmts: {
                    type: 'statements',
                    list: [{
                        type: 'super',
                        //expr: 'this.' + strings.OBJECT_INITPROPERTIES_METHOD_NAME,
                        args: []
                    }].concat(node.properties)
                }
            };

            // We've placed all statements into their respective containers, so now we empty the stmts array so that the
            // walker doesn't traverse it.
            // The walker will still traverse all methods, properties, create, and destroy via their new locations
            // on the object node.
            node.stmts = [];
        }

        if(node.type === 'super') {
            // Find the containing object (which will tell us the super-class) and the containing method's name

            var methodNode:any = astUtils.findParent(node, (parentNode:any) => parentNode.type === 'script' && parentNode.methodname );
            if(!methodNode) {
                throw new Error('"super" calls only allowed within object methods.');
            }
            var objectNode:any = astUtils.findParent(methodNode, (parentNode) => parentNode.type === 'object' );
            var methodName = methodNode.methodname;
            var parentName = objectNode.parent;

            // Special case for destroy() scripts: Since an object's destroy script can't have arguments, the super()
            // call can't have arguments either.
            if(methodName === '$destroy' && node.args.length) {
                throw new Error('Can\'t pass arguments to "super" call within a "destroy" script.');
            }

            // replace `super` calls with a funccall node that calls the parent object's method
            return {
                type: 'funccall',
                expr: {
                    type: 'jsexpr',
                    expr: strings.ANGL_GLOBALS_IDENTIFIER + '.' + parentName + '.prototype.' + methodName
                },
                args: node.args
            };
        }

        if(node.type === 'assign') {
            var assignNode = <astTypes.AssignNode>node;
            // Is the lval an arrow operator?
            if(assignNode.lval.type === 'binop' && (<astTypes.BinOpNode>assignNode.lval).op === '->') {
                var arrowLeft = (<astTypes.BinOpNode>assignNode.lval).expr1;
                var arrowRight = <astTypes.IdentifierNode>(<astTypes.BinOpNode>assignNode.lval).expr2;
                // Replace this assign node with a call to the runtime's arrowAssign method
                var fieldString:astTypes.StringNode = {
                    type: 'string',
                    val: arrowRight.name
                };
                var assignReplacement:astTypes.JsFuncCallNode = {
                    type: 'jsfunccall',
                    expr: strings.ANGL_RUNTIME_IDENTIFIER + '.arrowAssign',
                    args: [arrowLeft, fieldString, assignNode.rval]
                };
                return assignReplacement;
            }
        }

        // Catch all arrow operators that aren't captured and replaced by the logic above
        if(node.type === 'binop' && (<astTypes.BinOpNode>node).op === '->') {
            var arrowNode = <astTypes.BinOpNode>node;
            var resolveCall:astTypes.JsFuncCallNode = {
                type: 'jsfunccall',
                expr: strings.ANGL_RUNTIME_IDENTIFIER + '.arrowResolve',
                args: [arrowNode.expr1]
            };
            var arrowReplacement:astTypes.BinOpNode = {
                type: 'binop',
                op: '.',
                expr1: resolveCall,
                expr2: arrowNode.expr2
            };
            return arrowReplacement;
        }

        // Replace all cmpassign with the equivalent assign and binop combo
        // TODO this does not properly prevent lvalue expressions from being evaluated twice
        if(node.type === 'cmpassign') {
            var cmpAssignNode = <astTypes.CmpAssignNode>node;
            var binopNode:astTypes.BinOpNode = {
                type: 'binop',
                op: cmpAssignNode.op,
                expr1: cmpAssignNode.lval,
                expr2: cmpAssignNode.rval
            };
            var assignNode:astTypes.AssignNode = {
                type: 'assign',
                lval: cmpAssignNode.lval,
                rval: binopNode
            };
            return assignNode;
        }

    });
}