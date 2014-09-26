"use strict";

import _ = require('lodash');

import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import strings = require('./strings');
import ops = require('./operator-precedence-and-associativity');
var OpEnum = ops.JavascriptOperatorsEnum;
import anglToJsOpMap = require('./angl-to-js-operator-map');

var buffer,
    print: (text: string)=>void,
    indentationLevel: number;

function initializeCompiler() {
    buffer = [];
    print = _.bind(buffer.push, buffer);
    indentationLevel = 0;
}

function indent() {
    indentationLevel++;
}

function outdent() {
    indentationLevel--;
    if(indentationLevel < 0) {
        throw new Error('Tried to outdent too far.');
    }
}

function printIndent() {
    // TODO create customizable indentation level
    // TODO make this faster?
    _.times(indentationLevel, function() {
        print('    ');
    });
}

// TODO properly translate all binops and unops:
//   ones that GML has that JS doesn't have
//   ones with different behavior that need to be implemented differently
//   DIV, MOD, ^^, bitwise ops
//   how does GML do type coercion (42 + "hello world")?  Do I need to emulate that behavior?
function generateExpression(astNode: astTypes.ExpressionNode, parentExpressionType: ops.JavascriptOperatorsEnum = OpEnum.GROUPING, locationInParentExpression: ops.Location = ops.Location.N_A, omitIndentation: boolean = false) {
    var writeParens: boolean;
    
    switch(astNode.type) {

        case 'identifier':
            var identifierNode = <astTypes.IdentifierNode>astNode;
            var variable = identifierNode.variable;
            if(variable) {
                if(variable.getAccessType() === 'PROP_ACCESS') {
                    print(variable.getContainingObjectIdentifier() + '.');
                }
                print(variable.getJsIdentifier());
            } else {
                print(identifierNode.name);
            }
            // TODO will this ever need to be enclosed in parentheses?
            // How should I be handling this in the general case?
            break;

        case 'binop':
            var binOpNode = <astTypes.BinOpNode>astNode;
            switch(binOpNode.op) {
                // special-case the dot operator - no brackets!
                case '.':
                    generateExpression(binOpNode.expr1, OpEnum.MEMBER_ACCESS, ops.Location.LEFT);
                    print('.');
                    generateExpression(binOpNode.expr2, OpEnum.MEMBER_ACCESS, ops.Location.RIGHT);
                    break;

                case 'div':
                    writeParens = ops.needsParentheses(OpEnum.BITWISE_OR, parentExpressionType, locationInParentExpression);
                    writeParens && print('(');
                    // Include these parentheses for clarity, even though they are not necessary.
                    print('(');
                    generateExpression(binOpNode.expr1, OpEnum.DIVISION, ops.Location.LEFT);
                    print(' / ');
                    generateExpression(binOpNode.expr2, OpEnum.DIVISION, ops.Location.RIGHT);
                    print(')|0');
                    writeParens && print(')');
                    break;

                case 'mod':
                    writeParens = ops.needsParentheses(OpEnum.REMAINDER, parentExpressionType, locationInParentExpression);
                    writeParens && print('(');
                    generateExpression(binOpNode.expr1, OpEnum.REMAINDER, ops.Location.LEFT);
                    print(' % ');
                    generateExpression(binOpNode.expr2, OpEnum.REMAINDER, ops.Location.RIGHT);
                    writeParens && print(')');
                    break;
                
                case '||':
                    // Implement OR without short-circuit evaluation
                    // Coerce both sides to booleans, add them, coerce that to a boolean, then coerce that to a number
                    writeParens = ops.needsParentheses(OpEnum.BITWISE_OR, parentExpressionType, locationInParentExpression);
                    writeParens && print('(');
                    print('!!(!! ');
                    generateExpression(binOpNode.expr1, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                    print(' +!! ');
                    generateExpression(binOpNode.expr2, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                    print(' )|0');
                    writeParens && print(')');
                    break;
                
                case '&&':
                    // Implement AND without short-circuit evaluation
                    // Coerce both sides to booleans, then multiply them
                    writeParens = ops.needsParentheses(OpEnum.MULTIPLICATION, parentExpressionType, locationInParentExpression);
                    writeParens && print('(');
                    print('!! ');
                    generateExpression(binOpNode.expr1, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                    print(' *!! ');
                    generateExpression(binOpNode.expr2, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                    print(' ');
                    writeParens && print(')');
                    break;
                
                case '^^':
                    // Implement XOR without short-circuit evaluation
                    // Coerce both sides to boolean and "not" them, add them, subtract 1, coerce to boolean and "not", coerce to number
                    writeParens = ops.needsParentheses(OpEnum.BITWISE_OR, parentExpressionType, locationInParentExpression);
                    writeParens && print('(');
                    print('!((! ');
                    generateExpression(binOpNode.expr1, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                    print(' +! ');
                    generateExpression(binOpNode.expr2, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                    print(' )-1)|0');
                    writeParens && print(')');
                    break;
                    
                default:
                    // TODO figure out if we need to writeParens. Must create a mapping from binOpNode.op values to OpEnum values.
                    var binOpType = anglToJsOpMap.anglToJsBinOps[binOpNode.op];
                    writeParens = ops.needsParentheses(binOpType, parentExpressionType, locationInParentExpression);
                    writeParens && print('(');
                    generateExpression(binOpNode.expr1, binOpType, ops.Location.LEFT);
                    print(' ' + binOpNode.op + ' ');
                    generateExpression(binOpNode.expr2, binOpType, ops.Location.RIGHT);
                    writeParens && print(')');
                    break;
            }
            break;

        case 'unop':
            var unOpNode = <astTypes.UnOpNode> astNode;
            var unOpType = anglToJsOpMap.anglToJsUnOps[unOpNode.op];
            writeParens = ops.needsParentheses(unOpType, parentExpressionType, locationInParentExpression);
            writeParens && print('(');
            print(unOpNode.op);
            generateExpression(unOpNode.expr, unOpType, ops.Location.RIGHT);
            writeParens && print(')');
            break;

        case 'number':
            var numberNode = <astTypes.NumberNode>astNode;
            // If this number is being used inside a property access expression, we should wrap it in parentheses.
            // E.g.
            //   2.2.toString() // Valid JS code, but wat?
            //   2.toString()   // syntax error
            // much better:
            //   (2.2).toString() // returns "2.2"
            //   (2).toString()
            writeParens = parentExpressionType === OpEnum.MEMBER_ACCESS;
            writeParens && print('(');
            print(numberNode.val.toString());
            // TODO does toString always produce valid Javascript that will create the exact same number?
            writeParens && print(')');
            break;

        case 'string':
            var stringNode = <astTypes.StringNode>astNode;
            print(JSON.stringify(stringNode.val));
            // TODO this fails in a select few corner cases.  Use something better,
            // perhaps stolen from the Jade source code
            break;

        case 'index':
            var indexNode = <astTypes.IndexNode>astNode;
            // TODO this needs a lot of work
            // What do we do when index values aren't numbers?  Aren't integers?
            // What about when the array isn't initialized or the target isn't an array?
            writeParens = ops.needsParentheses(OpEnum.SUBSCRIPTING, parentExpressionType, locationInParentExpression);
            writeParens && print('(');
            generateExpression(indexNode.expr, OpEnum.SUBSCRIPTING, ops.Location.LEFT);
            _.each(indexNode.indexes, function (index) {
                print('[');
                generateExpression(index, OpEnum.SUBSCRIPTING, ops.Location.RIGHT);
                print(']');
            });
            writeParens && print(')');
            break;

        case 'funccall':
            var funcCallNode = <astTypes.FuncCallNode>astNode;
            var opType = funcCallNode.isMethodCall ? OpEnum.FUNCTION_CALL : OpEnum.MEMBER_ACCESS;
            generateExpression(funcCallNode.expr, opType, ops.Location.LEFT);
            if(funcCallNode.isMethodCall) {
                // Method calls: `self`/`this` is automatically set to the object to which the method belongs
                print('(');
            } else {
                // Function calls: Function's `self` and `other` are the local `self` and `other` values
                print('.call(');
                generateExpression({
                    type: 'identifier',
                    variable: astUtils.getAnglScope(funcCallNode).getVariableByIdentifierInChain('self')
                }, OpEnum.COMMA, ops.Location.N_A);
            }
            _.each(funcCallNode.args, function(arg, i, args) {
                if(i || !funcCallNode.isMethodCall) print(', ');
                generateExpression(arg, OpEnum.COMMA, ops.Location.N_A);
            });
            print(')');
            break;

        case 'script':
            var scriptNode = <astTypes.ScriptNode>astNode;
            // Do not write any wrapping parentheses because this is a function literal, not an operator.
            print('function(');
            print(scriptNode.args.join(', '));
            print(') {\n');
            indent();
            generateLocalVariableAllocation(scriptNode);
            // TODO this part of the AST doesn't seem quite right, suggesting there are
            // possibilities I'm not aware of.
            // These sanity checks will reject anything unexpected.
            /*if(!(_.isObject(astNode.stmts) && _(_.keys(astNode.stmts).sort()).isEqual(['list', 'type']) && astNode.stmts.type === 'statements' && _.isArray(astNode.stmts.list))) {
             throw new Error('Failed sanity checks on stmts!')
             }
             _.each(astNode.stmts.list, generateStatement)*/
            generateStatement(scriptNode.stmts);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'jsfunccall':
            var jsFuncCallNode = <astTypes.JsFuncCallNode>astNode;
            writeParens = ops.needsParentheses(OpEnum.FUNCTION_CALL, parentExpressionType, locationInParentExpression);
            writeParens && print('(');
            print(jsFuncCallNode.expr);
            print('(');
            _.each(jsFuncCallNode.args, function(arg, i) {
                if(i) print(', ');
                generateExpression(arg, OpEnum.COMMA, ops.Location.N_A);
            });
            print(')');
            writeParens && print(')');
            break;

        case 'jsexpr':
            var jsExprNode = <astTypes.JsExprNode>astNode;
            // Writing parentheses because we have no idea what the operator is.
            print('(');
            print(jsExprNode.expr);
            print(')');
            break;

        default:
            throw new Error('Unknown expression type: "' + astNode.type + '"');
    }
};

function generateStatement(astNode, omitTerminator: boolean = false, omitIndentation: boolean = false) {
    if(arguments.length < 2) omitTerminator = false;
    switch(astNode.type) {

        case 'var':
            var varNode = <astTypes.VarDeclarationNode>astNode;
            omitIndentation || printIndent();
            print('var ');
            _.each(varNode.list, (varItemNode, i, args) => {
                print(varItemNode.name);
                if (varItemNode.hasOwnProperty('expr')) {
                    print(' = ');
                    generateExpression(varItemNode.expr);
                }
                if(i < args.length - 1) {
                    print(', ');
                }
            });
            break;

        case 'assign':
            var assignNode = <astTypes.AssignNode>astNode;
            omitIndentation || printIndent();
            generateExpression(assignNode.lval, OpEnum.ASSIGNMENT, ops.Location.LEFT);
            print(' = ');
            generateExpression(assignNode.rval, OpEnum.ASSIGNMENT, ops.Location.RIGHT);
            break;

        case 'scriptdef':
            var scriptDefNode = <astTypes.ScriptDefNode>astNode;
            omitIndentation || printIndent();
            print(strings.ANGL_GLOBALS_IDENTIFIER + '.' + scriptDefNode.name);
            print(' = function(');
            print(scriptDefNode.args.join(', '));
            print(') {\n');
            indent();
            generateLocalVariableAllocation(scriptDefNode);
            // TODO this part of the AST doesn't seem quite right, suggesting there are
            // possibilities I'm not aware of.
            // These sanity checks will reject anything unexpected.
            /*if(!(_.isObject(astNode.stmts) && _(_.keys(astNode.stmts).sort()).isEqual(['list', 'type']) && astNode.stmts.type === 'statements' && _.isArray(astNode.stmts.list))) {
                throw new Error('Failed sanity checks on stmts!')
            }
            _.each(astNode.stmts.list, generateStatement)*/
            generateStatement(scriptDefNode.stmts);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'const':
            var constNode = <astTypes.ConstNode>astNode;
            omitIndentation || printIndent();
            print(strings.ANGL_GLOBALS_IDENTIFIER + '.' + constNode.name);
            print(' = ');
            generateExpression(constNode.expr, OpEnum.ASSIGNMENT, ops.Location.RIGHT);
            break;

        case 'switch':
            var switchNode = <astTypes.SwitchNode>astNode;
            omitIndentation || printIndent();
            print('switch(');
            generateExpression(switchNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
            print(') {\n');
            indent();
            _.each(switchNode.cases, (caseNode) => {
                generateCase(caseNode);
            });
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'for':
            var forNode = <astTypes.ForNode>astNode;
            omitIndentation || printIndent();
            print('for(');
            generateStatement(forNode.initstmt, true, true);
            print('; ');
            generateExpression(forNode.contexpr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
            print('; ');
            generateStatement(forNode.stepstmt, true, true);
            print(') {\n');
            indent();
            // TODO I bet there are some scoping issues I'm not dealing with correctly.
            generateStatement(forNode.stmt);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'ifelse':
            var ifElseNode = <astTypes.IfElseNode>astNode;
            omitIndentation || printIndent();
            print('if(');
            generateExpression(ifElseNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
            print(') {\n');
            indent();
            generateStatement(ifElseNode.stmt1);
            outdent();
            omitIndentation || printIndent();
            print('} else {\n');
            indent();
            generateStatement(ifElseNode.stmt2);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'if':
            var ifNode = <astTypes.IfNode>astNode;
            // This is a special case of ifelse where the else block is empty.
            generateStatement({
                type: 'ifelse',
                expr: ifNode.expr,
                stmt1: ifNode.stmt,
                stmt2: {type: 'nop'}
            }, omitTerminator, omitIndentation);
            break;

        case 'while':
            var whileNode = <astTypes.WhileNode>astNode;
            omitIndentation || printIndent();
            print('while(');
            generateExpression(whileNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
            print(') {\n');
            indent();
            generateStatement(whileNode.stmt);
            outdent();
            printIndent();
            print('}');
            break;

        case 'dountil':
            var doUntilNode = <astTypes.DoUntilNode>astNode;
            omitIndentation || printIndent();
            print('do {\n');
            indent();
            generateStatement(doUntilNode.stmt);
            outdent();
            omitIndentation || printIndent();
            print('} while(!');
            generateExpression(doUntilNode.expr, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
            print(')');
            break;

        case 'break':
            omitIndentation || printIndent();
            print('break');
            // TODO are break semantics ever different in Angl than they are in JS?
            break;

        case 'continue':
            omitIndentation || printIndent();
            print('continue');
            // TODO are continue semantics ever different in Angl than they are in JS?
            break;

        case 'statements':
            var statementsNode = <astTypes.StatementsNode>astNode;
            _.each(statementsNode.list, (statement) => {
                generateStatement(statement);
            });
            break;

        case 'funccall':
        case 'jsfunccall':
            // Delegate to the expression generator
            omitIndentation || printIndent();
            generateExpression(astNode);
            break;

        case 'with':
            var withNode = <astTypes.WithNode>astNode;
            var indexIdentifier = {
                type: 'identifier',
                variable: withNode.indexVariable
            };
            var allObjectsIdentifier = {
                type: 'identifier',
                variable: withNode.allObjectsVariable
            };
            var innerSelfIdentifier = {
                type: 'identifier',
                variable: astUtils.getAnglScope(withNode).getVariableByIdentifier('self')
            };
            var outerSelfIdentifier = {
                type: 'identifier',
                variable: astUtils.getAnglScope(withNode.parentNode).getVariableByIdentifier('self')
            };
            var outerOtherIdentifier = {
                type: 'identifier',
                variable: withNode.outerOtherVariable
            };
            // Cache the outer `other` value
            omitIndentation || printIndent();
            generateExpression(outerOtherIdentifier);
            print(' = ' + strings.ANGL_RUNTIME_IDENTIFIER + '.other;\n');
            // Set the new `other` value
            omitIndentation || printIndent();
            print(strings.ANGL_RUNTIME_IDENTIFIER + '.other = ');
            generateExpression(outerSelfIdentifier);
            print(';\n');
            // Start the for loop that iterates over all matched instances
            omitIndentation || printIndent();
            print('for(');
            generateExpression(indexIdentifier);
            print(' = 0; ');
            generateExpression(indexIdentifier);
            print(' < ');
            generateExpression(allObjectsIdentifier);
            print('.length; ');
            generateExpression(indexIdentifier);
            print('++) {\n');
            indent();
            // Assign the value of inner `self`
            omitIndentation || printIndent();
            generateExpression(innerSelfIdentifier);
            print(' = ');
            generateExpression(allObjectsIdentifier);
            print('[');
            generateExpression(indexIdentifier);
            print('];\n');
            // Generate all statements within the with loop
            generateStatement(withNode.stmt);
            outdent();
            omitIndentation || printIndent();
            print('};\n');
            // Restore the outer value of `other`
            omitIndentation || printIndent();
            print(strings.ANGL_RUNTIME_IDENTIFIER + '.other = ');
            generateExpression(outerOtherIdentifier);
            break;

        case 'return':
            var returnNode = <astTypes.ReturnNode>astNode;
            // TODO is there ever a situation where a Javascript 'return' won't do what we want?
            // For example, inside a _.each() iterator function
            omitIndentation || printIndent();
            print('return (');
            generateExpression(returnNode.expr);
            print(')');
            break;

        case 'exit':
            // TODO same caveats as 'return'
            omitIndentation || printIndent();
            print('return');
            break;

        case 'object':
            var objectNode = <astTypes.ObjectNode>astNode;
            var objectExpr = strings.ANGL_GLOBALS_IDENTIFIER + '.' + objectNode.name;
            var protoExpr = objectExpr + '.prototype';
            var parentObjectExpr = strings.ANGL_GLOBALS_IDENTIFIER + '.' + objectNode.parent;
            var parentProtoExpr = parentObjectExpr + '.prototype';
            // Wrap object creation within a closure, and pass that closure into the proper runtime method.
            // The Angl runtime will take care of creating objects in the proper order, so that the parent object
            // already exists.
            omitIndentation || printIndent();
            print(strings.ANGL_RUNTIME_IDENTIFIER + '.createAnglObject(' +
                  JSON.stringify(objectNode.name) + ', ' + JSON.stringify(objectNode.parent) + ', ');
            print('function() {\n');
            indent();
            // Generate the constructor function
            omitIndentation || printIndent();
            print(objectExpr + ' = function() { ' + parentObjectExpr + '.apply(this, arguments); };\n');
            // Set up inheritance
            omitIndentation || printIndent();
            print(strings.ANGL_RUNTIME_IDENTIFIER + '.inherit(' + objectExpr + ', ' + parentObjectExpr + ');\n');
            // Generate the property initialization function
            omitIndentation || printIndent();
            print(protoExpr + '.' + strings.OBJECT_INITPROPERTIES_METHOD_NAME + ' = ');
            generateExpression(objectNode.propertyinitscript);
            print(';\n');
            // Generate the create event, if specified
            if(objectNode.createscript) {
                omitIndentation || printIndent();
                print(protoExpr + '.$create = ');
                generateExpression(objectNode.createscript);
                print(';\n');
            }
            // Generate the destroy event, if specified
            if(objectNode.destroyscript) {
                omitIndentation || printIndent();
                print(protoExpr + '.$destroy = ');
                generateExpression(objectNode.destroyscript);
                print(';\n');
            }
            // Generate all methods
            _.each(objectNode.methods, (method) => {
                omitIndentation || printIndent();
                print(protoExpr + '.' + method.methodname + ' = ');
                generateExpression(method);
                print(';\n');
            });
            outdent();
            omitIndentation || printIndent();
            print('})');
            break;
            break;

        case 'nop':
            // No-ops don't do anything.  I'm assuming they never trigger any behavior by
            // "separating" adjacent statements.
            break;

        default:
            throw new Error('Unknown statement type: "' + astNode.type + '"');
    }
    // Statements are terminated by a semicolon and a newline
    // except for a few exceptions.
    // Also, in certain contexts we want to omit this termination
    // (e.g., initializer statement of a for loop)
    if(!_.contains(['nop', 'statements'], astNode.type) && !omitTerminator) {
        print(';\n');
    }
};

function generateCase(astNode) {
    switch(astNode.type) {

        case 'case':
            var caseNode = <astTypes.CaseNode>astNode;
            printIndent();
            print('case ');
            generateExpression(caseNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
            print(':\n');
            indent();
            generateStatement(caseNode.stmts);
            outdent();
            break;

        case 'defaultcase':
            var defaultCaseNode = <astTypes.DefaultCaseNode>astNode;
            printIndent();
            print('default:\n');
            indent();
            generateStatement(defaultCaseNode.stmts);
            outdent();
            break;

        default:
            throw new Error('Unknown case type: "' + astNode.type + '"');
    }
};

function generateLocalVariableAllocation(astNode) {
    var localVariables = _.filter(astUtils.getAnglScope(astNode).getVariablesArray(), (variable) => {
        return variable.getAllocationType() === 'LOCAL';
    });
    if(localVariables.length) {
        printIndent();
        print('var ');
        print(_.map(localVariables, (variable) => {
            return variable.getJsIdentifier();
        }).join(', '));
        print(';\n');
    }
}

function generateTopNode(astNode) {
    switch(astNode.type) {

        case 'file':
            // RequireJS `define()` call
            print('define(function(require) {\n');
            indent();
            printIndent();
            // Something removes "use strict" from the source code unless I split it up like so.  RequireJS perhaps?
            print('"use' + ' strict";\n');
            // require modules
            printIndent();
            print('var ' + strings.ANGL_GLOBALS_IDENTIFIER + ' = require(' + JSON.stringify(strings.ANGL_GLOBALS_MODULE) + ');\n');
            printIndent();
            print('var ' + strings.ANGL_RUNTIME_IDENTIFIER + ' = require(' + JSON.stringify(strings.ANGL_RUNTIME_MODULE) + ');\n');
            // allocate local variables
            generateLocalVariableAllocation(astNode);
            // delegate to the statement generator
            _.each(astNode.stmts, (node) => {
                generateStatement(node);
            });
            outdent();
            print('});');
            break;

        default:
            throw new Error('Unknown root node type: "' + astNode.type + '"');
    }
};

export function generateJs(transformedAst: astTypes.AstNode) {
    initializeCompiler();
    generateTopNode(transformedAst);
    return _.flatten(buffer).join('');
}

