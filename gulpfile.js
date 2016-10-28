var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');
gulp.watch = watch;
var flatten = require('gulp-flatten');
var del = require('del');
var cache = require('gulp-cache');
var fileinclude = require('gulp-file-include');
var removeCode = require('gulp-remove-code');
var removeEmptyLines = require('gulp-remove-empty-lines');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var argv = require('yargs').argv;
var dedupe = require('gulp-dedupe');

/* Routes */

//base
var base_scss_route_from = ['app/base/*.scss', 'app/base/core/*.scss', 'app/base/modules/**/scss/*.scss'];
var base_scss_route_to = 'dist/css';
var base_scss_route_file_name = 'base.css';

var base_fonts_route_from = 'app/base/core/fontawesome/fonts/*.*';
var base_fonts_route_to = 'dist/fonts';

//general
var general_scss_route_from = 'app/general/scss/*.scss';
var general_scss_route_to = 'dist/css';
var general_scss_route_file_name = 'general.css';

var general_js_route_from = ['app/general/js/*.js', '!app/general/js/_*.js'];
var general_js_route_to = 'dist/js';
var general_js_route_file_name = 'general.js';

var general_ts_route_from = 'app/general/ts/*.ts';
var general_ts_route_file_name = 'general-ts.js';
var general_ts_route_to = 'dist/js';

var general_images_route_from = 'app/general/img/*.*';
var general_images_route_to = 'dist/img';

var general_fonts_route_from = 'app/general/fonts/*.*';
var general_fonts_route_to = 'dist/fonts';


//layouts
var layouts_scss_route_from = 'app/layouts/**/scss/*.scss';
var layouts_scss_route_to = 'dist/css';
var layouts_scss_route_file_name = 'layouts.css';

var layouts_js_route_from = ['app/layouts/**/js/*.js', '!app/layouts/**/js/_*.js'];
var layouts_js_route_to = 'dist/js';
var layouts_js_route_file_name = 'layouts.js';

var layouts_ts_route_from = 'app/layouts/**/**/ts/*.ts';
var layouts_ts_route_file_name = 'layouts-ts.js';
var layouts_ts_route_to = 'dist/js';

var layouts_images_route_from = 'app/layouts/**/img/*.*';
var layouts_images_route_to = 'dist/img';


//modules
var modules_scss_route_from = ['app/modules/**/scss/*.scss', '!app/modules/_components/**/scss/*.scss'];
var modules_scss_route_to = 'dist/css';
var modules_scss_route_file_name = 'modules.css';

var modules_js_route_from = ['app/modules/**/js/*.js', '!app/modules/_components', '!app/modules/**/js/_*.js'];
var modules_js_route_to = 'dist/js';
var modules_js_route_file_name = 'modules.js';

var modules_ts_route_from = ['app/modules/**/ts/*.ts', '!app/modules/_components'];
var modules_ts_route_file_name = 'modules-ts.js';
var modules_ts_route_to = 'dist/js';

var modules_images_route_from = ['app/modules/**/img/*.*', '!app/modules/_components'];
var modules_images_route_to = 'dist/img';

var modules_html_route_from = ['app/modules/**/*.html', '!app/tmp/*.html'];
var modules_html_route_to = 'app/tmp';

//components
var components_scss_route_from = ['app/modules/_components/**/scss/*.scss'];
var components_scss_route_to = 'dist/css';
var components_scss_route_file_name = 'components.css';

var components_js_route_from = ['app/modules/_components/**/js/*.js', '!app/modules/_components/**/js/_*.js'];
var components_js_route_to = 'dist/js';
var components_js_route_file_name = 'components.js';

var components_ts_route_from = ['app/modules/_components/**/ts/*.ts'];
var components_ts_route_file_name = 'components-ts.js';
var components_ts_route_to = 'dist/js';

var components_images_route_from = ['app/modules/_components/**/img/*.*']
var components_images_route_to = 'dist/img';

//templates
var templates_html_route_from = 'app/*.html';
var templates_html_route_cache = 'app/tmp';
var templates_html_route_to = 'dist/';

//vendors
var vendors_js_route_from = ['app/general/js/_*.js', 'app/layouts/**/js/_*.js', 'app/modules/**/js/_*.js', 'app/modules/_components/**/js/_*.js'];
var vendors_js_route_file_name = 'vendors.js';
var vendors_js_route_to = 'dist/js';


