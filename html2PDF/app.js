/*global require*/
'use strict';

require.config({
    baseUrl: '.',
    paths: {
        underscore: 'third_party/underscore',
        backbone: 'third_party/backbone',
        jquery: 'third_party/jquery-1.10.2',
        bootstrap: 'third_party/bootstrap/js/bootstrap',
        datepicker: 'third_party/bootstrap/js/bootstrap-datepicker',
        multiselect: 'third_party/bootstrap/js/bootstrap-multiselect',
        modernizr: "third_party/modernizr-2.6.2.min",
        xml2json: 'third_party/xml2json',
        handlebars: 'third_party/handlebars',
        hbars: 'third_party/hbars',
        json2: 'third_party/json2',
        json: 'third_party/json',
        text: 'third_party/text',
        moment: 'third_party/moment.min',
        highcharts: 'third_party/highcharts'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        datepicker: {
            deps: ['jquery', 'bootstrap']
        },
        multiselect: {
            deps: ['jquery', 'bootstrap']
        },
        highcharts: {
            exports: "Highcharts",
            deps: ["jquery"]
        },
        handlebars: {
            exports: 'Handlebars'
        },
        hbars: {
            deps: ["handlebars"]
        }
    },
    hbars: {
        extension: ".hbs"
    }
});

function rqErr(wtf ) {
    console.error ("requirejs load error", wtf);
}

require(["views/charting-view", "backbone", "underscore"], function(ChartingView) {

    var DEFAULT_NODE_ID = 'slot:/DataEye/VISCON';

    require(['util/params'], function(params) {

        var nodeId = params.getParam('node');
        if (nodeId) {

            // get rid of station if its there
            nodeId = nodeId.replace(/station:\|/g, '');

            // be 'slot:' agnostic
            if ( !/^slot:/.test(nodeId)) {
                nodeId = 'slot:' + nodeId;
            }
            // be intollerant of trailing /
            nodeId = nodeId.replace(/\/$/, '');

        } else {
            nodeId = DEFAULT_NODE_ID;
        }
        new ChartingView({
            nodeId: nodeId
        });
    });

}, rqErr);