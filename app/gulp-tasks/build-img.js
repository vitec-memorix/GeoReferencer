module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore');

    gulp.task(
        'build-img',
        function () {
            var sources = _.map(
                taskConfig.src,
                _.identity
            );

            var stream = gulp.src(sources);

            return stream.pipe(gulp.dest(taskConfig.target));
        }
    );
}
