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
		'dojo/_base/lang',
		'dojo/_base/html',
		'dojo/_base/array',
		'dojo/_base/fx',
		'dojo/on',
		"dojo/dom",
		"dojo/query",
		"dojo/mouse",
		"dojo/touch",
		'dojo/promise/all',
		'dijit/_WidgetsInTemplateMixin',
		'esri/symbols/SimpleMarkerSymbol',
		'esri/symbols/SimpleLineSymbol',
		'esri/symbols/SimpleFillSymbol',
		'esri/symbols/jsonUtils',
		'esri/Color',
		"esri/config",
		"esri/tasks/GeometryService",
		"esri/symbols/TextSymbol",
		"esri/symbols/Font",
		"esri/InfoTemplate",
		"esri/dijit/FeatureTable",
		"esri/graphicsUtils",
		"esri/tasks/query",
		"esri/tasks/QueryTask",
		"esri/tasks/BufferParameters",
		"esri/layers/FeatureLayer",
		"esri/toolbars/draw",
		"esri/geometry/normalizeUtils",
		"esri/geometry/Point",
		"esri/SpatialReference",
		'jimu/BaseWidget',
		'jimu/WidgetManager',
		'jimu/dijit/ViewStack',
		'jimu/dijit/FeatureSetChooserForMultipleLayers',
		'jimu/LayerInfos/LayerInfos',
		'jimu/SelectionManager',
		'./DataManager',
		'jimu/dijit/LoadingShelter',
		'dijit/form/HorizontalSlider',
		'dijit/form/HorizontalRuleLabels', 
		'dijit/form/HorizontalRule',
		'dojox/grid/EnhancedGrid',
		'dojox/grid/DataGrid',
		"dojo/store/Memory",
		"dojo/data/ObjectStore",
		'dojox/charting/action2d/MoveSlice',
		'dojox/charting/Chart2D',
		'dojox/charting/Chart3D',
		'dojox/charting/plot3d/Bars',
		'dojox/charting/action2d/Highlight',
		'dojox/charting/action2d/Tooltip',
		'dojo/parser'
	],
	function(declare, lang, html, array, fx, on, dom, query, mouse, touch, all, _WidgetsInTemplateMixin, SimpleMarkerSymbol,
		SimpleLineSymbol, SimpleFillSymbol, SymbolJsonUtils, Color, esriConfig, GeometryService, TextSymbol, Font, InfoTemplate, FeatureTable, graphicsUtils, Query,
		QueryTask, BufferParameters, FeatureLayer, Draw, normalizeUtils, Point, SpatialReference, BaseWidget, WidgetManager, ViewStack, FeatureSetChooserForMultipleLayers,
		LayerInfos, SelectionManager, DataManager, FeatureItem,HorizontalSlider,HorizontalRuleLabels,HorizontalRule,EnhancedGrid,DataGrid,Memory,ObjectStore,
		MoveSlice,Chart2D,Chart3D,Bars,Highlight,Tooltip,parser
	) {

		var rule;
		
		return declare([BaseWidget, _WidgetsInTemplateMixin], {
			baseClass: 'jimu-widget-select',

			postMixInProperties: function() {
				this.inherited(arguments);
				lang.mixin(this.nls, window.jimuNls.common);
			},
			onOpen: function() {
//				alert(2);
//				var value = rule.getValue();
//				alert(value);
				rule.attr("value",1.8);
				
				
			},

			onDestroy: function() {
				this._clearAllSelections();

			},
			onClose: function() {
//				alert(3);
			},

			startup: function() {
//				alert(1);
				rule = new HorizontalSlider({
	     			value:1.0,
	    	 		maximum:3.0,
	     			minimum:1.0,
	     			showButtons:"true",
	     			discreteValues:21,
	     			intermediateChanges:"true" ,//为什么没有调用setValue
	     			onChange:(function(){
						var domNode = dojo.byId("sliderinput");
						var changeValue = rule.value;
//						domNode.value = changeValue%1==0?changeValue.toString()+".0":changeValue;
						domNode.value = changeValue.toFixed(1);
					})
				},"rule");
				rule.startup();
				
				var data = {
					items:[
						{"id": 1, "Artist":"aaa",  "Name":"HHH There", "Track":4, "Download Date":"1923/4/9"},
					    {"id": 2, "Artist":"aabbb", "Name":"LLL Hey", "Track":4, "Download Date":"1947/12/6"},
			
					]

				}
				
  
				var typeData;
				var layout = [{
					defaultCell: {  editable: true},        
				    cells:[{ field: "id", datatype:"dojox.grid.cells.Select",
				    	},
							
					    { field: "Artist", datatype:"string"},
					    { field: "Name", datatype:"string"},
					    { field: "Download Date", datatype:"date"},
				    ]
				}];
				store=new Memory({data:data});
                dataStore=new ObjectStore({objectStore : store});
				
				var grid = new DataGrid({
					store:dataStore,
					structure:layout,
					rowCount:2,
				},'grid');
				grid.startup();
				
				
				//--- 柱状图 ---
				var chartBar = new Chart2D('chart',{title:"单位：km"});
				
				var arrXData = [
	                    {value: 1, text: "地块A"},
	                    {value: 2, text: "地块B"},
	                    {value: 3, text: "地块C"},
	                    {value: 4, text: "地块D"}]
				//增加X轴，但并不需要显示
	            chartBar.addAxis("x", {
	                labels: arrXData,
	                majorTick: {length: 0},
	                minorTick: {length: 0},
	                natural: true
	            });
	            //增加Y轴，但也不需要显示
	            chartBar.addAxis("y", {
	                vertical: true,
	                stroke: "black",
	                fontColor: "black",
	                majorTick: {length: 0},
	                minorTick: {length: 0},
	                includeZero: true
	            });
	            
		        //定义图标类型，这里用柱状图
	            chartBar.addPlot("default",{
	                type: "Columns",
	                gap: 10,
	                font: "normal normal bold 8pt Tahoma",
	                fontColor: "black"
	            });
	            
	            var arrYData = [2500,2000,1500,3000,2000,4000,6000];
	            //指定图标使用的数据以及图表中柱条的颜色
	            chartBar.addSeries("SeriesA", arrYData, {stroke: {color: "steelblue"}, fill: "steelblue"});
      
	            var anim1 = new dojox.charting.action2d.Highlight(chartBar, "default", {highlight: "lightskyblue"});
             	var anim2 = new dojox.charting.action2d.Tooltip(chartBar,"default");
             	chartBar.connectToPlot("default", "x",function(args){
					if(args.type=="onclick" ){												
						switch(args.index){
							case 0:
								alert("地块A");
								break;
							case 1:
								alert("地块B")
								
								break;
							case 2:
								alert("地块C");
								break;
							case 3:
								alert("地块D");
								
								break;

						}
					}
				});

	            //渲染
             chartBar.render();
			},

			initLayer: function() {
				syLayer = new FeatureLayer(this.appConfig.featureLayer, {
					mode: FeatureLayer.MODE_SNAPSHOT,
					outFields: ["*"],
					opacity: 0.5,
					id: "featureLayerSY"
				});

				zzLayer = new FeatureLayer(this.appConfig.zzfeatureLayer, {
					mode: FeatureLayer.MODE_SNAPSHOT,
					outFields: ["*"],
					opacity: 0.5,
					id: "featureLayerZZ"
				});
			},

			_slide: function(dom, startLeft, endLeft) {
				html.setStyle(dom, 'display', 'block');
				html.setStyle(dom, 'left', startLeft + "%");
				fx.animateProperty({
					node: dom,
					properties: {
						left: {
							start: startLeft,
							end: endLeft,
							units: '%'
						}
					},
					duration: 500,
					onEnd: lang.hitch(this, function() {
						html.setStyle(dom, 'left', endLeft);
						if(endLeft === 0) {
							html.setStyle(dom, 'display', 'block');
						} else {
							html.setStyle(dom, 'display', 'none');
						}
					})
				}).play();
			},

			_initLayers: function(layerInfoArray) {
				this.layerObjectArray = [];
				this.layerItems = [];
				this.selectionSymbols = {};

				html.empty(this.layerItemsNode);
				this.shelter.show();

				all(this._obtainLayerObjects(layerInfoArray)).then(lang.hitch(this, function(layerObjects) {
					array.forEach(layerObjects, lang.hitch(this, function(layerObject, index) {
						// hide from the layer list if layerobject is undefined or there is no objectIdField
						if(layerObject && layerObject.objectIdField && layerObject.geometryType) {
							var layerInfo = layerInfoArray[index];
							var visible = layerInfo.isShowInMap() && layerInfo.isInScale();

							var item = new SelectableLayerItem({
								layerInfo: layerInfo,
								checked: visible,
								layerVisible: visible,
								folderUrl: this.folderUrl,
								allowExport: this.config ? this.config.allowExport : false,
								map: this.map,
								nls: this.nls
							});
							this.own(on(item, 'switchToDetails', lang.hitch(this, this._switchToDetails)));
							this.own(on(item, 'stateChange', lang.hitch(this, function() {
								this.shelter.show();
								this.selectDijit.setFeatureLayers(this._getSelectableLayers());
								this.shelter.hide();
							})));
							item.init(layerObject);
							html.place(item.domNode, this.layerItemsNode);
							item.startup();

							this.layerItems.push(item);
							this.layerObjectArray.push(layerObject);

							if(!layerObject.getSelectionSymbol()) {
								this._setDefaultSymbol(layerObject);
							}

							var symbol = layerObject.getSelectionSymbol();
							this.selectionSymbols[layerObject.id] = symbol.toJson();
						}
					}));
					this.selectDijit.setFeatureLayers(this._getSelectableLayers());
					this._setSelectionSymbol();
					this.shelter.hide();
				}));
			},

			_setSelectionSymbol: function() {
				array.forEach(this.layerObjectArray, function(layerObject) {
					this._setDefaultSymbol(layerObject);
				}, this);
			},

			_setDefaultSymbol: function(layerObject) {
				if(layerObject.geometryType === 'esriGeometryPoint' ||
					layerObject.geometryType === 'esriGeometryMultipoint') {
					layerObject.setSelectionSymbol(this.defaultPointSymbol);
				} else if(layerObject.geometryType === 'esriGeometryPolyline') {
					layerObject.setSelectionSymbol(this.defaultLineSymbol);
				} else if(layerObject.geometryType === 'esriGeometryPolygon') {
					layerObject.setSelectionSymbol(this.defaultFillSymbol);
				} else {
					console.warn('unknown geometryType: ' + layerObject.geometryType);
				}
			},

			_restoreSelectionSymbol: function() {
				array.forEach(this.layerObjectArray, function(layerObject) {
					var symbolJson = this.selectionSymbols[layerObject.id];
					if(symbolJson) {
						layerObject.setSelectionSymbol(SymbolJsonUtils.fromJson(symbolJson));
					}
				}, this);
			},

			_layerVisibilityChanged: function() {
				array.forEach(this.layerItems, function(layerItem) {
					layerItem.updateLayerVisibility();
				}, this);
			},

			_getSelectableLayers: function() {
				var layers = [];
				array.forEach(this.layerItems, function(layerItem) {
					if(layerItem.isLayerVisible() && layerItem.isChecked()) {
						layers.push(layerItem.featureLayer);
					}
				}, this);

				return layers;
			},

			_clearAllSelections: function() {
				var selectionMgr = SelectionManager.getInstance();
				array.forEach(this.layerObjectArray, function(layerObject) {
					selectionMgr.clearSelection(layerObject);
				});
			},

			_obtainLayerObjects: function(layerInfoArray) {
				return array.map(layerInfoArray, function(layerInfo) {
					return layerInfo.getLayerObject();
				});
			},

			_switchToDetails: function(layerItem) {
				html.empty(this.featureContent);
				this.viewStack.switchView(1);
				this.selectedLayerName.innerHTML = layerItem.layerName;
				this.selectedLayerName.title = layerItem.layerName;

				layerItem.layerInfo.getLayerObject().then(lang.hitch(this, function(layerObject) {
					var selectedFeatures = layerObject.getSelectedFeatures();
					if(selectedFeatures.length > 0) {
						array.forEach(selectedFeatures, lang.hitch(this, function(feature) {
							var item = new FeatureItem({
								graphic: feature,
								map: this.map,
								featureLayer: layerObject,
								displayField: layerObject.displayField,
								objectIdField: layerObject.objectIdField,
								allowExport: this.config ? this.config.allowExport : false,
								nls: this.nls
							});
							html.place(item.domNode, this.featureContent);
							item.startup();
						}));
					}
				}));
			},

			_switchToLayerList: function() {
				this.viewStack.switchView(0);
			}
		});
	});