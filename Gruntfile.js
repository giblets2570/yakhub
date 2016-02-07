'use strict';

module.exports = function (grunt) {
	var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch(e) {
    localConfig = {};
  }

	 // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({

    // get the configuration info from package.json ----------------------------
    // this way we can use things like name and version (pkg.name)
    pkg: grunt.file.readJSON('package.json'),

    env: {
		  test: {
		    NODE_ENV: 'test'
		  },
		  prod: {
		    NODE_ENV: 'production'
		  },
		  all: localConfig
		},

    // all of our configuration will go here

    // configure jshint to validate js files -----------------------------------
  	jshint: {
      options: {
        reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
      },

    // when this task is run, lint the Gruntfile and all js files in src
      build: ['Grunfile.js', 'routes/*.js']
    },

    watch: {

      // for scripts, run jshint and uglify
      scripts: {
        files: 'routes/*.js',
        tasks: ['jshint']
      }
    },

    concurrent: {
      dev: {

        tasks: ['jshint', 'nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    }, // concurrent

    nodemon: {
      dev: {
        script: './server.js'
      }
    } // nodemon


  });

	// ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================
  // we can only load these if they are in our package.json
  // make sure you have run npm install so our app can find these
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('default', '', function() {
    var taskList = [
        'jshint',
        'nodemon',
        'watch'
    ];
    grunt.task.run(taskList);
});

}