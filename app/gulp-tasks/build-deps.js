module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore');
    var path = require('path');

    gulp.task(
        'build-deps',
        function () {
            var sources = _.map(
                taskConfig.src,
                _.identity
            );

            return gulp.src(sources)
                .pipe(deps.concat(taskConfig.name, {newLine: ';\n'}))
                .pipe(gulp.dest(taskConfig.target))
                .on(
                    'error',
                    function (error) {
                        console.log('Error during dependency concatenation!');
                        console.log(error);
                        this.emit('end');
                    }
                );
        }
    );
}
