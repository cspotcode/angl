import scope = module('./angl-scope');
import scopeVariable = module('./scope-variable');

export interface AstNode {
    parentNode?: AstNode;
    type: string;
    anglScope?: scope.AnglScope;
    globalAnglScope?: scope.AnglScope;
}

export interface ExpressionNode extends AstNode {
    // If true, this expression is used twice in the generated JavaScript.  To avoid triggering side-effects more than
    // once, we must pre-compute the expression's children.
    isUsedTwice?: bool;
    // `requiresPrecomputation` is set on the children of an `isUsedTwice` node.  This indicates that the expression
    // must be evaluated ahead-of-time, stored in a variable, and referenced.
    requiresPrecomputation?: bool;
}

export interface BinOpNode extends AstNode {
    op: string;
    expr1: ExpressionNode;
    expr2: ExpressionNode;
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

export interface StatementNode extends AstNode {
    
}

export interface FuncCallNode extends AstNode {
    expr: ExpressionNode;
    args: ExpressionNode[];
    // If set to true during AST transformation, JavaScript's automatic `this` binding will occur, and we don't need
    // to use `.call`
    isMethodCall?: bool;
}

export interface JsFuncCallNode extends AstNode {
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
}

export interface ObjectNode extends StatementNode {
    name: string;
    parent?: string;
    stmts: StatementNode[];
}

export interface PropertyNode extends StatementNode {
    name: string;
    expr: ExpressionNode;
}

export interface MethodNode extends ScriptNode {
    methodname: string;
}

export interface ScriptNode extends ExpressionNode implements AbstractArgsInvokableNode {
}

export interface ScriptDefNode extends StatementNode implements AbstractArgsInvokableNode {
    name: string;
}

export interface ForNode extends StatementNode {
    initstmt: StatementNode;
    contexpr: ExpressionNode;
    stepstmt: StatementNode;
    stmt: StatementNode;
}

export interface AbstractInvokableNode {
    stmts: StatementNode[];
}

export interface AbstractArgsInvokableNode extends AbstractInvokableNode {
    args: string[];
}
