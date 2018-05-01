module.exports = (grunt) => {

    const builder = require(`corifeus-builder-angular`);

    const loader = new builder.loader(grunt);
    loader.angular();

    grunt.config.merge({
        copy: {
            'cory-twemoji': {
                files: [
                    {
                        cwd: 'node_modules/twemoji/2/svg',
                        expand: true,
                        src: [
                            '**',
                        ],
                        dest: './build/browser/assets/twemoji/svg'
                    },
                    {
                        cwd: 'test/angular-webpack/public',
                        expand: true,
                        src: [
                            '**',
                        ],
                        dest: './build/browser/'
                    },

                ]
            }
        },
        watch: {
            wait: {
                files: ['**/*.js'],
                tasks: ['copy:cory-build'],
            },
            json2sass: {

            }
        },
        'cory-json2scss': {
            json2sass: {
                files: ['src/json/settings.json'],
                dest: 'src/assets/_settings.scss',
                prefix: 'cory-layout-settings'
            },
        },
        'cory-inject': {
          sass: {
              files: [
                  'src/angular/**/*.scss'
              ],
              dest: 'src/assets/style.scss',
              template: '@import \'${file}\';'
          }
        },


    });



    const defaults = [
        'cory-json2scss',
        'cory-inject'
    ];

    const postProcess= [
        'copy:cory-twemoji',
    ]

//    grunt.registerTask('default', defaults.concat(builder.config.task.build.angularAot));
    grunt.registerTask('default', defaults.concat(builder.config.task.build.angularAot).concat(postProcess));

    grunt.registerTask('dev', defaults.concat(builder.config.task.build.angular).concat(postProcess));
    grunt.registerTask('aot', defaults.concat(builder.config.task.build.angularAot).concat(postProcess));
    grunt.registerTask('aot-jit', defaults.concat(builder.config.task.build.angularAotJit).concat(postProcess));

    grunt.registerTask('run', defaults.concat(builder.config.task.run.angular));
    grunt.registerTask('coverage', 'karma:cory-angular');

    grunt.registerTask('test-connect', [
        'connect:cory-angular',
        'watch:cory-wait'
    ])
}