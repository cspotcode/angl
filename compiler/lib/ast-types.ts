/// <reference path="../../typings/all.d.ts"/>
"use strict";

import Map = require('collections/map');

import scope = require('./angl-scope');
import scopeVariable = require('./scope-variable');
import ModuleDescriptor = require('./module-descriptor');
import operators = require('./operator-precedence-and-associativity');

export interface AstNode {
    parentNode?: AstNode;
    type: string;
    anglScope?: scope.AnglScope;
    globalAnglScope?: scope.AnglScope;
    location?: NodeLocation;
    comments?: {
        before: Array<CommentNode>;
        after: Array<CommentNode>;
    }
}

export interface NodeLocation {
    first_line: number;
    first_column: number;
    last_line: number;
    last_column: number;
}

export interface CommentNode {
    text: string;
    location: NodeLocation;
}

export interface ProjectNode extends AstNode {
    files: Array<FileNode>;
}

/**
 * SimpleFileNode is created by the parser.
 * The compiler quickly replaces it with an instance of FileNode during AST transformation.
 */
export interface SimpleFileNode extends AstNode {
    stmts: Array<StatementNode>;
    allComments: Array<CommentNode>;
}

export class FileNode implements AstNode {
    // Implement AstNode interface
    parentNode: AstNode;
    type = 'file';
    anglScope: scope.AnglScope;
    globalAnglScope: scope.AnglScope;
    
    stmts: StatementNode[];

    /**
     * Map from ModuleDescriptor instances to their corresponding local variables.
     */
    public /*read-only*/ dependencies: Map<ModuleDescriptor, scopeVariable.AbstractVariable>;

    /**
     * Describes this file's module.  In AMD, each file is a module.
     */
    public /*read-only*/ moduleDescriptor: ModuleDescriptor;

    /**
     * Add a dependency on the given module.
     * It will be require()'d in the generated JS code.
     * For convenience, returns the local variable into which the dependency will be stored.
     */
    addDependency(moduleDescriptor: ModuleDescriptor): scopeVariable.AbstractVariable {
        // TODO throw an error?  Or silently succeed?
        if(this.dependencies.has(moduleDescriptor)) {
            throw new Error('File already has a dependency on module: ' + moduleDescriptor.name);
        }
        var variable = new scopeVariable.Variable(null, 'IMPORT', 'BARE');
        variable.setDesiredJsIdentifier(moduleDescriptor.preferredIdentifier);
        this.anglScope.addVariable(variable);
        this.dependencies.set(moduleDescriptor, variable);
        return variable;
    }

    /**
     * Returns the local variable on which this dependency is stored when loaded.
     * Returns undefined if we do not have a dependency on the given module.
     */
    getVariableForDependency(moduleDescriptor: ModuleDescriptor): scopeVariable.AbstractVariable {
        return this.dependencies.get(moduleDescriptor, undefined);
    }

    /**
     * Get a local proxy variable that accesses the property on the locally-loaded module.
     * Create said variable if it does not yet exist.
     * If addDependency is true, a dependency will be added as necessary.
     * If addDependency is false and a dependency does not yet exist, throws an error.
     */
    getLocalProxyForModuleVariable(variable: scopeVariable.AbstractVariable, addDependency: boolean = false): scopeVariable.AbstractVariable {
        var providedByModule = variable.getProvidedByModule();
        var moduleVariable = this.getVariableForDependency(providedByModule);
        if(!moduleVariable) {
            if(!addDependency) throw new Error('File does not already have a dependency on the appropriate module.');
            moduleVariable = this.addDependency(providedByModule);
        }
        // create local proxy variable and add it to scope
        var proxyVariable = new scopeVariable.ProxyToModuleProvidedVariable(variable, moduleVariable);
        this.anglScope.addVariable(proxyVariable);
        return proxyVariable;
    }

    constructor(stmts: Array<StatementNode>, modulePath: string) {
        this.stmts = stmts.slice();
        this.moduleDescriptor = new ModuleDescriptor(modulePath, false);
        this.dependencies = new Map<ModuleDescriptor, scopeVariable.AbstractVariable>();
    }
}


export interface ExpressionNode extends AstNode {
    /**
     * If true, this expression is used twice in the generated JavaScript.  To avoid triggering side-effects more than
     * once, we must pre-compute the expression's children.
     */
    isUsedTwice?: boolean;
    /**
     * `requiresPrecomputation` is set on the children of an `isUsedTwice` node.  This indicates that the expression
     * must be evaluated ahead-of-time, stored in a variable, and referenced.
     */
    requiresPrecomputation?: boolean;
}

export interface BinOpNode extends ExpressionNode {
    op: string;
    expr1: ExpressionNode;
    expr2: ExpressionNode;
}

export interface UnOpNode extends ExpressionNode {
    op: string;
    expr: ExpressionNode;
}

export interface IndexNode extends ExpressionNode {
    expr: ExpressionNode;
    indexes: Array<ExpressionNode>;
}

export interface AssignNode extends StatementNode {
    lval: ExpressionNode;
    rval: ExpressionNode;
}

