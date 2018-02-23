var gulp = require('gulp');
var rename = require('gulp-rename');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var karma = require('karma').server;
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var fs = require('fs');

gulp.task('default', ['css', 'jshint', 'test', 'compress']);

gulp.task('less', function() {
  return gulp.src('./less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./css'));
});

gulp.task('css', ['less'], function() {
  return gulp.src('./css/colorpicker.css')
      .pipe(minifyCss())
      .pipe(rename('colorpicker.min.css'))
      .pipe(gulp.dest('./css'));
});

gulp.task('jshint', function () {
  return gulp.src(['js/*.js', 'lazy_js/*.js', 'test/unit/*.js', '!js/bootstrap-colorpicker-module.min.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('compress', function() {
  gulp.src(['./lazy_js/factory.js', './lazy_js/link.js'])
      .pipe(concat('./dist/uib-colorpicker-lazy.min.js'))
      .pipe(replace('CSS_UIB_COLORPICKER_APP', '"'+fs.readFileSync('./css/colorpicker.min.css', 'utf-8')+'"'))
      .pipe(uglify())
      .pipe(rename('uib-colorpicker-lazy.min.js'))
      .pipe(gulp.dest('./dist'));
  gulp.src(['./js/bootstrap-colorpicker-module.js'])
      .pipe(concat('./dist/uib-colorpicker.min.js'))
      .pipe(replace('CSS_UIB_COLORPICKER_APP', '"'+fs.readFileSync('./css/colorpicker.min.css', 'utf-8')+'"'))
      .pipe(uglify())
      .pipe(rename('uib-colorpicker.min.js'))
      .pipe(gulp.dest('./dist'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done);
});
