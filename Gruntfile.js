module.exports = (grunt) => {

    const builder = require(`corifeus-builder`);
    const loader = new builder.loader(grunt);
    loader.js({
        replacer: {
            type: 'p3x',
            npmio: true,
        },
        config: {
            copy: {
                tweomji: {
                    files: [
                        {
                            cwd: 'node_modules/twemoji/2/svg',
                            expand: true,
                            src: [
                                '**',
                            ],
                            dest: `./dist/corifeus-app-web-pages/assets/twemoji/svg`
                        },

                    ]
                },

            },
            'cory-inject': {
                sass: {
                    files: [
                        'src/app/**/*.scss',
                        '!src/app/modules/material/scss/**/*.**'
                    ],
                    dest: 'src/artifacts/style.scss',
                    template: '@import \'${file}\';'
                }
            },

        }
    });


    const defaults = [
        'cory-inject',
        'cory-raw-npm-angular'
    ];

    const defaultTask = defaults.concat(builder.config.task.build.js)
    grunt.registerTask('default', defaultTask);

}
