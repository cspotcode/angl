README
======

Introduction
------------

angl is a programming language that compiles to JavaScript, which is designed to be [GML](http://en.wikipedia.org/wiki/Game_Maker_Language)-compatible, but adding several features.

Language notes
-------------

angl's grammar is based on Game Maker 8.0 help files, whose definition of the grammar is much stricter than the Game Maker 8.0 GML parser actually is (for example, the parser does not require semicolons, happily disregards braces, allows both `=` and `:=` for assignment).

However, it breaks compatibility in a few places.

For a full overview, see *Language overview* below.

Name
----

angl is an acronym of __a__ngl's __n__ot __g__ame maker __l__anguage. It is, of course, a recursive acronym.

Compiling
---------

To generate the parser you'll need [Jison](http://zaach.github.com/jison/). 

To install all dependencies just run `npm install` in the source tree root.

To compile, run `build.sh`. If you don't have a shell (git bash on windows works fine), you can also manually make sure an empty `out` directory exists, run `jison src/parser.jison --output-file=out/parser.js` and then copy the other .js files to that directory.

Usage
-----

`node angl.js ../examples/first.gml` outputs the AST generated from that example.

Language overview
-----------------

Features unique to angl are marked with (*).

Programs consist of a set of statements.

###Source-code comments

C-style (`/* this */`) and C++-style (`// this`) comments are allowed.

###Valid identifier names

Identifier names (used for variables or functions), must begin with a letter or an underscore, and may contain letters, underscores and digits. Identifier names are case-sensitive, i.e. `x` and `X` are not the same.

###Function call

Calls a function, follows the format `<function>(<arg1>, <arg2>, ...)`.

###Script literals(*)

This declares a script as a literal (for assignment to a variable). It has the following format:

    script (<argname1>, <argname2>, ...) {
        <statements>
    }

###Expressions

Are any valid literal, valid variable reference, valid use of an operator or valid function call.

###Operators

In order of precedence. `(` and `)` can also be used to embed an expression causing it to be evaluated first, as in maths, e.g. `3 * (2 + 4)`.

####Boolean

* `&&` - boolean AND
* `||` - boolean OR
* `^^` - boolean XOR

####Comparison

* `<=` - less than or equal to
* `<` - less than
* `==` - equal to
* `!=` - not equal to
* `>=` - greater than or equal to
* `>` - greater than

####Bitwise

* `|` - bitwise OR
* `&` - bitwise AND
* `^` - bitwise XOR
* `<<` - binary left shift
* `>>` - binary right shift

####Mathematical

* `+` - addition
* `-` - subtraction
* `*` - multiplication
* `/` - division
* `div` - integer division
* `mod` - modulo (remainder of integer division)

####Unary operators

* `!` - boolean NOT
* `~` - bitwise negation
* `-` - negation

####Object/array dereferencing

* `<object>.<identifier>` - refers to property of object
* `<array>[<expression>]` - refers to array's <expression>th index (from 0)
* `<array>[<expression>,<expression>]` - refers to 2d array's <expression>,<expression> index (from 0,0)

###Statements

There are the following types of statement:

####Statement block

Groups a bunch of statements together, is considered a single statement, follows the format:

    {
        <statement1>;
        <statement2>;
        ...;
    }

####Lone semicolon (`;`)

Does nothing.

####`var` statement

Declares that the given variable names are local to the script (instead of to the instance). Is of the format `var <var1>, <var2>, ...;`. The semicolon is required.

####Script definition(*)

This declares a script. It has the following format:

    script <name> (<argname1>, <argname2>, ...) {
        <statements>
    }

Script definitions are hoisted, i.e., it does not matter where in the file it is defined, you can still use it. They are also global, which means other files also see them. Scripts can see the local variables of the surrounding script or program. However, they cannot see the variables on the instance.

In GML there is no direct equivalent to this statement. You can create scripts graphically, but you cannot specify argument names (you must use `argument0`, `argument1`, etc.).

####Assignments

Assigns a value to a variable, follows the format `<variable> = <expression>;`. The semicolon is required. There are also the following compound assignment operators:

* `+=` - assign by addition
* `-=` - assign by subtraction
* `*=` - assign by multiplication
* `/=` - assign by division
* `|=` - assign by OR
* `&=` - assign by AND
* `^=` - assign by XOR

####Function calls

`<function call>;`

####If statement

Executes statemen only if a given expression evaluates to true (non-0). It follows the format `if (<expr>) <statement>`. You can optionally specify an `else` portion to execute where the expression does not evaluate to true, following the format `if (<expr>) <statement> else <statement>`.

####Repeat statement

Executes the statement the number of times given by the rounded value of the expression, following the format `repeat (<expression>) <statement>`.

####While statement

Runs in a loop. Each time the loop runs, it checks if the expression evaluates to true (non-0), and if so, then the statement is executed. If it is not, the loop halts. Follows the format `while (<expression>) <statement>`.

####Do-Until statement

Runs in a loop. Each time the loop the loop runs, it executes the statement. Then, it checks if the expression evaluates to true. If the expression evaluates to true, the loop halts.

####For statement

Contains four pieces: the initialisation assignment, the continuation expression, the step assignment and the main statement. It follows the format `for(<init>;<cont>;<step>) <main>`. It runs in a loop. Before the loop runs, the initialisation assignment is executed. Then, each time the loop runs, the continuation expression is evaluated. If it evaluates to false, the loop halts. Otherwise, the main statement is executed. Then, the step assignment is executed.

####Switch statement

Containts two pieces: the expression, and the case statements. Follows the format `switch (<expression>) { <case statements> }`. Case statements take the form `case <expression>:`, or `default:` for the default. They are followed by either more case statements, or normal statements. Each case statement's expression is evaluated, and if it matches the switch expression, then the statements following it are run until encountering a `break`.

####With statement

Follows the format `with (<expression>) <statement>`. Where the expression is an object, it runs in a loop for each instance of that object, setting the `self` value to that object, and `other` to the actual current object, then executing the statement.

####Break statement

Follows the format `break;`, breaks out of a loop.

####Continue statement

Follows the format `continue;`, skips to next repeat of loop.

####Exit statement

Follows the format `exit;`, exits the script.

####Return statement

Used within a script, returns the expression to the caller (as the value of the function call) and exits the script. Has the format `return <expression>;`.
