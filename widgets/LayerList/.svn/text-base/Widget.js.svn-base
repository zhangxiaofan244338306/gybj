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

define([
		'jimu/BaseWidget',
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/_base/array',
		'dojo/_base/html',
		'dojo/dom',
		'dojo/on',
		'dojo/query',
		'dijit/registry',
		'esri/InfoTemplate',
		'esri/layers/FeatureLayer',
		"esri/layers/GraphicsLayer",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/LOD",
		"esri/graphic",
		"esri/tasks/QueryTask",
		"esri/tasks/query",
		"esri/symbols/PictureMarkerSymbol",
		'./LayerListView',
		'./NlsStrings',
		'jimu/LayerInfos/LayerInfos'
	],
	function(BaseWidget, declare, lang, array, html, dom, on,
		query, registry, InfoTemplate, FeatureLayer, GraphicsLayer, ArcGISDynamicMapServiceLayer, LOD, Graphic,
		QueryTask, Query, PictureMarkerSymbol, LayerListView, NlsStrings, LayerInfos) {

		var clazz = declare([BaseWidget], {
			//these two properties is defined in the BaseWiget
			baseClass: 'jimu-widget-layerList',
			name: 'layerList',
			_denyLayerInfosReorderResponseOneTime: null,
			//layerListView: Object{}
			//  A module is responsible for show layers list
			layerListView: null,

			//operLayerInfos: Object{}
			//  operational layer infos
			operLayerInfos: null,

			startup: function() {
				//				var ck1 = document.getElementById("checkeBoxGYYD");
				var queryCondition
				var self = this;
				var fillDK = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
					new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2), new dojo.Color([255, 250, 250, 0.25]));
				var NFarr = [];
				var NFarrdistinct = [];

				var queryTaskCR = new QueryTask(self.appConfig.crdkLayer);
				var queryCR = new Query();
				queryCR.where = "1=1";
				queryCR.outFields = ["DKNF"];
				queryTaskCR.execute(queryCR, showQueryResultCR);

				function showQueryResultCR(queryResult) {
					if(queryResult.features.length >= 1) {
						for(var i = 0; i < queryResult.features.length; i++) {
							oDKNF = queryResult.features[i].attributes["DKNF"];
							NFarr.push(oDKNF);
						}
						NFarrdistinct = NFarr.distinct();
					}
				}

				function showLayer(queryCon) {
					var queryTaskCRNF = new QueryTask(self.appConfig.crdkLayer);
					var queryCRNF = new Query();
					queryCRNF.where = "1=1" + " And DKNF=" + queryCon;
					queryCRNF.outFields = ["*"];
					queryCRNF.returnGeometry = true;
					queryTaskCRNF.execute(queryCRNF, showQueryResultCRNF);
				}

				function showQueryResultCRNF(queryResult) {
					var allLayerPop = new esri.layers.GraphicsLayer();
					allLayerPop.id = queryCondition;
					for(var i = 0; i < queryResult.features.length; i++) {
						var fea = queryResult.features[i];
						var graphicd = new esri.Graphic();
						graphicd = fea;
						var transactionPrice = graphicd.attributes["CJJ"];
						var crAverage = graphicd.attributes["CRMJ"];
						var zbUnit = transactionPrice * 10000 / crAverage;
						
						var content = "<table class = 'Bombox-table' style='line-height:25px;font-size:14px;border-spacing: 0px;border: #ccc 1px solid;'>" +
							"<tr class='content_tr'><td  class='content_td_left' >地块年份:</td><td class='content_td_right'>${DKNF}年</td></tr>" +
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
							"<tr><td class='content_td_left'>地面单价:</td><td class='content_td_right'>" + zbUnit.toFixed(1) +"元</td></tr>" +
							"</table>";

						infoTemplate = new InfoTemplate("${DKBH}", content);
						graphicd.setInfoTemplate(infoTemplate);
						graphicd.setSymbol(fillDK);
						allLayerPop.add(graphicd);
					}
					self.map.addLayer(allLayerPop);
				}
				//去重、去空、排序
				Array.prototype.distinct = function() {
					var arr = this,
						len = arr.length;
					arr.sort(function(a, b) {
						return a - b;
					})

					function loop(index) {
						if(index >= 1) {
							if(arr[index] === arr[index - 1]) {
								arr.splice(index, 1);
							}
							loop(index - 1);
						}
					}
					loop(len - 1);
					for(var i = 0; i < arr.length; i++) {
						if(arr[i] == '' || arr[i] == null || typeof(arr[i]) == undefined) {
							arr.splice(i, 1);
							i = i - 1;
						}
					}
					return arr;
				};

				Mathedd = function(value) {
					if(value) {
						var resulted = Math.ceil(value);
						return resulted;
					}
				}
				Mathedd1 = function(value) {
					if(value) {
						var resulted = value.toFixed(1);
						return resulted;
					}
				}
				//商业地价
				var content = "<table class='Bombox-table' style='line-height:25px;font-size:14px;border-spacing: 0px;border: #ccc 1px solid;text-align:right;'>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>地价区段名称:</td><td style = ' padding-left: 7px;'>${DJQDMC}</td></tr>" +
					"<tr ><td  style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>土地级别:</td><td style = ' padding-left: 7px;'>${TDJB}级</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td  style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>基准地价:</td><td style = ' padding-left: 7px;'>${JZDJ}元</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>设定容积率:</td><td style = ' padding-left: 7px;'>${SDRJL}</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>现状容积率:</td><td style = ' padding-left: 7px;'>${XZRJL}</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>地面基准地价:</td><td style = ' padding-left: 7px;'>${DMJZDJ}元</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>楼面基准地价:</td><td style = ' padding-left: 7px;'>${LMJZDJ}元</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>地价区段面积:</td><td style = ' padding-left: 7px;'>${DJQDMJ:Mathedd}平方米</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>基础设施状况:</td><td style = ' padding-left: 7px;'>${QDJCSSZK}</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>公共设施状况:</td><td style = ' padding-left: 7px;'>${QDGGSSZK}</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>区段最低价:</td><td style = ' padding-left: 7px;'>${QDZDJ}元</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>区段最高价:</td><td style = ' padding-left: 7px;'>${QDZGJ}元</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>平均地价:</td><td style = ' padding-left: 7px;'>${JCDPJDJ}元</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>平均楼面地价:</td><td style = ' padding-left: 7px;'>${JCDPJLMDJ}元</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>商服路线起点:</td><td style = ' padding-left: 7px;'>${QD}</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>商服路线止点:</td><td style = ' padding-left: 7px;'>${ZD}</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>区片类型:</td><td style = ' padding-left: 7px;'>${QPLX}</td></tr>" +
					"<tr><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>主要商服类型:</td><td style = ' padding-left: 7px;'>${ZYSFLX}</td></tr>" +
					"<tr style=' background: #f3f1f1;'><td style = ' border-right: 1px solid #ccc;  padding-left: 7px;'>建筑物状况:</td><td style = ' padding-left: 7px;'>${JCNFJJZWZK}</td></tr>" +
					"</table>";

				var infoTemplate = new InfoTemplate("${DJQDBH}", content);
				var syfeature = new FeatureLayer(this.appConfig.featureLayer, {
					mode: FeatureLayer.MODE_SNAPSHOT,
					opacity: 0.9,
					outFields: ["*"],
					infoTemplate: infoTemplate,
					id: "baseFeaLayer"
				});

				//住宅地价
				var zzcontent = "<table class='Bombox-table' style='line-height:25px;font-size:14px;border-spacing: 0px;border: #ccc 1px solid;text-align:right;'>" +
					"<tr class='content_tr'><td class='content_td_left'>地价区段名称:</td><td class='content_td_right'>${DJQDMC}</td></tr>" +
					"<tr><td class='content_td_left'>土地级别:</td><td class='content_td_right'>${TDJB}级</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>基准地价:</td><td class='content_td_right'>${JZDJ}元</td></tr>" +
					"<tr><td class='content_td_left'>设定容积率:</td><td class='content_td_right'>${SDRJL}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>现状容积率:</td><td class='content_td_right'>${XZRJL}</td></tr>" +
					"<tr><td class='content_td_left'>地面基准地价:</td><td class='content_td_right'>${DMJZDJ}元</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>楼面基准地价:</td><td class='content_td_right'>${LMJZDJ}元</td></tr>" +
					"<tr><td class='content_td_left'>地价区段面积:</td><td class='content_td_right'>${DJQDMJ:Mathedd}平方米</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>基础设施状况:</td><td class='content_td_right'>${QDJCSSZK}</td></tr>" +
					"<tr><td class='content_td_left'>公共设施状况:</td><td class='content_td_right'>${QDGGSSZK}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>区段最低价:</td><td class='content_td_right'>${QDZDJ}元</td></tr>" +
					"<tr><td class='content_td_left'>区段最高价:</td><td class='content_td_right'>${QDZGJ}元</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>平均地价:</td><td class='content_td_right'>${JCDPJDJ}元</td></tr>" +
					"<tr><td class='content_td_left'>平均楼面地价:</td><td class='content_td_right'>${JCDPJLMDJ}元</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>区片类型:</td><td class='content_td_right'>${QPLX}</td></tr>" +
					"<tr><td class='content_td_left'>建筑物状况:</td><td class='content_td_right'>${JCNFJJZWZK}</td></tr>" +
					"</table>";

				var zzinfoTemplate = new InfoTemplate("${DJQDBH}", zzcontent);
				var zzfeature = new FeatureLayer(this.appConfig.zzfeatureLayer, {
					mode: FeatureLayer.MODE_SNAPSHOT,
					opacity: 0.9,
					outFields: ["*"],
					infoTemplate: zzinfoTemplate,
					id: "baseFeaLayerZZ"

				});

				//工业地价
				var gycontent = "<table class='Bombox-table' style='line-height:25px;font-size:14px;border-spacing: 0px;border: #ccc 1px solid;text-align:right;'>" +
					"<tr class='content_tr'><td class='content_td_left'>地价区段名称:</td><td class='content_td_right'>${DJQDMC}</td></tr>" +
					"<tr><td class='content_td_left'>土地级别:</td><td class='content_td_right'>${TDJB}级</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>基准地价:</td><td class='content_td_right'>${JZDJ}元</td></tr>" +
					"<tr><td class='content_td_left'>设定容积率:</td><td class='content_td_right'>${SDRJL}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>现状容积率:</td><td class='content_td_right'>${XZRJL}</td></tr>" +
					"<tr><td class='content_td_left'>地面基准地价:</td><td class='content_td_right'>${DMJZDJ}元</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>楼面基准地价:</td><td class='content_td_right'>${LMJZDJ}元</td></tr>" +
					"<tr><td class='content_td_left'>地价区段面积:</td><td class='content_td_right'>${DJQDMJ:Mathedd}平方米</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>基础设施状况:</td><td class='content_td_right'>${QDJCSSZK}</td></tr>" +
					"<tr><td class='content_td_left'>公共设施状况:</td><td class='content_td_right'>${QDGGSSZK}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>区段最低价:</td><td class='content_td_right'>${QDZDJ}</td></tr>" +
					"<tr><td class='content_td_left'>区段最高价:</td><td class='content_td_right'>${QDZGJ}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>平均地价:</td><td class='content_td_right'>${JCDPJDJ}</td></tr>" +
					"<tr><td class='content_td_left'>平均楼面地价:</td><td class='content_td_right'>${JCDPJLMDJ}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>东至:</td><td class='content_td_right'>${DZ}</td></tr>" +
					"<tr><td class='content_td_left'>西至:</td><td class='content_td_right'>${XZ}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>南至:</td><td class='content_td_right'>${NZ}</td></tr>" +
					"<tr><td class='content_td_left'>北至:</td><td class='content_td_right'>${BZ}</td></tr>" +
					"<tr class='content_tr'><td class='content_td_left'>区片类型:</td><td class='content_td_right'>${QPLX}</td></tr>" +
					"<tr><td class='content_td_left'>建筑物状况:</td><td class='content_td_right'>${JCNFJJZWZK}</td></tr>" +
					"</table>";

				var gyinfoTemplate = new InfoTemplate("${DJQDBH}", gycontent);
				var gyfeature = new FeatureLayer(this.appConfig.gyfeatureLayer, {
					mode: FeatureLayer.MODE_SNAPSHOT,
					opacity: 0.9,
					outFields: ["*"],
					infoTemplate: gyinfoTemplate,
					id: "baseFeaLayerGY"

				});

				formatDate = function crtTimeFtt(val) {
					if(val != null) {
						var date = new Date(val).toLocaleDateString();
						return date;
					}
				}

				//出让地块
				var crcontent = "<table class='Bombox-table' style='line-height:25px;font-size:14px;border-spacing: 0px;border: #ccc 1px solid;text-align:right;'>" +
					"<tr class='content_tr'><td  class='content_td_left' style='width: 30%';>地块年份:</td><td class='content_td_right'>${DKNF}年</td></tr>" +
					"<tr><td  class='content_td_left'>地块编号:</td><td class='content_td_right'>${DKBH}</td></tr>" +
					"<tr class='content_tr'><td  class='content_td_left'>地块位置:</td><td class='content_td_right'>${DKWZ}</td></tr>" +
					"<tr><td  class='content_td_left'>起始价:</td><td class='content_td_right'>${QSJ}万元</td></tr>" +
					"<tr class='content_tr'><td  class='content_td_left'>成交价:</td><td class='content_td_right'>${CJJ}万元</td></tr>" +
					"<tr><td  class='content_td_left'>竞得人:</td><td class='content_td_right'>${JDR}</td></tr>" +
					"<tr class='content_tr'><td  class='content_td_left'>地块用途:</td><td class='content_td_right'>${YT}</td></tr>" +
					"<tr><td  class='content_td_left'>容积率 :</td><td class='content_td_right'>${RJL}</td></tr>" +
					"<tr class='content_tr'><td  class='content_td_left'>建筑密度:</td><td class='content_td_right'>${JZMD}</td></tr>" +
					"<tr><td  class='content_td_left'>绿地率:</td><td class='content_td_right'>${LDL}</td></tr>" +
					"<tr class='content_tr'><td  class='content_td_left'>出让面积 :</td><td class='content_td_right'>${CRMJ:Mathedd}平方米</td></tr>" +
					"<tr><td  class='content_td_left'>成交日期:</td><td class='content_td_right'>${CJRQ:formatDate}</td></tr>" +
					"<tr class='content_tr'><td  class='content_td_left'>合同签订日期:</td><td class='content_td_right'>${HTQDRQ:formatDate}</td></tr>" +
					"</table>";

				var crinfoTemplate = new InfoTemplate("${DKBH}", crcontent);
				var crfeature = new FeatureLayer(this.appConfig.crdkfeatureLayer, {
					mode: FeatureLayer.MODE_ONDEMAND,
					opacity: 0.9,
					outFields: ["DKBH", "DKWZ", "QSJ", "CJJ", "JDR", "YT", "RJL", "JZMD", "LDL", "CRMJ",
						"CJRQ", "HTQDRQ", "DKNF"
					],
					infoTemplate: crinfoTemplate,
					id: "baseFeaLayerCR"

				});
				crfeature.setDefinitionExpression("DKNF = '2017'");

				var crfeature_2016 = new FeatureLayer(this.appConfig.crdkfeatureLayer, {
					mode: FeatureLayer.MODE_ONDEMAND,
					opacity: 0.9,
					outFields: ["DKBH", "DKWZ", "QSJ", "CJJ", "JDR", "YT", "RJL", "JZMD", "LDL", "CRMJ",
						"CJRQ", "HTQDRQ", "DKNF"
					],
					infoTemplate: crinfoTemplate,
					id: "baseFeaLayerCR2016"

				});
				crfeature_2016.setDefinitionExpression("DKNF = '2016'")

				//根据节约等级的不同，动态显示不同的节约等级图片
				//				compare = function(value, key) {
				//					var result = "";
				//
				//					switch(key) {
				//						case "JYDJ":
				//							if(result = value == "A级" || value == null) {
				//								result = "<img src='widgets/LayerList/images/GradeA.png'/>";
				//							} else if(result = value == "B级") {
				//								result = "<img src='widgets/LayerList/images/GradeB.png'/>";
				//							} else if(result = value == "C级") {
				//								result = "<img src='widgets/LayerList/images/GradeC.png'/>";
				//							} else if(result = value == "D级") {
				//								result = "<img src='widgets/LayerList/images/GradeD.png'/>";
				//							}
				//							break;
				//						case "DKMJ":
				//							result = value.toFixed(1);
				//							break;
				//						case "CLSJ":
				//							result = new Date(value).toLocaleDateString();
				//							break;
				//						case "KGSJ":
				//							result = new Date(value).toLocaleDateString();
				//							break;
				//						case "JGSJ":
				//							result = new Date(value).toLocaleDateString();
				//							break;
				//					}
				//					if(result == "1970/1/1")
				//						result = "";
				//					return(result);
				//				};
				var sjttLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.appConfig.sqjttLayer);

				//出让地块图层2017
				var yddw = document.getElementById("checkeBoxYDDW");

				on(dom.byId("checkeBoxYDDW"), "click", function() {
					if(yddw.checked) {
						document.getElementById("Allcheckbox").style.display = "block";
						document.getElementById("Allcheckbox").innerHTML = "";
						for(var i = 0; i < NFarrdistinct.length; i++) {
							var htmlDIVNF = document.createElement('div');
							var htmlNF = '<div style="display: inline;"></div>' +
								'<div style="width: 50%;display: inline;position: relative;left: 12.5%;">' + NFarrdistinct[i] + '年出让地块</div>' +
								'<div style="display: inline;position: relative;left: 33%;"><label class="checkbox1"><input  class="cliceEven" queryCondition = ' + NFarrdistinct[i] + ' type="checkbox" ><i></i></label></div>'
							htmlDIVNF.innerHTML = htmlNF;
							document.getElementById("Allcheckbox").appendChild(htmlDIVNF);
						}
						var cliceEven = document.getElementsByClassName("cliceEven");

						for(var i = 0; i < cliceEven.length; i++) {
							cliceEven[i].onclick = function(e) {

								queryCondition = e.target.getAttribute("queryCondition");
								if(e.target.checked == true) {
									showLayer(queryCondition);
								} else {
									var delectlayerSY = self.map.getLayer(queryCondition);
									self.map.removeLayer(delectlayerSY);
								}
							}
						}
					} else {
						document.getElementById("Allcheckbox").innerHTML = "";
						document.getElementById("Allcheckbox").style.display = "none";
						//TODO
					}
				});

				//控制道路图层
				var dl = document.getElementById("checkeBoxDL");
				var dlLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.appConfig.roadLayer);
				if(dl.checked)
					self.map.addLayer(dlLayer);
				on(dom.byId("checkeBoxDL"), "click", function() {
					if(dl.checked)
						self.map.addLayer(dlLayer);
					else
						self.map.removeLayer(dlLayer);
				});
				//控制行政界线图层
				var xzjx = document.getElementById("checkeBoxXZJX");
				var xzjxLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.appConfig.xzjxLayer);
				if(xzjx.checked)
					self.map.addLayer(xzjxLayer);
				on(dom.byId("checkeBoxXZJX"), "click", function() {
					if(xzjx.checked)
						self.map.addLayer(xzjxLayer);
					else
						self.map.removeLayer(xzjxLayer);
				});

				var colorSelect = document.getElementById("colorSelect");
				//商业基准地价图层
				var sfdj = document.getElementById("checkeBoxSFDJ");
				if(sfdj.checked) {
					colorSelect.style.display = "block";
					self.map.addLayer(syfeature);
				};
				on(dom.byId("checkeBoxSFDJ"), "click", function() {
					if(sfdj.checked) {

						self.map.addLayer(syfeature);
					} else {
						self.map.removeLayer(syfeature);
						self.map.infoWindow.hide();
					}
					if(sfdj.checked || zzdj.checked || gydj.checked || yddw.checked) {
						colorSelect.style.display = "block";
					} else {
						colorSelect.style.display = "none";
					}
				});

				//居住基准地价
				var zzdj = document.getElementById("checkeBoxZZDJ");
				if(zzdj.checked) {
					colorSelect.style.display = "block";
					self.map.addLayer(zzfeature);
				}
				on(dom.byId("checkeBoxZZDJ"), "click", function() {
					if(zzdj.checked) {
						self.map.addLayer(zzfeature);
					} else {
						self.map.removeLayer(zzfeature);
						self.map.infoWindow.hide();
					}
					if(sfdj.checked || zzdj.checked || gydj.checked || yddw.checked) {
						colorSelect.style.display = "block";
					} else {
						colorSelect.style.display = "none";
					}
				});

				//工业基准地价
				var gydj = document.getElementById("checkeBoxGYDJ");
				if(gydj.checked) {
					colorSelect.style.display = "block";
					self.map.addLayer(gyfeature);
				}
				on(dom.byId("checkeBoxGYDJ"), "click", function() {
					if(gydj.checked) {
						self.map.addLayer(gyfeature);
					} else {
						self.map.removeLayer(gyfeature);
						self.map.infoWindow.hide();
					}
					if(sfdj.checked || zzdj.checked || gydj.checked || yddw.checked) {
						colorSelect.style.display = "block";
					} else {
						colorSelect.style.display = "none";
					}
				});

			},

			destroy: function() {
				this._clearLayers();
				this.inherited(arguments);
			}

		});
		return clazz;
	});