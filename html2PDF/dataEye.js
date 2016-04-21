/***************************************************

Name: dataEye.js
Version: 1.0.0
Date: 7/26/13
Author: Robert Sadler, Brian Murrell
Description: Enables an easy interaction with Webeye/Niagara.

Usage:

var req = {
  callback: reqCb,
  method1: {                             // name of object here is not significant
    method: 'getValue',
    data: 'prophetData:Calculations/Metrics/Indices/ComfortIndex_Hvac',
    nodeId: 'slot:/DataTree/EastRegion/Team07/Louisiana/MallOfLouisiana'
  }
}

dataEye.getData(req);

function reqCb(res) {
  // do stuf with res
}

***************************************************/

(function(){

    var parsers = {

        getDataDefinition: function(methodResponses) {
            var data = [];
            _.each(methodResponses, function(resp) {
                var uid = resp['@uid'];
                var datum = {
                    uid: resp['@uid'],
                    prophetName: resp['@name']
                };
                if (resp.error) {
                    _.extend(datum, {error: resp.error});
                } else {
                    _.extend(datum, resp.dataDefinition);
                    // replace @type with type
                    datum.type = datum['@type']; delete datum['@type'];
                    // transform trended to true boolean type
                    datum.trended = datum.trended === 'true';

                    if (!_.isUndefined(datum.units)) {
                        datum.units = {
                            text: datum.units['#text'],
                            name: datum.units['@name']
                        };
                    }

                    // actions is a container; it has an array of 'action' inside;
                    // just promote up to datum.actions array
                    if (!_.isUndefined(datum.actions)) {
                        // ensure action prop is an array
                        datum.actions.action = _.isArray(datum.actions.action) ?
                            datum.actions.action :
                            [datum.actions.action];
                        datum.actions = _.map(datum.actions.action, function(a) {
                            return a;
                        });
                    }

                    // TODO: range/enums has not been tested yet!
                    // range is for enums; stores the valid enum values
                    if ( !_.isUndefined(datum.range) ) {
                        var tags = _.isArray(datum.range.tag) ? datum.range.tag : [datum.range.tag];

                    }

                }
                data.push(datum);
            });
            return data;
        },

        getValue: function(methodResponses) {
            var data = [];
            _.each(methodResponses, function(resp) {
                resp.uid = resp['@uid']; delete resp['@uid'];
                resp.prophetName = resp['@name']; delete resp['@name'];
                if (resp.error) {
                    resp.valueObj = {
                        type: 'error',
                        value: ''
                    };
                }
                if (resp.value) {
                    resp.valueObj = {
                        type: resp.value['@type'],
                        value: resp.value['#text']
                    };
                    if ( resp.value['@status'] ) {
                        resp.valueObj.statuses = resp.value['@status'].split(',');
                        delete resp.value['@status'];
                    }
                    // HACK TO FIX SERVER BUG. STATUS IS NOT COMING IN ATTRIBUTE
                    // BUT IN VALUE INSTEAD
                    (function fixStatusBug() {
                        var statusRE = /(\{\w+\})/;
                        var statusMatch = statusRE.exec(resp.valueObj.value);
                        if ( statusMatch ) {
                            resp.valueObj.statuses = [statusMatch[1]];
                            resp.valueObj.value = resp.valueObj.value.replace(statusRE, '');
                            // SOMETIMES WITH NO VALUE, THE SERVERS SENDS A '-' IN THE VALUE
                            // WITH A STATUS. KILL THAT.
                            var dashRE = /- /;
                            resp.valueObj.value = resp.valueObj.value.replace(dashRE, '');
                        }
                    })();
                    delete resp.value;
                } else {
                    resp.valueObj = {};
                }
                // TODO: resp.expressions parsing has not been tested yet...
                if (resp.expressions) {
                    var expressions = _.isArray(resp.expressions.exp) ? resp.expressions.exp : [resp.expressions.exp];
                    expressions = _.map(expressions, function(exp) {
                        var obj = {};
                        // xml2json will return exp different ways depending on
                        // whether attributes were returned (see xml2json doc)
                        // this anticpates the polymorphous states
                        if ( !_.isUndefined(exp['@id']) ) {
                            obj.id = exp['@id'];
                            obj.value = exp['#text'];
                        } else {
                            obj.value = exp;
                        }
                        return obj;
                    });
                    resp.expressions = expressions;
                }
                data.push(resp);
            });
            return data;
        }
    }


    function valueOf(data) {
        var val = data.valueObj.value;
        switch (data.type) {
            case 'numeric':
                var passThru = _.isEmpty(val);
                if ( passThru ) {
                    val = val;
                } else if ( /\./.test(val) ) {
                    val = parseFloat( Number(val).toFixed( parseInt(data.precision, 10) ) );
                    val = $util.addCommas(val);
                } else {
                    val = parseInt(val, 10);
                }
                if ( !passThru && !!data.units ) {
                    val += ' ' + data.units.text;
                }
                break;
            case 'boolean':
                if ( !_.isUndefined(data.valueObj.trueText) ) {
                    // if it has trueText or falseText, return that
                    val = (val === "true") ? data.valueObj.trueText : data.valueObj.falseText;
                } else if (val === "true" || val === "false") {
                    // if it has 'string' boolean convert to true boolean
                    val = val === "true";
                }
                // otherwise pass thru the val
                break;
            case 'enum':
                // TODO: do something with mapped enum vals
            case 'string':
                // TODO:  mabye nothing to do, but need a test case

        }
        return val;
    }

    // TODO: this is a conceptual WIP. not yet used, but should
    // be fleshed out and used for all calls to enforce validity of
    // the proper method elements and structure for each method type
    function validateOptions(options, typeValidator) {
        if (options.method) {
            options.methods = [options.method]; delete options.method;
        }
        if ( options.methods && !_.isArray(options.methods) ) {
            options.methods = [options.methods];
        }
        if (!options.methods) {
            throw('DataEye API: options did not provide any methods to call.');
        }
        options.methods = _.map(options.methods, function(m) {
            if ( !_.isArray(m.criteria) ) {
                m.criteria = [m.criteria];
            }
            _.each(m.criteria, function(c) {
                if (c.attr && !_.isArray(c.attr) ) {
                    c.attr = [c.attr];
                }
            });
        });
        options = _.map(options, function(o) {
            return o.uid = o.uid || _.uniqueId();
        });

        if (typeValidator) {
            options = typeValidator(options);
        }

        return options;
    }

    var dataEye = {
        // return values for data.  in Prophet, data definitions come from
        // getData/getDataDefinition and the values come from getValue
        // this API function allows you to request a comprehensive dataValue object
        // with sugared information representing the values data type, precision, etc.
        //
        // in its simplest, singlular form, the options can be a simple object as in:
        //
        //    {
        //     nodeId: 'slot:/DataTree/WestRegion/Team01/California/NorthridgeFashionCenter/HVAC/MRTU01',
        //     data: 'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZontControlTempNum'
        //    }
        //
        // or, for a single node, you may request multiple data values as in:
        //
        //    {
        //     nodeId: 'slot:/DataTree/WestRegion/Team01/California/NorthridgeFashionCenter/HVAC/MRTU01',
        //     data: [
        //        'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZontControlTempNum',
        //        'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZoneControlSpNum'
        //     ]
        //    }
        //
        // and if you want to request data for multiple nodes, you may pass options as an array
        // which contains nodeId and data properties as in:
        //
        //    [
        //       {
        //        nodeId: 'slot:/DataTree/WestRegion/Team01/California/NorthridgeFashionCenter/HVAC/MRTU01',
        //        data: 'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZontControlTempNum'
        //       },
        //       {
        //        nodeId: 'slot:/DataTree/WestRegion/Team01/California/NorthridgeFashionCenter/HVAC/MRTU02',
        //        data: 'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZontControlTempNum'
        //       },
        //       {
        //        nodeId: 'slot:/DataTree/WestRegion/Team01/California/NorthridgeFashionCenter/HVAC/MRTU03',
        //        data: [
        //           'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZontControlTempNum',
        //           'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZoneControlSpNum'
        //        ]
        //       }
        //    ]
        //
        // also, for any supported prophet criteria for getValue, you simply provide them as name/value objects
        //
        //    {
        //     nodeId: 'slot:/DataTree/WestRegion/Team01/California/NorthridgeFashionCenter/HVAC/MRTU01',
        //     data: 'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZontControlTempNum',
        //     timeRange: 'today',
        //     aggregation: 'avg',
        //     timeFilter: {
        //       daysOfWeek: [1,4,7],
        //       timeRange: [0,1000000]
        //     }
        //    }
        //
        //
        // given an array of node-ish objects, each with an array of data
        // to get (e.g. 'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZoneControlSpNum')
        // return an array of data correlating the array of nodes
        // options:
        //   [
        //        {
        //            uid: _.uniqueId('-equipData'),
        //            nodeId: row.slotPath,
        //            data: [
        //                'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZoneControlSpNum',
        //                'slot:/DataTree/data/Haystack/hvac/temp/air/numeric/activeZoneControlTempNum'
        //            ]
        //        },
        //        {
        //          ...
        //        }
        //   ]
        //
        // returns:
        //     [
        //         {
        //
        //         },
        //        {
        //          ...
        //        }
        //     ]

        getDataValuesForNodes: function(options) {
            var singleNode = false;
            // simplest form, options is an object
            if (!_.isArray(options)) {
                singleNode = true;
                options = [options];
            }

            _.each(options, function(opt) {
                // simplest form, data is an object
                if (!_.isArray(opt.data)) {
                    opt.data = [opt.data];
                }
            });

            GETVALUE_CRITERIA = ['tags', 'aggregation', 'timeRange', 'timeFilter', 'rollup', 'autoDelta', 'expressions'];

            var methods = [];
            // matchMaker keeps track of the paired uid to associate
            // the getDataDefinition and getValue responses
            var matchMaker = [];
            _.each(options, function(opt){
                _.each(opt.data, function(d, i) {
                    // augment uid to facilitate correlating the two sets
                    var uid = opt.uid + '---' + i;
                    matchMaker.push(uid);
                    methods.push({
                        uid: uid,
                        name: 'getDataDefinition',
                        criteria: [
                            {name: 'nodeId', value: opt.nodeId},
                            {name: 'data', value: d}
                        ]
                    });
                    var getValueMethod = {
                        uid: uid,
                        name: 'getValue',
                        criteria: [
                            {name: 'nodeId', value: opt.nodeId},
                            {name: 'data', value: d}
                        ]
                    };
                    for (var criterium in opt) {
                        // skip the required criteria as they were already done above
                        if ( _.include(['data', 'nodeId'], criterium) ) continue;
                        if ( _.include(GETVALUE_CRITERIA, criterium) ) {
                            if (!_.isArray(opt[criterium]) && _.isObject(opt[criterium]) ) {
                                var attrs = [];
                                for (var a in opt[criterium] ) {
                                    attrs.push({name: a, value: opt[criterium][a]});
                                }
                                getValueMethod.criteria.push({
                                    name: criterium,
                                    attrs: attrs
                                });
                            } else {
                                if (criterium === 'tags') {
                                    if ( _.isArray(opt[criterium]) ) {
                                        opt[criterium] = opt[criterium].join(',');
                                    }
                                }
                                getValueMethod.criteria.push({
                                    name: criterium,
                                    value: opt[criterium]
                                });

                            }
                        }
                    }
                    methods.push(getValueMethod);


                });
            });

            this.goProphet({
                methods: methods,
                // need to correlate two sets of data to one data obj per node
                callback: function(respData) {
                    var data = [];
                    _.each(matchMaker, function(uid) {
                        var pairs = _.where(respData, {uid: uid});
                        var dd = _.findWhere(pairs, {prophetName: 'getDataDefinition'});
                        var val = _.findWhere(pairs, {prophetName: 'getValue'});
                        var obj = _.extend({}, dd, val );

                        Object.defineProperty(obj, 'value', {
                            get: function() {
                                return valueOf(obj);
                            }
                        });

                        data.push(obj);
                    });

                    // a little tidying transformation
                    data = _.map(data, function(da) {
                        // we're done with prophetName; internal use only
                        delete da.prophetName;
                        // de-augment the uid, putting it back the way it was
                        da.uid = da.uid.replace(/-{3}\d+$/, '');
                        return da;
                    });
                    if ( options.callback ) {
                        // then pass it back to the original callback
                        options.callback(singleNode ? data[0] : data);
                    }
                }
            });
        },

        goProphet: function(options) {
             $.ajax({
                url: '/p?http://'+server+'/prophet',
                data: TMPLS.genericProphetReq2(options.methods),
                type:  'POST',
                dataType: 'text',
                contentType : "text/xml",
                timeout: 140000,
                success: function(respXml){
                    var respJSON = xml2json($.parseXML(respXml), '');
                    var prophetResp = JSON.parse(respJSON).ProphetResponse;
                    var methodResponses = _.isArray(prophetResp.MethodResponse)
                        ? prophetResp.MethodResponse
                        : [prophetResp.MethodResponse];

                    // of all the possible methods that were passed, identify
                    // all unique method names; this will be used to identify
                    // the proper parser to call for the specific method response
                    var uniqueMethodNames = _.uniq(_.pluck(methodResponses, '@name'));
                    var data = [];
                    _.each(uniqueMethodNames, function(m) {
                        // of all responses, get subset based on each unique method name
                        var mResponses = _.where(methodResponses, {'@name': m});
                        // and parse those responses according to the appropriate parser,
                        // adding them to the return data
                        data = data.concat(
                            parsers[m](mResponses)
                        );
                    });
                    if ( options.callback ) {
                        options.callback(data);
                    }
                },
                error: function(jqXhr, statusTxt, errorTxt) {
                    throw "dataEye.js goProphet error: " + errorTxt;
                }

            });
        },



        getData: function(obj, debug){
            var xml = dataEye.prepareXML(obj, debug);
            dataEye.ajax(xml, obj.callback, debug);
        },
        reqXML: function(xml, callback, debug){
            dataEye.ajax(xml, callback, debug);
        },
        prepareXML: function(obj, debug) {
            var allMethods = '';
            for (x in obj) {
                if (x === 'callback') { }
                else {                                                                             // if x != 'callback'
                  var method = "<Method name='" + obj[x].method + "' ";
                  var uid = undefined;

                  if (obj[x].uid) {
                    uid = obj[x].uid;
                  } else if (obj[x].data) {
                    uid = obj[x].data.slice(obj[x].data.lastIndexOf('/') + 1)
                  } else {
                    uid = dataEye.uniqueNum();
                  }

                  method += "uid='" + uid + "'>";
                  for (key in obj[x]) {
                      //console.log(key);
                      //console.log(obj[x][key]);
                      switch (key) {
                          case 'uid':
                              break;
                          case 'method':
                              break;
                          default:
                              method += "<" + key + ">" + obj[x][key] + "</" + key + ">";
                              break;
                      }
                  }
                  method += "</Method>";
                  allMethods += method;
                }
            }
            var xml = "<ProphetRequest version='1'>" + allMethods + "</ProphetRequest>";
            if (debug) {
              console.log(xml);
              console.log($.parseXML(xml));
            }
            return xml;
        },
        uniqueNum: function(){
            return dataEye.uniqueNum.counter = (dataEye.uniqueNum.counter || 0) + 1;
        },
        ajax: function(req, callback, debug, convert) {
            var convert = convert === undefined ? true : false;
            $.ajax({
                url: '/p?http://'+server+'/prophet',
                data: req,
                type:  'POST',
                dataType: 'text',
                contentType : "text/xml",
                timeout: 5000,
                success: function(res){
                    if (debug) {
                      console.log($.parseXML(res));
                    }
                    if (callback){
                      if (typeof xml2json === 'function' && convert) {                                   // conver to json if xml2json is available
                        var jsonRes = JSON.parse(xml2json($.parseXML(res), ''));
                        callback(jsonRes.ProphetResponse);
                      } else {
                        callback(res);
                      }
                    }
                },
                error: function(jqXhr, textStatus, textError) {
                    throw "dataEye.js error " + textError + "\nfor: " + req;
                }
            });
        }
    };

    return window.dataEye =  dataEye;

}).call(this);
