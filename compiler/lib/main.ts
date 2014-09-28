"use strict";

import _ = require('lodash');

import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import strings = require('./strings');
import ops = require('./operator-precedence-and-associativity');
var OpEnum = ops.JavascriptOperatorsEnum;
import anglToJsOpMap = require('./angl-to-js-operator-map');
import ModuleExportsType = require('./module-exports-type');
import options = require('./options');

export class JsGenerator {
    
    private buffer: Array<any>;
    private indentationLevel: number;
    private options: options.Options;
    private indentationString: string;
    
    constructor(options: options.Options) {
        this.options = options;
    }
    
    initialize() {
        this.buffer = [];
        this.indentationLevel = 0;
        this.indentationString = '';
        _.times(this.options.spacesPerIndentationLevel, () => {
            this.indentationString += ' ';
        });
    }
    
    print(text) {
        this.buffer.push(text);
    }

    indent() {
        this.indentationLevel++;
    }

    outdent() {
        this.indentationLevel--;
        if(this.indentationLevel < 0) {
            throw new Error('Tried to outdent too far.');
        }
    }

    printIndent() {
        _.times(this.indentationLevel, () => {
            this.print(this.indentationString);
        });
    }
    
    getCode() {
        return _.flatten(this.buffer).join('');
    }

    // TODO properly translate all binops and unops:
    //   ones that GML has that JS doesn't have
    //   ones with different behavior that need to be implemented differently
    //   DIV, MOD, ^^, bitwise ops
    //   how does GML do type coercion (42 + "hello world")?  Do I need to emulate that behavior?
    generateExpression(astNode:astTypes.ExpressionNode, parentExpressionType:ops.JavascriptOperatorsEnum = OpEnum.GROUPING, locationInParentExpression:ops.Location = ops.Location.N_A, omitIndentation:boolean = false) {
        var writeParens:boolean;

        switch(astNode.type) {

            case 'identifier':
                var identifierNode = <astTypes.IdentifierNode>astNode;
                var variable = identifierNode.variable;
                if(variable) {
                    if(variable.getAccessType() === 'PROP_ACCESS') {
                        this.print(variable.getContainingObjectIdentifier() + '.');
                    }
                    this.print(variable.getJsIdentifier());
                } else {
                    this.print(identifierNode.name);
                }
                // TODO will this ever need to be enclosed in parentheses?
                // How should I be handling this in the general case?
                break;

            case 'binop':
                var binOpNode = <astTypes.BinOpNode>astNode;
                switch(binOpNode.op) {
                    // special-case the dot operator - no brackets!
                    case '.':
                        this.generateExpression(binOpNode.expr1, OpEnum.MEMBER_ACCESS, ops.Location.LEFT);
                        this.print('.');
                        this.generateExpression(binOpNode.expr2, OpEnum.MEMBER_ACCESS, ops.Location.RIGHT);
                        break;

                    case 'div':
                        writeParens = ops.needsParentheses(OpEnum.BITWISE_OR, parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        // Include these parentheses for clarity, even though they are not necessary.
                        this.print('(');
                        this.generateExpression(binOpNode.expr1, OpEnum.DIVISION, ops.Location.LEFT);
                        this.print(' / ');
                        this.generateExpression(binOpNode.expr2, OpEnum.DIVISION, ops.Location.RIGHT);
                        this.print(')|0');
                        writeParens && this.print(')');
                        break;

                    case 'mod':
                        writeParens = ops.needsParentheses(OpEnum.REMAINDER, parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        this.generateExpression(binOpNode.expr1, OpEnum.REMAINDER, ops.Location.LEFT);
                        this.print(' % ');
                        this.generateExpression(binOpNode.expr2, OpEnum.REMAINDER, ops.Location.RIGHT);
                        writeParens && this.print(')');
                        break;

                    case '||':
                        // Implement OR without short-circuit evaluation
                        // Coerce both sides to booleans, add them, coerce that to a boolean, then coerce that to a number
                        writeParens = ops.needsParentheses(OpEnum.BITWISE_OR, parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        this.print('!!(!! ');
                        this.generateExpression(binOpNode.expr1, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' +!! ');
                        this.generateExpression(binOpNode.expr2, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' )|0');
                        writeParens && this.print(')');
                        break;

                    case '&&':
                        // Implement AND without short-circuit evaluation
                        // Coerce both sides to booleans, then multiply them
                        writeParens = ops.needsParentheses(OpEnum.MULTIPLICATION, parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        this.print('!! ');
                        this.generateExpression(binOpNode.expr1, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' *!! ');
                        this.generateExpression(binOpNode.expr2, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' ');
                        writeParens && this.print(')');
                        break;

                    case '^^':
                        // Implement XOR without short-circuit evaluation
                        // Coerce both sides to boolean and "not" them, add them, subtract 1, coerce to boolean and "not", coerce to number
                        writeParens = ops.needsParentheses(OpEnum.BITWISE_OR, parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        this.print('!((! ');
                        this.generateExpression(binOpNode.expr1, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' +! ');
                        this.generateExpression(binOpNode.expr2, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' )-1)|0');
                        writeParens && this.print(')');
                        break;

                    default:
                        // TODO figure out if we need to writeParens. Must create a mapping from binOpNode.op values to OpEnum values.
                        var binOpType = anglToJsOpMap.anglToJsBinOps[binOpNode.op];
                        writeParens = ops.needsParentheses(binOpType, parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        this.generateExpression(binOpNode.expr1, binOpType, ops.Location.LEFT);
                        this.print(' ' + binOpNode.op + ' ');
                        this.generateExpression(binOpNode.expr2, binOpType, ops.Location.RIGHT);
                        writeParens && this.print(')');
                        break;
                }
                break;

            case 'unop':
                var unOpNode = <astTypes.UnOpNode> astNode;
                var unOpType = anglToJsOpMap.anglToJsUnOps[unOpNode.op];
                writeParens = ops.needsParentheses(unOpType, parentExpressionType, locationInParentExpression);
                writeParens && this.print('(');
                this.print(unOpNode.op);
                this.generateExpression(unOpNode.expr, unOpType, ops.Location.RIGHT);
                writeParens && this.print(')');
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
                writeParens && this.print('(');
                this.print(numberNode.val.toString());
                // TODO does toString always produce valid Javascript that will create the exact same number?
                writeParens && this.print(')');
                break;

            case 'string':
                var stringNode = <astTypes.StringNode>astNode;
                this.print(JSON.stringify(stringNode.val));
                // TODO this fails in a select few corner cases.  Use something better,
                // perhaps stolen from the Jade source code
                break;

            case 'index':
                var indexNode = <astTypes.IndexNode>astNode;
                // TODO this needs a lot of work
                // What do we do when index values aren't numbers?  Aren't integers?
                // What about when the array isn't initialized or the target isn't an array?
                writeParens = ops.needsParentheses(OpEnum.SUBSCRIPTING, parentExpressionType, locationInParentExpression);
                writeParens && this.print('(');
                this.generateExpression(indexNode.expr, OpEnum.SUBSCRIPTING, ops.Location.LEFT);
                _.each(indexNode.indexes, (index) => {
                    this.print('[');
                    this.generateExpression(index, OpEnum.SUBSCRIPTING, ops.Location.RIGHT);
                    this.print(']');
                });
                writeParens && this.print(')');
                break;

            case 'funccall':
                var funcCallNode = <astTypes.FuncCallNode>astNode;
                var opType = funcCallNode.isMethodCall ? OpEnum.FUNCTION_CALL : OpEnum.MEMBER_ACCESS;
                this.generateExpression(funcCallNode.expr, opType, ops.Location.LEFT);
                if(funcCallNode.isMethodCall) {
                    // Method calls: `self`/`this` is automatically set to the object to which the method belongs
                    this.print('(');
                } else {
                    // Function calls: Function's `self` and `other` are the local `self` and `other` values
                    this.print('.call(');
                    this.generateExpression({
                        type: 'identifier',
                        variable: astUtils.getAnglScope(funcCallNode).getVariableByIdentifierInChain('self')
                    }, OpEnum.COMMA, ops.Location.N_A);
                }
                _.each(funcCallNode.args, (arg, i, args) => {
                    if(i || !funcCallNode.isMethodCall) this.print(', ');
                    this.generateExpression(arg, OpEnum.COMMA, ops.Location.N_A);
                });
                this.print(')');
                break;

            case 'script':
                var scriptNode = <astTypes.ScriptNode>astNode;
                // Do not write any wrapping parentheses because this is a function literal, not an operator.
                this.print('function(');
                this.print(scriptNode.args.join(', '));
                this.print(') {\n');
                this.indent();
                this.generateLocalVariableAllocation(scriptNode);
                // TODO this part of the AST doesn't seem quite right, suggesting there are
                // possibilities I'm not aware of.
                // These sanity checks will reject anything unexpected.
                /*if(!(_.isObject(astNode.stmts) && _(_.keys(astNode.stmts).sort()).isEqual(['list', 'type']) && astNode.stmts.type === 'statements' && _.isArray(astNode.stmts.list))) {
                 throw new Error('Failed sanity checks on stmts!')
                 }
                 _.each(astNode.stmts.list, generateStatement)*/
                this.generateStatement(scriptNode.stmts);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('}');
                break;

            case 'jsfunccall':
                var jsFuncCallNode = <astTypes.JsFuncCallNode>astNode;
                writeParens = ops.needsParentheses(OpEnum.FUNCTION_CALL, parentExpressionType, locationInParentExpression);
                writeParens && this.print('(');
                this.print(jsFuncCallNode.expr);
                this.print('(');
                _.each(jsFuncCallNode.args, (arg, i) => {
                    if(i) this.print(', ');
                    this.generateExpression(arg, OpEnum.COMMA, ops.Location.N_A);
                });
                this.print(')');
                writeParens && this.print(')');
                break;

            case 'jsexpr':
                var jsExprNode = <astTypes.JsExprNode>astNode;
                // Writing parentheses because we have no idea what the operator is.
                this.print('(');
                this.print(jsExprNode.expr);
                this.print(')');
                break;

            default:
                throw new Error('Unknown expression type: "' + astNode.type + '"');
        }
    }

    generateStatement(astNode, omitTerminator:boolean = false, omitIndentation:boolean = false) {
        if(arguments.length < 2) omitTerminator = false;
        switch(astNode.type) {

            case 'var':
                var varNode = <astTypes.VarDeclarationNode>astNode;
                omitIndentation || this.printIndent();
                this.print('var ');
                _.each(varNode.list, (varItemNode, i, args) => {
                    this.print(varItemNode.name);
                    if(varItemNode.hasOwnProperty('expr')) {
                        this.print(' = ');
                        this.generateExpression(varItemNode.expr);
                    }
                    if(i < args.length - 1) {
                        this.print(', ');
                    }
                });
                break;

            case 'assign':
                var assignNode = <astTypes.AssignNode>astNode;
                omitIndentation || this.printIndent();
                this.generateExpression(assignNode.lval, OpEnum.ASSIGNMENT, ops.Location.LEFT);
                this.print(' = ');
                this.generateExpression(assignNode.rval, OpEnum.ASSIGNMENT, ops.Location.RIGHT);
                break;

            case 'scriptdef':
                var scriptDefNode = <astTypes.ScriptDefNode>astNode;
                omitIndentation || this.printIndent();
                this.generateExpression({
                    type: 'identifier',
                    variable: scriptDefNode.variable
                }, OpEnum.ASSIGNMENT, ops.Location.LEFT);
                this.print(' = function(');
                this.print(scriptDefNode.args.join(', '));
                this.print(') {\n');
                this.indent();
                this.generateLocalVariableAllocation(scriptDefNode);
                // TODO this part of the AST doesn't seem quite right, suggesting there are
                // possibilities I'm not aware of.
                // These sanity checks will reject anything unexpected.
                /*if(!(_.isObject(astNode.stmts) && _(_.keys(astNode.stmts).sort()).isEqual(['list', 'type']) && astNode.stmts.type === 'statements' && _.isArray(astNode.stmts.list))) {
                 throw new Error('Failed sanity checks on stmts!')
                 }
                 _.each(astNode.stmts.list, generateStatement)*/
                this.generateStatement(scriptDefNode.stmts);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('}');
                break;

            case 'const':
                var constNode = <astTypes.ConstNode>astNode;
                omitIndentation || this.printIndent();
                this.generateExpression({
                    type: 'identifier',
                    variable: constNode.variable
                }, OpEnum.ASSIGNMENT, ops.Location.LEFT);
                this.print(' = ');
                this.generateExpression(constNode.expr, OpEnum.ASSIGNMENT, ops.Location.RIGHT);
                break;

            case 'switch':
                var switchNode = <astTypes.SwitchNode>astNode;
                omitIndentation || this.printIndent();
                this.print('switch(');
                this.generateExpression(switchNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
                this.print(') {\n');
                this.indent();
                _.each(switchNode.cases, (caseNode) => {
                    this.generateCase(caseNode);
                });
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('}');
                break;

            case 'for':
                var forNode = <astTypes.ForNode>astNode;
                omitIndentation || this.printIndent();
                this.print('for(');
                this.generateStatement(forNode.initstmt, true, true);
                this.print('; ');
                this.generateExpression(forNode.contexpr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
                this.print('; ');
                this.generateStatement(forNode.stepstmt, true, true);
                this.print(') {\n');
                this.indent();
                // TODO I bet there are some scoping issues I'm not dealing with correctly.
                this.generateStatement(forNode.stmt);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('}');
                break;

            case 'ifelse':
                var ifElseNode = <astTypes.IfElseNode>astNode;
                omitIndentation || this.printIndent();
                this.print('if(');
                this.generateExpression(ifElseNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
                this.print(') {\n');
                this.indent();
                this.generateStatement(ifElseNode.stmt1);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('} else {\n');
                this.indent();
                this.generateStatement(ifElseNode.stmt2);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('}');
                break;

            case 'if':
                var ifNode = <astTypes.IfNode>astNode;
                // This is a special case of ifelse where the else block is empty.
                this.generateStatement({
                    type: 'ifelse',
                    expr: ifNode.expr,
                    stmt1: ifNode.stmt,
                    stmt2: {type: 'nop'}
                }, omitTerminator, omitIndentation);
                break;

            case 'while':
                var whileNode = <astTypes.WhileNode>astNode;
                omitIndentation || this.printIndent();
                this.print('while(');
                this.generateExpression(whileNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
                this.print(') {\n');
                this.indent();
                this.generateStatement(whileNode.stmt);
                this.outdent();
                this.printIndent();
                this.print('}');
                break;

            case 'dountil':
                var doUntilNode = <astTypes.DoUntilNode>astNode;
                omitIndentation || this.printIndent();
                this.print('do {\n');
                this.indent();
                this.generateStatement(doUntilNode.stmt);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('} while(!');
                this.generateExpression(doUntilNode.expr, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                this.print(')');
                break;

            case 'break':
                omitIndentation || this.printIndent();
                this.print('break');
                // TODO are break semantics ever different in Angl than they are in JS?
                break;

            case 'continue':
                omitIndentation || this.printIndent();
                this.print('continue');
                // TODO are continue semantics ever different in Angl than they are in JS?
                break;

            case 'statements':
                var statementsNode = <astTypes.StatementsNode>astNode;
                _.each(statementsNode.list, (statement) => {
                    this.generateStatement(statement);
                });
                break;

            case 'funccall':
            case 'jsfunccall':
                // Delegate to the expression generator
                omitIndentation || this.printIndent();
                this.generateExpression(astNode);
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
                omitIndentation || this.printIndent();
                this.generateExpression(outerOtherIdentifier);
                this.print(' = ' + strings.ANGL_RUNTIME_IDENTIFIER + '.other;\n');
                // Set the new `other` value
                omitIndentation || this.printIndent();
                this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.other = ');
                this.generateExpression(outerSelfIdentifier);
                this.print(';\n');
                // Start the for loop that iterates over all matched instances
                omitIndentation || this.printIndent();
                this.print('for(');
                this.generateExpression(indexIdentifier);
                this.print(' = 0; ');
                this.generateExpression(indexIdentifier);
                this.print(' < ');
                this.generateExpression(allObjectsIdentifier);
                this.print('.length; ');
                this.generateExpression(indexIdentifier);
                this.print('++) {\n');
                this.indent();
                // Assign the value of inner `self`
                omitIndentation || this.printIndent();
                this.generateExpression(innerSelfIdentifier);
                this.print(' = ');
                this.generateExpression(allObjectsIdentifier);
                this.print('[');
                this.generateExpression(indexIdentifier);
                this.print('];\n');
                // Generate all statements within the with loop
                this.generateStatement(withNode.stmt);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('};\n');
                // Restore the outer value of `other`
                omitIndentation || this.printIndent();
                this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.other = ');
                this.generateExpression(outerOtherIdentifier);
                break;

            case 'return':
                var returnNode = <astTypes.ReturnNode>astNode;
                // TODO is there ever a situation where a Javascript 'return' won't do what we want?
                // For example, inside a _.each() iterator function
                omitIndentation || this.printIndent();
                this.print('return (');
                this.generateExpression(returnNode.expr);
                this.print(')');
                break;

            case 'exit':
                // TODO same caveats as 'return'
                omitIndentation || this.printIndent();
                this.print('return');
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
                omitIndentation || this.printIndent();
                this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.createAnglObject(' +
                    JSON.stringify(objectNode.name) + ', ' + JSON.stringify(objectNode.parent) + ', ');
                this.print('function() {\n');
                this.indent();
                // Generate the constructor function
                omitIndentation || this.printIndent();
                this.print(objectExpr + ' = function() { ' + parentObjectExpr + '.apply(this, arguments); };\n');
                // Set up inheritance
                omitIndentation || this.printIndent();
                this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.inherit(' + objectExpr + ', ' + parentObjectExpr + ');\n');
                // Generate the property initialization function
                omitIndentation || this.printIndent();
                this.print(protoExpr + '.' + strings.OBJECT_INITPROPERTIES_METHOD_NAME + ' = ');
                this.generateExpression(objectNode.propertyinitscript);
                this.print(';\n');
                // Generate the create event, if specified
                if(objectNode.createscript) {
                    omitIndentation || this.printIndent();
                    this.print(protoExpr + '.$create = ');
                    this.generateExpression(objectNode.createscript);
                    this.print(';\n');
                }
                // Generate the destroy event, if specified
                if(objectNode.destroyscript) {
                    omitIndentation || this.printIndent();
                    this.print(protoExpr + '.$destroy = ');
                    this.generateExpression(objectNode.destroyscript);
                    this.print(';\n');
                }
                // Generate all methods
                _.each(objectNode.methods, (method) => {
                    omitIndentation || this.printIndent();
                    this.print(protoExpr + '.' + method.methodname + ' = ');
                    this.generateExpression(method);
                    this.print(';\n');
                });
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('})');
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
            this.print(';\n');
        }
    }

    generateCase(astNode) {
        switch(astNode.type) {

            case 'case':
                var caseNode = <astTypes.CaseNode>astNode;
                this.printIndent();
                this.print('case ');
                this.generateExpression(caseNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
                this.print(':\n');
                this.indent();
                this.generateStatement(caseNode.stmts);
                this.outdent();
                break;

            case 'defaultcase':
                var defaultCaseNode = <astTypes.DefaultCaseNode>astNode;
                this.printIndent();
                this.print('default:\n');
                this.indent();
                this.generateStatement(defaultCaseNode.stmts);
                this.outdent();
                break;

            default:
                throw new Error('Unknown case type: "' + astNode.type + '"');
        }
    }

    generateLocalVariableAllocation(astNode) {
        var localVariables = astUtils.getAnglScope(astNode).getVariablesThatMustBeAllocatedInThisScope();
        if(localVariables.length) {
            this.printIndent();
            this.print('var ');
            this.print(_.map(localVariables, (variable) => {
                return variable.getJsIdentifier();
            }).join(', '));
            this.print(';\n');
        }
    }

    generateTopNode(astNode) {
        switch(astNode.type) {

            case 'file':
                var fileNode = <astTypes.FileNode>astNode;
                if(this.options.generateAmdWrapper) {
                    // RequireJS `define()` call
                    this.print('define(function(require, exports, module) {\n');
                    this.indent();
                }
                this.printIndent();
                if(this.options.generateUseStrict) {
                    // Something removes "use strict" from the source code unless I split it up like so.  RequireJS perhaps?
                    this.print('"use' + ' strict";\n');
                }
                // require modules
                this.printIndent();
                this.print('var ' + strings.ANGL_GLOBALS_IDENTIFIER + ' = require(' + JSON.stringify(strings.ANGL_GLOBALS_MODULE) + ');\n');
                this.printIndent();
                this.print('var ' + strings.ANGL_RUNTIME_IDENTIFIER + ' = require(' + JSON.stringify(strings.ANGL_RUNTIME_MODULE) + ');\n');
                fileNode.dependencies.forEach((variable, moduleDescriptor) => {
                    this.printIndent();
                    this.print('var ' + variable.getJsIdentifier() + ' = require(' + JSON.stringify(moduleDescriptor.name) + ');\n');
                });
                // allocate local variables
                this.generateLocalVariableAllocation(fileNode);
                // delegate to the statement generator
                _.each(fileNode.stmts, (node) => {
                    this.generateStatement(node);
                });
                // Export values
                switch(fileNode.moduleDescriptor.exportsType) {
                    case ModuleExportsType.MULTI:
                        // Do nothing.  Multi-exports are directly accessed/assigned as properties
                        // of the exports object (e.g. exports.foo) so they don't need to be exported at
                        // the end of the file.
                        break;

                    case ModuleExportsType.SINGLE:
                        this.printIndent();
                        this.print('module.exports = ');
                        this.generateExpression({
                            type: 'identifier',
                            variable: fileNode.moduleDescriptor.singleExport
                        }, OpEnum.ASSIGNMENT, ops.Location.RIGHT);
                        this.print(';\n');
                        break;

                    default:
                    // Do nothing; apparently this file does not export anything.
                }
                if(this.options.generateAmdWrapper) {
                    this.outdent();
                    this.print('});');
                }
                break;

            default:
                throw new Error('Unknown root node type: "' + astNode.type + '"');
        }
    }
}

export function generateJs(transformedAst: astTypes.AstNode, options: options.Options) {
    var generator = new JsGenerator(options);
    generator.initialize();
    generator.generateTopNode(transformedAst);
    return generator.getCode();
}

