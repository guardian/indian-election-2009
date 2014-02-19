module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 9999,
                    base: 'src',
                    hostname: '*',
                    keepalive: true
                }
            }
        }
    });

    // Loads
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Tasks
    grunt.registerTask('default', ['connect']);
};
