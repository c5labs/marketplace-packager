var argv = require('yargs').argv;
var exec = require('child_process').exec;
var gulp = require('gulp');
var del = require('del');
var change = require('gulp-change');
var zip = require('gulp-zip');
var rename = require("gulp-rename");
var fs = require('fs');

/*
  | Refuse to run without a source
 */
if (typeof argv.source === "undefined") {
    console.error("You must specify as source (i.e. gulp --source /my/folder/name)");
    process.exit(1);
}

/*
 | Try accessing the source path
 */
try {
    fs.accessSync(argv.source, fs.F_OK);
} catch (e) {
    console.error("I couldn't access the source path '"+argv.source+"'.");
    process.exit(1);
}

/*
 | Pipework
 */
var source = argv.source,
    package_name = argv.package || 'my_package',
    destination = 'build/'+package_name;

/*
 | Move the files from the source into 
 | a build directory 'build'.
 */
gulp.task('move', function(){
  return gulp.src([
        source+'/**',
        '!gulpfile.js',
    ],{ dot: argv.includedots })
    .pipe(gulp.dest('./'+destination));
});

/*
 | Install composer dependencies.
 */
gulp.task('compose', ['clean-php'], function(cb) {
    if (typeof argv.skipcompose === "undefined") {

        // Remove any existing dependencies.
        del.sync([
            './'+destination+'/vendor'
        ]);

        // Install.
        exec('composer install --prefer-dist --working-dir '+destination, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    }
    return null;
});

/*
 | Run phpfixer (https://github.com/FriendsOfPHP/PHP-CS-Fixer)
 */
gulp.task('phpfixer', ['compose'], function(cb) {
    if (typeof argv.phpfixer !== "undefined") {
        exec(argv.phpfixer+' fix '+destination, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb();
        });
    } else {
        cb();
    }
});

/*
 | Clean-up PHP
 | This changes als include, require & require_once statements 
 | to use the Laravel F/W versions and also adds c5 do not execute 
 | statements to any PHP files without them
 */
gulp.task('clean-php', ['move'], function() {

    function doChange(content) {
        var i;

        if (typeof argv.skipincludes === "undefined") {
            // require_once
            i = content.replace(/^(.+)?require_once (.+)?$/mg, "        $fs = new \\Illuminate\\Filesystem\\Filesystem(); \r\n$1 $fs->requireOnce($2)");
            
            // require
            i = i.replace(/^(.+)?require (.+)?$/mg, "        $fs = new \\Illuminate\\Filesystem\\Filesystem(); \r\n$1 $fs->getRequire($2)");
            
            // include
            i = i.replace(/^(.+)?include (.+)?$/mg, "        $fs = new \\Illuminate\\Filesystem\\Filesystem(); \r\n$1 $fs->requireOnce($2)");
            
            // fix replacement ends
            i =i.replace(/;\)/gi, ');');
        }

        // do not execute statements
        if (typeof argv.skipexecutes === "undefined") {
            if (! i.match(/defined[\s]*\(['|"]C5_EXECUTE['|"]\)[\s]+or[\s]+die[\s]*\(['|"]Access Denied.['|"]\)[\s]*;/gi)) {
                if (i.match(/(namespace[\s]*([a-z_]+)([\\]+[a-z_]+)*;)/gi)) {
                    i = i.replace(/(namespace[\s]*([a-z_]+)([\\]+[a-z_]+)*;)/gi, "$1\r\n\r\ndefined(\'C5_EXECUTE\') or die(\'Access Denied.\');");
                } else {
                    i = i.replace('<?php', "<?php defined(\'C5_EXECUTE\') or die(\'Access Denied.\');\r\n");
                }
            }
        }

        return i;
    }

    return gulp.src([destination+'/**/*.php'])
        .pipe(change(doChange))
        .pipe(gulp.dest('./'+destination));
});

/*
 | ZIP up the package contents ready for the marketplace.
 */
gulp.task('package', ['compose', 'clean-php', 'phpfixer'], function() {
    if (typeof argv.nopackage === "undefined") {
        console.log('Creating package at releases/'+package_name+'.zip');
       return gulp.src(['./build/**'])
            .pipe(zip(package_name+'.zip'))
            .pipe(gulp.dest('./releases'));
    }
    return null;
});

/*
 | Clean-up by removing the build directory.
 */
gulp.task('cleanup', ['package'], function() {
    if (typeof argv.skipcleanup === "undefined" && typeof argv.nopackage === "undefined") {
        return del.sync([
            './'+destination
          ]);
    }
    return null;
});

gulp.task('default', ['move', 'clean-php', 'compose', 'phpfixer', 'package', 'cleanup']);