'use strict';

var gulp        = require('gulp');
var gulpTest    = require('./gulp/test');
var gulpBuild   = require('./gulp/build');


var config = {
	copySass : {
		sources : [
			'./src/*.scss'
		],
		dest : './dist/'
	},
    paths: {
        karmaConfigFile: __dirname + '/test/karma.conf.js',
	    jsSources : [
		    './src/floating-label.module.js',
		    './src/*.js'
	    ],
	    sassSources : [ './src/*.scss' ],

        dist: './dist/',
        jsOutputFile: 'floating-label.js',
        cssOutputFile: 'floating-label.css'
    }
};

gulp.task('jshint', gulpTest.jsHintTask(config.paths.jsSources));

gulp.task('karma', gulpTest.karmaTask(config.paths.karmaConfigFile));

gulp.task('test', ['jshint', 'karma']);

gulp.task('scripts', gulpBuild.scriptsTask(
    config.paths.jsSources,
    config.paths.jsOutputFile,
    config.paths.dist
));

gulp.task('styles', gulpBuild.stylesTask(
	config.paths.sassSources,
	config.paths.cssOutputFile,
	config.paths.dist
));

gulp.task('copySass', gulpBuild.copySassTask(
	config.copySass.sources,
	config.copySass.dest
));

gulp.task('testing', function(path){
	console.log("The path is:", path);
})


var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname;
var LIVERELOAD_PORT = 35729;
// Let's make things more readable by
// encapsulating each part's setup
// in its own method
function startExpress() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express.static(EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
}

var lr;
function startLivereload() {

	lr = require('tiny-lr')();
	lr.listen(LIVERELOAD_PORT);
}

function notifyLivereload(event) {

	// `gulp.watch()` events provide an absolute path
	// so we need to make it relative to the server root
	console.log("notifying of event:", event);
	var fileName = require('path').relative(EXPRESS_ROOT, event.path);

	lr.changed({
		body: {
			files: [fileName]
		}
	});
}

gulp.task('reload', function(event){
	// `gulp.watch()` events provide an absolute path
	// so we need to make it relative to the server root
	console.log("notifying of event:", event);
	var fileName = require('path').relative(EXPRESS_ROOT, event.path);
	lr.changed({
		body: {
			files: [fileName]
		}
	});
});


gulp.task('server', function(){
	startExpress();
	startLivereload();
});

gulp.task('watch', function() {
	gulp.watch('src/*.scss', ['styles']);
	gulp.watch('src/**/*.js', ['scripts']);
	// gulp.watch('src/index.html', notifyLivereload);
	gulp.watch('dist/*', notifyLivereload);
});

gulp.task('build', [/*'test', */'styles', 'copySass', 'scripts']);

gulp.task('default', ['server', 'build', 'watch']);
