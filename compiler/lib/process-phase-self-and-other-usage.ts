/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');
import FastSet = require('collections/fast-set');
import FastMap = require('collections/fast-map');

import graph = require('./util/graph');
import treeWalker = require('./tree-walker');
var walk = treeWalker.walk;
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import anglScope = require('./angl-scope');
import scopeVariable = require('./scope-variable');
import strings = require('./strings');

enum Tristate {
    UNKNOWN,
    FALSE,
    TRUE
}

enum NodeType {
    SELF,
    OTHER
}

interface NodeData {
    scope: Scope;
    type: NodeType;
}

interface Scope {
    usesSelf: Tristate;
    usesOther: Tristate;
    scope: anglScope.AnglScope;
    invokedScopes: FastSet<Scope>; // All other scopes invoked by this one.
    scriptDefNode: astTypes.ScriptDefNode; // AST ScriptDefNode for this scope if it's a scriptdef scope
    withNode: astTypes.WithNode; // AST WithNode for this scope if it's a with(){} scope
    selfId: string;
    otherId: string;
}

/*
 * Big idea: all code resides within a scope.  If that code uses the values of `self` and/or `other`,
 * then all other code that calls that code must pass those values.
 * For example, if a with block uses the value of `other`, then the parent scope must set the value of
 * `other`.
 * Another example: if a script scope uses the value of `self` then everywhere that script is invoked,
 * 
 * What about when we don't actually know if the thing we're invoking uses self and/or other?
 * In that case:
 *   Use runtime code analysis to look at the function's arguments.
 *   If the first argument of the function is named "other",
 *   pass `other` as the first argument.
 *   TODO attach this argument information to the function itself?  So we don't have to run fn.toString(), we just check fn.acceptsOther?
 *   Bind `this` just in case it's needed.  That's easy enough.
 * Examples of this situation:
 *   Invoking a fn passed as an argument
 *   Triggering an event on an object?
 *   Invoking a script by name?
 */

/*
 * What about anonymous functions?
 * What about invoking something that we can't resolve to a scope?
 * For example, global variables have a usesSelf and usesOther, but function arguments don't.
 */

