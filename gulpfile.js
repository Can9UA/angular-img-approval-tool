'use strict';

// common
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');
const browserSync = require('browser-sync').create();
const rimraf = require('gulp-rimraf');
const zip = require('gulp-zip');

// pug
const pug = require('gulp-pug');

// scss
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const debug = require('gulp-debug');

// for build
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const csso = require('gulp-csso');
let isBuild = false;

// common livereload
gulp.task('watch', function () {
  browserSync.init({
    server: './',
    port: '9000',
    notify: false,
    startPath: 'frontend/'
  });

  gulp.watch(['frontend/pug/**/*.pug'], gulp.series('pug-compile', 'reload'));
  gulp.watch(['frontend/sass/**/*.scss'], gulp.series('scss-compile', 'reload'));
  gulp.watch(['frontend/js/**/*.js'], gulp.series('reload'));
});

gulp.task('clean', function () {
  return gulp.src(['./frontend/css/*.css', './frontend/*.html'])
             .pipe(rimraf());
});

gulp.task('clean-build', function () {
  return gulp.src(['./build/**/*.*'])
             .pipe(rimraf());
});

gulp.task('reload', function (callback) {
  browserSync.reload();
  callback();
});

// pug
gulp.task('pug-compile', function () {
  return gulp.src(['frontend/pug/**/*.pug', '!frontend/pug/_*/*'])
    .pipe(plumber({
      errorHandler: function (err) {
        gutil.beep();
        gutil.log(gutil.colors.red(err.message));
        this.emit('end');
      }})
    )
    .pipe(
      pug({pretty: true})
    )
    .pipe(gulp.dest('frontend/'));
});

// scss
gulp.task('scss-compile', function () {
  return gulp.src(['./frontend/sass/**/*.scss'])
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: ['last 3 versions'], // ['last 3 versions', 'IE 8']
        cascade: true
      }))
      .pipe(debug({title: 'compile:'}))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./frontend/css/'));
});

// build
gulp.task('minimize', function () {
  return gulp.src('./frontend/*.html')
             .pipe(useref())
             .pipe(gulpIf('*.js', uglify()))
             .pipe(gulpIf('*.css', csso()))
             .pipe(gulp.dest('build'));
});

gulp.task('checkBuild', function (callback) {
  isBuild = true;
  callback();
});

gulp.task('build-zip', function () {
  return gulp.src('build/*')
             .pipe(zip('archive.zip'))
             .pipe(gulp.dest('./'));
});

// tasks for work ----------------------
gulp.task('default',
  gulp.series(
    'clean', 'pug-compile', 'scss-compile',
    gulp.parallel('watch')
  )
);

gulp.task('build',
  gulp.series(
      'checkBuild', 'clean', 'pug-compile', 'scss-compile', 'clean-build',
      gulp.parallel('minimize')
    )
);

gulp.task('zip', gulp.series('build', 'build-zip'));