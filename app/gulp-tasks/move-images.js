module.exports = function (gulp, deps, taskConfig) {
    gulp.task(
        'move-images',
        function () {
            return gulp.src(taskConfig.src)
                .pipe(gulp.dest(taskConfig.target));
        }
    );
};