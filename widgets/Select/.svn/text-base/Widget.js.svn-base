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
		'dojo/on',
		"dojo/dom",
		"dojo/query",
		'dojo/promise/all',
		'dijit/_WidgetsInTemplateMixin',
		'esri/symbols/SimpleMarkerSymbol',
		'esri/symbols/SimpleLineSymbol',
		'esri/symbols/SimpleFillSymbol',
		'esri/symbols/jsonUtils',
		'esri/Color',
		"esri/InfoTemplate",
		"esri/dijit/FeatureTable",
		"esri/graphicsUtils",
		"esri/tasks/query",
		"esri/tasks/QueryTask",
		"esri/layers/FeatureLayer",
		"esri/toolbars/draw",
		"esri/geometry/Point",
		'jimu/BaseWidget',
		'jimu/WidgetManager',
		'jimu/dijit/ViewStack',
		'jimu/dijit/FeatureSetChooserForMultipleLayers',
		'jimu/LayerInfos/LayerInfos',
		'jimu/SelectionManager',
		'./layerUtil',
		'./SelectableLayerItem',
		'./FeatureItem',
		'jimu/dijit/LoadingShelter'
	],
	function(declare, lang, html, array, on, dom, query, all, _WidgetsInTemplateMixin, SimpleMarkerSymbol,
		SimpleLineSymbol, SimpleFillSymbol, SymbolJsonUtils, Color, InfoTemplate, FeatureTable, graphicsUtils, Query,
		QueryTask, FeatureLayer, Draw, Point, BaseWidget, WidgetManager, ViewStack, FeatureSetChooserForMultipleLayers,
		LayerInfos, SelectionManager, layerUtil, SelectableLayerItem, FeatureItem) {
		var fLayer;
		var bottomDiv4 = document.getElementById("tableDiv4"); //FeatureTable 面板
		var staticsPanel = document.getElementById("statics_panel"); //统计面板
		var p = document.getElementById("pLabel"); // 展示统计数据
		var select = document.getElementById("fields-select");
		var closeBtn = document.getElementById("statics_close") //关闭统计面板
		var toolbar;
		var myFeatureTableCR;
		var selectValue;

		return declare([BaseWidget, _WidgetsInTemplateMixin], {
			baseClass: 'jimu-widget-select',

			postMixInProperties: function() {
				this.inherited(arguments);
				lang.mixin(this.nls, window.jimuNls.common);
			},
			onOpen: function() {
				WidgetManager.getInstance().activateWidget(this);
				document.getElementById("dijit_layout_ContentPane_2").style.zIndex = -1;

				if(this.map.getLayer("baseFeaLayer"))
					this.map.getLayer("baseFeaLayer").setVisibility(false);
				if(this.map.getLayer("baseFeaLayerZZ"))
					this.map.getLayer("baseFeaLayerZZ").setVisibility(false);
				if(this.map.getLayer("baseFeaLayerGY"))
					this.map.getLayer("baseFeaLayerGY").setVisibility(false);
				if(this.map.getLayer("baseFeaLayerCR"))
					this.map.getLayer("baseFeaLayerCR").setVisibility(false);
				var self = this;

				function centerandzoommetlh() {
					var delectlayer = self.map.getLayer("featureLayer2");
					var pointt = new Point(119.43601, 32.78446, 4326);
					self.map.centerAndZoom(pointt, 13);
				}

				function flayerCR() {
					fLayer = new FeatureLayer(self.appConfig.crdkLayer, {
						mode: FeatureLayer.MODE_SNAPSHOT,
						outFields: ["*"],
						id: "featureLayer3"
					});
					self.map.addLayer(fLayer);
				};
				flayerCR();
				centerandzoommetlh();

			},

			onDestroy: function() {
				// if (this.selectDijit.isActive()) {
				//   this.selectDijit.deactivate();
				// }
				this._clearAllSelections();

			},
			onClose: function() {
				try {
					var delectlayer = this.map.getLayer("featureLayer3");
					this.map.removeLayer(delectlayer);
				} catch(e) {}
				this._isOpen = false;
				bottomDiv4.style.zIndex = -1;
				toolbar.deactivate();
				this.map.graphics.clear();
				this.map.removeLayer(fLayer);
				this.map.infoWindow.hide(); //隐藏弹框
				//myFeatureTable.destroy();
				staticsPanel.style.display = "none"; //如果统计面板未关闭，强制关闭
				staticsPanel.style.zIndex = -1;
				select.selectedIndex = 0;
				p.innerText = "";
				if(this.map.getLayer("baseFeaLayer"))
					this.map.getLayer("baseFeaLayer").setVisibility(true);
				if(this.map.getLayer("baseFeaLayerZZ"))
					this.map.getLayer("baseFeaLayerZZ").setVisibility(true);
				if(this.map.getLayer("baseFeaLayerGY"))
					this.map.getLayer("baseFeaLayerGY").setVisibility(true);
				if(this.map.getLayer("baseFeaLayerCR"))
					this.map.getLayer("baseFeaLayerCR").setVisibility(true);
				var radio = document.getElementsByName("radios");

			},

			startup: function() {
				var self = this;
				var objectIds; //存储OBJECTID,用于导出excel
				var infoTemplate;
				var selectedGeoArray;
				var CRMJ, JZMJ, GDZCTZ;
				toolbar = new Draw(this.map, {
					showTooltip: true
				});

				function centerandzoommetlh() {
					var delectlayer = self.map.getLayer("featureLayer2");
					var pointt = new Point(119.43601, 32.78446, 4326);
					self.map.centerAndZoom(pointt, 13);
				}

				function delect() {
					try {
						var delectlayer = self.map.getLayer("featureLayer3");
						self.map.removeLayer(delectlayer);
					} catch(e) {}
				}

				function flayerCR() {
					fLayer = new FeatureLayer(self.appConfig.crdkLayer, {
						mode: FeatureLayer.MODE_SNAPSHOT,
						outFields: ["*"],
						id: "featureLayer3"
					});
					self.map.addLayer(fLayer);
				};
				flayerCR();
				centerandzoommetlh();
				myfeaturTableMethod();

				//设置空间查询框选时框的样式
				// var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
				//     new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 3), new dojo.Color([255, 255, 0, 0.15]));
				//显示要素单击选中或者与table交互的样式

				var fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
					new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 2), new dojo.Color([238, 99, 99, 0.55]));
				//查询结果的样式
				var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 2), new dojo.Color([255, 250, 250, 0.25]));

				function myfeaturTableMethod() {
					fLayer = new FeatureLayer(self.appConfig.crdkLayer, {
						mode: FeatureLayer.MODE_SNAPSHOT,
						outFields: ["*"],
						id: "featureLayer3"

					});
					myFeatureTableCR = new FeatureTable({
						featureLayer: fLayer,
						outFields: ["DKBH", "DKWZ", "QSJ", "CJJ", "JDR", "YT", "RJL", "JZMD", "LDL", "CRMJ",
							"CJRQ", "HTQDRQ"
						],
						map: self.map,
						editable: false,
						showAttachments: false,
						syncSelection: true, //map与table是否交互
						showFeatureCount: true, //显示多少要素选中
						dateOptions: {
							datePattern: 'MMM/d/y',
							timeEnabled: false, //是否显示时间
							//timePattern: 'H:mm',      //显示的时间格式
						},
						menuFunctions: [{
								label: "统计",
								callback: function() {
									staticsPanel.style.display = "inline-block";
									staticsPanel.style.zIndex = 999;
								}
							},
							{
								label: "导出到EXcel",
								callback: function() {
									objectIds = objectIds.substring(0, objectIds.length - 1);
									window.location.href = "http://yfbserver1:8028/gybj/ExportExcel.ashx?OBJIDS=" + objectIds;
								}
							}
						],
					}, 'myTableNode4');
					myFeatureTableCR.startup();
					//单击表中数据，定位到该图形,弹出框
					myFeatureTableCR.on("row-select", function(evt) {
						try {
							var row = myFeatureTableCR.selectedRows
							var row0 = row[0];
							var id = row0.OBJECTID;

							var len = selectedGeoArray.length;
							for(var i = 0; i < len; i++) {
								var geo = selectedGeoArray[i];
								if(geo.attributes["OBJECTID"] == id) {
									self.map.infoWindow.setContent(geo.getContent());
									self.map.infoWindow.setTitle(geo.getTitle());
									self.map.infoWindow.anchor = "ANCHOR_LOWERRIGHT "; //固定在右上角
									self.map.infoWindow.show(geo.geometry.getCentroid(), self.map.getInfoWindowAnchor(geo.geometry.getCentroid()));
									//重新设置定位位置，位置较重心上移250，使图形和弹窗均显示在地图正中央
									var pt = new Point(geo.geometry.getCentroid().x, geo.geometry.getCentroid().y, self.map.spatialReference);
									self.map.centerAndZoom(pt, 12);
								}
							}
						} catch {}
					});

				};

				var container = document.getElementById("result_container");

				select.onchange = function() {
					if(select[select.selectedIndex].label == "出让面积") {
						p.innerText = "总和：  " + CRMJ.toFixed(1);
					}
					if(select[select.selectedIndex].label == "建筑面积") {
						p.innerText = "总和：  " + JZMJ.toFixed(1);
					}
					if(select[select.selectedIndex].label == "固定资产投资") {
						p.innerText = "总和：  " + GDZCTZ.toFixed(1);
					}
				}

				closeBtn.onclick = function() {
					staticsPanel.style.display = "none";
					staticsPanel.style.zIndex = -1;
					select.selectedIndex = 0;
					p.innerText = "";

				}

				var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 3), new dojo.Color([255, 255, 0, 0.25]));

				query("button").on("click", function(evt) {
					var value = this.innerHTML;
					switch(value) {
						case "按矩形选择":
							toolbar.activate(Draw.RECTANGLE, {
								showTooltip: true
							})
							break;
						case "按多边形选择":
							toolbar.activate(Draw.POLYGON, {
								showTooltip: true
							})
							break;
						case "按圆选择":
							toolbar.activate(Draw.CIRCLE, {
								showTooltip: true
							});
							break;
						case "自定义选择":
							toolbar.activate(Draw.FREEHAND_POLYGON, {
								showTooltip: true
							});
							break;
						case "清除选择":
							self.map.graphics.clear();
							fLayer.clearSelection();
							objectIds = '';
							bottomDiv4.style.zIndex = -1;
							toolbar.deactivate(); //释放绘图工具
							self.map.infoWindow.hide();
							break;
						case "导出到Excel":
							if(objectIds == '') {
								alert("没有选中要素");
								break;
							}
							objectIds = objectIds.substring(0, objectIds.length - 1);
							window.location.href = "http://zj081:8015/ExportExcel.ashx?OBJIDS=" + objectIds;
							break;
					}
				});
				on(toolbar, "draw-end", function(result) {
					self.map.graphics.clear();
					var geometry = result.geometry;

					//var grap  = new esri.Graphic(geometry, symbol);
					//self.map.graphics.add(grap);      //只高亮显示，不显示框
					toolbar.deactivate(); //注销工具
					queryGraphic(geometry)
				});

				function queryGraphic(geometry) {
					var queryTask = new QueryTask(self.appConfig.crdkLayer);
					var query = new Query();
					query.geometry = geometry;
					query.where = "1=1";
					query.outFields = ["*"];
					query.outSpatialReference = self.map.spatialReference;
					query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
					query.returnGeometry = true;
					queryTask.execute(query, showQueryResult);
				}

				function showQueryResult(queryResult) {
					var arr = new Array(); //存OBJECTID
					selectedGeoArray = new Array();
					objectIds = ''; //每次查询都需要置空
					CRMJ = 0;
					JZMJ = 0;
					GDZCTZ = 0;

					if(queryResult.features.length >= 1) {

						for(var i = 0; i < queryResult.features.length; i++) {
							//得到graphic
							var graphic = queryResult.features[i];
							var transactionPrice = graphic.attributes["CJJ"];
							var crAverage = graphic.attributes["CRMJ"];
							var zbUnit = transactionPrice * 10000 / crAverage;
							selectedGeoArray[i] = graphic;
							var attr = graphic.attributes["OBJECTID"];

							arr[i] = attr;
							objectIds += attr;
							objectIds += ',';
							graphic.setSymbol(fill);
							Mathedd = function(value) {
								var resulted = Math.ceil(value);
								return resulted;
							}
							formatDate = function crtTimeFtt(val) {
								if(val != null) {
									var date = new Date(val).toLocaleDateString();
									return date;
								}
							}

							var content = "<table class = 'dikuaiBox' style='line-height:25px;font-size:14px;border-spacing: 0px;border: #ccc 1px solid;'>" +
								"<tr class='content_tr'><td  class='content_td_left' style='width: 30%';>地块年份:</td><td class='content_td_right'>${DKNF}年</td></tr>" +
								"<tr><td  class='content_td_left'>地块编号:</td><td class='content_td_right'>${DKBH}</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>地块位置:</td><td class='content_td_right'>${DKWZ}</td></tr>" +
								"<tr><td  class='content_td_left'>起始价:</td><td class='content_td_right'>${QSJ}元</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>成交价:</td><td class='content_td_right'>${CJJ}元</td></tr>" +
								"<tr><td  class='content_td_left'>竞得人:</td><td class='content_td_right'>${JDR}</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>地块用途:</td><td class='content_td_right'>${YT}</td></tr>" +
								"<tr><td  class='content_td_left'>容积率 :</td><td class='content_td_right'>${RJL}</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>建筑密度:</td><td class='content_td_right'>${JZMD}</td></tr>" +
								"<tr><td  class='content_td_left'>绿地率:</td><td class='content_td_right'>${LDL}</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>出让面积 :</td><td class='content_td_right'>${CRMJ:Mathedd}平方米</td></tr>" +
								"<tr><td  class='content_td_left'>成交日期:</td><td class='content_td_right'>${CJRQ:formatDate}</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>合同签订日期:</td><td class='content_td_right'>${HTQDRQ:formatDate}</td></tr>" +
								"<tr ><td class='content_td_left'>地面单价:</td><td class='content_td_right'>" + zbUnit.toFixed(1) +"元</td></tr>" +
								"</table>";

							infoTemplate = new InfoTemplate("${DKBH}", content);
							graphic.setInfoTemplate(infoTemplate);
							self.map.graphics.add(graphic);
						}
						myFeatureTableCR.filterRecordsByIds(arr);
					} else {
						return; //没有选中则不做操作
					}
					bottomDiv4.style.zIndex = 999999;

					//根据节约等级的不同，动态显示不同的节约等级图片
					compare = function(value, key) {
						var result = "";

						switch(key) {
							case "JYDJ":
								if(result = value == "A级" || value == null) {
									result = "<img src='widgets/LayerList/images/GradeA.png'/>";
								} else if(result = value == "B级") {
									result = "<img src='widgets/LayerList/images/GradeB.png'/>";
								} else if(result = value == "C级") {
									result = "<img src='widgets/LayerList/images/GradeC.png'/>";
								} else if(result = value == "D级") {
									result = "<img src='widgets/LayerList/images/GradeD.png'/>";
								}
								break;
							case "DKMJ":
								result = value.toFixed(1);
								break;
							case "CLSJ":
								result = new Date(value).toLocaleDateString();
								break;
							case "KGSJ":
								result = new Date(value).toLocaleDateString();
								break;
							case "JGSJ":
								result = new Date(value).toLocaleDateString();
								break;
						}
						if(result == "1970/1/1")
							result = "";
						return(result);
					};

				}
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