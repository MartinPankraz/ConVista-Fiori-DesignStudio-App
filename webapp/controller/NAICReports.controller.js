sap.ui.define([
	"convista/com/arp/demo/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
    "convista/com/arp/demo/view/utils/BExHelperFunctions",
    "convista/com/arp/demo/lib/FileSaver.min",
    "sap/ui/model/json/JSONModel",
    "convista/com/arp/demo/view/utils/MyFormatter"
], function(Controller,Filter,Sorter,BExHelper,FileSaver,JSONModel,MyFormatter) {
	"use strict";

	return Controller.extend("convista.com.arp.demo.controller.NAICReports", {
		
		_oDialog: null,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf convista.com.arp.demo.view.schedulingHistory
		 */
		onInit: function() {
			// var oModel = new sap.ui.model.json.JSONModel();
			// this.getView().byId("idNAICTable").setModel(oModel);
			// /* eslint-disable */
			// this.sServiceUrl = "https://sapwebdcbw.sap.convista.local:8443/sap/bc/cs67_ds_com?";
			// /* eslint-enable */
			// $.ajax({
			// 	url: this.sServiceUrl+"_method=list_all&exportType=FS-SR",
			// 	dataType: "jsonp",
			// 	jsonp: "callback",
			// 	cache: false,
			// 	success: function(json) {
			// 		oModel.setData(json);
			// 	}
			// });
			this._iReportCounter = 6;
			// var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			// var oModel = new JSONModel([sRootPath,'model/NAICReportsModel.json'].join("/"));
			// this.getView().setModel(oModel);
			this._oModel = this.getView().getModel("naicReports");
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf convista.com.arp.demo.view.schedulingHistory
		 */
		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		
		runNAICReport: function(oEvent){
			var sReportCounter = this._iReportCounter < 10 ? "0" + this._iReportCounter.toString() : this._iReportCounter.toString();
			// var oTable = this.byId("idNAICTable");
			var sKeyDate = MyFormatter.formatDate(this.byId("datePicker1").getDateValue()); 
			// var oColumnListItem = new sap.m.ColumnListItem({
			// 	cells:[
			// 		new sap.m.ObjectIdentifier({title: "TEST-2309842098324-LT1-000" + sReportCounter}),
			// 		new sap.m.Text({text: sKeyDate}),
			// 		new sap.m.Text({text: MyFormatter.getDateStamp()}),
			// 		new sap.m.Text({text: "PDF"}),
			// 		new sap.m.Text({text: "LT1"})
			// 		]
			// });
			// oTable.addItem(oColumnListItem);
			sap.m.MessageToast.show("Report added successfully");
			this._iReportCounter++;
			
			var oReport = {
				"filename":"TEST-2309842098324-LT1-000" + sReportCounter,
		        "keydate":sKeyDate,
		        "createdate":MyFormatter.getDateStamp(),
		        "schedobj" : "LT1"
			};
			
			this.getView().getModel("naicReports").getProperty("/entries").push(oReport);
			this.getView().getModel("naicReports").refresh(true);

			

			// var naicCompany = this.getView().byId("naicCompany").getSelectedKey();
			// var keyDate = this.getView().byId("datePicker1").getValue();
			// var listType = this.getView().byId("schedule").getSelectedKey();

			// $.ajax({
			// 	url: this.sServiceUrl + "_method=fs_sr" + 
			// 							"&_cc=" + naicCompany +
			// 							"&_date=" + keyDate + 
			// 							"&_lt=" + listType + 
			// 							"&_filetype=pdf",
			// 	dataType: "jsonp",
			// 	jsonp: "callback",
			// 	cache: false,
			// 	success: function(json) {
			// 		sap.m.MessageToast.show(json.msg+" New filename:"+json.filename, {
			// 		    duration: 3000,                  // default
			// 		    width: "15em",                   // default
			// 		    my: "center bottom",             // default
			// 		    at: "center bottom",             // default
			// 		    of: window,                      // default
			// 		    offset: "0 0",                   // default
			// 		    collision: "fit fit",            // default
			// 		    onClose: null,                   // default
			// 		    autoClose: true,                 // default
			// 		    animationTimingFunction: "ease", // default
			// 		    animationDuration: 1000,         // default
			// 		    closeOnBrowserNavigation: true   // default
			// 		});
			// 	}
			// });
		},
		
		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("convista.com.arp.demo.view.TableFilter", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		
		handleRefreshButtonPressed: function (oEvent) {
			var that = this;
			$.ajax({
				url: this.sServiceUrl+"_method=list_all&exportType=FS-SR",
				dataType: "jsonp",
				jsonp: "callback",
				cache: false,
				success: function(json) {
					var oModel = that.getView().byId("idNAICTable").getModel();
					oModel.setData(json);
				}
			});
		},
 
		handleTableFilterConfirm: function(oEvent) {
 
			var oView = this.getView();
			var oTable = oView.byId("idNAICTable");
 
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
		
		onSortObjectName: function(){
			this._objSorter.bDescending = !this._objSorter.bDescending;
			this.byId("idNAICTable").getBinding("items").sort(this._objSorter);
		},
		
		// Method for downloading files
		onRowSelect: function(oEvent){
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			var pdfExampleRoute = [sRootPath,'localFiles/pdfExampleNAIC.txt'].join("/");
			
			$.ajax({
				url: pdfExampleRoute,
				dataType: "text",
				success: function(data) {
					window.open("data:application/pdf;base64," + data);
				},
				error: function(error){
					console.log(error);
				}
			});
			// var that = this;
			// //Get Hold of List Item selected.
			// //Get Hold Binding Context of Selected List Item.
			// //get the property "filename"
			// var fileName = oEvent.getParameter("listItem").getBindingContext().getProperty("filename");        
			// //nee xhr for filesaver blob. Not able to figure out how to use ajax likewise yet
			// var xhr = new XMLHttpRequest();
			// xhr.open('GET', this.sServiceUrl+"_method=single&_file="+fileName, true);
			// xhr.responseType = 'blob';
			// xhr.onreadystatechange = function(e) {
			// 	if (this.readyState === 4){
			// 	  if (this.status === 200) {
			// 	  	var blob = new Blob([this.response]/*, {type: that.mimetype()'application/pdf'}*/);
			//     	/* eslint-disable */
			//     	saveAs(blob, fileName);	
			//     	/* eslint-enable */
			// 	  }else{
			// 		sap.m.MessageToast.show("File could not be downloaded!");
			// 	  }
			// 	  that.getView().byId("idNAICTable").setBusy(false);
			// 	}
			// };
			// this.getView().byId("idNAICTable").setBusy(true);
			// xhr.send();
			
		}

	});

});