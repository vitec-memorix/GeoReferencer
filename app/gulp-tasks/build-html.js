module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore');

    gulp.task(
        'build-html',
        function () {
            var sources = _.map(
                taskConfig.src,
                _.identity
            );

            var stream = gulp.src(sources)
                .pipe(
                    deps.minifyHtml({
                        empty: true,
                        spare: true,
                        quotes: true,
                        comments: true
                    })
                ).pipe(
                    deps.ngHtml2js(
                        {
                            moduleName: taskConfig.module
                        }
                    )
                ).pipe(
                    deps.concat(taskConfig.name)
                );

            if (taskConfig.uglify) {
                stream = stream.pipe(deps.uglify());
            }

            return stream.pipe(gulp.dest(taskConfig.target));
        }
    );
};
