/// <reference path="../../typings/all.d.ts"/>
"use strict";

import scope = require('./angl-scope');
import scopeVariable = require('./scope-variable');
import ModuleDescriptor = require('./module-descriptor');

export interface AstNode {
    parentNode?: AstNode;
    type: string;
    anglScope?: scope.AnglScope;
    globalAnglScope?: scope.AnglScope;
}

export interface ProjectNode extends AstNode {
    files: Array<FileNode>;
}

/**
 * AST node representing a single .angl file.
 * Each file is also an AMD module.
 */
export interface FileNode extends AstNode {
    stmts: StatementNode[];
    dependencies: Array<{
        variable: scopeVariable.AbstractVariable;
        moduleDescriptor: ModuleDescriptor;
    }>;
    moduleDescriptor: ModuleDescriptor;
}

export interface ExpressionNode extends AstNode {
    // If true, this expression is used twice in the generated JavaScript.  To avoid triggering side-effects more than
    // once, we must pre-compute the expression's children.
    isUsedTwice?: boolean;
    // `requiresPrecomputation` is set on the children of an `isUsedTwice` node.  This indicates that the expression
    // must be evaluated ahead-of-time, stored in a variable, and referenced.
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

export interface ConstNode extends AstNode {
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
    // If set to true during AST transformation, JavaScript's automatic `this` binding will occur, and we don't need
    // to use `.call`
    isMethodCall?: boolean;
}

export interface JsFuncCallNode extends AstNode {
    expr: string;
    args: ExpressionNode[];
}

export interface IdentifierNode extends ExpressionNode {
    // The parser generates nodes with a name
    name?: string;
    // The compiler generates identifier nodes with only a variable.  It also sets the variable on all identifiers
    // during the identifier resolution phase.
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
    indexVariable: scopeVariable.AbstractVariable;
    outerOtherVariable: scopeVariable.AbstractVariable;
    // Used in a processing phase to avoid processing this node twice.
    alreadyVisited: boolean;
}

export interface RepeatNode extends StatementNode {
    expr: ExpressionNode;
    stmt: StatementNode;
}

export interface SuperNode extends StatementNode {
    args: Array<ExpressionNode>;
}

export interface ObjectNode extends StatementNode {
    name: string;
    parent?: string;
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
}

export interface CreateDefNode extends AbstractArgsInvokableNode, AstNode {};

export interface DestroyDefNode extends AbstractInvokableNode, AstNode {};

export interface ScriptNode extends ExpressionNode, AbstractArgsInvokableNode {
}

export interface ScriptDefNode extends StatementNode, AbstractArgsInvokableNode {
    name: string;
}

export interface ForNode extends StatementNode {
    initstmt: StatementNode;
    contexpr: ExpressionNode;
    stepstmt: StatementNode;
    stmt: StatementNode;
}

export interface AbstractInvokableNode {
    stmts: StatementsNode;
}

export interface AbstractArgsInvokableNode extends AbstractInvokableNode {
    args: string[];
}
