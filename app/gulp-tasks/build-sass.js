module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore');

    gulp.task(
        'build-sass',
        function () {
            var stream = gulp.src(taskConfig.src)
                .pipe(
                    deps.compass(
                        taskConfig.options
                    )
                ).on(
                    'error',
                    function (error) {
                        console.log('Error during sass compilation:');
                        console.log(error);
                        this.emit('end');
                    }
                );
            
            if (!_.isUndefined(taskConfig.css)) {
                return gulp.src(
                    _.map(taskConfig.css, _.identity)
                )
                    .pipe(deps.concat(taskConfig.name))
                    .pipe(gulp.dest(taskConfig.target));
            }
            return stream;
        }
    );
}
