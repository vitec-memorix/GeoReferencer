module.exports = function (gulp, deps) {
    gulp.task(
        'default',
        deps.taskListing.withFilters(/:/)
    );
}