export function transform(ast:astTypes.AstNode) {
    
    var _id = 0;
    function id(): string {
        return '' + _id++;
    }

    function getLocalVariable(variable: scopeVariable.AbstractVariable) {
        if(variable instanceof scopeVariable.ProxyToModuleProvidedVariable) {
            variable = (<scopeVariable.ProxyToModuleProvidedVariable>variable).getModuleProvidedVariable();
        }
        if(variable instanceof scopeVariable.GlobalVersionOfExportedVariable) {
            variable = (<scopeVariable.GlobalVersionOfExportedVariable>variable).getLocalVariable();
        }
        return variable;
    }
    /**
     * Mapping from variables to their associated Scope, if one exists.
     */
    var variableToScope = new FastMap<scopeVariable.AbstractVariable, Scope>(
        null,
        (left, right) => getLocalVariable(left) === getLocalVariable(right),
        (value) => (<any>Object).hash(getLocalVariable(value))
    );
    /**
     * Graph of all Scopes, tracking their dependencies.  An edge pointing from A to B means that B's usesSelf and usesOther
     * depend on A's usesSelf and usesOther.  (A->B means B depends on A)
     */
    var scopeGraph = new graph.Graph<NodeData, void>();
    var scopes = new FastSet<Scope>();
    
    // Walk the AST once, creating a ScopeInfo for each script and with() node.
    findScopes(ast, null);
    function findScopes(rootNode: astTypes.AstNode, parentScope: Scope) {
        walk(rootNode, (node: astTypes.AstNode, parent: astTypes.AstNode, locationInParent: string) => {
            
            // skip the rootNode itself; only look at its children.  When we recurse, rootNode will be a ScriptDefNode
            // or WithNode that we've already created a Scope for.
            if(node === rootNode) return;

            // skip script literals and do not visit their children.  We can't use static analysis to associate them
            // with a variable, and the body of a script literal does not affect whether or not the parent lexical
            // scope usesSelf or usesOther.
            if(node.type === 'script') return false;
            
            var scriptDefNode: astTypes.ScriptDefNode = null;
            var withNode: astTypes.WithNode = null;
            if(node.type === 'scriptdef') {
                scriptDefNode = <astTypes.ScriptDefNode>node;
            }
            if(node.type === 'with') {
                withNode = <astTypes.WithNode>node;
            }
            
            if(scriptDefNode || withNode) {
                var selfGraphNode = scopeGraph.addNode();
                var otherGraphNode = scopeGraph.addNode();
                var scope: Scope = {
                    withNode: withNode,
                    scriptDefNode: scriptDefNode,
                    selfId: selfGraphNode.id,
                    otherId: otherGraphNode.id,
                    invokedScopes: new FastSet<Scope>(), // TODO don't use this?  Cuz this info is encoded in the graph
                    scope: astUtils.getAnglScope(node),
                    usesOther: Tristate.UNKNOWN,
                    usesSelf: Tristate.UNKNOWN
                };
                selfGraphNode.data = {scope: scope, type: NodeType.SELF};
                otherGraphNode.data = {scope: scope, type: NodeType.OTHER};
                scopes.add(scope);
                
                // If this scope is a scriptdef, then create a mapping from the script's AbstractVariable to its Scope.
                // TODO what about exported variables?
                // When they're imported into another file, it'll be a ProxyToModuleProvidedVariable.
                // Is there a separate global variable and local variable?
                if(scriptDefNode && scriptDefNode.variable) {
                    variableToScope.set(scriptDefNode.variable, scope);
                    
                    if(scriptDefNode.variable.getUsesThisBinding()) scope.usesSelf = Tristate.TRUE;
                    if(scriptDefNode.variable.getAcceptsOtherArgument()) scope.usesOther = Tristate.TRUE;
                }
                
                if(withNode && parentScope) {
                    // The parent scope will invoke this with() block scope
                    parentScope.invokedScopes.add(scope);
                    
                    // Therefore the parent scope's usesSelf is dependent on this with() scope's usesOther.
                    // If the with scope usesOther then the parent scope usesSelf
                    scopeGraph.addEdge(scope.otherId, parentScope.selfId);
                }

                // Walk the children of this node
                findScopes(node, scope);
                return false;
            }
            
            // Every time the `self` or `other` identifiers are used in the code, we mark the parent scope as usesSelf or usesOther
            if(parentScope && node.type === 'identifier') {
                var variable = (<astTypes.IdentifierNode>node).variable;
                if(variable === astUtils.getAnglScope(node).getVariableByIdentifierInChain('self')) {
                    parentScope.usesSelf = Tristate.TRUE;
                }
                if(variable === astUtils.getAnglScope(node).getVariableByIdentifierInChain('other')) {
                    parentScope.usesOther = Tristate.TRUE;
                }
            }
        });
    }
    
    // Walk the AST of each scope, finding all the scripts that each scope invokes.
    // If the invoked script has its own scope (e.g. it's a script declared elsewhere in the project) then create the
    // proper data structure links.
    scopes.forEach((parentScope) => {
        var parentSelfNode = scopeGraph.getNode(parentScope.selfId);
        var parentOtherNode = scopeGraph.getNode(parentScope.otherId);
        var astRoot = parentScope.withNode || parentScope.scriptDefNode;
        var invokedVariable: scopeVariable.AbstractVariable;
        var invokedScope: Scope;
        walk(astRoot, (astNode, parentAstNode, locationInParent) => {
            
            // Do not descend into nested scopes
            if(astNode !== astRoot && ~['with', 'script', 'scriptdef'].indexOf(astNode.type)) {
                return false;
            }
            
            // If this node is a funccall invoking another variable
            if(
                astNode.type === 'funccall'
                && (<astTypes.FuncCallNode>astNode).expr.type === 'identifier'
                && (invokedVariable = (<astTypes.IdentifierNode>(<astTypes.FuncCallNode>astNode).expr).variable)
            ) {
                // If the invoked variable has a Scope
                invokedScope = variableToScope.get(invokedVariable);
                if(invokedScope) {
                    // The parentScope invokes the invokedScope.
                    parentScope.invokedScopes.add(invokedScope);
                    // Therefore the parentScope's usesSelf and usesOther both depend on the usesSelf and usesOther of the
                    // invokedScope.
                    scopeGraph.addEdge(invokedScope.selfId, parentScope.selfId);
                    scopeGraph.addEdge(invokedScope.otherId, parentScope.otherId);
                } else {
                    // else the invoked variable doesn't have a Scope.
                    // Therefore the invoked variable's usesThisBinding and acceptsOtherArgument are not going to change.
                    if(invokedVariable.getUsesThisBinding()) parentScope.usesSelf = Tristate.TRUE;
                    if(invokedVariable.getAcceptsOtherArgument()) parentScope.usesOther = Tristate.TRUE;
                }
            }
        });
    });
    
    // Nodes that have already resolved their values.
    // All incoming edges to these nodes can be removed.
    // All outgoing edges can be followed to potentially resolve the target node.
    var resolvedNodes = new FastSet<graph.GraphNode<NodeData>>();
    
    scopeGraph.forEachNode((node) => {
        switch(node.data.type) {
            case NodeType.SELF:
                if(node.data.scope.usesSelf !== Tristate.UNKNOWN)
                    resolvedNodes.add(node);
                break;
            case NodeType.OTHER:
                if(node.data.scope.usesOther !== Tristate.UNKNOWN)
                    resolvedNodes.add(node);
                break;
        }
    });
    
    while(true) {
        do {
            while(resolvedNodes.length) {
                var node = resolvedNodes.one();
                resolvedNodes.remove(node);
                var scope = node.data.scope;
                var type = node.data.type;
                
                // If this node is still UNKNOWN, mark it as FALSE.
                // If it was going to be TRUE, we would have already set it to TRUE.
                switch(node.data.type) {
                    case NodeType.SELF:
                        if(node.data.scope.usesSelf === Tristate.UNKNOWN)
                            node.data.scope.usesSelf = Tristate.FALSE;
                        break;
                    case NodeType.OTHER:
                        if(node.data.scope.usesOther === Tristate.UNKNOWN)
                            node.data.scope.usesOther = Tristate.FALSE;
                        break;
                }

                // If this node (SELF or OTHER) is "true" (e.g self or other is used by the scope)
                if(type === NodeType.SELF
                        ? scope.usesSelf === Tristate.TRUE
                        : scope.usesOther === Tristate.TRUE
                ) {
                    // Set the destination node's usesSelf or usesOther to true,
                    // and mark the destination node as resolved.
                    scopeGraph.getOutEdgesOf(node.id).forEach((edge) => {
                        if(edge.toNode.data.type === NodeType.SELF) {
                            edge.toNode.data.scope.usesSelf = Tristate.TRUE;
                        } else { // NodeType.OTHER
                            edge.toNode.data.scope.usesOther = Tristate.TRUE;
                        }
                        resolvedNodes.add(edge.toNode);
                    });
                }
                
                // Propagate usesSelf and usesOther info onto the AST, variables, and/or angl scopes
                resolved(node);
                
                // Remove this node from the graph
                scopeGraph.removeNode(node.id);
            }

            // Mark all source nodes as resolved.
            scopeGraph.forEachSource((node) => {
                resolvedNodes.add(node);
            });
        } while(resolvedNodes.length);
        
        // If the graph has zero nodes, all scopes have been resolved.  We're done.
        if(scopeGraph.nodeSize === 0) break;
        
        // We've run out of resolved nodes to look at, but the graph isn't empty.
        // We have cycle(s); find them and remove them.
        var cycle;
        while(cycle = scopeGraph.findCycle()) {
            cycle.forEach((edge) => {
                scopeGraph.removeEdge(edge.fromNode.id, edge.toNode.id);
            });
        }
        
        
        //////////////////////
        //// TODO remove this crap below; it's old stuff
        //
        //
        //// Process and remove all source nodes until none are left
        //do {
        //    var visited = 0;
        //    scopeGraph.forEachSource((node) => {
        //        visited++;
        //        var scope = node.data.scope;
        //        var type = node.data.type;
        //
        //        // All of this node's dependencies have resolved.
        //        scope.invokedScopes.forEach((invokedScope) => {
        //            if(type === NodeType.SELF) {
        //                
        //            } else { // NodeType.OTHER
        //            }
        //            if(invokedScope.withNode) {
        //                // When a with node uses the value of `other`, the parent scope uses the value of `self`
        //                if(invokedScope.usesOther === Tristate.TRUE) scope.usesSelf = Tristate.TRUE;
        //            } else { // scriptDefNode
        //                if(invokedScope.usesSelf === Tristate.TRUE) scope.usesSelf = Tristate.TRUE;
        //                if(invokedScope.usesOther === Tristate.TRUE) scope.usesOther = Tristate.TRUE;
        //            }
        //        });
        //
        //        if(scope.usesSelf === Tristate.UNKNOWN) scope.usesSelf = Tristate.FALSE;
        //        if(scope.usesOther === Tristate.UNKNOWN) scope.usesOther = Tristate.FALSE;
        //
        //        resolved(scope);
        //        scopeGraph.removeNode(node.id); // TODO can we remove a node while the graph is being iterated?
        //    });
        //} while(visited);
        //
        //// If the graph has zero nodes, all scopes have been resolved.  We're done.
        //if(scopeGraph.nodeSize === 0) break;
        //
        //// Detect and remove any cycles from the graph.
        //var cycle;
        //while(cycle = scopeGraph.findCycle()) {
        //    cycle.forEach((edge) => {
        //        scopeGraph.removeEdge(edge.fromNode.id, edge.toNode.id);
        //    });
        //}
    }
    
    function resolved(node: graph.GraphNode<NodeData>) {
        var scope = node.data.scope;
        if(scope.scriptDefNode) {
            if(scope.scriptDefNode.variable instanceof scopeVariable.Variable) { // TODO update this type check to be better?
                var variable = <scopeVariable.Variable>scope.scriptDefNode.variable;
                switch(node.data.type) {
                    case NodeType.SELF:
                        if(scope.usesSelf === Tristate.TRUE) variable.setUsesThisBinding(true);
                        break;
                    case NodeType.OTHER:
                        if(scope.usesOther === Tristate.TRUE) {
                            variable.setAcceptsOtherArgument(true);
                            if(scope.scriptDefNode.args[0] !== 'other') scope.scriptDefNode.args.unshift('other');
                        }
                        break;
                }
            }
        }
        if(scope.withNode) {
            var withScope = astUtils.getAnglScope(scope.withNode);
            switch(node.data.type) {
                case NodeType.SELF:
                    if(scope.usesSelf === Tristate.TRUE)
                        withScope.setIdentifierInChainIsUsed('self');
                    break;
                case NodeType.OTHER:
                    if(scope.usesOther === Tristate.TRUE)
                        withScope.setIdentifierInChainIsUsed('other');
                    break;
            }
        }
    }
    
    // Everything has been resolved.  For all scriptdef scopes that do not declare a `other` argument, replace the local `other` with the angl runtime's global `other`
    scopes.forEach((scope)=> {
        if(scope.scriptDefNode && scope.scriptDefNode.args[0] !== 'other') {
            var localOther = astUtils.getAnglScope(scope.scriptDefNode).getVariableByIdentifier('other');
            var globalOther = astUtils.getGlobalAnglScope(scope.scriptDefNode).getVariableByIdentifier('other');
            walk(scope.scriptDefNode, (astNode) => {
                if(astNode.type === 'identifier') {
                    var identifierNode = <astTypes.IdentifierNode>astNode;
                    if(identifierNode.variable === localOther) identifierNode.variable = globalOther;
                }
            });
            astUtils.getAnglScope(scope.scriptDefNode).removeVariable(localOther);
        }
    });
}
