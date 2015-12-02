module.exports = function (gulp, deps, taskConfig) {
    var _ = require('underscore');
    var path = require('path');
    var merge = require('merge-stream');

    gulp.task(
        'move-deps',
        function (cb) {
            var result = null;
            var streams = [];
            _.each(
                taskConfig.vendors,
                function (files, dir)  {
                    var location = taskConfig.target[dir] ? taskConfig.target[dir] : taskConfig.target.default + dir;
                    _.each(
                        files,
                        function (sourceFile, index) {
                            var depName = ('0' + index).slice(-2) + '_' + path.basename(sourceFile);
                            var stream = gulp.src(sourceFile);
                            if (dir === 'js') {
                                //Respect order for JS deps
                                stream = stream.pipe(deps.rename(depName));
                            }
                            streams.push(stream.pipe(gulp.dest(location)));
                        }
                    );
                }
            );
            if (streams.length == 1) {
                stream = streams.shift();
            } else if (streams.length > 1) {
                stream = merge(streams.shift(), streams.shift());
                _.each(
                    streams,
                    function(src) {
                        stream.add(src);
                    }
                );
            }
            return stream;
        }
    );
}
