module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore');

    gulp.task(
        'build-js',
        function () {
            var sources = _.map(
                taskConfig.src,
                _.identity
            );

            var stream = gulp.src(sources)
                .pipe(deps.concat(taskConfig.name, {newLine: ';\n'}))
                .pipe(deps.ngAnnotate())
                .on(
                    'error',
                    function (error) {
                        console.log('Error during NG annotation:');
                        console.log(error);
                        this.emit('end');
                    }
                );

            if (taskConfig.uglify) {
                stream = stream.pipe(deps.uglify());
            }

            return stream.pipe(gulp.dest(taskConfig.target));
        }
    );
}
