/*global describe, it, before, beforeEach, after*/

'use strict';

var expect    = require('expect.js');
var fs        = require('fs');
var rimraf    = require('rimraf');
var automaton = require('automaton').create();
var chmod     = require('../autofile');

describe('chmod', function () {
    var mode755_dir,
        mode777_dir,
        mode755_file,
        mode777_file;

    function clean(done) {
        rimraf(__dirname + '/tmp/', done);
    }

    before(function (done) {
        clean(function (err) {
            if (err) {
                throw err;
            }

            fs.mkdirSync(__dirname + '/tmp/');
            var target = __dirname + '/tmp/chmod_dummy';

            // get the OS modes for dir
            fs.mkdirSync(target);
            mode777_dir = fs.statSync(target).mode;
            fs.chmodSync(target, '0775');
            mode755_dir = fs.statSync(target).mode;

            // get the OS modes for file
            target += 'dummy';
            fs.writeFileSync(target, 'dummy');
            fs.chmodSync(target, '0777');
            mode777_file = fs.statSync(target).mode;
            fs.chmodSync(target, '0755');
            mode755_file = fs.statSync(target).mode;

            clean(done);
        });
    });
    beforeEach(function (done) {
        clean(function (err) {
            if (err) {
                throw err;
            }

            fs.mkdirSync(__dirname + '/tmp/');
            done();
        });
    });
    after(clean);

    it('should change mode of files', function (done) {
        var dir  = __dirname + '/tmp/chmod/',
            file = 'file.js';

        // create dir
        fs.mkdirSync(dir);

        // create file
        fs.writeFileSync(dir + file, 'dummy');
        fs.chmodSync(dir + file, '0777');

        automaton.run(chmod, {
            files: dir + file,
            mode: '0755'
        }, function (err) {
            if (err) {
                throw err;
            }

            expect(fs.statSync(dir + file).mode).to.equal(mode755_file);
            done();
        });
    });

    it('should accept a file or an array of files', function (done) {
        var dir   = __dirname + '/tmp/chmod/',
            file1 = 'file1.js',
            file2 = 'file2.js',
            files = [];

        files.push(dir + file1);
        files.push(dir + file2);

        // create dir
        fs.mkdirSync(dir);

        // create file1
        fs.writeFileSync(files[0], 'dummy');
        fs.chmodSync(files[0], '0777');

        // create file2
        fs.writeFileSync(files[1], 'dummy');
        fs.chmodSync(files[1], '0777');

        automaton.run(chmod, {
            files: files,
            mode: '0755'
        }, function (err) {
            if (err) {
                throw err;
            }

            expect(fs.statSync(files[0]).mode).to.equal(mode755_file);
            expect(fs.statSync(files[1]).mode).to.equal(mode755_file);

            done();
        });
    });

    it('should error if target does not exists', function (done) {
        var file = __dirname + '/tmp/chmod/file_not_exists.js';

        automaton.run(chmod, {
            files: file,
            mode: '0755'
        }, function (err) {

            expect(err).to.be.an(Error);
            expect(err.message).to.match(/ENOENT/);
            done();
        });
    });

    it('should accept minimatch patterns', function (done) {
        var dir   = __dirname + '/tmp/chmod/',
            file1 = 'file1.js',
            file2 = 'file2.js',
            files = [];

        files.push(dir + file1);
        files.push(dir + file2);

        // create dir
        fs.mkdirSync(dir);

        // create file1
        fs.writeFileSync(files[0], 'dummy');
        fs.chmodSync(files[0], '0777');

        // create file2
        fs.writeFileSync(files[1], 'dummy');
        fs.chmodSync(files[1], '0777');

        automaton.run('chmod', {
            files: dir + '*.js',
            mode: '0755'
        }, function (err) {
            if (err) {
                throw err;
            }

            expect(fs.statSync(files[0]).mode).to.equal(mode755_file);
            expect(fs.statSync(files[1]).mode).to.equal(mode755_file);

            done();
        });
    });

    it('should pass over the glob options', function (done) {
        var dir  = __dirname + '/tmp/chmod/',
            file = '.file.js';

        // create dir
        fs.mkdirSync(dir);

        // create file
        fs.writeFileSync(dir + file);
        fs.chmodSync(dir + file, '0755');

        automaton.run(chmod, {
            files: dir + '*.js',
            mode: '0777',
            glob: {
                dot: true
            }
        }, function (err) {
            if (err) {
                throw err;
            }

            expect(fs.statSync(dir + file).mode).to.equal(mode777_file);
            done();
        });
    });
});
