// Variables
var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var cleanCSS = require('gulp-clean-css');
var npmCleanCSS = require('clean-css');
var postcss = require('gulp-postcss');
var pxtorem = require('postcss-pxtorem');
var wait = require('gulp-wait');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var replace = require('gulp-string-replace');
var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');

// Themes paths
var themesPath = './themes/';

// Theme folders
function getFolders(dir) {
  return fs.readdirSync(dir).filter(function (file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

// Theme
// var paths = {
//   styles: {
//     src: 'dcc/src/',
//     dest: 'dcc/dist/',
//   },
// };

// ASSET FILES
// var files = {
//   main: paths.styles.src + '/',
// };
// var themes = {
//   dcc_S: 'themes/dcc/src/',
//   dcc_D: 'themes/dcc/dist/',
// };

var processors = [
  autoprefixer({
    browsers: ['last 3 versions', 'IOS 8'],
    remove: false,
  }),
  pxtorem({
    rootValue: 16,
    unitPrecision: 5,
    propList: ['*'],
    replace: false,
  }),
];

// Compile themes
gulp.task('css', function () {
  var folders = getFolders(themesPath);

  var tasks = folders.map(function (folder) {
    // var themeFolder = path.join(themesPath + folder + '/dist/');
    return (
      gulp
        .src(path.join(themesPath, folder, '/src/*.scss'))
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .on(
          'error',
          notify.onError({
            message: 'theme ' + folder + ' not compiled',
          })
        )
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        // .pipe(gulp.dest(themes.dcc_D));
        .pipe(gulp.dest(path.join(themesPath + folder + '/dist/')))
    );
  });
});

// Clean themes
gulp.task('clean-css', ['css'], function () {
  return gulp.src(themesPath + '/**/*.min.css', { read: false }).pipe(clean());
});

// Compress themes
gulp.task('compress-css', ['clean-css'], function () {
  var folders = getFolders(themesPath);

  var tasks = folders.map(function (folder) {
    return (
      gulp
        // .src(themesPath + '*.css')
        .src(path.join(themesPath, folder, '/dist/*.css'))
        .pipe(sass().on('error', sass.logError))
        .on(
          'error',
          notify.onError({
            message: 'theme ' + folder + ' compression failed',
          })
        )
        .pipe(
          cleanCSS({
            level: {
              1: {
                specialComments: 0,
                removeUnusedAtRules: false,
                restructureRules: true,
              },
            },
            compatibility: '*',
            advanced: true,
            ieBangHack: true,
            ieFilters: true,
            iePrefixHack: true,
            ieSuffixHack: true,
            sourceMap: true,
          })
        )
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(path.join(themesPath + folder + '/dist/')))
        .pipe(
          notify({
            message: 'theme ' + folder + ' compressed',
            onLast: true,
          })
        )
    );
  });
});

// Default task
gulp.task('default', ['compress-css'], function () {
  gulp.start('compress-css');
  gulp.watch(themesPath + '**/*.scss', ['compress-css']);
});