/* Handlers */

function makeSCSS(folder_from, folder_to, dest_file) {
    gulp.src(folder_from)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 1%'],
            cascade: false
        }))
        .pipe(cleanCSS({
            compatibility: 'ie10'
        }))
        .pipe(concat(dest_file))
        .pipe(gulp.dest(folder_to));
}


function makeJS(folder_from, folder_to, dest_file) {
    gulp.src(folder_from)
        .pipe(flatten())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(dedupe())
        .pipe(concat(dest_file))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(folder_to));
}

function makeTS(folder_from, folder_to, dest_file) {
    gulp.src(folder_from)
        .pipe(flatten())
        .pipe(sourcemaps.init())
        .pipe(typescript())
        .pipe(uglify())
        .pipe(dedupe())
        .pipe(concat(dest_file))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(folder_to));
}

function copyImages(folder_from, folder_to) {
    gulp.src(folder_from)
        .pipe(cache(imagemin()))
        .pipe(flatten())
        .pipe(gulp.dest(folder_to));
}

function copyFiles(folder_from, folder_to, callback) {
    if (typeof(callback) == "undefined") {
        callback = function() {};
    }
    gulp.src(folder_from)
        .pipe(flatten())
        .pipe(gulp.dest(folder_to))
        .on('end', callback);
}

function makeHTML(folder_from, folder_cache, folder_to) {
    gulp.src(folder_from)
        .pipe(flatten())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: folder_cache
        }))
        .pipe(removeCode({
            production: true
        }))
        .pipe(removeEmptyLines())
        .pipe(gulp.dest(folder_to));
}

function buildTemplates() {
    // remove html
    makeHTML(templates_html_route_from, templates_html_route_cache, templates_html_route_to);
}


/* Default Task */

gulp.task('default', ['base', 'general', 'layouts', 'modules', 'components', 'templates', 'vendors'], function() {
    browserSync.init({
        logLevel: "info",
        port: 8080,
        open: false,
        server: {
            baseDir: '.'
        },
        notify: false
    });
    gulp.watch(['dist/*.*', 'dist/**/*.*', 'dist/**/**/*.*', 'dist/**/**/**/*.*', 'dist/**/**/**/**/*.*'], function() {
        browserSync.reload();
    });
});


/* Tasks */

gulp.task('removedist', function() {
    return del.sync('dist');
});

gulp.task('clearhtmlcache', function() {
    return del.sync('app/tmp/*.*');
});

gulp.task('clearcache', function() {
    return cache.clearAll();
});

gulp.task('makehtml', function() {
    buildTemplates();
});

gulp.task('wp_push', function() {
    if (argv.d !== undefined && argv.d !== true) {
        gulp.src('./dist/**/*')
            .pipe(gulp.dest('../' + argv.d + '/app/assets/'));
    } else {
        console.log("Use format: gulp wp_push --d project_folder");
    }
});

gulp.task('base', function() {
    gulp.watch(base_scss_route_from,
        function() {
            makeSCSS(base_scss_route_from, base_scss_route_to, base_scss_route_file_name);
        }
    );
    gulp.watch(base_fonts_route_from,
        function() {
            copyFiles(base_fonts_route_from, base_fonts_route_to);
        }
    );
});

gulp.task('general', function() {
    gulp.watch(general_scss_route_from,
        function() {
            makeSCSS(general_scss_route_from, general_scss_route_to, general_scss_route_file_name);
        }
    );
    gulp.watch(general_js_route_from,
        function() {
            makeJS(general_js_route_from, general_js_route_to, general_js_route_file_name);
        }
    );
    gulp.watch(general_images_route_from,
        function() {
            copyImages(general_images_route_from, general_images_route_to);
        }
    );
    gulp.watch(general_fonts_route_from,
        function() {
            copyFiles(general_fonts_route_from, general_fonts_route_to);
        }
    );
    gulp.watch(general_ts_route_from,
        function() {
            makeTS(general_ts_route_from, general_ts_route_to, general_ts_route_file_name);
        }
    );
});

