sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
    "convista/com/arp/demo/view/utils/BExHelperFunctions",
    "convista/com/arp/demo/view/utils/MyFormatter"
], function(Controller, ODataModel, Filter, Sorter, BExHelper, MyFormatter) {
	"use strict";

	return Controller.extend("convista.com.arp.demo.controller.schedulingOverview", {

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
			/* eslint-disable */
			this.sServiceUrl = "https://sapwebdcbw.sap.convista.local:8443/sap/bc/cs67_ds_com?";
			/* eslint-enable */
			$.ajax({
				url: this.sServiceUrl + "_method=get_user_info&_datasrc=sched_future",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					oModel.setData(json);
					that.getView().setModel(oModel);
				}
			});
			
			var oReportModel = new sap.ui.model.json.JSONModel();
			this.getView().byId("reportSelection").setModel(oReportModel);
			$.ajax({
				url: this.sServiceUrl + "_method=get_user_info&_datasrc=REP",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					oReportModel.setData(json);
					that.getView().setModel(oReportModel, "reportSelection");
				}
			});
			
			var oReportGroupModel = new sap.ui.model.json.JSONModel();
			this.getView().byId("reportGroupSelection").setModel(oReportGroupModel);
			$.ajax({
				url: this.sServiceUrl + "_method=get_user_info&_datasrc=GRP_REP",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					json.entries = that.filterGrpStructureForGroups(json.entries);
					oReportGroupModel.setData(json);
					that.getView().byId("reportGroupSelection").addItem(new sap.ui.core.Item({key:"none",text:"None"}));
				}
			});
			
			this.getView().byId("firstStartDate").setDateValue(new Date());
			this.getView().byId("dateAsOf").setDateValue(new Date());
			var date = new Date(), y = date.getFullYear();//, m = date.getMonth();
			var firstDay = new Date(y, 0, 1);
			this.getView().byId("dateRangeFrom").setDateValue(firstDay);
			this.getView().byId("dateRangeTo").setDateValue(new Date());
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
			var that = this;
			$.ajax({
				url: this.sServiceUrl+"_method=get_user_info&_datasrc=sched_future",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					var oModel = that.getView().byId("idSchedulingTable").getModel();
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
		
		scheduleReports: function(oEvent){
			var that = this;
			var dateAsOf = MyFormatter.getSAPInternatlDate(this.getView().byId("dateAsOf").getDateValue());
			var fiscalYear = ("" + dateAsOf).substring(0,4);
			var dateType = "";
			if(this.getView().byId("dateType").getSelectedIndex() === 0){
				dateType = "periodic";
			}else{
				dateType = "daily";
			}
			var dateRange = MyFormatter.getSAPInternatlDate(this.getView().byId("dateRangeFrom").getDateValue()) +
							"." +
							MyFormatter.getSAPInternatlDate(this.getView().byId("dateRangeTo").getDateValue());
			var data = {"report_filters":[{
				    "filter_name": "_va",
				    "filter_value": this.getView().byId("valuationArea").getSelectedKey()
				},{
				    "filter_name": "_ld",
				    "filter_value": this.getView().byId("ledgerBasis").getSelectedKey()
				},{
				    "filter_name": "_cc",
				    "filter_value": BExHelper.getAllStringForEmptySelection(this.getView().byId("companyCode").getSelectedKeys())
				},{
				    "filter_name": "_sa",
				    "filter_value": BExHelper.getAllStringForEmptySelection(this.getView().byId("securityAccount").getSelectedKeys())
				},{
				    "filter_name": "_gla",
				    "filter_value": BExHelper.getAllStringForEmptySelection(this.getView().byId("glAccount").getSelectedKeys())
				},{
				    "filter_name": "_fy",
				    "filter_value": fiscalYear
				},{
				    "filter_name": "_date",
				    "filter_value": dateAsOf
				},{
				    "filter_name": "_date_range",
				    "filter_value": dateRange
				},{
				    "filter_name": "_date_type",
				    "filter_value": dateType
				},{
				    "filter_name": "_view",
				    "filter_value": this.getView().byId("viewType").getSelectedKey()
				}],"to_be_scheduled": this.getToBeScheduledReports()
			};

			$.ajax({
				url: this.sServiceUrl + "_method=schedule_job&" +
										"_sched_first_start_date=" + MyFormatter.getSAPInternatlDate(this.getView().byId("firstStartDate").getDateValue()) +
										"_sched_first_start_time=" + MyFormatter.getSAPInternatlTime(this.getView().byId("firstStartTime").getDateValue()) +
										"_rule=" + this.getView().byId("execRule").getSelectedKey() +
										"_immediate=" + this.getView().byId("immediate").getSelected() +
										"_skip_holiday=" + this.getView().byId("skipHoliday").getSelectedKey() +
										"zip=false" + this.getView().byId("zip").getSelected() +
										"_shift_asof=" + this.getView().byId("shiftAsOf").getSelected() +
										"_shift_from=" + this.getView().byId("shiftFrom").getSelected() +
										"_shift_to=" + this.getView().byId("shiftTo").getSelected(),
				type: "POST",
				cache: false,
				processData: false,//avoid URL parsing of payload!
				data: JSON.stringify(data),
				dataType: "json",
				contentType: "application/json",
				success: function(json) {
					var oModel = that.getView().byId("idSchedulingTable").getModel();
					oModel.setData(json);
				}
			});
		},
		
		getToBeScheduledReports: function(){
			var result = [];
			var reportSelection = this.getView().byId("reportSelection");
			if(reportSelection.getEnabled()){
				var items = reportSelection.getSelectedItems();
				for(var i = 0; i < items.length; i++){
					var report = items[i];
					result.push({
						type:"rep",
						key: MyFormatter.getTimeStamp(),
						name: report.getKey()
					});
				}
			}
			else{
				var reportGroupSelection = this.getView().byId("reportGroupSelection");
				var item = reportGroupSelection.getSelectedItem();
				result.push({
						type:"grp",
						key: MyFormatter.getTimeStamp(),
						name: item.getKey()
					});
			}
			return result;
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
		},
		
		groupSelectionChanged: function(oEvent){
			var item = oEvent.getParameter("selectedItem");
			var key = item.getKey();
			if(key === 'none'){
				this.getView().byId("reportSelection").setEnabled(true);
			}else{
				this.getView().byId("reportSelection").setEnabled(false);
				this.getView().byId("reportSelection").setSelectedKeys([]);
			}
		},
		
		immediateSelect: function(oEvent){
			var selected = oEvent.getParameter("selected");
			if(selected){
				this.getView().byId("firstStartDate").setEnabled(false);
				this.getView().byId("firstStartTime").setEnabled(false);  
				this.getView().byId("shiftAsOf").setSelected(false).setEnabled(false);
				this.getView().byId("shiftFrom").setSelected(false).setEnabled(false);
				this.getView().byId("shiftTo").setSelected(false).setEnabled(false);
			}else{
				this.getView().byId("firstStartDate").setEnabled(true);
				this.getView().byId("firstStartTime").setEnabled(true);
				this.getView().byId("shiftAsOf").setEnabled(true);
				this.getView().byId("shiftFrom").setEnabled(true);
				this.getView().byId("shiftTo").setEnabled(true);
			}
		}

	});

});