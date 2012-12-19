// Define aliases for the paths used.
//
// If you edit this section, make sure the analog edit goes into
// /static/js/build.js as well. These need to stay in sync.
require.config({
    waitSeconds: 15,
    paths: {
        jQuery      : 'lib/jquery',
        Underscore  : 'lib/underscore',
        Backbone    : 'lib/backbone'
    },
    priority: ['jQuery'],
    shim: {
        'lib/plugins/jquery-linedtextarea' : ['jQuery'],
        'lib/plugins/jquery.carat' : ['jQuery'],
        'jsonlint/jsl.interactions' : ['Backbone'],
        Backbone : {
            deps : ['jQuery', 'Underscore'],
            exports : 'Backbone',
            init : function($, _) {
                _.noConflict();
                return Backbone.noConflict()
            }
        },
        Underscore : {
            exports : '_'
        }
    }
});

require([
    'jQuery',
    'Underscore',
    'Backbone'
]);
