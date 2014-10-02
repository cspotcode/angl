/* lexical grammar */
%lex

%%
\s+\n                   %{
                            yy.saveComment(yytext, yylloc);
                        %}
\s+                     %{
                            /* skip whitespace */
                            yy.saveComment(yytext, yylloc);
                        %}
"/*"[\s\S]*?"*/"        %{
                            /* C-style comment */
                            yy.saveComment(yytext, yylloc);
                        %}
"//".*                  %{
                            /* C++-style comment */
                            yy.saveComment(yytext, yylloc);
                        %}

/* keywords */
"var"                   return 'VAR';
"globalvar"             return 'GLOBALVAR';
"if"                    return 'IF';
"else"                  return 'ELSE';
"repeat"                return 'REPEAT';
"while"                 return 'WHILE';
"do"                    return 'DO';
"until"                 return 'UNTIL';
"for"                   return 'FOR';
"switch"                return 'SWITCH';
"case"                  return 'CASE';
"with"                  return 'WITH';
"default"               return 'DEFAULT';
"break"                 return 'BREAK';
"continue"              return 'CONTINUE';
"exit"                  return 'EXIT';
"return"                return 'RETURN';
"object"                return 'OBJECT';
"script"                return 'SCRIPT';
"const"                 return 'CONST';
"parent"                return 'PARENT';
"create"                return 'CREATE';
"destroy"               return 'DESTROY';
"super"                 return 'SUPER';
"export"                return 'EXPORT';

/* keyword operators (must appear above identifier) */
"div"                   return 'DIV';
"mod"                   return 'MOD';
"and"                   return '&&';
"or"                    return '||';
"not"                   return '!';

/* literals */
[0-9]+("."[0-9]+)?\b    return 'NUMBER';        /* 123.4 */
"."[0-9]+\b             return 'NUMBER';        /* .9 (no digits before the decimal point) */
"$"[0-9a-fA-F]+\b       return 'HEX';           /* $FF00AA */
"\""[\s\S]*?"\""        return 'STRING';        /* "string" */
"'"[\s\S]*?"'"          return 'STRING';        /* 'string' */
[a-zA-Z_][0-9a-zA-Z_]*  return 'IDENTIFIER';    /* var_name3 */

/* punctuation */
";"                     return ';';
","                     return ',';
":"                     return ':';
"{"                     return '{';
"}"                     return '}';

/* operators */
"++"                    return '++';
"--"                    return '--';
"+="                    return '+=';
"-="                    return '-=';
"*="                    return '*=';
"/="                    return '/=';
"|="                    return '|=';
"&="                    return '&=';
"^="                    return '^=';
"<<"                    return '<<';
">>"                    return '>>';
"&&"                    return '&&';
"||"                    return '||';
"^^"                    return '^^';
"<="                    return '<=';
"<"                     return '<';
"=="                    return '==';
"!="                    return '!='
">="                    return '>=';
">"                     return '>';
"="                     return '=';
"|"                     return '|';
"&"                     return '&';
"^"                     return '^';
"+"                     return '+';
"->"                    return '->';
"-"                     return '-';
"*"                     return '*';
"/"                     return '/';
"!"                     return '!';
"~"                     return '~';
"."                     return '.';
"["                     return '[';
"]"                     return ']';
"("                     return '(';
")"                     return ')';
<<EOF>>                 return 'EOF';

/lex

/* operator associations and precedence */

%left 'IF'
%left 'ELSE'
%left '&&' '||' '^^'
%left '<' '<=' '==' '!=' '>' '>='
%left '|' '&' '^'
%left '<<' '>>'
%left '+' '-'
%left '*' '/' 'DIV' 'MOD'
%left '!' '~' UMINUS
%left '->' '.' '[' ']'
%left '(' ')'

%start top

%% /* language grammar */

top
    : top_level_statements EOF
        {
            var ret = yy.makeSimpleFile($1, yy.getComments());
            yy.setLocation(ret, @1, @2);
            return ret;
        }
    ;

top_level_statements
    : top_level_statement top_level_statements
        { $$ = [$1].concat($2); }
    | /* empty */
        { $$ = []; }
    ;

