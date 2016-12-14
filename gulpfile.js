var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
var template = require('gulp-template');
var runSequence = require('run-sequence');
var flatten = require('gulp-flatten');
var exec = require('child_process').exec;
var standard = require('gulp-standard')
var watch = require('gulp-watch');
var zip = require('gulp-vinyl-zip');
var addsrc = require('gulp-add-src');
var babelminify = require('gulp-babel-minify');
var gulpIgnore = require('gulp-ignore');
var del = require('del');
var babel = require('gulp-babel');

var package = require('./package.json');
console.log("p.version="+package.version);

// use gulp html --debug false

var minimist = require('minimist');

  var knownOptions = {
    string: ['debug','browser'],
    default: {debug:false,browser:'chrome'}
  };

var options = minimist(process.argv.slice(2), knownOptions); 
console.log("Options debug :"+options.debug)

gulp.task('watch', function () {
   gulp.watch(['upwork_addon/**/*','common/**/*'], ['build-upwork']);
});

var config={
  dist_path: "build/",
  tasks:{
    upwork_addon: 
      {
        name:"upwork",
        dir:"upwork_addon"
      }
  }
};
function makeMiniTask (task,dir) {
  var fn = function () {
    gulp.src([dir+'/**/*.js'])
      .pipe(preprocess({context: { ENVDST: 'production'},extension:"js"}))
      .pipe(babelminify({
          ext:{
              src:'.js',
              min:'-ini.js'
          },
      }).on('error', function(e){
              console.log(e);
           }))
      .pipe(gulp.dest(config.dist_path+dir+'/'))
      
    gulp.src(['common/js/*.js'], {base: "."})
      .pipe(preprocess({context: { ENVDST: 'production'},extension:"js"}))
      .pipe(babelminify({
          ext:{
              src:'.js',
              min:'-ini.js'
          },
          noSource: true,
      }).on('error', function(e){
              console.log(e);
           }))
      .pipe(gulp.dest(config.dist_path+dir+'/'))
      
    gulp.src(['./'+dir+'/**/*','!./'+dir+'/**/*.js','!./'+dir+'/README.md'])
      .pipe(gulpIgnore.exclude(['build/'+dir+'/**/*.png','build/'+dir+'/**/*.jpg']))
      .pipe(preprocess({context: { ENVDST: 'production'},extension:"js"}))
      .pipe(addsrc(['build/'+dir+'/**/*.png','build/'+dir+'/**/*.jpg']))

      .pipe(gulp.dest(config.dist_path+dir));  
    
    gulp.src(['./common/**/*','!./common/*/*.js'])
      .pipe(gulp.dest(config.dist_path+dir+'/common'));    
  }
  fn.displayName = "mini-"+task;
  gulp.task("mini-"+task, fn);
  // Or if gulp 4: gulp.task(fn);
}
function makeDelTask (task,dir) {

  var fn = function () {
    return del('build/'+dir);
  };
  fn.displayName = "del-"+task;
  console.log("DEL Building task ",task);
  gulp.task("del-"+task, fn);
  // Or if gulp 4: gulp.task(fn);
}

function makeDistTask (task,dir) {
  var fn = function () {
    return runSequence(
    'del-'+task,
    'mini-'+task,
    'zip-'+task,
    function (error) {
      if (error) {
        console.log(error.message);
      } else {
      }
    });
  };
  fn.displayName = "dist-"+task;
  gulp.task("dist-"+task, fn);
  // Or if gulp 4: gulp.task(fn);
}

function makeZiptask (task,dir) {
  var archive_name = dir+"-"+package.version+'.zip';
  var fn = function () {
    var date = new Date();
    console.log("Archive generated: "+archive_name);

    return gulp.src(['build/'+dir+'/**/*'])
      .pipe(zip.dest('./dist/'+archive_name));        
  };
  fn.displayName = "zip-"+task;
  gulp.task("zip-"+task, fn);
  // Or if gulp 4: gulp.task(fn);
}
function makeBuildTask (task,dir) {
  var fn = function () {
    gulp.src(['./'+dir+'/**/*','!./'+dir+'/README.md'])
      .pipe(gulp.dest('./build/'+dir));
    return gulp.src(['./common/**/*'])
      .pipe(gulp.dest('./build/'+dir+'/common'));      
  };
  fn.displayName = "build-"+task;
  gulp.task("build-"+task, fn);
  // Or if gulp 4: gulp.task(fn);
}

for (task in config.tasks) {
  var task_name = config.tasks[task].name;
  var dir_name = config.tasks[task].dir;
  console.log("Building: ",task_name);
  makeDelTask(task_name, dir_name);
  makeDistTask(task_name, dir_name);
  makeZiptask(task_name, dir_name);
  makeMiniTask(task_name, dir_name);
  makeBuildTask(task_name, dir_name);
}

gulp.task('clean', function(cb) {
  exec("rm -rf build/bulk_addon", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    exec("rm -rf build/email_remover_chromeapp", function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  })
  exec("rm -rf build/clickbyclick_addon", function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
    });
});


gulp.task('default', ['all']); 