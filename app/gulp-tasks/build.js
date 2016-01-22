module.exports = function (gulp, deps, taskConfig, fullConfig) {
    var _ = require('underscore');
    var runSequence = require('run-sequence');

    gulp.task(
        'build',
        function () {
            runSequence(
                'clean',
                'config-php',
                'config-js',
                'demo-php',
                'proxy-html',
                'move-images',
                'move-deps',
                'build-deps',
                'build-sass',
                'i18n-po',
                'build-js',
                'build-html'
            );
        }
    );
};
