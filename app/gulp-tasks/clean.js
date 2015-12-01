module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore'),
        rimraf = require('gulp-rimraf');

    gulp.task(
        'clean',
        function () {
            var targets = _.map(
                taskConfig.target,
                _.identity
            );

            return gulp.src(targets, {read:false})
                .pipe(rimraf());
        }
    );
}
