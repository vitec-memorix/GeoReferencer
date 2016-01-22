module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore'),
        angularGettext = require('gulp-angular-gettext');

    gulp.task('i18n-po', function () {
        var sources = _.map(
            taskConfig.src,
            _.identity
        );
        
        return gulp.src(sources)
            .pipe(angularGettext.compile())
            .pipe(gulp.dest(taskConfig.target));
    });
};
