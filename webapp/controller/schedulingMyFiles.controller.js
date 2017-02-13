sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter"
], function(Controller, ODataModel, Filter, Sorter) {
	"use strict";

	return Controller.extend("convista.com.arp.demo.controller.schedulingMyFiles", {

		_oDialog: null,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf convista.com.arp.demo.view.schedulingOverview
		 */
		onInit: function() {
			var that = this;

			var oModelCompCode = new ODataModel("/sap/opu/odata/sap/ZARP_COMPCODE_SRV",{
				defaultBindingMode: "TwoWay",
				defaultCountMode: "Inline"
			});
			this.getView().setModel(oModelCompCode, "compCode");

			var oModel = new sap.ui.model.json.JSONModel();

			this.sServiceUrl = "https://sapwebdcbw.sap.convista.local:8443/sap/bc/cs67_ds_com?";
			$.ajax({
				url: this.sServiceUrl+"_method=get_user_info&_datasrc=sched_future",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					oModel.setData(json);
					that.getView().setModel(oModel);
					//sap.ui.getCore().setModel(oModel);
				}
			});
			
			var oReportModel = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: this.sServiceUrl+"_method=get_user_info&_datasrc=REP",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					oReportModel.setData(json);
					that.getView().setModel(oReportModel, "reportSelection");
				}
			});
			
			var oReportGroupModel = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: this.sServiceUrl+"_method=get_user_info&_datasrc=GRP_REP",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					json.entries = that.filterGrpStructureForGroups(json.entries);
					oReportGroupModel.setData(json);
					that.getView().setModel(oReportGroupModel, "reportGroupSelection");
				}
			});
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf convista.com.arp.demo.view.schedulingOverview
		 */
		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleViewSettingsDialogButtonPressed: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("convista.com.arp.demo.view.TableFilter", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleRefreshButtonPressed: function(oEvent) {
			$.ajax({
				url: this.sServiceUrl+"_method=get_user_info&_datasrc=sched_future",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					var oModel = this.getView().byId("idSchedulingTable").getModel();
					oModel.setData(json);
				}
			});
		},

		handleTableFilterConfirm: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("idSchedulingTable");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			/*			if (mParams.groupItem) {
							var sPath = mParams.groupItem.getKey();
							var bDescending = mParams.groupDescending;
							var vGroup = this.mGroupFunctions[sPath];
							aSorters.push(new Sorter(sPath, bDescending, vGroup));
						}*/
			var sPath = mParams.sortItem.getKey();
			var bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			/*var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var sValue2 = aSplit[3];
				var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);*/

			// update filter bar
			/*oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			oView.byId("vsdFilterLabel").setText(mParams.filterString);*/
		},

		formatStatusIcon: function(sStatus) {
			var result = "sap-icon://";
			switch (sStatus) {
				case 'P':
					return result + "status-positive"; //preliminary
				case 'S':
					return result + "calendar"; //scheduled
				case 'Y':
					return result + "status-in-process"; //ready
				case 'R':
					return result + "physical-activity"; //running
				case 'F':
					return result + "complete"; //finished
				case 'A':
					return result + "sys-cancel-2"; //aborted
				case 'Z':
					return result + "alert"; //suspended
				default:
					return result + "message-information"; //default
			}
		},
		

		filterGrpStructureForGroups: function(array){
			var seen = {};
		    var out = [];
		    var len = array.length;
		    var j = 0;
		    for(var i = 0; i < len; i++) {
		         var item = array[i].groupKey;
		         if(seen[item] !== 1) {
		               seen[item] = 1;
		               out[j++] = array[i];
		         }
		    }
		    return out;
		}

	});

});