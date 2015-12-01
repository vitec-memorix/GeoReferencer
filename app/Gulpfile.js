//General
var fs = require('fs');
var _ = require('underscore');
var properties = require('properties');
var argv = require('yargs').argv;

//Gulp task parameters.
var gulp = require('gulp');
var deps = require('gulp-load-plugins')();

//Execution context.
var buildEnv = process.env.BUILD_ENV || 'devimage';

/**
 * Unfortunately, the properties module does not seem to support
 * synchronous reading of files, which makes gulp fail before
 * specified tasks are loaded. Need to use fs & load from string to
 * go around it.
 * @TODO: Improve error handling here.
 **/
var configFile = fs.readFileSync(
    argv.appConfig || 'app.cfg',
    'utf-8'
);

var config = properties.parse(
    configFile,
    {
        variables: true,
        sections: true,
        namespaces: true
    }
);

var taskList = config['global']['load'];

_.each(
    fs.readdirSync(taskList),
    function (fileName) {
        var taskName = fileName.replace('.js', '');
        var params = {};

        if (!_.isUndefined(config['global']) && !_.isUndefined(config['global'][taskName])) {
            params = config['global'][taskName];
        }

        if (!_.isUndefined(config[buildEnv]) && !_.isUndefined(config[buildEnv][taskName])) {
            params = _.extend(
                params,
                config[buildEnv][taskName]
            );
        }

        require(config['global']['load'] + taskName)(
            gulp,
            deps,
            params,
            config
        );
    }
);
