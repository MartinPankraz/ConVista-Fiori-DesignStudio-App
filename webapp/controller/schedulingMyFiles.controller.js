sap.ui.define([
	"convista/com/arp/demo/controller/BaseController",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"convista/com/arp/demo/lib/FileSaver.min"
], function(Controller, ODataModel, Filter, Sorter, FileSaver) {
	"use strict";

	return Controller.extend("convista.com.arp.demo.controller.schedulingMyFiles", {

		_oDialog: null,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf convista.com.arp.demo.view.schedulingOverview
		 */
		onInit: function() {
			//jQuery.sap.require("FileSaver");
			var that = this;

			var oModel = new sap.ui.model.json.JSONModel();
			/* eslint-disable */
			this.sServiceUrl = "https://sapwebdcbw.sap.convista.local:8443/sap/bc/cs67_ds_com?";
			/* eslint-enable */
			$.ajax({
				url: this.sServiceUrl+"_method=list_all&exportType=",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					oModel.setData(json);
					that.getView().setModel(oModel);
					//sap.ui.getCore().setModel(oModel);
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
				this._oDialog = sap.ui.xmlfragment("convista.com.arp.demo.view.myFilesTableFilter", this);
				this.getView().addDependent(this._oDialog);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleRefreshButtonPressed: function(oEvent) {
			var that = this;
			$.ajax({
				url: this.sServiceUrl+"_method=list_all&exportType=",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					var oModel = that.getView().byId("idSchedulingMyFiles").getModel();
					oModel.setData(json);
				}
			});
		},

		handleTableFilterConfirm: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("idSchedulingMyFiles");

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
		
		onRowSelect: function(oEvent){
			var that = this;
			var oSelectedListItem = oEvent.getParameter("listItem");            //Get Hold of List Item selected.
			var oBindingContext = oSelectedListItem.getBindingContext();     //Get Hold Binding Context of Selected List Item.
			var oPath = oBindingContext.getPath();              //Get Hold of Binding Context Path
			var oModel = this.getView().getModel().getProperty(oPath);          //Get the binding model.
			var fileName = oModel.filename;
			//nee xhr for filesaver blob. Not able to figure out how to use ajax likewise yet
			var xhr = new XMLHttpRequest();
			xhr.open('GET', this.sServiceUrl+"_method=single&_file="+fileName, true);
			xhr.responseType = 'blob';
			xhr.onreadystatechange = function(e) {
				if (this.readyState === 4){
				  if (this.status === 200) {
				  	var blob = new Blob([this.response]/*, {type: that.mimetype()'application/pdf'}*/);
			    	/* eslint-disable */
			    	saveAs(blob, fileName);	
			    	/* eslint-enable */
				  }else{
					sap.m.MessageToast.show("File could not be downloaded!");
				  }
				  that.getView().byId("idSchedulingMyFiles").setBusy(false);
				}
			};
			this.getView().byId("idSchedulingMyFiles").setBusy(true);
			xhr.send();
			
			/*$.ajax({
				url: this.sServiceUrl+"_method=single&_file="+fileName,
				contentType: "application/pdf",
				cache: false,
				dataType: 'blob',
				success: function(response){
					var blob = new Blob([response]/*, {type: that.mimetype()'application/pdf'}*);
			    	/* eslint-disable 
			    	saveAs(blob, fileName);	
			    	/* eslint-enable 
				},
				error: function(json) {
					sap.m.MessageToast.show("File could not be downloaded!");
				}
			});*/
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