export interface CmpAssignNode extends StatementNode {
    lval: ExpressionNode;
    rval: ExpressionNode;
    op: string;
}

export interface VarDeclarationNode extends StatementNode {
    list: Array<VarDeclarationItemNode>;
}

export interface GlobalVarDeclarationNode extends VarDeclarationNode {}

export interface VarDeclarationItemNode extends AstNode {
    name: string;
    expr?: ExpressionNode;
}

export interface StatementNode extends AstNode {
    
}

export interface ConstNode extends AstNode, AbstractExportableNode {
    name: string;
    expr: ExpressionNode;
}

export interface SwitchNode extends StatementNode {
    expr: ExpressionNode;
    cases: Array<AstNode>;
    // TODO tighten up the type checking for cases array
    // It contains zero or more CaseNode and zero or one DefaultCaseNode
}

export interface CaseNode extends AstNode {
    expr: ExpressionNode;
    stmts: StatementsNode;
}

export interface DefaultCaseNode extends AstNode {
    stmts: StatementsNode;
}

export interface IfNode extends StatementNode {
    expr: ExpressionNode;
    stmt: StatementNode;
}

export interface IfElseNode extends StatementNode {
    expr: ExpressionNode;
    stmt1: StatementNode;
    stmt2: StatementNode;
}

export interface WhileNode extends StatementNode {
    expr: ExpressionNode;
    stmt: StatementNode;
}

export interface DoUntilNode extends StatementNode {
    expr: ExpressionNode;
    stmt: StatementNode;
}

export interface ReturnNode extends StatementNode {
    expr: ExpressionNode;
}

export interface FuncCallNode extends AstNode {
    expr: ExpressionNode;
    args: ExpressionNode[];
    /**
     * If set to true during AST transformation, JavaScript's automatic `this` binding will occur, and we don't need
     * to use `.call`
     */
    isMethodCall?: boolean;
}

export interface JsFuncCallNode extends AstNode {
    expr: string;
    args: ExpressionNode[];
    op: operators.JavascriptOperatorsEnum;
}

export interface IdentifierNode extends ExpressionNode {
    // The parser generates nodes with a name
    // The compiler generates identifier nodes with only a variable.  It also sets the variable on all identifiers
    // during the identifier resolution phase.
    /**
     * Name of this identifier, as it appears in the Angl source.
     */
    name?: string;
    /**
     * Variable to which this identifier resolves.
     */
    variable?: scopeVariable.AbstractVariable;
}

export interface StatementsNode extends StatementNode {
    list: StatementNode[];
}

export interface NumberNode extends ExpressionNode {
    val: number;
}

export interface StringNode extends ExpressionNode {
    val: string;
}

export interface WithNode extends StatementNode {
    expr: ExpressionNode;
    stmt: StatementNode;
    allObjectsVariable: scopeVariable.AbstractVariable;
    outerOtherVariable: scopeVariable.AbstractVariable;
    /**
     * Used in a processing phase to avoid processing this node twice.
     */
    alreadyVisited: boolean;
}

export interface RepeatNode extends StatementNode {
    expr: ExpressionNode;
    stmt: StatementNode;
}

export interface SuperNode extends StatementNode {
    args: Array<ExpressionNode>;
}

export interface ObjectNode extends StatementNode, AbstractExportableNode {
    name: string;
    parent?: string;
    parentIdentifier?: IdentifierNode;
    stmts: Array<StatementNode>;
    properties: Array<AssignNode>;
    methods: Array<MethodNode>;
    createscript: ScriptNode;
    destroyscript: ScriptNode;
    propertyinitscript: ScriptNode;
}

export interface PropertyNode extends StatementNode {
    name: string;
    expr: ExpressionNode;
}

// TODO MethodNode and ScriptNode both have type==='script'
// This is a problem, because the type property is supposed to
// allow a clean way to detect the type of a node at runtime and
// perform the correct downcast (without the possibility of making
// a mistake)
export interface MethodNode extends ScriptNode {
    methodname: string;
}

export interface JsExprNode extends AstNode {
    expr: string;
    op: operators.JavascriptOperatorsEnum;
}

export interface CreateDefNode extends AbstractArgsInvokableNode, AstNode {}

export interface DestroyDefNode extends AbstractInvokableNode, AstNode {}

export interface ScriptNode extends ExpressionNode, AbstractArgsInvokableNode {
}

export interface ScriptDefNode extends StatementNode, AbstractArgsInvokableNode, AbstractExportableNode {
    name: string;
}

export interface ForNode extends StatementNode {
    initstmt: StatementNode;
    contexpr: ExpressionNode;
    stepstmt: StatementNode;
    stmt: StatementNode;
}

export interface ExportDeclarationNode extends AstNode {
    name: string;
}

export interface AbstractInvokableNode extends AstNode {
    stmts: StatementsNode;
}

export interface AbstractArgsInvokableNode extends AbstractInvokableNode, AstNode {
    args: string[];
}

export interface AbstractExportableNode extends AstNode {
    exported?: boolean;
    name: string;
    variable?: scopeVariable.AbstractVariable;
}