top_level_statement
    : top_level_script_definition
        { $$ = $1; }
    | object_definition
        { $$ = $1; }
    | const_definition
        { $$ = $1; }
    | export_declaration
        { $$ = $1; }
    ;

statements
    : statements_unwrapped
        {
            $$ = yy.makeStmtList($1);
            yy.setLocation($$, @1);
        }
    ;

statements_unwrapped
    : statement statements_unwrapped
        { $$ = [$1].concat($2); }
    | /* empty */
        { $$ = []; }
    ;

statement
    : assignment ';'
        { $$ = $1; }
    | function_call ';'
        { $$ = $1; }
    | var_statement ';'
        { $$ = $1; }
    | globalvar_statement ';'
        { $$ = $1; }
    | if_statement
        { $$ = $1; }
    | repeat_statement
        { $$ = $1; }
    | while_statement
        { $$ = $1; }
    | do_until_statement
        { $$ = $1; }
    | for_statement
        { $$ = $1; }
    | switch_statement
        { $$ = $1; }
    | with_statement
        { $$ = $1; }
    | '{' statements '}'
        { $$ = $2; }
    | BREAK ';'
        { $$ = yy.makeBreakStmt(); yy.setLocation($$, @1, @2); }
    | CONTINUE ';'
        { $$ = yy.makeContinueStmt(); yy.setLocation($$, @1, @2); }
    | EXIT ';'
        { $$ = yy.makeExitStmt(); yy.setLocation($$, @1, @2); }
    | RETURN expression ';'
        { $$ = yy.makeReturnStmt($2); yy.setLocation($$, @1, @3); }
    | ';'
        { $$ = yy.makeNopStmt(); yy.setLocation($$, @1); }
    ;

if_statement
    : IF '(' expression ')' statement
        { $$ = yy.makeIfStmt($3, $5); yy.setLocation($$, @1, @5); }
    | IF '(' expression ')' statement ELSE statement
        { $$ = yy.makeIfElseStmt($3, $5, $7); yy.setLocation($$, @1, @7); }
    ;

repeat_statement
    : REPEAT '(' expression ')' statement
        { $$ = yy.makeRepeatStmt($3, $5); yy.setLocation($$, @1, @5); }
    ;

while_statement
    : WHILE '(' expression ')' statement
        { $$ = yy.makeWhileStmt($3, $5); yy.setLocation($$, @1, @5); }
    ;

do_until_statement
    : DO statement UNTIL '(' expression ')'
        { $$ = yy.makeDoUntilStmt($2, $5); yy.setLocation($$, @1, @6); }
    ;

for_statement
    : FOR '(' assignment ';' expression ';' assignment ')' statement
        { $$ = yy.makeForStmt($3, $5, $7, $9); yy.setLocation($$, @1, @9); }
    ;

switch_statement
    : SWITCH '(' expression ')' '{' cases '}'
        { $$ = yy.makeSwitchStmt($3, $6); yy.setLocation($$, @1, @7); }
    ;

cases
    : case cases
        { $$ = [$1].concat($2); }
    | /* empty */
        { $$ = []; }
    ;

case
    : CASE expression ':' statements
        { $$ = yy.makeCase($2, $4); yy.setLocation($$, @1, @4); }
    | DEFAULT ':' statements
        { $$ = yy.makeDefaultCase($3); yy.setLocation($$, @1, @3); }
    ;

with_statement
    : WITH '(' expression ')' statement
        { $$ = yy.makeWithStmt($3, $5); yy.setLocation($$, @1, @5); }
    ;

var_statement
    : VAR var_list
        { $$ = yy.makeVarStmt($2); yy.setLocation($$, @1, @2); }
    ;

var_list
    : identifier ',' var_list
        { $$ = [yy.setLocation(yy.makeVarStmtItem($1), @1)].concat($3); }
    | identifier '=' expression ',' var_list
        { $$ = [yy.setLocation(yy.makeVarStmtItem($1, $3), @1, @3)].concat($5); }
    | identifier
        { $$ = [yy.setLocation(yy.makeVarStmtItem($1), @1)]; }
    | identifier '=' expression
        { $$ = [yy.setLocation(yy.makeVarStmtItem($1, $3), @1, @3)]; }
    ;
    
