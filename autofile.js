'use strict';

var fs    = require('fs');
var async = require('async');
var glob  = require('glob');

module.exports = function (task) {
    task
    .id('chmod')
    .name('Change mode')
    .description('Change mode of a file or a set of files.')
    .author('Indigo United')

    .option('files', 'Which file to chmod. Accepts a filename and array of filenames. Also note that the filenames can be minimatch patterns.')
    .option('mode', 'The mode to apply.', '0777')
    .option('glob', 'The options to pass to glob (check https://npmjs.org/package/glob for details).', 'null')

    .setup(function (opt, ctx, next) {
        if (typeof opt.mode !== 'number') {
            opt.mode = parseInt(opt.mode, 8);
        }
        next();
    })
    .do(function (opt, ctx, next) {
        var files = Array.isArray(opt.files) ? opt.files : [opt.files];
        var error;

        async.forEach(files, function (file, next) {
            glob(file, opt.glob, function (err, files) {
                if (err) {
                    return next(err);
                }

                if (!files.length) {
                    error = new Error('ENOENT, no such file or directory \'' + file + '\'');
                    error.code = 'ENOENT';
                    return next(error);
                }

                async.forEach(files, function (file, next) {
                    ctx.log.debugln('Changing mode for file: ' + file);
                    fs.chmod(file, opt.mode, next);
                }, next);
            });
        }, next);
    });
};