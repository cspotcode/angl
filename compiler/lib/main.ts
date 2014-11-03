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
import pathUtils = require('./path-utils');
import scopeVariable = require('./scope-variable');
import scope = require('./angl-scope');
import FastSet = require('collections/fast-set');

export class JsGenerator {
    
    private buffer: Array<any>;
    private indentationLevel: number;
    private options: options.Options;
    private indentationString: string;
    private spacer: string;
    private skipCommentNewlines: number;
    
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
        this.spacer = null;
        this.skipCommentNewlines = 0;

        // tracking usages of global variables
        this._referencedGlobalVariables = new FastSet<scopeVariable.AbstractVariable>();
        this._globalScope = null;
    }
    
    print(text: string) {
        this.spacer = '';
        // outputting non-whitespace resets the whitespace-skipping counter
        if(/\S/.test(text)) this.skipCommentNewlines = 0;
        this.buffer.push(text);
    }

    /**
     * Like `print`, but the text is considered a "spacer."
     * Adjacent spacers can be collapsed together and leading spacers at the beginning of a
     * file are never printed.
     * This is useful for putting blank lines between chunks of code that may or may not be empty.
     * For example, the following code will only print a single newline:
     * 
     *     this.printSpacer('\n');
     *     this.printSpacer('\n');
     * 
     * ...but this will print two newlines, one before the comment and one after:
     * 
     *     this.printSpacer('\n');
     *     this.print('// whoa\n');
     *     this.printSpacer('\n');
     * 
     * Note: at the moment, the collapsing logic is really primitive and only works for simple cases.
     */
    printSpacer(text: string) {
        // If at the beginning of the file, do not print spacer.
        if(this.spacer == null) return;
        if(this.spacer.length >= text.length && this.spacer.slice(0, text.length) === text) {
            // skip this new text; it is entirely contained in the already-printed spacer
            return;
        }
        if(this.spacer.length < text.length && this.spacer === text.slice(0, this.spacer.length)) {
            // only some of the text is new; the rest has already been printed
            var textToPrint = text.slice(this.spacer.length);
            this.spacer += textToPrint;
            this.buffer.push(textToPrint);
            return;
        }
        this.buffer.push(text);
    }

    /**
     * Uses printSpacer to print a blank line
     */
    printSpacerLine(omitIndentation: boolean = false) {
        this.printSpacer((omitIndentation ? '' : this.indentString()) + '\n');
        this.skipCommentNewlines++;
    }

    indent() {
        this.indentationLevel++;
        this.skipCommentNewlines++;
    }

    outdent() {
        this.indentationLevel--;
        if(this.indentationLevel < 0) {
            throw new Error('Tried to outdent too far.');
        }
        this.skipCommentNewlines++;
    }

    indentString(additional: number = 0) {
        var ret = '';
        _.times(this.indentationLevel + additional, () => {
            ret += this.indentationString;
        });
        return ret;
    }
    
    printIndent(additional?: number) {
        this.print(this.indentString(additional));
    }

    /**
     * Print all comments that should occur immediately before this node.
     */
    beginNode(node: astTypes.AstNode, context: CommentContext) {
        if(node.comments) {
            this._printComments(node.comments.before, context);
        }
    }

    /**
     * Print all comments that should occur immediately after this node.
     */
    endNode(node: astTypes.AstNode, context: CommentContext) {
        if(node.comments) {
            this._printComments(node.comments.after, context);
        }
    }
    
    _printComments(comments: Array<astTypes.CommentNode>, context: CommentContext) {
        // Pluck the text from all comments
        var commentsArray = <Array<string>>_.map(comments, (comment) => comment.text);
        
        
        // If context is TRAILING, omit a single trailing newline (cuz the code generator will output one anyway)
        // If context is NEWLINE, do the same thing, cuz our comment printing logic (below) is hard-coded to output a
        // trailing newline.
        var lastComment = _.last(commentsArray);
        if((context === CommentContext.TRAILING || context === CommentContext.NEWLINE) && lastComment && _.last(lastComment) === '\n') {
            commentsArray.pop();
            lastComment = lastComment.slice(0, -1);
            if(lastComment.length) commentsArray.push(lastComment);
        }
        
        // Replace all C++-style comments that are not followed by a newline with C-style comments
        commentsArray = _.map(commentsArray, (comment, i) => {
            // skip if not a C++-style comment
            if(comment[1] != '/') return comment;
            
            // If:
            //     the next comment is a newline
            // ...or...
            //     we're TRAILING or NEWLINE and looking at the last comment
            // ...then we don't need to rewrite the comment
            var nextComment = commentsArray[i + 1];
            if(       nextComment != null
                    ? nextComment[0] === '\n'
                    : ((context === CommentContext.TRAILING || context === CommentContext.NEWLINE) && i === commentsArray.length - 1)) {
                return comment;
            }
            
            // transform the C++-style comment into a C-style comment
            return '/*' + comment.slice(2).replace(/\*\//g, '* /') + '*/';
        });
        
        // Convert all comments into an array with one string for every line of comment / whitespace
        var commentsCombined = commentsArray.join('');
        var commentLines = commentsCombined.length ? commentsCombined.split('\n') : [];
        
        // Sometimes we skip a certain number of leading newlines
        while(this.skipCommentNewlines && commentLines[0] === '') {
            commentLines.shift();
            this.skipCommentNewlines--;
        }
        
        // When outputting a TRAILING comment, put a space between the comment and the preceding code
        if(context === CommentContext.TRAILING && commentLines[0]) {
            commentLines[0] = ' ' + commentLines[0];
        }
        
        // When outputting a leading comment in NEWLINE_INDENTED context, put a space between the comment and the following code
        if(context === CommentContext.NEWLINE_INDENTED && _.last(commentLines)) {
            commentLines[commentLines.length - 1] = commentLines[commentLines.length - 1] + ' ';
        }
        
        // For INLINE comments, any lines after the first should use a hanging indent.
        // Otherwise, use a normal indentation level
        var indentation = context === CommentContext.INLINE ? 2 : 0;

        for(var i = 0, l = commentLines.length; i < l; i++) {
            // prefix a newline if this isn't the first line of comments
            if(i) {
                this.print('\n');
            }
            // In NEWLINE context, print leading indentation on all lines.
            // In all other contexts, print leading indentation on all lines except the first.
            if(context === CommentContext.NEWLINE || i) {
                this.printIndent(indentation);
            }
            this.print(commentLines[i]);
        }
        
        // When in NEWLINE context, we *must* leave the code in the same state we found it: after a newline with no indentation
        // or anything else on the line.
        // Therefore we always print a trailing newline.
        if(context === CommentContext.NEWLINE) {
            this.print('\n');
        }
    }
    
    getCode() {
        return _.flatten(this.buffer).join('');
    }
    
    codeForStringLiteral(value: string) {
        var code = JSON.stringify(value);
        if(this.options.stringQuoteStyle === options.StringQuoteStyle.SINGLE) {
            code = "'" + code.slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'") + "'";
        }
        return code;
    }
    
    getOptions(): options.Options {
        return this.options;
    }
    
    _referencedGlobalVariables: FastSet<scopeVariable.AbstractVariable>;
    _globalScope: scope.AnglScope;

    /**
     * Call this with every variable that is referenced in the output code
      */
    logReferenceToVariable(variable) {
        if(this._globalScope.hasVariable(variable)) {
            this._referencedGlobalVariables.add(variable);
        }
    }
    
    getReferencedGlobalVariables(): Array<scopeVariable.AbstractVariable> {
        return this._referencedGlobalVariables.toArray();
    }
    
    generateVariable(variable: scopeVariable.AbstractVariable, parentExpressionType: ops.JavascriptOperatorsEnum = OpEnum.GROUPING, locationInParentExpression: ops.Location = ops.Location.N_A, commentContext: CommentContext = CommentContext.INLINE, omitIndentation: boolean = false) {
        var identifierNode: astTypes.IdentifierNode = {
            type: 'identifier',
            variable: variable
        };
        this.generateExpression(identifierNode, parentExpressionType, locationInParentExpression, commentContext, omitIndentation);
    }

    // TODO properly translate all binops and unops:
    //   ones that GML has that JS doesn't have
    //   ones with different behavior that need to be implemented differently
    //   DIV, MOD, ^^, bitwise ops
    //   how does GML do type coercion (42 + "hello world")?  Do I need to emulate that behavior?
    generateExpression(astNode: astTypes.ExpressionNode, parentExpressionType: ops.JavascriptOperatorsEnum = OpEnum.GROUPING, locationInParentExpression: ops.Location = ops.Location.N_A, beforeCommentContext: CommentContext = CommentContext.INLINE, omitIndentation: boolean = false, callBeginNode: boolean = true, callEndNode: boolean = true) {
        var writeParens:boolean;
        
        callBeginNode && this.beginNode(astNode, beforeCommentContext);

        switch(astNode.type) {

            case 'identifier':
                var identifierNode = <astTypes.IdentifierNode>astNode;
                var variable = identifierNode.variable;
                // Some variables implement custom code generators to write the JS code for getting, settings, and/or
                // invoking the variable as a function.
                // If we are dealing with one such variable, and we've reached this point, assume that we are generating
                // code to get the value of this expression. (not set, not invoke)
                // The other two cases (setting the value and invoking the variable as a function) are handled elsewhere
                // and prevent this code path from being executed.
                var writeDefaultGetter = true;

                if(variable) {
                    if(this.options.trackReferencedGlobalVariables) {
                        this.logReferenceToVariable(variable);
                    }
                    writeDefaultGetter = !variable.generateGetter(this, parentExpressionType, locationInParentExpression, identifierNode);
                }
                if(writeDefaultGetter) {
                    if(variable) {
                        if(variable.getAccessType() === 'PROP_ACCESS') {
                            this.print(variable.getContainingObjectIdentifier() + '.');
                        }
                        this.print(variable.getJsIdentifier());
                    } else {
                        this.print(identifierNode.name);
                    }
                }
                // TODO will this ever need to be enclosed in parentheses?
                // How should I be handling this in the general case?
                break;

            case 'binop':
                var binOpNode = <astTypes.BinOpNode>astNode;
                var shortCircuit = this.options.generateShortCircuitBooleanLogic;
                var coerceToNumber = this.options.coerceBooleanLogicToNumber;
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
                        // To implement OR without short-circuit evaluation, we:
                        // Coerce both sides to booleans, add them, coerce that to a boolean, then coerce that to a number
                        var opts:Array<any> = shortCircuit ? coerceToNumber ? [OpEnum.BITWISE_OR,  OpEnum.LOGICAL_OR,  ops.Location.LEFT,  OpEnum.LOGICAL_OR,  ops.Location.RIGHT, '( ',  ' || ',  ' )|0']
                                                                            : [OpEnum.LOGICAL_OR,  OpEnum.LOGICAL_OR,  ops.Location.LEFT,  OpEnum.LOGICAL_OR,  ops.Location.RIGHT, '',    ' || ',  ''    ]
                                                           : coerceToNumber ? [OpEnum.BITWISE_OR,  OpEnum.LOGICAL_NOT, ops.Location.RIGHT, OpEnum.LOGICAL_NOT, ops.Location.RIGHT, '!(! ', ' *! ', ' )|0']
                                                                            : [OpEnum.LOGICAL_NOT, OpEnum.LOGICAL_NOT, ops.Location.RIGHT, OpEnum.LOGICAL_NOT, ops.Location.RIGHT, '!(! ', ' *! ', ' )'  ],
                        writeParens = ops.needsParentheses(opts[0], parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        this.print(opts[5]);
                        this.generateExpression(binOpNode.expr1, opts[1], opts[2]);
                        this.print(opts[6]);
                        this.generateExpression(binOpNode.expr2, opts[3], opts[4]);
                        this.print(opts[7]);
                        writeParens && this.print(')');
                        break;

                    case '&&':
                        // To implement AND without short-circuit evaluation, we:
                        // Coerce both sides to booleans, then multiply them
                        var opts:Array<any> = shortCircuit ? coerceToNumber ? [OpEnum.BITWISE_OR,     OpEnum.LOGICAL_AND, ops.Location.LEFT,  OpEnum.LOGICAL_AND, ops.Location.RIGHT, '( ',  ' && ',  ' )|0']
                                                                            : [OpEnum.LOGICAL_AND,    OpEnum.LOGICAL_AND, ops.Location.LEFT,  OpEnum.LOGICAL_AND, ops.Location.RIGHT, '',    ' && ',  ''    ]
                                                           : coerceToNumber ? [OpEnum.MULTIPLICATION, OpEnum.LOGICAL_NOT, ops.Location.RIGHT, OpEnum.LOGICAL_NOT, ops.Location.RIGHT, '!! ', ' *!! ', ''    ]
                                                                            : [OpEnum.LOGICAL_NOT,    OpEnum.LOGICAL_NOT, ops.Location.RIGHT, OpEnum.LOGICAL_NOT, ops.Location.RIGHT, '!(! ', ' +! ', ' )'  ],
                        writeParens = ops.needsParentheses(opts[0], parentExpressionType, locationInParentExpression);
                        writeParens && this.print('(');
                        this.print(opts[5]);
                        this.generateExpression(binOpNode.expr1, opts[1], opts[2]);
                        this.print(opts[6]);
                        this.generateExpression(binOpNode.expr2, opts[3], opts[4]);
                        this.print(opts[7]);
                        writeParens && this.print(')');
                        break;

                    case '^^':
                        // Implement XOR without short-circuit evaluation
                        // Coerce both sides to boolean and "not" them, add them, subtract 1, coerce to boolean and "not", coerce to number
                        writeParens = ops.needsParentheses(
                            coerceToNumber ? OpEnum.BITWISE_OR : OpEnum.LOGICAL_NOT,
                            parentExpressionType,
                            locationInParentExpression);
                        writeParens && this.print('(');
                        this.print('!(! ');
                        this.generateExpression(binOpNode.expr1, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' +! ');
                        this.generateExpression(binOpNode.expr2, OpEnum.LOGICAL_NOT, ops.Location.RIGHT);
                        this.print(' -1)');
                        coerceToNumber && this.print('|0');
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
                var unOpType = anglToJsOpMap.anglToJsUnOps[unOpNode.op];this.options
                var coerceToNumber = this.options.coerceBooleanLogicToNumber;
                // Special case: for the ! (not) operator, we might need to coerce the output to a number.
                writeParens = ops.needsParentheses(
                    unOpNode.op === '!' && coerceToNumber ? OpEnum.BITWISE_OR : unOpType,
                    parentExpressionType,
                    locationInParentExpression);
                writeParens && this.print('(');
                this.print(unOpNode.op);
                this.generateExpression(unOpNode.expr, unOpType, ops.Location.RIGHT);
                unOpNode.op === '!' && coerceToNumber && this.print('|0');
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
                this.print(this.codeForStringLiteral(stringNode.val));
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
                var funcIdentifierNode = <astTypes.IdentifierNode>funcCallNode.expr;
                var mustBindThis =
                    !(funcCallNode.isMethodCall
                      || (funcIdentifierNode.type === 'identifier'
                          && funcIdentifierNode.variable
                          && !funcIdentifierNode.variable.getUsesThisBinding()));
                var opType = mustBindThis ? OpEnum.MEMBER_ACCESS : OpEnum.FUNCTION_CALL;
                /**
                 * Should we generate our regular function invocation code?  Maybe not if the variable decides
                 * to generate the code itself.
                 */
                var writeDefaultInvocation = true;
                if(funcCallNode.expr.type === 'identifier') {
                    if(funcIdentifierNode.variable) {
                        writeDefaultInvocation = !funcIdentifierNode.variable.generateInvocation(funcCallNode.args, this, parentExpressionType, locationInParentExpression, funcIdentifierNode);
                    }
                }
                if(writeDefaultInvocation) {
                    this.generateExpression(funcCallNode.expr, opType, ops.Location.LEFT, beforeCommentContext);
                    if(!mustBindThis) {
                        // Method calls: `self`/`this` is automatically set to the object to which the method belongs
                        this.print('(');
                    } else {
                        // Function calls: Function's `self` and `other` are the local `self` and `other` values
                        this.print('.call(');
                        this.generateVariable(
                            astUtils.getAnglScope(funcCallNode).getVariableByIdentifierInChain('self'),
                            OpEnum.COMMA,
                            ops.Location.N_A
                        );
                    }
                    _.each(funcCallNode.args, (arg, i, args) => {
                        if(i || mustBindThis) this.print(', ');
                        this.generateExpression(arg, OpEnum.COMMA, ops.Location.N_A);
                    });
                    this.print(')');
                }
                break; 

            case 'script':
                var scriptNode = <astTypes.ScriptNode>astNode;
                // Do not write any wrapping parentheses because this is a function literal, not an operator.
                this.generateFunction(scriptNode);
                break;

            case 'jsfunccall':
                var jsFuncCallNode = <astTypes.JsFuncCallNode>astNode;
                writeParens = ops.needsParentheses(OpEnum.FUNCTION_CALL, parentExpressionType, locationInParentExpression);
                var writeParensAroundFuncExpr = ops.needsParentheses(jsFuncCallNode.op, OpEnum.FUNCTION_CALL, ops.Location.RIGHT);
                writeParens && this.print('(');
                writeParensAroundFuncExpr && this.print('(');
                this.print(jsFuncCallNode.expr);
                writeParensAroundFuncExpr && this.print(')');
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
                writeParens = ops.needsParentheses(jsExprNode.op, parentExpressionType, locationInParentExpression);
                writeParens && this.print('(');
                this.print(jsExprNode.expr);
                writeParens && this.print(')');
                break;

            default:
                throw new Error('Unknown expression type: "' + astNode.type + '"');
        }
        
        callEndNode && this.endNode(astNode, CommentContext.INLINE);
    }
    
    generateFunction(astNode: astTypes.AbstractArgsInvokableNode, writeFunctionKeyword: boolean = true, functionName?: string) {
        // This function can generate a function for either a 'script' or 'scriptdef' node
        if(!_.contains(['script', 'scriptdef'], astNode.type)) throw new Error('Expected "script" or "scriptdef" node; got "' + astNode.type + '" node.');

        var scriptNode = <astTypes.ScriptNode>astNode;
        // Do not write any wrapping parentheses because this is a function literal, not an operator.
        if(writeFunctionKeyword) this.print('function');
        if(writeFunctionKeyword && functionName) this.print(' ');
        if(functionName) this.print(functionName);
        this.print('(');
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
        this.printIndent();
        this.print('}');
    }

    generateStatement(astNode, omitTerminator:boolean = false, omitIndentation:boolean = false) {
        
        switch(astNode.type) {

            case 'var':
                var varNode = <astTypes.VarDeclarationNode>astNode;
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
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
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                // Should we generate our ordinary setter code?  Maybe not if the variable
                // decides to generate its own setter code.
                var writeDefaultSetter = true;
                // Is the lval a variable?
                if(assignNode.lval.type === 'identifier') {
                    var lvalIdentifierNode = <astTypes.IdentifierNode>assignNode.lval;
                    // It may have custom setter logic
                    if(lvalIdentifierNode.variable) {
                        writeDefaultSetter = !lvalIdentifierNode.variable.generateSetter(assignNode.rval, this, lvalIdentifierNode);
                    }
                }
                if(writeDefaultSetter) {
                    this.generateExpression(assignNode.lval, OpEnum.ASSIGNMENT, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                    this.print(' = ');
                    this.generateExpression(assignNode.rval, OpEnum.ASSIGNMENT, ops.Location.RIGHT);
                }
                break;

            case 'scriptdef':
                var scriptDefNode = <astTypes.ScriptDefNode>astNode;
                omitIndentation || this.printIndent();
                this.beginNode(scriptDefNode, CommentContext.NEWLINE_INDENTED);
                if(this.options.generateTypeScript) {
                    if(scriptDefNode.exported) this.print('export ');
                    this.generateFunction(scriptDefNode, true, scriptDefNode.variable.getJsIdentifier());
                } else {
                    this.generateVariable(scriptDefNode.variable, OpEnum.ASSIGNMENT, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                    this.print(' = ');
                    this.generateFunction(scriptDefNode);
                }
                break;

            case 'const':
                var constNode = <astTypes.ConstNode>astNode;
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                if(this.options.generateTypeScript) {
                    if(constNode.exported)
                        this.print('export ');
                    this.print('var ');
                }
                this.generateVariable(constNode.variable, OpEnum.ASSIGNMENT, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                this.print(' = ');
                this.generateExpression(constNode.expr, OpEnum.ASSIGNMENT, ops.Location.RIGHT);
                break;

            case 'switch':
                var switchNode = <astTypes.SwitchNode>astNode;
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
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
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
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
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                this.print('if(');
                this.generateExpression(ifElseNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
                this.print(') {\n');
                this.indent();
                this.generateStatement(ifElseNode.stmt1);
                this.outdent();
                omitIndentation || this.printIndent();
                if(ifElseNode.stmt2) {
                    this.print('} else {\n');
                    this.indent();
                    this.generateStatement(ifElseNode.stmt2);
                    this.outdent();
                    omitIndentation || this.printIndent();
                }
                this.print('}');
                break;

            case 'while':
                var whileNode = <astTypes.WhileNode>astNode;
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
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
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
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
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                this.print('break');
                // TODO are break semantics ever different in Angl than they are in JS?
                break;

            case 'continue':
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                this.print('continue');
                // TODO are continue semantics ever different in Angl than they are in JS?
                break;

            case 'statements':
                var statementsNode = <astTypes.StatementsNode>astNode;
                this.beginNode(astNode, CommentContext.NEWLINE);
                _.each(statementsNode.list, (statement) => {
                    this.generateStatement(statement);
                });
                break;

            case 'funccall':
            case 'jsfunccall':
                // Delegate to the expression generator
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                this.generateExpression(astNode, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A, CommentContext.NEWLINE_INDENTED, false, false, false);
                break;

            case 'with':
                var withNode = <astTypes.WithNode>astNode;
                var withScope = astUtils.getAnglScope(withNode);
                var parentScope = astUtils.getAnglScope(withNode.parentNode);
                var innerSelfVariable = withScope.getVariableByIdentifier('self');
                var outerSelfVariable = parentScope.getVariableByIdentifierInChain('self');
                var outerOtherVariable = parentScope.getVariableByIdentifierInChain('other');
                var outerOtherCacheVariable = withNode.outerOtherVariable;
                var mustCacheOuterOther = outerOtherVariable.getContainingObjectIdentifier() === strings.ANGL_RUNTIME_IDENTIFIER;
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                // Cache the outer `other` value if necessary.
                // If the outerOtherVariable isn't $ART.other, there's no need to cache its value.
                // For example, if the outerOtherVariable is 
                if(mustCacheOuterOther) {
                    this.generateVariable(outerOtherCacheVariable);
                    this.print(' = ');
                    this.generateVariable(outerOtherVariable);
                    this.print(';\n');
                    omitIndentation || this.printIndent();
                }
                // Set the new `other` value
                if(withNode.innerOtherVariable.getJsIdentifier() !== 'this' && withScope.getVariableIsUsed(withNode.innerOtherVariable)) {
                    this.generateVariable(withNode.innerOtherVariable);
                    this.print(' = ');
                }
                this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.other = ');
                this.generateVariable(outerSelfVariable);
                this.print(';\n');
                // Start the while loop that iterates over all matching objects
                omitIndentation || this.printIndent();
                this.print('while(');
                // Assign the value of inner `self` to the next object returned by the iterator
                this.generateVariable(innerSelfVariable);
                this.print(' = ');
                this.generateVariable(withNode.allObjectsVariable);
                this.print('.next()) {\n');
                this.indent();
                // Generate all statements within the with loop
                this.generateStatement(withNode.stmt);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print('}\n');
                // Restore the outer value of `other`
                omitIndentation || this.printIndent();
                this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.other = ');
                this.generateVariable(mustCacheOuterOther ? outerOtherCacheVariable : outerOtherVariable);
                break;

            case 'return':
                var returnNode = <astTypes.ReturnNode>astNode;
                // TODO is there ever a situation where a Javascript 'return' won't do what we want?
                // For example, inside a _.each() iterator function
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                this.print('return');
                if(returnNode.expr) {
                    this.print(' ');
                    this.generateExpression(returnNode.expr, OpEnum.WRAPPED_IN_PARENTHESES, ops.Location.N_A);
                }
                break;

            case 'exit':
                // TODO same caveats as 'return'
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                this.print('return');
                break;

            case 'object':
                var objectNode = <astTypes.ObjectNode>astNode;
                var objectExpr = {
                    type: 'identifier',
                    variable: objectNode.variable
                };
                /*var protoExpr = objectExpr + '.prototype';*/
                var parentObjectExpr = /*strings.ANGL_GLOBALS_IDENTIFIER + '.' + objectNode.parent;*/objectNode.parentIdentifier;
                var protoExpr = {
                    type: 'binop',
                    op: '.',
                    expr1: objectExpr,
                    expr2: {
                        type: 'identifier',
                        name: 'prototype'
                    }
                };
                
                // Wrap object creation within a closure, and pass that closure into the proper runtime method.
                // The Angl runtime will take care of creating objects in the proper order, so that the parent object
                // already exists.
                omitIndentation || this.printIndent();
                this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                if(this.options.generateTypeScript) {
                    if(objectNode.exported) this.print('export ');
                    this.print('class ');
                    this.generateVariable(objectNode.variable);
                    this.print(' extends ');
                    this.generateExpression(objectNode.parentIdentifier);
                    this.print(' {\n');
                    // TODO properly import the parent
                    // TODO properly output the local variable name of the parent
                } else {
                    this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.createAnglObject(' +
                        this.codeForStringLiteral(objectNode.name) + ', ' + this.codeForStringLiteral(objectNode.parent) + ', ');
                    this.print('function() {\n');
                }
                this.indent();
                this.printSpacerLine(omitIndentation);
                // Generate declarations for additional class members
                var fileNode = <astTypes.FileNode>astUtils.findParent(objectNode, 'file');
                var additionalClassMembers: Array<string>;
                // Only do this in TypeScript, if the object is globally exported, and if an array of additional class members exists.
                if(this.options.generateTypeScript && (objectNode.exported || fileNode.moduleDescriptor.singleExport === objectNode.variable) && (additionalClassMembers = this.options.additionalClassMembers[objectNode.variable.getJsIdentifier()])) {
                    _.each(additionalClassMembers, (memberName) => {
                        omitIndentation || this.printIndent();
                        this.print(memberName);
                        this.print(';\n');
                    });
                }
                this.printSpacerLine(omitIndentation);
                // Generate the constructor function
                if(this.options.generateTypeScript) {
                    // TypeScript will generate the necessary constructor as long as we omit it.
                } else {
                    omitIndentation || this.printIndent();
                    this.generateExpression(objectExpr, OpEnum.ASSIGNMENT, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                    this.print(' = function() { ');
                    this.generateExpression(parentObjectExpr);
                    this.print('.apply(this, arguments); };\n');
                }
                // blank line
                this.printSpacerLine(omitIndentation);
                // Set up inheritance
                if(!this.options.generateTypeScript) {
                    omitIndentation || this.printIndent();
                    this.print(strings.ANGL_RUNTIME_IDENTIFIER + '.inherit(');
                    this.generateExpression(objectExpr);
                    this.print(', ');
                    this.generateExpression(parentObjectExpr);
                    this.print(');\n');
                }
                // blank line
                this.printSpacerLine(omitIndentation);
                // Generate the property initialization function
                omitIndentation || this.printIndent();
                if(this.options.generateTypeScript) {
                    this.generateFunction(objectNode.propertyinitscript, false, strings.OBJECT_INITPROPERTIES_METHOD_NAME);
                    this.print('\n');
                } else {
                    this.generateExpression(protoExpr, OpEnum.MEMBER_ACCESS, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                    this.print('.' + strings.OBJECT_INITPROPERTIES_METHOD_NAME + ' = ');
                    this.generateExpression(objectNode.propertyinitscript);
                    this.print(';\n');
                }
                // blank line
                this.printSpacerLine(omitIndentation);
                // Generate the create event, if specified
                if(objectNode.createscript) {
                    omitIndentation || this.printIndent();
                    this.beginNode(objectNode.createscript, CommentContext.NEWLINE_INDENTED);
                    if(this.options.generateTypeScript) {
                        this.generateFunction(objectNode.createscript, false, '$create');
                    } else {
                        this.generateExpression(protoExpr, OpEnum.MEMBER_ACCESS, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                        this.print('.$create = ');
                        this.generateExpression(objectNode.createscript);
                        this.print(';');
                    }
                    this.endNode(objectNode.createscript, CommentContext.TRAILING);
                    this.print('\n');
                }
                // blank line
                this.printSpacerLine(omitIndentation);
                // Generate the destroy event, if specified
                if(objectNode.destroyscript) {
                    omitIndentation || this.printIndent();
                    this.beginNode(objectNode.destroyscript, CommentContext.NEWLINE_INDENTED);
                    if(this.options.generateTypeScript) {
                        this.generateFunction(objectNode.destroyscript, false, '$destroy');
                    } else {
                        this.generateExpression(protoExpr, OpEnum.MEMBER_ACCESS, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                        this.print('.$destroy = ');
                        this.generateExpression(objectNode.destroyscript);
                        this.print(';');
                    }
                    this.endNode(objectNode.destroyscript, CommentContext.TRAILING);
                    this.print('\n');
                }
                // Generate all methods
                _.each(objectNode.methods, (method) => {
                    // blank line
                    this.printSpacerLine(omitIndentation);
                    omitIndentation || this.printIndent();
                    this.beginNode(method, CommentContext.NEWLINE_INDENTED);
                    if(this.options.generateTypeScript) {
                        this.generateFunction(method, false, method.methodname);
                    } else {
                        this.generateExpression(protoExpr, OpEnum.MEMBER_ACCESS, ops.Location.LEFT, CommentContext.NEWLINE_INDENTED);
                        this.print('.' + method.methodname + ' = ');
                        this.generateExpression(method);
                        this.print(';');
                    }
                    this.endNode(method, CommentContext.TRAILING);
                    this.print('\n');
                });
                // blank line
                this.printSpacerLine(omitIndentation);
                this.outdent();
                omitIndentation || this.printIndent();
                this.print(this.options.generateTypeScript ? '}' : '})');
                break;

            case 'nop':
                // No-ops don't do anything.  I'm assuming they never trigger any behavior by
                // "separating" adjacent statements.
                
                if(astNode.comments.before.length || astNode.comments.after.length) {
                    omitIndentation || this.printIndent();
                    this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
                }
                break;

            default:
                throw new Error('Unknown statement type: "' + astNode.type + '"');
        }
        // Statements are terminated by a semicolon and a newline
        // except for a few exceptions.
        // Also, in certain contexts we want to omit this termination
        // (e.g., initializer statement of a for loop)
        if(!_.contains(['nop', 'statements', 'ifelse', 'while', 'for', 'switch'], astNode.type)
                && (!this.options.generateTypeScript || !_.contains(['scriptdef', 'object'], astNode.type))
                && !omitTerminator)
            this.print(';');
        
        //if(!_.contains(['if'], astNode.type))
            this.endNode(astNode, CommentContext.TRAILING);
        
        if(!_.contains(['statements'], astNode.type)
                && !(astNode.type === 'nop' && !astNode.comments.before.length && !astNode.comments.after.length)
                && !omitTerminator)
            this.print('\n');
        
    }

    generateCase(astNode) {
        
        this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
        
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
        
        this.endNode(astNode, CommentContext.NEWLINE_INDENTED);
        
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
        
        this.beginNode(astNode, CommentContext.NEWLINE_INDENTED);
        
        switch(astNode.type) {

            case 'file':
                // Tracking usages of global variables
                this._globalScope = astNode.globalAnglScope;

                var fileNode = <astTypes.FileNode>astNode;
                if(this.options.typeScriptReferencePath) {
                    this.print('/// <reference path="');
                    this.print(pathUtils.relativeModule(fileNode.moduleDescriptor.name, this.options.typeScriptReferencePath));
                    this.print('" />\n');
                }
                if(this.options.generateAmdWrapper) {
                    // RequireJS `define()` call
                    this.print('define(function(require, exports, module) {\n');
                    this.indent();
                }
                if(this.options.generateUseStrict) {
                    this.printIndent();
                    // Something removes "use strict" from the source code unless I split it up like so.  RequireJS perhaps?
                    this.print('"use' + ' strict";\n');
                }
                this.printSpacerLine();
                // require modules
                this.printIndent();
                this.print(this.options.generateTypeScript ? 'import ' : 'var ');
                this.print(strings.ANGL_GLOBALS_IDENTIFIER + ' = require(' + this.codeForStringLiteral(strings.ANGL_GLOBALS_MODULE) + ');\n');
                this.printIndent();
                this.print(this.options.generateTypeScript ? 'import ' : 'var ');
                this.print(strings.ANGL_RUNTIME_IDENTIFIER + ' = require(' + this.codeForStringLiteral(strings.ANGL_RUNTIME_MODULE) + ');\n');
                fileNode.dependencies.forEach((variable, moduleDescriptor) => {
                    this.printIndent();
                    this.print(this.options.generateTypeScript ? 'import ' : 'var ');
                    this.print(variable.getJsIdentifier() + ' = require(');
                    this.print(this.codeForStringLiteral(moduleDescriptor.isRelative ? pathUtils.relativeModule(fileNode.moduleDescriptor.name, moduleDescriptor.name) : moduleDescriptor.name));
                    this.print(');\n');
                });
                // blank line
                this.printSpacerLine();
                // allocate local variables
                this.generateLocalVariableAllocation(fileNode);
                // blank line
                this.printSpacerLine();
                // delegate to the statement generator
                _.each(fileNode.stmts, (node) => {
                    this.generateStatement(node);
                });
                // blank line
                this.printSpacerLine();
                // Export values
                switch(fileNode.moduleDescriptor.exportsType) {
                    case ModuleExportsType.MULTI:
                        // Do nothing.  Multi-exports are directly accessed/assigned as properties
                        // of the exports object (e.g. exports.foo) so they don't need to be exported at
                        // the end of the file.
                        break;

                    case ModuleExportsType.SINGLE:
                        this.printIndent();
                        this.print(this.options.generateTypeScript ? 'export = ' : 'module.exports = ');
                        this.generateVariable(
                            fileNode.moduleDescriptor.singleExport,
                            OpEnum.ASSIGNMENT,
                            ops.Location.RIGHT
                        );
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
        
        this.endNode(astNode, CommentContext.NEWLINE_INDENTED);
        
    }
}

export function generateCode(transformedAst: astTypes.AstNode, options: options.Options) {
    return generate(transformedAst, options).code;
}

export function generate(transformedAst: astTypes.AstNode, options: options.Options): GenerationResult {
    var generator = new JsGenerator(options);
    generator.initialize();
    generator.generateTopNode(transformedAst);
    var result: GenerationResult = {
        code: generator.getCode()
    };
    if(options.trackReferencedGlobalVariables)
        result.referencedGlobalVariables = generator.getReferencedGlobalVariables();
    return result;
}

/**
 * The result of generating code from a transformed AST.
 */
export interface GenerationResult {
    code: string;
    referencedGlobalVariables?: Array<scopeVariable.AbstractVariable>;
}

/**
 * Syntactic context in which comments are being printed.
 * In other words, where in the surrounding code are comments being inserted?
 * This tells the comment generator how to handle newlines and indentation so that the comments fit into the
 * surrounding code, everything is indented sensibly, and there aren't too many blank lines.
 */
export enum CommentContext {
    /**
     * After a line of code, immediately before a newline will be generated.
     * For example, after the semicolon at the end of a line.
     */
    TRAILING,
    /**
     * Between bits of code within a single line.
     * For example, between numbers in a math expression.
     */
    INLINE,
    /**
     * Immediately following a newline and leading indentation.
     */
    NEWLINE_INDENTED,
    /**
     * Immediately following a newline, not indented.  The comment printer *must* output a trailing newline after all
     * comments.
     */
    NEWLINE
}