globalvar_statement
    : GLOBALVAR globalvar_list
        { $$ = yy.makeGlobalVarStmt($2); yy.setLocation($$, @1, @2); }
    ;

globalvar_list
    : identifier ',' globalvar_list
        { $$ = [yy.setLocation(yy.makeVarStmtItem($1), @1)].concat($3); }
    | identifier
        { $$ = [yy.setLocation(yy.makeVarStmtItem($1), @1)]; }
    ;

script_literal
    : SCRIPT '(' ')' '{' statements '}'
        { $$ = yy.makeScriptVal([], $5); yy.setLocation($$, @1, @6); }
    | SCRIPT '(' definition_arguments ')' '{' statements '}'
        { $$ = yy.makeScriptVal($3, $6); yy.setLocation($$, @1, @7); }
    ;

script_definition
    : SCRIPT identifier '(' ')' '{' statements '}'
        { $$ = yy.makeScriptStmt($2, [], $6); yy.setLocation($$, @1, @7); }
    | SCRIPT identifier '(' definition_arguments ')' '{' statements '}'
        { $$ = yy.makeScriptStmt($2, $4, $7); yy.setLocation($$, @1, @8); }
    ;

top_level_script_definition
    : script_definition
        { $$ = $1; }
    | EXPORT SCRIPT identifier '(' ')' '{' statements '}'
        { $$ = yy.makeScriptStmt($3, [], $7, true); yy.setLocation($$, @1, @8); }
    | EXPORT SCRIPT identifier '(' definition_arguments ')' '{' statements '}'
        { $$ = yy.makeScriptStmt($3, $5, $8, true); yy.setLocation($$, @1, @9); }
    ;

definition_arguments
    : identifier ',' definition_arguments
        { $$ = [$1].concat($3); }
    | identifier
        { $$ = [$1]; }
    ;

const_definition
    : CONST identifier '=' expression ';'
        { $$ = yy.makeConstStmt($2, $4); yy.setLocation($$, @1, @5); }
    | EXPORT CONST identifier '=' expression ';'
        { $$ = yy.makeConstStmt($3, $5, true); yy.setLocation($$, @1, @6); }
    ;

object_definition
    : OBJECT identifier '{' class_statements '}'
        { $$ = yy.makeObjectStmt($2, $4); yy.setLocation($$, @1, @5); }
    | OBJECT identifier PARENT identifier '{' class_statements '}'
        { $$ = yy.makeObjectStmt($2, $6, $4); yy.setLocation($$, @1, @7); }
    | EXPORT OBJECT identifier '{' class_statements '}'
        { $$ = yy.makeObjectStmt($3, $5, null, true); yy.setLocation($$, @1, @6); }
    | EXPORT OBJECT identifier PARENT identifier '{' class_statements '}'
        { $$ = yy.makeObjectStmt($3, $7, $5, true); yy.setLocation($$, @1, @8); }
    ;

class_statements
    : class_statement class_statements
        { $$ = [$1].concat($2); }
    | /* empty */
        { $$ = []; }
    ;

class_statement
    : script_definition
        { $$ = $1; }
    | CREATE '(' ')' '{' statements '}'
        { $$ = yy.makeCreateStmt([], $5); yy.setLocation($$, @1, @6); }
    | CREATE '(' definition_arguments ')' '{' statements '}'
        { $$ = yy.makeCreateStmt($3, $6); yy.setLocation($$, @1, @7); }
    | DESTROY '{' statements '}'
        { $$ = yy.makeDestroyStmt($3); yy.setLocation($$, @1, @4); }
    | identifier '=' expression ';'
        { $$ = yy.makePropertyStmt($1, $3); yy.setLocation($$, @1, @4); }
    ;

export_declaration
    : EXPORT '=' identifier ';'
        { $$ = yy.makeExportDeclarationStmt($3); yy.setLocation($$, @1, @4); }
    ;

