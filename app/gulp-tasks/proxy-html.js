module.exports = function (gulp, deps, taskConfig, fullConfig) {
    var _ = require('underscore');

    gulp.task(
        'proxy-html',
        function () {
            // First merge the MASTER_URL array values into a string
            function mergeMasterURL(master, combine) {
                return combine(_.values(master));
            }

            if (taskConfig.tokens.hasOwnProperty('MASTER_URL')) {
                taskConfig.tokens.MASTER_URLS = mergeMasterURL(taskConfig.tokens.MASTER_URL, function (urls) {
                    var merged = '';
                    urls.forEach (function (name) {
                        merged = merged + ' "' + name + '": "*",'
                    });
                    merged = merged.slice(0, -1);
                    return merged;
                });
            }

            return gulp.src(taskConfig.src)
                .pipe(deps.tokenReplace({tokens: taskConfig.tokens}))
                .pipe(deps.rename(taskConfig.name))
                .pipe(gulp.dest(taskConfig.target));
        }
    );
};
