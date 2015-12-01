module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore');

    gulp.task(
        'validate-js',
        function () {
            var sources = _.map(
                taskConfig.src,
                _.identity
            );

            gulp.src(sources)
                .pipe(deps.jshint(taskConfig.config))
                .pipe(deps.jshint.reporter('jshint-stylish'))
                .on(
                    'error',
                    function (error) {
                        console.log('Error during JS validation.');
                        console.log(error);
                        this.emit('end');
                    }
                );
        }
    );
}