assignment
    : variable '=' expression
        { $$ = yy.makeAssignStmt($1, $3); yy.setLocation($$, @1, @3); }
    | variable '++'
        { $$ = yy.makeCmpAssignStmt('+', $1, yy.makeNumVal('1')); yy.setLocation($$, @1, @2); }
    | variable '--'
        { $$ = yy.makeCmpAssignStmt('-', $1, yy.makeNumVal('1')); yy.setLocation($$, @1, @2); }
    | variable '+=' expression
        { $$ = yy.makeCmpAssignStmt('+', $1, $3); yy.setLocation($$, @1, @3); }
    | variable '-=' expression
        { $$ = yy.makeCmpAssignStmt('-', $1, $3); yy.setLocation($$, @1, @3); }
    | variable '*=' expression
        { $$ = yy.makeCmpAssignStmt('*', $1, $3); yy.setLocation($$, @1, @3); }
    | variable '/=' expression
        { $$ = yy.makeCmpAssignStmt('/', $1, $3); yy.setLocation($$, @1, @3); }
    | variable '|=' expression
        { $$ = yy.makeCmpAssignStmt('|', $1, $3); yy.setLocation($$, @1, @3); }
    | variable '&=' expression
        { $$ = yy.makeCmpAssignStmt('&', $1, $3); yy.setLocation($$, @1, @3); }
    | variable '^=' expression
        { $$ = yy.makeCmpAssignStmt('^', $1, $3); yy.setLocation($$, @1, @3); }
    ;

expression
    : NUMBER
        { $$ = yy.makeNumVal(yytext); yy.setLocation($$, @1); }
    | HEX
        { $$ = yy.makeHexVal(yytext); yy.setLocation($$, @1); }
    | STRING
        { $$ = yy.makeStringVal(yytext); yy.setLocation($$, @1); }
    | script_literal
        { $$ = $1; }
    | expression '&&' expression
        { $$ = yy.makeBinaryOp('&&', $1, $3); yy.setLocation($$, @1, @3); }
    | expression '||' expression
        { $$ = yy.makeBinaryOp('||', $1, $3); yy.setLocation($$, @1, @3);}
    | expression '^^' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '<' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '<=' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '==' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '!=' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '>' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '>=' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '|' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '&' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '^' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '<<' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '>>' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '+' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '-' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '*' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '/' expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression DIV expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression MOD expression
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | '!' expression
        { $$ = yy.makeUnaryOp('!', $2); yy.setLocation($$, @1, @2); }
    | '~' expression
        { $$ = yy.makeUnaryOp($1, $2); yy.setLocation($$, @1, @2); }
    | '-' expression %prec UMINUS
        { $$ = yy.makeUnaryOp($1, $2); yy.setLocation($$, @1, @2); }
    | function_call
        { $$ = $1; }
    | variable
        { $$ = $1; }
    | '(' expression ')'
        { $$ = $2; }
    ;

function_call
    : expression '(' ')'
        { $$ = yy.makeFunctionCall($1, []); yy.setLocation($$, @1, @3); }
    | expression '(' function_call_arguments ')'
        { $$ = yy.makeFunctionCall($1, $3); yy.setLocation($$, @1, @4); }
    | SUPER '(' ')'
        { $$ = yy.makeSuperCall([]); yy.setLocation($$, @1, @3); }
    | SUPER '(' function_call_arguments ')'
        { $$ = yy.makeSuperCall($3); yy.setLocation($$, @1, @4); }
    ;

function_call_arguments
    : expression ',' function_call_arguments
        { $$ = [$1].concat($3); }
    | expression
        { $$ = [$1]; }
    ;

variable
    : lval_identifier
        { $$ = $1; }
    | expression '.' lval_identifier
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '->' lval_identifier
        { $$ = yy.makeBinaryOp($2, $1, $3); yy.setLocation($$, @1, @3); }
    | expression '[' indexes ']'
        { $$ = yy.makeIndex($1, $3); yy.setLocation($$, @1, @4); }
    ;

indexes
    : expression ',' indexes
        { $$ = [$1].concat($3); }
    | expression
        { $$ = [$1]; }
    ;

/*
  Only used for lvalues (variables above)
  subscripting, property access, & bare identifiers
 */
lval_identifier
    : identifier
        { $$ = yy.makeIdentifier(yytext); yy.setLocation($$, @1); }
    ;

/* It is possible to use a few Angl keywords as an identifier since those keywords are never used in the same places
   as an identifier.
 */
identifier
    : IDENTIFIER
    | OBJECT
    | PARENT
        { $$ = yytext; }
    ;
