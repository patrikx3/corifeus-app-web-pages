module.exports = (grunt) => {

    const builder = require(`corifeus-builder-angular`);

    const loader = new builder.loader(grunt);
    loader.angular();

    grunt.config.merge({
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

    grunt.registerTask('default', defaults.concat(builder.config.task.build.angularAotJit));

    grunt.registerTask('dev', defaults.concat(builder.config.task.build.angular));
    grunt.registerTask('aot', defaults.concat(builder.config.task.build.angularAot));
    grunt.registerTask('aot-jit', defaults.concat(builder.config.task.build.angularAotJit));

    grunt.registerTask('run', defaults.concat(builder.config.task.run.angular));
    grunt.registerTask('coverage', 'karma:cory-angular');

    grunt.registerTask('test-connect', [
        'connect:cory-angular',
        'watch:cory-wait'
    ])
}