///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
    'dojo/_base/html',
    'dojo/query',
    'dojo/on',
    'dojo/_base/lang',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
    "esri/layers/GraphicsLayer",
    "esri/graphic",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/InfoTemplate",
    "esri/geometry/Point"
  ],
  function(declare, html, query, on, lang, _WidgetsInTemplateMixin, BaseWidget, GraphicsLayer,
           Graphic, QueryTask, Query, SimpleLineSymbol, SimpleFillSymbol,PictureMarkerSymbol, InfoTemplate, Point) {
    var self;
    var graphLayer = new GraphicsLayer();
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-about',
      // clasName: 'esri.widgets.About',

      _hasContent: null,

      postCreate: function() {
        this.inherited(arguments);

        this._hasContent = this.config.about && this.config.about.aboutContent;
      },

      startup: function() {
        self = this;
        this.inherited(arguments);
        this.resize();
        this.warn();

      },

      resize: function() {
        //this._resizeContentImg();
      },
        warn:function () {
            var queryTask = new QueryTask(self.appConfig.dynamicQueryLayer);
            var query = new Query();
            query.where = "OBJECTID > 0";
            query.outFields = ["*"];
            query.returnGeometry = true;
            queryTask.execute(query, function (queryResult) {
                graphLayer.clear();
                self.map.removeLayer(graphLayer);
                var numCount = 0;		//计数器，统计有多少符合
                var showExtent = null;
                var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 255, 0]), 1);
                var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new dojo.Color([25, 255, 200, 0.1]));
                var markerPicSymbol = new PictureMarkerSymbol("widgets/AddData/images/warn.gif", 60, 60);
                var dateNow = Date.now();
                var infoTemplate;
                var length = queryResult.features.length;
                if(length >=1 ) {
                    for(var i = 0; i < length; i++) {
                        var geo = queryResult.features[i];
                        var companyName = geo.attributes["YDDW"];
                        var startTime = geo.attributes["KGSJ"] - 3600000; //默认时间为上午8点,减去8小时回到0点
                        var endTime = geo.attributes["JGSJ"] - 3600000;

                        if(startTime == null && endTime == null)
                            continue;
                        //在此处判断时间间隔
                        if((GetStandardTime(startTime) - GetStandardTime(dateNow) > 0 && GetStandardTime(startTime) - GetStandardTime(dateNow) < txt_shigong) ||
                            (GetStandardTime(endTime) - GetStandardTime(dateNow) > 0 && GetStandardTime(endTime) - GetStandardTime(dateNow) < txt_jungong)) {
                            var mixSTime = new Date(startTime);
                            var commonSTime = mixSTime.toLocaleDateString()
                            var mixETime = new Date(endTime);
                            var commonETime = mixETime.toLocaleDateString();

                            var content ="<table>"+"<tr><td>开工时间："+commonSTime+"</td><td rowspan='2'><img src='widgets/AddData/images/remind.png' style='height:50px;width:50px;margin-left:10px;'/></td></tr>"+"<tr><td>竣工时间："+commonETime +"</td></tr>"+
                                "</table>"
                            ;
                            infoTemplate = new InfoTemplate(companyName,content);
                            geo.setInfoTemplate(infoTemplate);

                            //生成点
                            var g = geo.geometry;
                            var centroid = g.getCentroid();

                            var ptGraphic = new Graphic(centroid, markerPicSymbol);
                            ptGraphic.setInfoTemplate(infoTemplate); //点和面都设置infotemplate，移动到要素显示
                            geo.setSymbol(fill);

                            graphLayer.add(geo);
                            graphLayer.add(ptGraphic);
                            numCount++;

                            //获取查询到的所有geometry的Extent用来设置查询后的地图显示
                            if(i == 0 || showExtent == null) {
                                showExtent = geo.geometry.getExtent();
                            } else {
                                showExtent = showExtent.union(geo.geometry.getExtent());
                            }

                        }
                    }

                }
                self.map.addLayer(graphLayer);
                //设置地图的视图范围
                self.map.setExtent(showExtent.expand(1));
            });

            dojo.connect(graphLayer, "onMouseMove", function(evt) {
                var g = evt.graphic;
                // if (typeof(g) =="undefined")
                //     return;
                self.map.infoWindow.setContent(g.getContent());
                self.map.infoWindow.setTitle(g.getTitle());
                self.map.infoWindow.show(evt.screenPoint, self.map.getInfoWindowAnchor(evt.screenPoint));

            });
            //注册鼠标离开监听事件
            dojo.connect(graphLayer, "onMouseOut", function() {
                self.map.infoWindow.hide();
            });

            function GetStandardTime(dateString) {

                var toSec = dateString / 1000;
                var toMin = toSec / 60;
                var toHour = toMin / 60;
                var toDay = toHour / 24;
                return toDay;
            }
        }

      // _resizeContentImg: function() {
      //   if (this._hasContent) {
      //     html.empty(this.customContentNode);
      //
      //     var aboutContent = html.toDom(this.config.about.aboutContent);
      //     html.place(aboutContent, this.customContentNode);
      //     // single node only(no DocumentFragment)
      //     if (this.customContentNode.nodeType && this.customContentNode.nodeType === 1) {
      //       var contentImgs = query('img', this.customContentNode);
      //       if (contentImgs && contentImgs.length) {
      //         contentImgs.forEach(lang.hitch(this, function(img) {
      //           var isNotLoaded = ("undefined" !== typeof img.complete && false === img.complete) ? true : false;
      //           if (isNotLoaded) {
      //             this.own(on(img, 'load', lang.hitch(this, function() {
      //               this._resizeImg(img);
      //             })));
      //           } else {
      //             this._resizeImg(img);
      //           }
      //         }));
      //       }
      //     }
      //   }
      // },
      // _resizeImg: function(img) {
      //   var customBox = html.getContentBox(this.customContentNode);
      //   var imgSize = html.getContentBox(img);
      //   if (imgSize && imgSize.w && imgSize.w >= customBox.w) {
      //     html.setStyle(img, {
      //       maxWidth: (customBox.w - 20) + 'px', // prevent x scroll
      //       maxHeight: (customBox.h - 40) + 'px'
      //     });
      //   }
      // }
    });
    return clazz;
  });