gulp.task('layouts', function() {
    gulp.watch(layouts_scss_route_from,
        function() {
            makeSCSS(layouts_scss_route_from, layouts_scss_route_to, layouts_scss_route_file_name);
        }
    );
    gulp.watch(layouts_js_route_from,
        function() {
            makeJS(layouts_js_route_from, layouts_js_route_to, layouts_js_route_file_name);
        }
    );
    gulp.watch(layouts_images_route_from,
        function() {
            copyImages(layouts_images_route_from, layouts_images_route_to);
        }
    );
    gulp.watch(layouts_ts_route_from,
        function() {
            makeTS(layouts_ts_route_from, layouts_ts_route_to, layouts_ts_route_file_name);
        }
    );
});

gulp.task('modules', function() {
    gulp.watch(modules_scss_route_from,
        function() {
            makeSCSS(modules_scss_route_from, modules_scss_route_to, modules_scss_route_file_name);
        }
    );
    gulp.watch(modules_js_route_from,
        function() {
            makeJS(modules_js_route_from, modules_js_route_to, modules_js_route_file_name);
        }
    );
    gulp.watch(modules_images_route_from,
        function() {
            copyImages(modules_images_route_from, modules_images_route_to);
        }
    );
    gulp.watch(modules_html_route_from,
        function() {
            copyFiles(modules_html_route_from, modules_html_route_to, buildTemplates);
        }
    );
    gulp.watch(modules_ts_route_from,
        function() {
            makeTS(modules_ts_route_from, modules_ts_route_to, modules_ts_route_file_name);
        }
    );
});

gulp.task('components', function() {
    gulp.watch(components_scss_route_from,
        function() {
            makeSCSS(components_scss_route_from, components_scss_route_to, components_scss_route_file_name);
        }
    );
    gulp.watch(components_js_route_from,
        function() {
            makeJS(components_js_route_from, components_js_route_to, components_js_route_file_name);
        }
    );
    gulp.watch(components_images_route_from,
        function() {
            copyImages(components_images_route_from, components_images_route_to);
        }
    );
    gulp.watch(components_ts_route_from,
        function() {
            makeTS(components_ts_route_from, components_ts_route_to, components_ts_route_file_name);
        }
    );
});

gulp.task('templates', function() {
    gulp.watch([templates_html_route_from],
        function() {
            buildTemplates();
        }
    );
});

gulp.task('vendors', function() {
    gulp.watch(vendors_js_route_from,
        function() {
            makeJS(vendors_js_route_from, vendors_js_route_to, vendors_js_route_file_name);
        }
    );
});

gulp.task('build', ['removedist', 'clearcache', 'clearhtmlcache'], function() {
    //base
    makeSCSS(base_scss_route_from, base_scss_route_to, base_scss_route_file_name);
    copyFiles(base_fonts_route_from, base_fonts_route_to);
    //general
    makeSCSS(general_scss_route_from, general_scss_route_to, general_scss_route_file_name);
    makeJS(general_js_route_from, general_js_route_to, general_js_route_file_name);
    copyImages(general_images_route_from, general_images_route_to);
    copyFiles(general_fonts_route_from, general_fonts_route_to);
    makeTS(general_ts_route_from, general_ts_route_to, general_ts_route_file_name);
    //layouts
    makeSCSS(layouts_scss_route_from, layouts_scss_route_to, layouts_scss_route_file_name);
    makeJS(layouts_js_route_from, layouts_js_route_to, layouts_js_route_file_name);
    copyImages(layouts_images_route_from, layouts_images_route_to);
    makeTS(layouts_ts_route_from, layouts_ts_route_to, layouts_ts_route_file_name);
    //modules
    makeSCSS(modules_scss_route_from, modules_scss_route_to, modules_scss_route_file_name);
    makeJS(modules_js_route_from, modules_js_route_to, modules_js_route_file_name);
    copyImages(modules_images_route_from, modules_images_route_to);
    copyFiles(modules_html_route_from, modules_html_route_to, buildTemplates);
    makeTS(modules_ts_route_from, modules_ts_route_to, modules_ts_route_file_name);
    //components
    makeSCSS(components_scss_route_from, components_scss_route_to, components_scss_route_file_name);
    makeJS(components_js_route_from, components_js_route_to, components_js_route_file_name);
    copyImages(components_images_route_from, components_images_route_to);
    makeTS(components_ts_route_from, components_ts_route_to, components_ts_route_file_name);
    //vendors
    makeJS(vendors_js_route_from, vendors_js_route_to, vendors_js_route_file_name);
});