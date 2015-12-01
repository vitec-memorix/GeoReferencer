module.exports = function (gulp, deps, taskConfig, fullConfig) {
    var _ = require('underscore');

    gulp.task(
        'watch',
        function () {
            var configs = {};
            var buildEnv = process.env.BUILD_ENV || 'development';

            _.each(
                ['build-js', 'build-html', 'build-sass', 'build-img', 'validate-js'],
                function (taskName) {
                    var params = {};

                    if (!_.isUndefined(fullConfig['global']) && !_.isUndefined(fullConfig['global'][taskName])) {
                        params = fullConfig['global'][taskName];
                    }

                    if (!_.isUndefined(fullConfig[buildEnv]) && !_.isUndefined(fullConfig[buildEnv][taskName])) {
                        params = _.extend(
                            params,
                            fullConfig[buildEnv][taskName]
                        );
                    }
                    configs[taskName] = params;
                }
            );

            var src = configs['build-sass'].src;
            
            gulp.watch(
                [src],
                ['build-sass']
            );

            src = _.map(
                configs['build-js'].src,
                _.identity
            );
            
            gulp.watch(
                src,
                ['validate-js', 'build-js']
            );

            src = _.map(
                configs['build-html'].src,
                _.identity
            );

            gulp.watch(
                src,
                ['build-html']
            );

            src = _.map(
                configs['build-img'].src,
                _.identity
            );

            gulp.watch(
                src,
                ['build-img']
            );
        }
    );
}
