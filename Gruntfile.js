module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        nodemon: {
            dev: {
                script: 'app.js'
            }
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                commit: false,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'release/<%= pkg.name %>-<%= pkg.version %>.zip',
                    pretty: true
                },
                files: [
                    {
                        src: ['app.js', 'modules/**', 'package.json'],
                        dest: '/'
                    }
                ]
            }
        }
    });

    grunt.registerTask('default', ['nodemon']);
    grunt.registerTask('release', ['bump', 'compress']);
};
