module.exports = (grunt) => {

    const builder = require(`corifeus-builder`);
    const gruntUtil = builder.utils;
    const loader = new builder.loader(grunt);
    loader.js({
        replacer: {
            type: 'p3x',
            npmio: false,
        },
        config: {
            htmlmin: {
                dist: {
                    options: {                                 // Target options
                        removeComments: true,
                        collapseWhitespace: true,
                        minifyCSS: true,
                    },
                    files: {
                        './dist/corifeus-app-web-pages/index.html': './dist/corifeus-app-web-pages/index.html'
                    }
                }
            },
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

    grunt.registerTask('build', async function() {
        const done = this.async()
        const cwd = process.cwd()

        try {

            await gruntUtil.spawn({
                grunt: grunt,
                gruntThis: this,

            }, {
                cmd: `${cwd}/node_modules/.bin/ng${gruntUtil.commandAddon}`,
                args: [
                    'build',
                    '--source-map=false',
                    '--output-hashing=all',
                    '--configuration=production',
                    '--base-href=/',
                    '--aot=true',
                    '--build-optimizer=true',
                    '--optimization=true'
                ]
            });

            done()
        } catch(e) {
            done(e)
        }
    })

    const defaults = [
        'cory-inject',
        'cory-raw-npm-angular',
        'build',
        'copy',
        'htmlmin:dist',
    ];

    const defaultTask = builder.config.task.build.js.concat(defaults)
    grunt.registerTask('default', defaultTask);

}
