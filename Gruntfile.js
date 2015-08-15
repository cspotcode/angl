module.exports = function(grunt) {
    
    var _ = require('lodash');
    
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);
    
    switch(grunt.option('tsc')) {
        case 'custom':
            grunt.log.writeln('Using custom grunt-ts');
            grunt.loadNpmTasks('custom-grunt-ts');
            break;
        default:
            grunt.log.writeln('Using original grunt-ts');
            grunt.loadNpmTasks('original-grunt-ts');
    }
    
    // Declare configuration in a more readable style
    grunt = require('grunt-organized')(grunt, {
        pkg: grunt.file.readJSON('package.json')
    });
    
    var tsOptions = {
        module: 'commonjs',
        target: 'es5',
        sourceMap: true,
        declaration: true,
        noImplicitAny: false
        //fast: 'always'
    };
    
    // typedoc task uses slightly different options than the ts task.
    var typedocOptions = {
        module: 'commonjs'
    };
    if(tsOptions.noImplicitAny) typedocOptions.noImplicitAny = '';
    
    // TODO tell ts plugin to use typescript 1.3
    
    grunt.registerTask('clean-parser', 'Delete generated parser files', {
        clean: {
            src: ['parser/out/**/*']
        }
    });
    
    grunt.registerTask('build-parser', 'Build the parser', {
        jison: {
            files: [
                {
                    src: 'parser/src/parser.jison',
                    dest: 'parser/out/parser.js'
                }
            ]
        },
        copy: {
            files: [
                {
                    expand: true,
                    cwd: 'parser/src',
                    src: '**/*.js',
                    dest: 'parser/out'
                }
            ]
        }
    });
    
    grunt.registerTask('clean-compiler', 'Delete generated compiler files', {
        clean: {
            src: ['compiler-build/lib/**/*', 'compiler-build/resource/**/*']
        }
    });

    grunt.registerTask('build-compiler', 'Builds the compiler without rebuilding the parser.', {
        ts: {
            src: ['compiler/lib/**/*.ts'],
            outDir: 'compiler-build/lib',
            options: tsOptions
        },
        copy: {
            files: [
                // Copy all plain JS files
                {
                    expand: true,
                    cwd: 'compiler/lib',
                    src: ['**/ *.js'],
                    dest: 'compiler-build/lib'
                },
                // Copy all resources
                {
                    expand: true,
                    cwd: 'compiler/resource',
                    src: '**/*',
                    dest: 'compiler-build/resource'
                }
            ]
        }
    });
    
    grunt.registerTask('clean-docs', 'Delete generated documentation files', {
        clean: {
            src: ['docs/**/*']
        }
    });
    
    grunt.registerTask('build-docs', 'Generate API documentation for the compiler', {
        typedoc: {
            src: '<%= ts.build-compiler.src %>',
            options: _.defaults({
                out: 'docs',
                name: 'angl',
                theme: 'minimal'
            }, typedocOptions)
        }
    });
    
    grunt.registerTask('docs', 'Generate compiler API documentation', ['clean-docs', 'build-docs']);

    grunt.registerTask('clean-demo', 'Delete generated files for the browser-based demo', {
        clean: {
            src: ['compiler/out/demo/**/*']
        }
    });

    grunt.registerTask('build-demo', 'Build the browser-based demo', {
        jade: {
            files: [
                {
                    src: 'compiler/demo/index.jade',
                    dest: 'compiler/out/demo/index.html'
                }
            ]
        },
        stylus: {
            options: {
                use: [require('axis')]
            },
            files: [
                {
                    src: 'compiler/demo/style.styl',
                    dest: 'compiler/out/demo/style.css'
                }
            ]
        },
        requirejs: {
            options: require('./compiler/requirejs-config')
        }
    });

    grunt.registerTask('build', 'Build everything: the parser, compiler, and demo.', ['build-parser', 'build-compiler', 'build-demo']);
    
    grunt.registerTask('clean-compiler-tests', 'Delete generated compiler test files', {
        clean: {
            src: ['compiler-build/test/**/*']
        }
    });
    
    grunt.registerTask('build-compiler-tests', {
        ts: {
            src: ['compiler/test/**/*.ts'],
            // Tests in the test directory load code from the lib directory.  We must set outDir to be the common root
            // of all source files being compiled.
            outDir: 'compiler-build',
            options: tsOptions
        }
    });
    
    grunt.registerTask('run-compiler-tests', {
        mochaTest: {
            src: ['compiler-build/test/**/*.spec.js']
        }
    });
    
    grunt.registerTask('test', 'Builds and runs unit tests.', ['build-compiler-tests', 'run-compiler-tests']);
    
    grunt.registerTask('default', ['build']);
};

