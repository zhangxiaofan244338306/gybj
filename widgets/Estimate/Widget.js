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
		"esri/symbols/PictureMarkerSymbol",
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
		'dojox/charting/action2d/MoveSlice',
		'dojox/charting/Chart2D',
		'dojox/charting/Chart3D',
		'dojox/charting/plot3d/Bars',
		'dojox/charting/action2d/Highlight',
		'dojox/charting/action2d/Tooltip',
		'dojo/parser'
	],
	function(declare, lang, html, array, fx, on, dom, query, mouse, touch, all, _WidgetsInTemplateMixin, SimpleMarkerSymbol,
		SimpleLineSymbol, SimpleFillSymbol, SymbolJsonUtils, PictureMarkerSymbol, Color, esriConfig, GeometryService, TextSymbol, Font, InfoTemplate, FeatureTable, graphicsUtils, Query,
		QueryTask, BufferParameters, FeatureLayer, Draw, normalizeUtils, Point, SpatialReference, BaseWidget, WidgetManager, ViewStack, FeatureSetChooserForMultipleLayers,
		LayerInfos, SelectionManager, DataManager, FeatureItem, HorizontalSlider, HorizontalRuleLabels, HorizontalRule, MoveSlice, Chart2D, Chart3D, Bars, Highlight, Tooltip, parser) {
		var syLayer;
		var zzLayer;
		var toolbar;
		var myFeatureTable;
		var myFeatureTableZZ;
		var myFeatureTableGY;
		var myFeatureTableCR;
		var prePlotSF; //初始商服容积率
		var prePlotZZ; //初始住宅容积率
		var currentPlot; //设定容积率	
		var plotCorrFactorSF = 1; //商服容积率修正系数
		var plotCorrFactorZZ = 1; //住宅容积率修正系数
		var sectorNumberSF; //商服区段编号
		var sectorNumberZZ; //住宅区段编号
		var unitPriceSF; //商服单价
		var unitPriceZZ; //住宅单价
		var areTyple; //地块类型
		var acreage; //面积
		var zhxzARR = [];
		var zhxsSumSFArr = [];
		var zhxsSumZZArr = [];
		var zhxsSumSF; //商服综合因素修正总系数
		var zhxsSumZZ; //住宅综合因素修正总系数
		var szzb; //用户输入的百分比，需/100
		var resultGraphic;
		var geometry;
		var unitPriceDM;
		var zbUnitArr = [];
		var hcqGraphic; //缓冲区图层
		var zbGraphicArr = []; //周边地块结果图层
		var zbdjGraLayerArr = []; //周边地块地价文本图层
		var zbdjChatDataArr = [];
		var pointt;
		var xiugaiState;
		var yyclickNum;
		var unitPriceZJ;
		var rule;
		var unitPriceZJ1;
		var radioTextselectArr = [];
		var radioVlueArr = [];
		var SelectionNumberArr = [];
		var unitNew;
		var gjGraphic;
		var plotNew;
		var plotNstate;
		var state;

		return declare([BaseWidget, _WidgetsInTemplateMixin], {
			baseClass: 'jimu-widget-select',

			postMixInProperties: function() {
				this.inherited(arguments);
				lang.mixin(this.nls, window.jimuNls.common);
			},
			onOpen: function() {
				WidgetManager.getInstance().activateWidget(this);
				if(this.map.getLayer("baseFeaLayer"))
					this.map.getLayer("baseFeaLayer").setVisibility(false);
				if(this.map.getLayer("baseFeaLayerZZ"))
					this.map.getLayer("baseFeaLayerZZ").setVisibility(false);
				if(this.map.getLayer("baseFeaLayerGY"))
					this.map.getLayer("baseFeaLayerGY").setVisibility(false);

								if(this.map.getLayer("featureLayerZZ"))
									this.map.getLayer("featureLayerZZ").setVisibility(true);
								if(this.map.getLayer("featureLayerSY"))
									this.map.getLayer("featureLayerSY").setVisibility(true);
								if(this.map.graphics)
									this.map.graphics.setVisibility(true);
			},

			onDestroy: function() {
				this._clearAllSelections();

			},
			onClose: function() {
				state = "no";
					document.getElementById("input_jawzjValue").value = "";
					document.getElementById("input_szzb").value = "";
					document.getElementById("input_zszb").value = "";
					radioVlueArr.length = 0;
					document.getElementById("user-defined").style.display = "none";
					document.getElementById("buildingUnit").style.display = "none";
					document.getElementById("colorSelect1").style.display = "none";
					document.getElementById("showSelection").innerHTML = "";
					document.getElementById("dataTitle").style.display = "none";
					document.getElementById("dataTitle1").style.display = "none";
					document.getElementById("dataTitle").style.width = "100%";
					try {
						var selectPlot = document.getElementsByClassName("interst-information highlight")[0]
						selectPlot.className = "interst-information";
					} catch(e) {};

					document.getElementById("user-defined").style.opacity = "0";
					document.getElementById("colorSelect1").style.opacity = "0";
					try {
						var delectlayerZZ = this.map.getLayer("featureLayerZZ");
						this.map.removeLayer(delectlayerZZ);
					} catch(e) {};
					try {
						var delectlayerSY = this.map.getLayer("featureLayerSY");
						this.map.removeLayer(delectlayerSY);
					} catch(e) {}
					try {
						this._isOpen = false;
						this.map.graphics.clear();
					} catch(e) {}
					document.getElementById('chart').innerHTML = '';
					document.getElementById("chart").style.zIndex = -1000;
					document.getElementById("chart").style.opacity = 0;
					document.getElementById("huanchongAre").style.zIndex = -1000;
					document.getElementById("huanchongAre").style.opacity = 0;
					this._slide("panel4", 0, -100);
					this._slide("panel2", 0, -100);
					this._slide("panel3", 0, -100);
					this._slide("panel1", -100, 0);
					SelectionNumberArr.length = 0;
					prePlotSF = "";
					prePlotZZ = "";
					currentPlot = "";
					plotCorrFactorSF = 1;
					radioVlueArr.length = 0;
					plotCorrFactorZZ = 1;
					sectorNumberSF = ""; //商服区段编号
					sectorNumberZZ = ""; //住宅区段编号
					unitPriceSF = ""; //商服单价
					unitPriceZZ = ""; //住宅单价
					areTyple = ""; //地块类型
					acreage = ""; //面积
					zhxsSumSFArr.length = 0;
					zhxsSumZZArr.length = 0;
					zhxsSumSF = 0; //商服综合因素修正总系数
					zhxsSumZZ = 0; //住宅综合因素修正总系数
					szzb = ""; //用户输入的百分比，需/100
					zbGraphicArr = [];
					zbdjGraLayerArr = [];
					zbdjChatDataArr = [];
					clickNum = 0;
					zbUnitArr.length = 0;
					radioTextselectArr.length = 0;
					document.getElementById("selctionChange").innerHTML = "";
					var selectBtton = document.getElementById("selectBtton");
					selectBtton.checked = false;
					document.getElementById("buildingUnit").style.opacity = "0";
				try {
					document.getElementsByClassName("interst-information highlight")[0].className = "interst-information";
				} catch(e) {};
				try {
					var delectlayerZZ = this.map.getLayer("featureLayerZZ");
					this.map.removeLayer(delectlayerZZ);
//										this.map.getLayer("featureLayerZZ").setVisibility(false);
				} catch(e) {};
				try {
					var delectlayerSY = this.map.getLayer("featureLayerSY");
					this.map.removeLayer(delectlayerSY);
//										this.map.getLayer("featureLayerSY").setVisibility(false);
				} catch(e) {}
				try {
					this._isOpen = false;
					this.map.graphics.clear();
//										this.map.graphics.setVisibility(false);
				} catch(e) {}

				try {
					var selectPlot = document.getElementsByClassName("interst-information highlight")[0]
					selectPlot.className = "interst-information";
				} catch(e) {};

				if(this.map.getLayer("baseFeaLayer"))
					this.map.getLayer("baseFeaLayer").setVisibility(true);
				if(this.map.getLayer("baseFeaLayerZZ"))
					this.map.getLayer("baseFeaLayerZZ").setVisibility(true);
				if(this.map.getLayer("baseFeaLayerGY"))
					this.map.getLayer("baseFeaLayerGY").setVisibility(true);
			},

			startup: function() {

				rule = new HorizontalSlider({
					value: 1,
					maximum: 3,
					minimum: 1,
					discreteValues: 21,
					showButtons: "true",
					onChange: (function() {
						var domNode = dojo.byId("ruleValue");
						try {
							var newValue = (rule.value).toFixed(1);
						} catch(e) {}
						//获得新的容积率系数
						plotCorrFactorSF1 = commercePlot.get(String(newValue) + "," + String(prePlotSF));
						plotCorrFactorZZ1 = residencePlot.get(String(newValue) + "," + String(prePlotZZ));
						domNode.innerHTML = rule.value;
						currentPlot = parseFloat(rule.value).toFixed(1);
						if(areTyple == "sf") {
							var uniPriceZJchange = (unitPriceZJ / plotCorrFactorSF) * plotCorrFactorSF1;
						} else if(areTyple == "zz") {
							var uniPriceZJchange = (unitPriceZJ / plotCorrFactorZZ) * plotCorrFactorZZ1;
						} else {
							var plotCorrFactorSZ = szzb / 100 * plotCorrFactorSF + plotCorrFactorZZ * (1 - szzb / 100);
							var plotCorrFactorSZ1 = szzb / 100 * plotCorrFactorSF1 + plotCorrFactorZZ1 * (1 - szzb / 100);
							var uniPriceZJchange = (unitPriceZJ / plotCorrFactorSZ) * plotCorrFactorSZ1;
						}
						if(plotNstate == "yes") {
							xiugaiState = "yes";
							unitPriceZJ = uniPriceZJchange;
							plotCorrFactorSF = plotCorrFactorSF1;
							plotCorrFactorZZ = plotCorrFactorZZ1;
							unitPriceDM = uniPriceZJchange / acreage

							//						var unitAcreage = acreage / 666.666666;
							//						if(unitPriceDMchange && uniPriceZJchange) {
							//							var resultValue = "容积率：" + rule.value + "\n" + "地面单价：" + (unitPriceDMchange).toFixed(2) + '元/m²\n ' +
							//								"楼面单价：" + (unitPriceDMchange / (rule.value)).toFixed(2) + '元\n' + "面积：" + unitAcreage.toFixed(1) + '亩  ' + acreage + 'm²\n' +
							//								'总价：  ' + (uniPriceZJchange / 10000).toFixed(2) + '万元';
							//							showResult(resultValue);
							//						}
							unitNew = unitPriceDM;
							var last = zbUnitArr.length - 1;
							zbUnitArr.splice(last);
							resprese();
						}
					})
				}, "rule");
				rule.startup();
				//TODO

				var self = this;
				var dojoquery = document.getElementById('interestInfor');
				var dojoqueryChildren = dojoquery.children;
				this.initLayer();
				esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

				esriConfig.defaults.io.proxyUrl = "/proxy/";
				esriConfig.defaults.io.alwaysUseProxy = false;

				pointt = new Point(119.43601, 32.78446, 4326);

				dojoquery.onclick = function(e) {
					if(e.target !== dojoquery) {
						currentPlot = parseFloat(e.target.innerText).toFixed(1);
						dojo.query(e.target).addClass("highlight").siblings().removeClass("highlight");
					}

				};

				document.getElementById("input_szzb").onblur = function() {
					var szzb = document.getElementById("input_szzb").value;
					if(szzb < 0) {
						document.getElementById("input_szzb").value = 0;
						szzb = 0;
					};
					if(szzb > 100) {
						document.getElementById("input_szzb").value = 100;
						szzb = 100;
					};
					if(szzb !== "") {
						document.getElementById("input_zszb").value = (100 - szzb);
						cxszzb();
					}
				}

				document.getElementById("input_zszb").onblur = function() {
					var zszb = document.getElementById("input_zszb").value;
					if(zszb < 0) {
						document.getElementById("input_zszb").value = 0;
						zszb = 0
					};
					if(zszb > 100) {
						document.getElementById("input_zszb").value = 100;
						zszb = 100
					};
					if(zszb !== "") {
						document.getElementById("input_szzb").value = (100 - zszb);
						cxszzb();
					}
				}

				var selectBtton = document.getElementById("selectBtton");
				on(dom.byId("selectBtton"), "click", function() {
					if(selectBtton.checked) {
						document.getElementById("buildingUnit").style.display = "block";
						dojo.fadeIn({
							node: "buildingUnit",
							duration: 100
						}).play();

					} else {
						document.getElementById("input_jawzjValue").value = "";
						document.getElementById("buildingUnit").style.display = "none";
						document.getElementById("buildingUnit").style.opacity = "0";
					}
				});				

				function cxszzb() {
					szzb = document.getElementById("input_szzb").value;
					try {
						var delectlayerZZ = self.map.getLayer("featureLayerZZ");
						self.map.removeLayer(delectlayerZZ);
					} catch(e) {};
					try {
						var delectlayerSY = self.map.getLayer("featureLayerSY");
						self.map.removeLayer(delectlayerSY);
					} catch(e) {};

					if(szzb == 100) {
						document.getElementById("selctionChangeTitle").style.width = "100%";
						areTyple = "sf";
						flayerSY();
					} else if(szzb == 0) {
						document.getElementById("selctionChangeTitle").style.width = "100%";
						areTyple = "zz";
						flayerZZ();
					} else if(szzb > 0 && szzb < 100) {
						areTyple = "sz";
						document.getElementById("selctionChangeTitle").style.width = "calc(100% - 17px)";
						flayerZZ();
						flayerSY();
					}
					document.getElementById("user-defined").style.display = "block";
					dojo.fadeIn({
						node: "user-defined",
						duration: 1000
					}).play();
					//初始化综合系数
					zhxsSumSF = 0;
					zhxsSumZZ = 0;
				};

				var nextZH = document.getElementById('nextZH');

				var clickNum = 0;
				nextZH.onclick = function(e) {
					if(acreage == "" || acreage == undefined || acreage == "0.0") {
						self.map.graphics.clear();
						return;
					};
					if(currentPlot == "" || currentPlot == undefined) {
						alert("请选择容积率");
						return;
					}
					self.initZHData();
					if(areTyple == "sf") {
						zhxzARR = commercial;
					} else if(areTyple == "zz") {
						zhxzARR = residentialStandard;
					} else if(areTyple == "sz") {
						zhxzARR = standardSZArr;
					}

					zbUnitArr = [];
					clickNum = 0;
					self._slide("panel1", 0, -100);
					self._slide("panel2", -100, 0);
					document.getElementById("txt_xzys").innerHTML = zhxzARR[0].name;

					touch.over(dom.byId("div_a"), function() {
						document.getElementById("describe").innerHTML = zhxzARR[0].bz.a;
						var fadeIn = dojo.fadeIn({
							node: "describe",
							duration: 1000
						});
						fadeIn.play();
					});
					touch.over(dom.byId("div_b"), function() {
						document.getElementById("describe").innerHTML = zhxzARR[0].bz.b;
						var fadeIn = dojo.fadeIn({
							node: "describe",
							duration: 1000
						});
						fadeIn.play();
					});
					touch.over(dom.byId("div_c"), function() {
						document.getElementById("describe").innerHTML = zhxzARR[0].bz.c;
						var fadeIn = dojo.fadeIn({
							node: "describe",
							duration: 1000
						});
						fadeIn.play();
					});
					touch.over(dom.byId("div_d"), function() {
						document.getElementById("describe").innerHTML = zhxzARR[0].bz.d;
						var fadeIn = dojo.fadeIn({
							node: "describe",
							duration: 1000
						});
						fadeIn.play();
					});
					touch.over(dom.byId("div_e"), function() {
						document.getElementById("describe").innerHTML = zhxzARR[0].bz.e;
						var fadeIn = dojo.fadeIn({
							node: "describe",
							duration: 1000
						});
						fadeIn.play();
					});
					//计算容积率修正系数
					plotCorrFactorSF = commercePlot.get(String(currentPlot) + "," + String(prePlotSF));
					plotCorrFactorZZ = residencePlot.get(String(currentPlot) + "," + String(prePlotZZ));
					console.log("容积率修正系数 商服：" + plotCorrFactorSF + "住宅：" + plotCorrFactorZZ);
				};

				var backOver = document.getElementById('backOver');
				backOver.onclick = function(e) {
					xiugaiState = "no";
					SelectionNumberArr.length = 0;
					zhxsSumSFArr.length = 0;
					zhxsSumZZArr.length = 0;
					radioTextselectArr.length = 0;
					try {
						var radiols = document.getElementsByName("radio-2");
						for(i = 0; i < radiols.length; i++) {
							if(radiols[i].checked) {
								radioVlue = radiols[i].value;
								radiols[i].checked = false;
							}
						}
						radiols[2].checked = true;
					} catch(e) {};
					zhxsSumSF = 0; //商服综合因素修正总系数
					zhxsSumZZ = 0; //住宅综合因素修正总系数
					clickNum = 0;
					self._slide("panel2", 0, -100);
					self._slide("panel1", -100, 0);
					document.getElementById("showSelection").innerHTML = "";
					document.getElementById("dataTitle").style.display = "none";
					document.getElementById("dataTitle1").style.display = "none";
					state = "no";
					document.getElementById("dataTitle").style.width = "100%";
					document.getElementById("selctionChange").innerHTML = "";
				};
				//重新估价
				var backOver1 = document.getElementById('backOver1');
				backOver1.onclick = function(e) {

					state = "no";
					document.getElementById("input_jawzjValue").value = "";
					document.getElementById("input_szzb").value = "";
					document.getElementById("input_zszb").value = "";
					radioVlueArr.length = 0;
					document.getElementById("user-defined").style.display = "none";
					document.getElementById("buildingUnit").style.display = "none";
					document.getElementById("colorSelect1").style.display = "none";
					document.getElementById("showSelection").innerHTML = "";
					document.getElementById("dataTitle").style.display = "none";
					document.getElementById("dataTitle1").style.display = "none";
					document.getElementById("dataTitle").style.width = "100%";
					try {
						var selectPlot = document.getElementsByClassName("interst-information highlight")[0]
						selectPlot.className = "interst-information";
					} catch(e) {};

					document.getElementById("user-defined").style.opacity = "0";
					document.getElementById("colorSelect1").style.opacity = "0";
					try {
						var delectlayerZZ = self.map.getLayer("featureLayerZZ");
						self.map.removeLayer(delectlayerZZ);
					} catch(e) {};
					try {
						var delectlayerSY = self.map.getLayer("featureLayerSY");
						self.map.removeLayer(delectlayerSY);
					} catch(e) {}
					try {
						self._isOpen = false;
						self.map.graphics.clear();
					} catch(e) {}
					self._slide("panel3", 0, -100);
					self._slide("panel1", -100, 0);
					SelectionNumberArr.length = 0;
					prePlotSF = "";
					prePlotZZ = "";
					currentPlot = "";
					plotCorrFactorSF = 1;
					radioVlueArr.length = 0;
					plotCorrFactorZZ = 1;
					sectorNumberSF = ""; //商服区段编号
					sectorNumberZZ = ""; //住宅区段编号
					unitPriceSF = ""; //商服单价
					unitPriceZZ = ""; //住宅单价
					areTyple = ""; //地块类型
					acreage = ""; //面积
					zhxsSumSFArr.length = 0;
					zhxsSumZZArr.length = 0;
					zhxsSumSF = 0; //商服综合因素修正总系数
					zhxsSumZZ = 0; //住宅综合因素修正总系数
					szzb = ""; //用户输入的百分比，需/100
					zbGraphicArr = [];
					zbdjGraLayerArr = [];
					zbdjChatDataArr = [];
					clickNum = 0;
					zbUnitArr.length = 0;
					radioTextselectArr.length = 0;
					document.getElementById("selctionChange").innerHTML = "";
					var selectBtton = document.getElementById("selectBtton");
					selectBtton.checked = false;
					document.getElementById("buildingUnit").style.opacity = "0";
				};
				var hcqkg = document.getElementById("checkeBoxHCQ");
				on(dom.byId("checkeBoxHCQ"), "click", function() {
					if(hcqkg.checked) {
						self.map.graphics.add(hcqGraphic);
					} else {
						self.map.graphics.remove(hcqGraphic);
					}
				});

				document.getElementById('back_bj').onclick = function(e) {
					self._slide("panel3", -100, 0);
					document.getElementById("panel4").style.display = "none";
					document.getElementById('chart').innerHTML = '';
					document.getElementById("chart").style.zIndex = -1000;
					document.getElementById("chart").style.opacity = 0;
					document.getElementById("huanchongAre").style.zIndex = -1000;
					document.getElementById("huanchongAre").style.opacity = 0;
					self.map.infoWindow.hide(); //隐藏弹框

				};

				document.getElementById('btn_nearby').onclick = function(e) {
					//setup the buffer parameters 
					self.map.graphics.add(hcqGraphic);
					var showExtent = hcqGraphic.geometry.getExtent();
					self.map.setExtent(showExtent.expand(1.5));
					for(i = 0; i < zbdjGraLayerArr.length; i++) {
						var zbGraphic = zbdjGraLayerArr[i];
						self.map.graphics.add(zbGraphic);
					}
					self.showChat();
					document.getElementById("panel3").style.display = "none";
					self._slide("panel4", -100, 0);
					document.getElementById("chart").style.zIndex = 1;
					document.getElementById("chart").style.opacity = 1;
					document.getElementById("huanchongAre").style.zIndex = 1;
					document.getElementById("huanchongAre").style.opacity = 1;
					document.getElementById("checkeBoxHCQ").checked = true;
				};

				function rimQurytaskDK(geometry) {
					var queryTask = new QueryTask(self.appConfig.crdkfeatureLayer);
					var query = new Query();
					query.geometry = geometry;
					query.where = "1=1";
					query.outFields = ["*"];
					query.outSpatialReference = self.map.spatialReference;
					query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
					query.returnGeometry = true;
					queryTask.execute(query, rimQueryResultDK);
				}

				Mathedd1 = function(value, key) {
					var result = "";
					switch(key) {
						case "DMDJ":
							if(value) {
								var result = value.toFixed(1);
							}
							break;
						case "CRMJ":
							if(value) {
								var result = value.toFixed(1);
							}
							break;
					}
					return result;
				}

				function rimQueryResultDK(queryResult) {

					if(queryResult.features.length >= 1) {
						for(var i = 0; i < queryResult.features.length; i++) {
							var dataObj = {};
							//得到graphic
							var zbGraphic = queryResult.features[i];
							var transactionPrice = zbGraphic.attributes["CJJ"];
							var crAverage = zbGraphic.attributes["CRMJ"];
							var zbPlot = zbGraphic.attributes["RJL"];
							var dkNumber = zbGraphic.attributes["DKBH"];
							var zbUnit = transactionPrice * 10000 / crAverage;
							if(zbUnit > unitPriceDM) {
								zbUnitArr.push(zbUnit);
							};

							var crcontent = "<table class='Bombox-table-tb' style='    text-align: left!important;line-height:25px;font-size:14px;border-spacing: 0px;border: #ccc 1px solid;text-align:right;'>" +
								"<tr ><td  class='content_td_left' style='width: 30%';>地块年份:</td><td class='content_td_right'>${DKNF}年</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>地块位置:</td><td class='content_td_right'>${DKWZ}</td></tr>" +
								"<tr><td  class='content_td_left'>起始价:</td><td class='content_td_right'>${QSJ}万元</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>成交价:</td><td class='content_td_right'>${CJJ}万元</td></tr>" +
								"<tr><td  class='content_td_left'>容积率 :</td><td class='content_td_right'>${RJL}</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>建筑密度:</td><td class='content_td_right'>${JZMD}</td></tr>" +
								"<tr><td  class='content_td_left'>绿地率:</td><td class='content_td_right'>${LDL}</td></tr>" +
								"<tr class='content_tr'><td  class='content_td_left'>出让面积 :</td><td class='content_td_right'>${CRMJ:Mathedd1}平方米</td></tr>" +
								"<tr><td  class='content_td_left'>地块用途:</td><td class='content_td_right'>${YT}</td></tr>" +
								"<tr class='content_tr'><td class='content_td_left'>地面单价:</td><td class='content_td_right'>" + zbUnit.toFixed(1) +"元</td></tr>" +
								"</table>";
							var crinfoTemplate = new InfoTemplate("${DKBH}", crcontent);
							zbGraphic.setInfoTemplate(crinfoTemplate);

							zbGraphic.setSymbol(fillDK);
							zbGraphicArr.push(zbGraphic);
							dataObj.price = zbUnit.toFixed(1);
							dataObj.dataGraphic = zbGraphic;
							dataObj.dkNumber=dkNumber;
							zbdjChatDataArr.push(dataObj);

							//添加周边地块地价text label graphic
							var text = zbUnit.toFixed(1) + "元/m²";
							var textSym = new TextSymbol(text, color, font);
							textSym.setHaloColor(new Color([255, 255, 255]));
							textSym.setHaloSize(1);
							var color = new Color();
							textSym.setColor(new Color([59, 143, 196]));
							var font = new Font();
							font.setSize("12pt");
							font.setWeight(Font.WEIGHT_BOLD);
							font.setFamily("微软雅黑");
							textSym.setFont(font);
							var markSymbol = self.getColumnSymble(zbUnit.toFixed(0),textSym);
							var columnGraphic = new esri.Graphic(zbGraphic.geometry, markSymbol);
							var textLabelGraphic = new esri.Graphic(zbGraphic.geometry, textSym);
							zbdjGraLayerArr.push(columnGraphic);
							zbdjGraLayerArr.push(textLabelGraphic);
							zbdjGraLayerArr.push(zbGraphic);
						}
					}
					resprese();
				}
				var jinruState;
				var synthesizeRadio;
				
				var showSelectionBox = document.getElementById('showSelection');
				var styleNum;
				showSelectionBox.onclick = function(e) {
					if(e.target !== showSelectionBox) {
						try {
							document.getElementById('showSelection').children[styleNum].style.border = "0px solid";
						} catch(e) {}
						if(jinruState == "yes") {
							yyclickNum = clickNum;
							jinruState = "no";
						}
						clickNum = e.target.getAttribute("numBer");
						styleNum = clickNum;
						try {
							var radiols = document.getElementsByName("radio-2");
							for(i = 0; i < radiols.length; i++) {
								if(radiols[i].checked) {
									radioVlue = radiols[i].value;
									radiols[i].checked = false;
								}
							}
							radiols[2].checked = true;
						} catch(e) {};
						document.getElementById('showSelection').children[clickNum].style.border = "1px solid";
						document.getElementById("txt_xzys").innerHTML = zhxzARR[clickNum].name;
						self._slide("zhChiose", -100, 0);
						xiugaiState = "yes";
					}
				};
				document.getElementById('btn_ok').onclick = function(e) {
					jisuanMeoth();
				};

				function jisuanMeoth() {
					if(state !== "yes") {
						document.getElementById("dataTitle").style.display = "block";
						document.getElementById("dataTitle1").style.display = "block";
						state = "yes";
					}
					if(clickNum >= zhxzARR.length) {
						return;
					}
					jinruState = "yes";
					try {
						document.getElementById('showSelection').children[clickNum].style.border = "0px solid";
					} catch(e) {
						//TODO handle the exception
					}
					console.log('clickNum:' + clickNum);
					var radioVlue;
					var radiols = document.getElementsByName("radio-2");
					for(i = 0; i < radiols.length; i++) {
						if(radiols[i].checked) {
							radioVlue = radiols[i].value;
							radiols[i].checked = false;
						}
					};
					radiols[2].checked = true;

					radioVlue = radioVlue ? radioVlue : 0;
					dojo.fadeOut({
						node: "describe",
						duration: 100
					}).play();
					//综合影响因素  //住宅
					var synthesize;
					var synthesizeKey;
					
					if(areTyple == "sf") {
						synthesizeKey = (zhxzARR[clickNum].id + "," + sectorNumberSF.substr(sectorNumberSF.length - 4));
						synthesize = commercePremium.get(synthesizeKey);
						zhxsSumSFdg = parseFloat(synthesize * radioVlue * (zhxzARR[clickNum].qz) * 0.01);
						if(xiugaiState == "yes") {
							zhxsSumSFArr[clickNum] = zhxsSumSFdg;
						} else {
							zhxsSumSFArr.push(zhxsSumSFdg);
						}
					} else if(areTyple == "zz") {
						synthesizeKey = (zhxzARR[clickNum].id + "," + sectorNumberZZ.substr(sectorNumberZZ.length - 4));
						synthesize = residencePremium.get(synthesizeKey);
						zhxsSumZZdg = parseFloat(synthesize * radioVlue * (zhxzARR[clickNum].qz) * 0.01);
						if(xiugaiState == "yes") {
							zhxsSumZZArr[clickNum] = zhxsSumZZdg;
						} else {
							zhxsSumZZArr.push(zhxsSumZZdg);
						}
					} else if(areTyple == "sz") {
						if(zhxzARR[clickNum].type == "sf") {
							synthesizeKey = (zhxzARR[clickNum].id + "," + sectorNumberSF.substr(sectorNumberSF.length - 4));
							synthesize = commercePremium.get(synthesizeKey);
							zhxsSumSFdg = parseFloat(synthesize * radioVlue * (zhxzARR[clickNum].qz) * 0.01);
							if(xiugaiState == "yes") {
								zhxsSumSFArr[clickNum] = zhxsSumSFdg;
							} else {
								zhxsSumSFArr.push(zhxsSumSFdg);
							}
						} else if(zhxzARR[clickNum].type == "zz") {
							synthesizeKey = (zhxzARR[clickNum].id + "," + sectorNumberZZ.substr(sectorNumberZZ.length - 4));
							synthesize = residencePremium.get(synthesizeKey);
							zhxsSumZZdg = parseFloat(synthesize * radioVlue * (zhxzARR[clickNum].qz) * 0.01);
							if(xiugaiState == "yes") {
								zhxsSumZZArr[clickNum] = zhxsSumZZdg;
							} else {
								zhxsSumZZArr.push(zhxsSumZZdg);
							}

						}

					}
					console.log("sf综合影响因素:" + zhxsSumSFArr + ",zz综合影响因素" + zhxsSumZZArr);
					var radioTextselect;
					var SelectionNumber;
					if(radioVlue == 1) {
						radioTextselect = "优";
						SelectionNumber = 0;
					} else if(radioVlue == 0.5) {
						radioTextselect = "较优";
						SelectionNumber = 1;
					} else if(radioVlue == 0) {
						radioTextselect = "一般";
						SelectionNumber = 2;
					} else if(radioVlue == -0.5) {
						radioTextselect = "较劣";
						SelectionNumber = 3;
					} else if(radioVlue == -1) {
						radioTextselect = "劣";
						SelectionNumber = 4;
					};
					if(xiugaiState == "yes") {
						SelectionNumberArr[clickNum] = SelectionNumber;
						radioVlueArr[clickNum] = radioVlue;
						radioTextselectArr[clickNum] = radioTextselect;
					} else {
						SelectionNumberArr.push(SelectionNumber);
						radioVlueArr.push(radioVlue);
						radioTextselectArr.push(radioTextselect);
					}
					synthesizeRadio = radioVlue * synthesize;
					var nemeShow = zhxzARR[clickNum].name.split("：")[0];
					var qzPercentage = (zhxzARR[clickNum].qz * 100).toFixed(1);
					var html_ = "";
					html_ = '<div numBer = ' + clickNum + ' style="float: left;height:20px;">' + nemeShow + '</div>' +
						'<div numBer = ' + clickNum + ' style="float: left;height:20px;">' + radioTextselect + '</div>' +
						'<div numBer = ' + clickNum + ' style="float: left;height:20px;">' + synthesizeRadio + '</div>' +
						'<div numBer = ' + clickNum + ' style="float: left;height:20px;">' + qzPercentage + '</div>';
					//synthesize修正系数
					//zhxzARR[clickNum].qz权重
					if(clickNum == 8) {
						document.getElementById("dataTitle").style.width = "calc(100% - 17px)";
					}
					var oDiv = document.createElement('div');
					oDiv.style.height = "20px";
					oDiv.innerHTML = html_;
					if(xiugaiState == "yes") {
						var delectElement = document.getElementById('showSelection').children[clickNum];
						showSelectionBox.removeChild(delectElement);
						var addElment = document.getElementById('showSelection').children[clickNum];
						document.getElementById("showSelection").insertBefore(oDiv, addElment);
						clickNum = yyclickNum - 1;
						xiugaiState = "no";
					} else {
						document.getElementById("showSelection").appendChild(oDiv);
					}
					clickNum++;

					if(clickNum < zhxzARR.length) {
						var index = clickNum;
						if(index >= zhxzARR.length) {
							index = zhxzARR.length - 1;
						}
						document.getElementById("txt_xzys").innerHTML = zhxzARR[index].name;
						self._slide("zhChiose", -100, 0);

						touch.over(dom.byId("div_a"), function() {
							try {
								document.getElementById("describe").innerHTML = zhxzARR[index].bz.a;
							} catch(e) {}
							var fadeIn = dojo.fadeIn({
								node: "describe",
								duration: 1000
							});
							fadeIn.play();
						});
						touch.over(dom.byId("div_b"), function() {
							try {
								document.getElementById("describe").innerHTML = zhxzARR[index].bz.b;
							} catch(e) {}
							var fadeIn = dojo.fadeIn({
								node: "describe",
								duration: 1000
							});
							fadeIn.play();
						});
						touch.over(dom.byId("div_c"), function() {
							try {
								document.getElementById("describe").innerHTML = zhxzARR[index].bz.c;
							} catch(e) {}
							var fadeIn = dojo.fadeIn({
								node: "describe",
								duration: 1000
							});
							fadeIn.play();
						});
						touch.over(dom.byId("div_d"), function() {
							try {
								document.getElementById("describe").innerHTML = zhxzARR[index].bz.d;
							} catch(e) {}
							var fadeIn = dojo.fadeIn({
								node: "describe",
								duration: 1000
							});
							fadeIn.play();
						});
						touch.over(dom.byId("div_e"), function() {
							try {
								document.getElementById("describe").innerHTML = zhxzARR[index].bz.e;
							} catch(e) {}
							var fadeIn = dojo.fadeIn({
								node: "describe",
								duration: 1000
							});
							fadeIn.play();
						});

					} else {
						//TODO
						document.getElementById("loadingPage").style.display = "block";
						for(var i = 0; i < zhxzARR.length; i++) {

							var Changehtml = '';
							Changehtml = '<div>' + zhxzARR[i].name + '</div><div>' +
								'<select name = "Select">' +
								'<option  number =' + i + ' value="1">优</option>' +
								'<option number =' + i + ' value="0.5">较优</option>' +
								'<option number =' + i + ' value="0">一般</option>' +
								'<option number =' + i + ' value="-0.5">较劣</option>' +
								'<option number =' + i + ' value="-1">劣</option>' +
								'</select>' +
								'</div>';
							var oDiv1 = document.createElement('div');
							oDiv1.style.height = "20px";
							oDiv1.innerHTML = Changehtml;
							document.getElementById("selctionChange").appendChild(oDiv1);
						}
						plotNstate = "no";
						rule.attr("value", currentPlot);
						var ckNum;
						var Selects = document.getElementsByTagName("Select");
						for(var i = 0; i < SelectionNumberArr.length; i++) {
							var SelectionNum = SelectionNumberArr[i];
							Selects[i][SelectionNum].selected = true;
						}
						var synthesizeKeyRe;
						var synthesizeRe;

						for(var i = 0; i < Selects.length; i++) {
							console.log("Selects.length" + Selects.length + "SelectionNumberArr.length" + SelectionNumberArr.length)

							Selects[i].onchange = function(e) {
								ckNum = parseFloat(e.srcElement[0].attributes[0].value);
								valueRe = parseFloat(e.currentTarget.value);
								if(areTyple == "sf") {
									synthesizeKeyRe = (zhxzARR[ckNum].id + "," + sectorNumberSF.substr(sectorNumberSF.length - 4));
									synthesizeRe = commercePremium.get(synthesizeKeyRe);
									var zhxsSumSFdgN = parseFloat(synthesizeRe * valueRe * (zhxzARR[ckNum].qz) * 0.01);
									zhxsSumSFArr[ckNum] = zhxsSumSFdgN;
								} else if(areTyple == "zz") {
									console.log(zhxsSumZZArr)
									synthesizeKeyRe = (zhxzARR[ckNum].id + "," + sectorNumberZZ.substr(sectorNumberZZ.length - 4));
									synthesizeRe = residencePremium.get(synthesizeKeyRe);
									var zhxsSumZZdgN = parseFloat(synthesizeRe * valueRe * (zhxzARR[ckNum].qz) * 0.01);
									zhxsSumZZArr[ckNum] = zhxsSumZZdgN;
								} else if(areTyple == "sz") {
									if(zhxzARR[ckNum].type == "sf") {
										synthesizeKeyRe = (zhxzARR[ckNum].id + "," + sectorNumberSF.substr(sectorNumberSF.length - 4));
										synthesizeRe = commercePremium.get(synthesizeKeyRe);
										var zhxsSumSFdgN = parseFloat(synthesizeRe * valueRe * (zhxzARR[ckNum].qz) * 0.01);
										zhxsSumSFArr[ckNum] = zhxsSumSFdgN;
									} else if(zhxzARR[ckNum].type == "zz") {
										synthesizeKeyRe = (zhxzARR[ckNum].id + "," + sectorNumberZZ.substr(sectorNumberZZ.length - 4));
										synthesizeRe = residencePremium.get(synthesizeKeyRe);
										var zhxsSumZZdgN = parseFloat(synthesizeRe * valueRe * (zhxzARR[ckNum].qz) * 0.01);
										var NckNum = ckNum - 8;
										zhxsSumZZArr[NckNum] = zhxsSumZZdgN;
									}
								}
								//计算容积率修正系数
								plotCorrFactorSF = commercePlot.get(String(currentPlot) + "," + String(prePlotSF));
								plotCorrFactorZZ = residencePlot.get(String(currentPlot) + "," + String(prePlotZZ));
								console.log(zhxsSumSFArr)
								console.log(zhxsSumZZArr)
								console.log("value的值" + valueRe)
								xiugaiState = "yes";
								var last = zbUnitArr.length - 1;
								zbUnitArr.splice(last);
								console.log("数组" + zbUnitArr)
								computeMethod();
								resprese();
							}
						}
						computeMethod();

						var params = new BufferParameters();

						params.distances = [0.8];
						params.outSpatialReference = self.map.spatialReference;
						params.bufferSpatialReference = new SpatialReference({
							wkid: 102100
						});
						params.unit = GeometryService["UNIT_STATUTE_MILE"];
						normalizeUtils.normalizeCentralMeridian([geometry]).then(function(normalizedGeometries) {
							var normalizedGeometry = normalizedGeometries[0];
							if(normalizedGeometry.type === "polygon") {
								//if geometry is a polygon then simplify polygon.  This will make the user drawn polygon topologically correct.
								esriConfig.defaults.geometryService.simplify([normalizedGeometry], function(geometries) {
									params.geometries = geometries;
									esriConfig.defaults.geometryService.buffer(params, showBufferSimple);
								});
							} else {
								params.geometries = [normalizedGeometry];
								esriConfig.defaults.geometryService.buffer(params, showBufferSimple);
							}

						});
						//TODO

						function computeMethod() {
							zhxsSumZZ = 0;
							zhxsSumSF = 0;
							for(var i = 0; i < zhxsSumSFArr.length; i++) {
								zhxsSumSF += zhxsSumSFArr[i];
							};
							for(var i = 0; i < zhxsSumZZArr.length; i++) {
								zhxsSumZZ += zhxsSumZZArr[i];
							}
							console.log("------------" + currentPlot);

							if(areTyple == "sf") {
								console.log("商服单价：" + unitPriceSF + " 面积：" + acreage + "容积率修正系数：" + plotCorrFactorSF + " 综合修正系数：" + zhxsSumSF);
								unitPriceZJ = unitPriceSF * acreage * plotCorrFactorSF * (1 + zhxsSumSF);

							} else if(areTyple == "zz") {
								console.log("住宅单价：" + unitPriceZZ + " 面积：" + acreage + "容积率修正系数：" + plotCorrFactorZZ + " 综合修正系数：" + zhxsSumZZ);
								unitPriceZJ = unitPriceZZ * acreage * plotCorrFactorZZ * (1 + zhxsSumZZ);
							} else {
								console.log("商服单价：" + unitPriceSF + " 面积：" + acreage + "容积率修正系数：" + plotCorrFactorSF + " 综合修正系数：" + zhxsSumSF);
								console.log("住宅单价：" + unitPriceZZ + " 面积：" + acreage + "容积率修正系数：" + plotCorrFactorZZ + " 综合修正系数：" + zhxsSumZZ)
								console.log("商服占比：" + szzb);
								var unitPriceZJzz = unitPriceZZ * acreage * plotCorrFactorZZ * (1 + zhxsSumZZ);
								var unitPriceZJsf = unitPriceSF * acreage * plotCorrFactorSF * (1 + zhxsSumSF);
								unitPriceZJ = (szzb / 100 * unitPriceZJsf + (1 - szzb / 100) * unitPriceZJzz);
							};
							var unitAcreage = acreage / 666.666666;
							unitPriceDM = unitPriceZJ / acreage;
							var unitPriceLM = unitPriceDM / parseFloat(currentPlot);
							console.log("原始总价：" + unitPriceZJ + "，原始地面单价：" + unitPriceDM + "原始楼面单价" + unitPriceLM);
						};

						function showBufferSimple(bufferedGeometries) {
							var symbol = new SimpleFillSymbol(
								SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(
									SimpleLineSymbol.STYLE_SOLID,
									new dojo.Color([255, 0, 0, 0.65]), 2
								),
								new dojo.Color([255, 0, 0, 0.35])
							);

							array.forEach(bufferedGeometries, function(bfGeometry) {
								hcqGraphic = new esri.Graphic(bfGeometry, symbol);
								rimQurytaskDK(bfGeometry);
							});

						}

					}

				};

				function resprese() {
					var selectBtton = document.getElementById("selectBtton");
					var input_jawzjValue = document.getElementById("input_jawzjValue").value;
					if(!input_jawzjValue) {
						input_jawzjValue = "0";
					}
					zbUnitArr.push(unitPriceDM);
					console.log("周边地价+ 原始地价：" + zbUnitArr);
					var sum = 0;
					for(var i = 0; i < zbUnitArr.length; i++) {
						sum += zbUnitArr[i];
					}
					console.log("地价总和" + sum);
					var mean = sum / zbUnitArr.length;
					console.log("当前地价" + mean);
					var unitPriceLM = mean / parseFloat(currentPlot);
					if(selectBtton.checked) {
						unitPriceZJ1 = (mean * acreage + parseFloat(input_jawzjValue)).toFixed(1);
					} else {
						unitPriceZJ1 = mean * acreage
					}

					document.getElementById("loadingPage").style.display = "none";
					var unitAcreage = acreage / 666.666666;
					unitNew = mean;
					if(xiugaiState !== "yes") {
						self._slide("panel2", 0, -100);
						self._slide("panel3", -100, 0);
					}
					var resultValue = "容积率：" + currentPlot + "\n" + "地面单价：" + mean.toFixed(1) + '元/m²\n ' +
						"楼面单价：" + unitPriceLM.toFixed(1) + '元\n' + "面积：" + unitAcreage.toFixed(1) + '亩  ' + acreage + 'm²\n' +
						'总价：  ' + (mean * acreage / 10000).toFixed(1) + '万元';
					showResult(resultValue);
					xiugaiState = "no";
					plotNstate = "yes";
				}

				var geometryServices = new GeometryService(this.appConfig.GeometryService);

				function showResult(resultValue) {
					var textSym = new TextSymbol(resultValue, color, font);
					textSym.setHaloColor(new Color([255, 255, 255]));
					textSym.setHaloSize(1);
					var color = new Color();
					textSym.setColor(new Color([0, 0, 0]));
					var font = new Font();
					font.setSize("12pt");
					font.setWeight(Font.WEIGHT_BOLD);
					font.setFamily("微软雅黑");
					textSym.setFont(font);
					try {
						self.map.graphics.remove(resultGraphic);
					} catch(e) {};
					resultGraphic = new esri.Graphic(geometry, textSym);
					self.map.graphics.add(resultGraphic);

					var pt = new Point(geometry.getCentroid().x, geometry.getCentroid().y, self.map.spatialReference);
					var showExtent = geometry.getExtent();
					self.map.setExtent(showExtent.expand(2));
				}

				function delect() {
					try {
						var delectlayer = self.map.getLayer("featureLayer2");
						self.map.removeLayer(delectlayer);
					} catch(e) {}
				}

				function centerandzoommetlh() {
					self.map.centerAndZoom(pointt, 13);
				}

				function flayerSY() {
					self.map.graphics.clear();
					self.map.addLayer(syLayer);
					centerandzoommetlh();
				};

				function flayerZZ() {
					self.map.graphics.clear();
					self.map.addLayer(zzLayer);
					centerandzoommetlh();
				};

				toolbar = new Draw(this.map, {
					showTooltip: true
				});

				//设置空间查询框选时框的样式
				// var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
				//     new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 3), new dojo.Color([255, 255, 0, 0.15]));
				//显示要素单击选中或者与table交互的样式

				var fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
					new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 2), new dojo.Color([238, 99, 99, 0.55]));
				//查询结果的样式
				var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 2), new dojo.Color([255, 250, 250, 0.25]));
				var fillDK = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2), new dojo.Color([255, 250, 250, 0.25]));
				var userDefined = document.getElementById("user-defined");
				userDefined.onclick = function() {
					try {
						var popS = document.getElementsByClassName("esriPopupMobile")[0];
						popS.className = 'popNone';
					} catch(e) {
						try {
							var popS = document.getElementsByClassName("esriPopup")[0];
							popS.className = 'popNones';
						} catch(e) {}
					};
					self.map.graphics.clear();
					toolbar.activate(Draw.POLYGON, {
						showTooltip: true

					});
				};

				on(toolbar, "draw-end", function(result) {
					try {
						document.getElementsByClassName("titleButton close")[0].click();
						var popS = document.getElementsByClassName("popNone")[0];
						popS.className = 'esriPopupMobile';
					} catch(e) {
						try {
							var popS = document.getElementsByClassName("popNones")[0];
							popS.className = 'esriPopup esriPopupHidden';
						} catch(e) {};
					};
					geometry = result.geometry;
					toolbar.deactivate(); //注销工具
					if(areTyple == 'sf' || areTyple == 'sz') {
						queryGraphicSF(geometry);
					}
					if(areTyple == 'zz' || areTyple == 'sz') {
						queryGraphicZZ(geometry);
					}

					doMeasure(geometry);
				});

				function showPlotBut() {
					document.getElementById("colorSelect1").style.display = "block";
					dojo.fadeIn({
						node: "colorSelect1",
						duration: 1000
					}).play();
				}

				function queryGraphicSF(geometry) {
					var queryTask = new QueryTask(self.appConfig.featureLayer);
					var query = new Query();
					query.geometry = geometry;
					query.where = "1=1";
					query.outFields = ["*"];
					query.outSpatialReference = self.map.spatialReference;
					query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
					query.returnGeometry = true;
					queryTask.execute(query, showQueryResultSF);
				}

				function queryGraphicZZ(geometry) {
					var queryTask = new QueryTask(self.appConfig.zzfeatureLayer);
					var query = new Query();
					query.geometry = geometry;
					query.where = "1=1";
					query.outFields = ["*"];
					query.outSpatialReference = self.map.spatialReference;
					query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
					query.returnGeometry = true;
					queryTask.execute(query, showQueryResultZZ);
				}

				function showQueryResultSF(queryResult) {
					if(queryResult.features.length >= 1) {
						var graphic = queryResult.features[0];
						graphic.setSymbol(fill);
						sectorNumberSF = graphic.attributes["DJQDBH"];
						unitPriceSF = graphic.attributes["DMJZDJ"];
						prePlotSF = graphic.attributes["SDRJL"];
						console.log(sectorNumberSF + " " + unitPriceSF + " " + prePlotSF);
					} else {
						sectorNumberSF = "321084100024S";
						unitPriceSF = 2535;
						prePlotSF = 1.3;
					}
				}

				function showQueryResultZZ(queryResult) {
					if(queryResult.features.length >= 1) {
						var graphic = queryResult.features[0];
						graphic.setSymbol(fill);
						sectorNumberZZ = graphic.attributes["DJQDBH"];
						unitPriceZZ = graphic.attributes["DMJZDJ"];
						prePlotZZ = graphic.attributes["SDRJL"];
						console.log(sectorNumberZZ + " " + unitPriceZZ + " " + prePlotZZ);
					} else {
						sectorNumberZZ = "321084100018J";
						unitPriceZZ = 1190;
						prePlotZZ = 1.3;
					}
				}

				//量算
				function doMeasure(geometry) {
					//更加类型设置显示样式
					measuregeometry = geometry;
					switch(geometry.type) {
						case "polyline":
							var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 3);
							break;
						case "polygon":
							var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 3), new dojo.Color([255, 255, 0, 0.25]));
							break;
					}
					//设置样式
					gjGraphic = new esri.Graphic(geometry, symbol);
					//清除上一次的画图内容
					self.map.graphics.clear();
					self.map.graphics.add(gjGraphic);
					//进行投影转换，完成后调用projectComplete
					MeasureGeometry(geometry);
				}

				//投影转换完成后调用方法
				function MeasureGeometry(geometry) {
					//如果为线类型就进行lengths距离测算
					if(geometry.type == "polyline") {
						var lengthParams = new esri.tasks.LengthsParameters();
						lengthParams.polylines = [geometry];
						lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
						lengthParams.geodesic = true;
						lengthParams.polylines[0].spatialReference = new esri.SpatialReference(4326);
						geometryServices.lengths(lengthParams);
						dojo.connect(geometryServices, "onLengthsComplete", outputDistance);
					}
					//如果为面类型需要先进行simplify操作在进行面积测算
					else if(geometry.type == "polygon") {
						var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
						areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
						areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_METERS;
						this.outSR = new esri.SpatialReference({
							wkid: 102113
						});
						//						geometryServices.simplify([geometry], function(simplifiedGeometries) {
						//							areasAndLengthParams.polygons = simplifiedGeometries;
						//							geometryServices.areasAndLengths(areasAndLengthParams);
						//						});
						geometryServices.project([geometry], this.outSR, function(geometry) {
							geometryServices.simplify(geometry, function(simplifiedGeometries) {
								areasAndLengthParams.polygons = simplifiedGeometries;
								areasAndLengthParams.polygons[0].spatialReference = new esri.SpatialReference(102113);
								geometryServices.areasAndLengths(areasAndLengthParams);
							});
						});
						dojo.connect(geometryServices, "onAreasAndLengthsComplete", outputAreaAndLength);

					}
				};

				//显示测量面积
				function outputAreaAndLength(result) {
					acreage = (result.areas[0] / 1.41825).toFixed(1);
					if(acreage == "" || acreage == undefined || acreage == "0.0") {
						self.map.graphics.clear();
						return;
					};
					showPlotBut();
				}

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
			
			getColumnSymble: function(price,textSym) {
				var markSymbol;
				if(price<=1000){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 10).setOffset(0, 5);
					textSym.setOffset(0, 12);
				}else if(price<=2000){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 20).setOffset(20, 10);
					textSym.setOffset(20, 22);
				}else if(price<=3000){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 30).setOffset(0, 15);
					textSym.setOffset(0, 32);
				}else if(price<=3500){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 35).setOffset(0, 17);
					textSym.setOffset(0, 37);
				}else if(price<=4000){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 40).setOffset(0, 20);
					textSym.setOffset(0, 42);
				}else if(price<=4500){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 45).setOffset(0, 22);
					textSym.setOffset(0, 47);
				}else if(price<=5000){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 50).setOffset(0, 25);
					textSym.setOffset(0, 52);
				}else if(price<=5500){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 55).setOffset(-20, 27);
					textSym.setOffset(-5, 57);
				}else if(price<=6000){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 60).setOffset(0, 30);
					textSym.setOffset(0, 62);
				}else if(price<=6500){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 65).setOffset(-20, 32);
					textSym.setOffset(-20, 67);
				}else if(price<=7000){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 70).setOffset(0, 35);
					textSym.setOffset(0, 72);
				}else if(price<=7500){
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 75).setOffset(20, 37);
					textSym.setOffset(20, 87);
				}else{
					markSymbol = new PictureMarkerSymbol("widgets/Estimate/images/i_column.png", 20, 80).setOffset(20, 40);
					textSym.setOffset(20, 82);
				}
				
				return markSymbol;
			},

			showChat: function() {
				var self = this;
				//--- 柱状图 ---
				var chartBar = new Chart2D('chart', {
					title: "单位：元/m²",
					titleFont:"normal normal normal 15pt Arial"
				});

				var arrXData = [];
				var gjObj = {};
				gjObj.value = 1;
				gjObj.text = "估价地块";
				arrXData.push(gjObj);
				var arrYData = [];
				arrYData.push(parseFloat(unitNew.toFixed(1)));
				for(var i = 0; i < zbdjChatDataArr.length; i++) {
					var xObj = {};
					xObj.value = i + 2;
					xObj.text = zbdjChatDataArr[i].dkNumber;
					arrXData.push(xObj);
					arrYData.push(parseFloat(zbdjChatDataArr[i].price));
				}

				//增加X轴，但并不需要显示
				chartBar.addAxis("x", {
					labels: arrXData,
					majorTick: {
						length: 0
					},
					minorTick: {
						length: 0
					},
					natural: true,
					rotation:-45
				});
				//增加Y轴，但也不需要显示
				chartBar.addAxis("y", {
					vertical: true,
					stroke: "black",
					fontColor: "black",
					majorTick: {
						length: 0
					},
					minorTick: {
						length: 0
					},
					includeZero: true
				});

				//定义图标类型，这里用柱状图
				chartBar.addPlot("default", {
					type: "Columns",
					gap: 10,
					font: "normal normal bold 8pt Tahoma",
					fontColor: "black"
				});

				//指定图标使用的数据以及图表中柱条的颜色
				chartBar.addSeries("SeriesA", arrYData, {
					stroke: {
						color: "steelblue"
					},
					fill: "steelblue"
				});

				var anim1 = new dojox.charting.action2d.Highlight(chartBar, "default", {
					highlight: "lightskyblue"
				});
				var anim2 = new dojox.charting.action2d.Tooltip(chartBar, "default");
				chartBar.connectToPlot("default", "x", function(args) {
					if(args.type == "onclick") {
						if(args.index == 0) {
							var showExtent = geometry.getExtent();
							self.map.setExtent(showExtent.expand(3));
						} else {
							self.map.graphics.add(zbdjChatDataArr[args.index - 1].dataGraphic);
							var showExtent = zbdjChatDataArr[args.index - 1].dataGraphic.geometry.getExtent();
							self.map.infoWindow.setContent(zbdjChatDataArr[args.index - 1].dataGraphic.getContent());
							self.map.infoWindow.setTitle(zbdjChatDataArr[args.index - 1].dataGraphic.getTitle());
							self.map.infoWindow.anchor = "ANCHOR_LOWERRIGHT "; //固定在右上角
							self.map.infoWindow.show(zbdjChatDataArr[args.index - 1].dataGraphic.geometry.getCentroid(), self.map.getInfoWindowAnchor(zbdjChatDataArr[args.index - 1].dataGraphic.geometry.getCentroid()));
							self.map.setExtent(showExtent.expand(3));
						}
					}
				});

				//渲染
				chartBar.render();
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

			initZHData: function() {

				standardSZArr = [{
						"type": "sf",
						"name": "(商)宗地形状可利用度：",
						"id": "f",
						"qz": "0.0978",
						"bz": {
							"a": "矩形，面积适中，对土地利用有利",
							"b": "近似矩形，面积较适中，对土地利用较有利",
							"c": "较不规则，面积较小或较大，但对土地利用无影响",
							"d": "不规则，面积偏大或偏小，对土地利用有一定影响",
							"e": "很不规则，面积过大、过小对土地利用影响较大"
						}
					}, {
						"type": "sf",
						"name": "(商)规划条件：",
						"id": "l",
						"qz": "0.0969",
						"bz": {
							"a": "周边土地利用以商服用地为 主",
							"b": "周边土地利用以商服、市政用地为主",
							"c": "周边土地利用以商住、综合用地为主",
							"d": "周边土地利用以住宅用地为主",
							"e": "周边土地利用以工业等其他用地为主"
						}
					}, {
						"type": "sf",
						"name": "(商)宗地自然条件：",
						"id": "g",
						"qz": "0.0856",
						"bz": {
							"a": "地形坡度小于1％，地质状况和地基承载力好，适宜建设",
							"b": "地形坡度1-3%，地质状况和地基承载力较好，不需改造",
							"c": "地形坡度3-6%，地质状况和地基承载力一般，需略作改造",
							"d": "地形坡度6-10%，地质状况和地基承载力较差，需作一定改造",
							"e": "地形坡度大于10%，地质状况和地基承载力差，影响用地布局，需改造"
						}
					}, {
						"type": "sf",
						"name": "(商)临街道路状况：",
						"id": "h",
						"qz": "0.0922",
						"bz": {
							"a": "临混合型主干道，道路通达性好",
							"b": "临生活型主干道，道路通达性较好",
							"c": "临交通型主干道或生活型次干道，道路通达性一般",
							"d": "临交通型次干道，道路通达性较差",
							"e": "临支路或巷道，道路通达性差"
						}
					}, {
						"type": "sf",
						"name": "(商)商服繁华程度：",
						"id": "i",
						"qz": "0.2755",
						"bz": {
							"a": "距最近商服中心距离小于 100m，繁华度高",
							"b": "距最近商服中心距离 100m-300m，繁华度较高",
							"c": "距最近商服中心距离300m-500m，繁华度一般",
							"d": "距最近商服中心距离 500m-800m，繁华度较低",
							"e": "距最近商服中心距离大于800m，繁华度低"
						}
					}, {
						"type": "sf",
						"name": "(商)宗地利用状况：",
						"id": "j",
						"qz": "0.1234",
						"bz": {
							"a": "土地用途、规模、强度等利用状况有利于宗地价值最大化",
							"b": "土地用途、规模、强度等利用状况较有利于宗地价值最大化",
							"c": "土地用途、规模、强度等利用状况基本符合最高最佳使用",
							"d": "土地用途、规模、强度等利用状况对宗地价值最大化有一定影响",
							"e": "土地用途、规校、强度等利用状况对宗地价值最大化影响大"
						}
					}, {
						"type": "sf",
						"name": "(商)交通便捷度：",
						"id": "k",
						"qz": "0.1267",
						"bz": {
							"a": "交通便捷度高",
							"b": "交通便捷度较高",
							"c": "交通便捷一般",
							"d": "交通便捷度较差",
							"e": "交通便捷度差"
						}
					}, {
						"type": "sf",
						"name": "(商)其他因素状况：",
						"id": "m",
						"qz": "0.1019",
						"bz": {
							"a": "有利",
							"b": "较有利",
							"c": "无影响",
							"d": "有一定影响",
							"e": "影响较大"
						}
					},

					{
						"type": "zz",
						"name": "(住)宗地可利用程度：",
						"id": "f",
						"qz": "0.0773",
						"bz": {
							"a": "矩形，面积适中，对土地利用有利",
							"b": "近似矩形，面积较适中，对土地利用较有利",
							"c": "较不规则，面积较小或较大，但对土地利用无影响",
							"d": "不规则，面积偏大或偏小，对土地利用有一定影响",
							"e": "很不规则，面积过大、过小对土地利用影响较大"
						}
					}, {
						"type": "zz",
						"name": "(住)规划条件：",
						"id": "l",
						"qz": "0.0717",
						"bz": {
							"a": "未来土地利用以居住用地为主",
							"b": "未来土地利用以居住、市政用地为主",
							"c": "未来土地利用以商住、综合用地为主",
							"d": "未来土地利用以商服用地为主",
							"e": "未来土地利用以工业等其他用 地为主"
						}
					}, {
						"type": "zz",
						"name": "(住)距商服中心距离：",
						"id": "z",
						"qz": "0.1286",
						"bz": {
							"a": "距最近商服中心距离小于100m",
							"b": "距最近商服中心距离100m-300m",
							"c": "距最近商服中心距离300m-500m",
							"d": "距最近商服中心距离500m-800m",
							"e": "距最近商服中心距离大于800m"
						}
					}, {
						"type": "zz",
						"name": "(住)微观环境状况：",
						"id": "w",
						"qz": "0.1842",
						"bz": {
							"a": "自然、人文环境优美，配套设施齐全",
							"b": "自然、人文环境较优美，配套设施较齐全",
							"c": "自然、人文环境一般，有基本的配套设施",
							"d": "自然、人文环境较差，配套设施不齐全",
							"e": "自然、人文环境差，配套设施不齐全"
						}
					}, {
						"type": "zz",
						"name": "(住)公用设施方便度：",
						"id": "q",
						"qz": "0.1312",
						"bz": {
							"a": "500m内超市、菜场、学校、医院、体育馆、公园、邮政等公共服务设施较齐全",
							"b": "500-800m超市、菜场、学校、医院、体育馆、公园、邮政等公共服务设施较齐全",
							"c": "800m内有超市、菜场、学校等基本公共服务设施",
							"d": "800-1000m内有超市、菜场、学校等基本公共服务设施",
							"e": "超市、菜场、学校等基本公共服务设施位于1000m外"
						}
					}, {
						"type": "zz",
						"name": "(住)交通便捷度：",
						"id": "k",
						"qz": "0.1489",
						"bz": {
							"a": "交通便捷度高",
							"b": "交通便捷度较高",
							"c": "交通便捷一般",
							"d": "交通便捷度较差",
							"e": "交通便捷度差"
						}
					}, {
						"type": "zz",
						"name": "(住)绿化率：",
						"id": "n",
						"qz": "0.0761",
						"bz": {
							"a": "绿化设置有主有从、层次分明，苗木配置合理，人文、自然有机结合,绿化面积不少于建筑面积的50%",
							"b": "绿化设置有主有从、层次分明，苗木配置合理，绿化面积占建 筑面枳的30%~50%",
							"c": "绿化设置有主有从、层次分明，苗木质量一般，绿化面积少于建筑面积的30%",
							"d": "简单绿化、苗木质量一般",
							"e": "少量、无绿化配置"
						}
					}, {
						"type": "zz",
						"name": "(住)其他因素状况：",
						"id": "m",
						"qz": "0.0851",
						"bz": {
							"a": "有利",
							"b": "较有利",
							"c": "无影响",
							"d": "有一定影响",
							"e": "影响较大"
						}
					}

				];
				commercial = [{
						"name": "宗地形状可利用度：",
						"id": "f",
						"qz": "0.0978",
						"bz": {
							"a": "矩形，面积适中，对土地利用有利",
							"b": "近似矩形，面积较适中，对土地利用较有利",
							"c": "较不规则，面积较小或较大，但对土地利用无影响",
							"d": "不规则，面积偏大或偏小，对土地利用有一定影响",
							"e": "很不规则，面积过大、过小对土地利用影响较大"
						}
					},
					{
						"name": "规划条件：",
						"id": "l",
						"qz": "0.0969",
						"bz": {
							"a": "周边土地利用以商服用地为 主",
							"b": "周边土地利用以商服、市政用地为主",
							"c": "周边土地利用以商住、综合用地为主",
							"d": "周边土地利用以住宅用地为主",
							"e": "周边土地利用以工业等其他用地为主"
						}
					},
					{
						"name": "宗地自然条件：",
						"id": "g",
						"qz": "0.0856",
						"bz": {
							"a": "地形坡度小于1％，地质状况和地基承载力好，适宜建设",
							"b": "地形坡度1-3%，地质状况和地基承载力较好，不需改造",
							"c": "地形坡度3-6%，地质状况和地基承载力一般，需略作改造",
							"d": "地形坡度6-10%，地质状况和地基承载力较差，需作一定改造",
							"e": "地形坡度大于10%，地质状况和地基承载力差，影响用地布局，需改造"
						}
					},
					{
						"name": "临街道路状况：",
						"id": "h",
						"qz": "0.0922",
						"bz": {
							"a": "临混合型主干道，道路通达性好",
							"b": "临生活型主干道，道路通达性较好",
							"c": "临交通型主干道或生活型次干道，道路通达性一般",
							"d": "临交通型次干道，道路通达性较差",
							"e": "临支路或巷道，道路通达性差"
						}
					},
					{
						"name": "商服繁华程度：",
						"id": "i",
						"qz": "0.2755",
						"bz": {
							"a": "距最近商服中心距离小于 100m，繁华度高",
							"b": "距最近商服中心距离 100m-300m，繁华度较高",
							"c": "距最近商服中心距离300m-500m，繁华度一般",
							"d": "距最近商服中心距离 500m-800m，繁华度较低",
							"e": "距最近商服中心距离大于800m，繁华度低"
						}
					},
					{
						"name": "宗地利用状况：",
						"id": "j",
						"qz": "0.1234",
						"bz": {
							"a": "土地用途、规模、强度等利用状况有利于宗地价值最大化",
							"b": "土地用途、规模、强度等利用状况较有利于宗地价值最大化",
							"c": "土地用途、规模、强度等利用状况基本符合最高最佳使用",
							"d": "土地用途、规模、强度等利用状况对宗地价值最大化有一定影响",
							"e": "土地用途、规校、强度等利用状况对宗地价值最大化影响大"
						}
					},
					{
						"name": "交通便捷度：",
						"id": "k",
						"qz": "0.1267",
						"bz": {
							"a": "交通便捷度高",
							"b": "交通便捷度较高",
							"c": "交通便捷一般",
							"d": "交通便捷度较差",
							"e": "交通便捷度差"
						}
					},
					{
						"name": "其他因素状况：",
						"id": "m",
						"qz": "0.1019",
						"bz": {
							"a": "有利",
							"b": "较有利",
							"c": "无影响",
							"d": "有一定影响",
							"e": "影响较大"
						}
					}
				];
				//住宅
				residentialStandard = [{
						"name": "宗地形状可利用度：",
						"id": "f",
						"qz": "0.0773",
						"bz": {
							"a": "矩形，面积适中，对土地利用有利",
							"b": "近似矩形，面积较适中，对土地利用较有利",
							"c": "较不规则，面积较小或较大，但对土地利用无影响",
							"d": "不规则，面积偏大或偏小，对土地利用有一定影响",
							"e": "很不规则，面积过大、过小对土地利用影响较大"
						}
					},
					{
						"name": "规划条件：",
						"id": "l",
						"qz": "0.0717",
						"bz": {
							"a": "未来土地利用以居住用地为主",
							"b": "未来土地利用以居住、市政用地为主",
							"c": "未来土地利用以商住、综合用地为主",
							"d": "未来土地利用以商服用地为主",
							"e": "未来土地利用以工业等其他用 地为主"
						}
					},
					{
						"name": "距商服中心距离：",
						"id": "z",
						"qz": "0.1286",
						"bz": {
							"a": "距最近商服中心距离小于100m",
							"b": "距最近商服中心距离100m-300m",
							"c": "距最近商服中心距离300m-500m",
							"d": "距最近商服中心距离500m-800m",
							"e": "距最近商服中心距离大于800m"
						}
					},
					{
						"name": "微观环境状况：",
						"id": "w",
						"qz": "0.1842",
						"bz": {
							"a": "自然、人文环境优美，配套设施齐全",
							"b": "自然、人文环境较优美，配套设施较齐全",
							"c": "自然、人文环境一般，有基本的配套设施",
							"d": "自然、人文环境较差，配套设施不齐全",
							"e": "自然、人文环境差，配套设施不齐全"
						}
					},
					{
						"name": "公用设施方便度：",
						"id": "q",
						"qz": "0.1312",
						"bz": {
							"a": "500m内超市、菜场、学校、医院、体育馆、公园、邮政等公共服务设施较齐全",
							"b": "500-800m超市、菜场、学校、医院、体育馆、公园、邮政等公共服务设施较齐全",
							"c": "800m内有超市、菜场、学校等基本公共服务设施",
							"d": "800-1000m内有超市、菜场、学校等基本公共服务设施",
							"e": "超市、菜场、学校等基本公共 服务设施位于1000m外"
						}
					},
					{
						"name": "交通便捷度：",
						"id": "k",
						"qz": "0.1489",
						"bz": {
							"a": "交通便捷度高",
							"b": "交通便捷度较高",
							"c": "交通便捷一般",
							"d": "交通便捷度较差",
							"e": "交通便捷度差"
						}
					},
					{
						"name": "绿化率：",
						"id": "n",
						"qz": "0.0761",
						"bz": {
							"a": "绿化设置有主有从，层次分明，苗木配置合理，人文、自然有机结合，绿化面积不少于建筑面积的50%",
							"b": "绿化设置有主有从，层次分明，苗木配置合理，绿化面积占建 筑面枳的30%~50%",
							"c": "绿化设置有主有从，层次分明，苗木质量一般，绿化面积少于建筑面积的30%",
							"d": "简单绿化，苗木质量一般",
							"e": "少量、无绿化配置"
						}
					},
					{
						"name": "其他因素状况：",
						"id": "m",
						"qz": "0.0851",
						"bz": {
							"a": "有利",
							"b": "较有利",
							"c": "无影响",
							"d": "有一定影响",
							"e": "影响较大"
						}
					}
				]

				var indetryStandard = [{
						"name": "宗地形状及可利用程度：",
						"id": "f",
						"qz": "0.1154",
						"bz": {
							"a": "矩形，面积适中，对土地利用有利",
							"b": "近似矩形，面积较适中，对土地利用较有利",
							"c": "较不规则，面积较小或较大，但对土地利用无影响",
							"d": "不规则，面积偏大或偏小，对土地利用有一定影响",
							"e": "很不规则，面积过大、过小对土地利用影响较大"
						}
					},
					{
						"name": "基础设施状况：",
						"id": "s",
						"qz": "0.0895",
						"bz": {
							"a": "水电气综合保证率达＞95%，排水 通畅，通讯状况好",
							"b": "水电气综合保证率达90%-95%，排水较通畅，通讯状况较好",
							"c": "水电气综合保证率达85%-90%，排水一般，通讯状况一般",
							"d": "水电气综合保证率达80%-95%，排水较差，通讯状况较差",
							"e": "水电气综合保证率达＜80%，排水差，通讯状况差"
						}
					},
					{
						"name": "交通便捷度：",
						"id": "k",
						"qz": "0.1447",
						"bz": {
							"a": "临交通型主干道，距离高速公路入口、港口码头、铁路站点距离近，交通便捷",
							"b": "临混合型主干道，距离高速公路入口、港口码头、铁路站点距离较近，交通较便捷",
							"c": "临生活型主干道或交通型次干道，距离髙速公路入口、港口码头、铁路站点有一定距离",
							"d": "临生活型次干道，距离高速公路入口、港口码头、铁路站点距离较远",
							"e": "临支路或巷道，距离高速公路入口，港口码头、铁路站点距离远"
						}
					},
					{
						"name": "区位条件：",
						"id": "t",
						"qz": "0.1971",
						"bz": {
							"a": "位置相对好，距公共服务设施近",
							"b": "位置相对较好，距公共服务设施 较近",
							"c": "位置相对一般，距公共服务设施距离一般",
							"d": "位置相对较差，距公共服务设施 较远",
							"e": "位置相对差，距公共服务设施远"
						}
					},
					{
						"name": "产业聚集程度：",
						"id": "y",
						"qz": "0.1785",
						"bz": {
							"a": "与区域产业联系紧密，配套协作性强，产业聚集度高",
							"b": "与区域产业联系较紧密，配套协 作性较强，产业聚集度较髙",
							"c": "与区域产业联系一般，产业聚集度一般",
							"d": "与区域产业无联系，配套协作程 度低",
							"e": "与区域产亚无联系，对主导产业发展有不利影响"
						}
					},
					{
						"name": "宗地自然条件：",
						"id": "g",
						"qz": "0.0856",
						"bz": {
							"a": "地形坡度小于1%，地质状况和 地基承载力好，适宜建设",
							"b": "地形坡度1-3%，地质状况和地基承载力较好，不需改造",
							"c": "地形坡度3-6%，地质状况和地基承载力一般，需略作改造",
							"d": "地形坡度6-10%，地质状况和地基承载力较差，需作一定改造",
							"e": "地形坡度大于10%，地质状况和地基承载力差，影响用地布局， 需改造"
						}
					},
					{
						"name": "其他因素状况：",
						"id": "m",
						"qz": "0.0756",
						"bz": {
							"a": "有利",
							"b": "较有利",
							"c": "无影响",
							"d": "有一定影响",
							"e": "影响较大"
						}
					}
				]

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