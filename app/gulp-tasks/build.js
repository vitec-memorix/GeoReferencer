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
                'build-js',
                'build-html'
            );
        }
    );
};
