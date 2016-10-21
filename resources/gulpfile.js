/*
 * Gulp install plugins
 * @package.json
 */
var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $ = gulpLoadPlugins(),
    sass = require('gulp-ruby-sass');
  const babel = require('gulp-babel');

  require("babel-core").transform("code", {
    presets: ["es2015"]
  });



/*
 * Paths for watch,process & bower
 */
var paths = {
  watch: {
    scripts: ['js/**/*','vendor/js/**/*'],
    styles:['sass/**/*.scss'],
  },
  process: {
    scripts:[
      //'vendor/js/en_bcv_parser.js',
      //'js/src/bv.js',
      'js/src/BvInputClass.js',
      'js/src/bvReadable.js',
      'js/src/bvModal.js',
      'js/src/bv-inputs.js'
    ],
    sass:['sass/verses.scss']
  }
};




/*
 * jsHint
 */
gulp.task('jshint', function () {
  console.log('–:::– JSHINT –:::–');
  return gulp.src(['js/src/**/*.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
});







/*
 * Contact script files to master.js
 */
gulp.task('scripts', function(){
  console.log('–:::– SCRIPTS –:::–');
  return gulp.src(paths.process.scripts)
    .pipe($.changed('js/src/**/*.js'))
    .pipe($.concat('verses.js'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('js/'));
});




/*
 * Minify master.js => master.min.js
 */
gulp.task('compress',['scripts'],function(){
  return gulp.src('js/verses.js')
    .pipe($.jsmin())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest('js/'));
});



/*
 * Notification when script process is done.
 */
gulp.task('notify',['compress'],function(){
  return gulp.src("notify.ext")
   .pipe($.notify({
        "title": "Verses Craft Plugin",
        //"subtitle": "Project web site",
        "message": "Script processing successful!",
        "sound": "Morse", // case sensitive
        "onLast": true,
        "wait": true
      }));
});



/*
 * sass build
 */
gulp.task('sass-app',function(){
  console.log('–:::SASS:::–');
   return sass('sass/') 
    .on('error', function (err) {
      console.error('Error!', err.message);
   })
    .pipe(gulp.dest('css/src'));
});



/*
 * Minify & autoprefix styles
 */
gulp.task('styles',['sass-app'],function(){
  console.log('–:::STYLES:::–');
  return gulp.src('css/src/**/*')
    .pipe($.concat('verses.css'))
    .pipe($.minifyCss())
    .pipe(gulp.dest('css'));
});



/*
 * Watch 'default'
 */
gulp.task('default', function() {
  gulp.watch(paths.watch.scripts, ['scripts','compress','notify']);
  gulp.watch(paths.watch.styles, ['sass-app','styles']);
  //gulp.watch(paths.images, ['images']);
});

