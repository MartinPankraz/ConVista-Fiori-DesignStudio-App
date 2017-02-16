sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter"
], function(Controller,ODataModel,Filter,Sorter) {
	"use strict";

	return Controller.extend("convista.com.arp.demo.controller.schedulingManageGroups", {
		
		_oDialog: null,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf convista.com.arp.demo.view.schedulingHistory
		 */
		onInit: function() {
			var that = this;
			
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel);
			/* eslint-disable */
			this.sServiceUrl = "https://sapwebdcbw.sap.convista.local:8443/sap/bc/cs67_ds_com?";
			/* eslint-enable */
			
			$.ajax({
				url: this.sServiceUrl + "_method=get_user_info&_datasrc=REP",
				dataType: "jsonp",
				jsonp: "callback",
				success: function(json) {
					oModel.setProperty("/reports",json.entries);
					
					$.ajax({
						url: that.sServiceUrl + "_method=get_user_info&_datasrc=GRP_REP",
						dataType: "jsonp",
						jsonp: "callback",
						success: function(jsonGrpRep) {
							oModel.setProperty("/grp_rep",jsonGrpRep.entries);
							var entries = that.filterGrpStructureForGroups(jsonGrpRep.entries);
							oModel.setProperty("/groups", entries);
							//make sure first value is always selected!
							var selectedGroupKey = jsonGrpRep.entries[0].groupKey;
							var queriesWithinGroupBox = that.getView().byId("reportsSelectedGroup");
							for(var i = 0; i < jsonGrpRep.entries.length; i++){
								var grpEntry = jsonGrpRep.entries[i];
								if(grpEntry.groupKey === selectedGroupKey){
									for(var j = 0; j < json.entries.length; j++){
										var entry = json.entries[j];	
										if(entry.query === grpEntry.query){
											queriesWithinGroupBox.addItem(new sap.ui.core.Item({key: entry.query, text: entry.descr}));
											break;
										}
									}	
								}
							}
						}
					});
				}
			});
			
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
		
		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("convista.com.arp.demo.view.TableFilter", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		
		handleRefreshButtonPressed: function (oEvent) {
			var oTable = this.getView().byId("idSchedulingHistoryTable");
			var oModel = oTable.getModel();
			oModel.refresh(true);
		},
 
		handleTableFilterConfirm: function(oEvent) {
 
			var oView = this.getView();
			var oTable = oView.byId("idSchedulingHistoryTable");
 
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
		//update done by overriding (always sending all values to simplify update logic on backend)
		handleButtonSavePressed: function(oEvent){
			var newGrpText = this.getView().byId("newGrpInput").getValue();
			var items = this.getView().byId("selectedReports").getItems();
			var data = this.getView().getModel().getProperty("/grp_rep");
			
			for(var i = 0; i < items.length; i++){
				var query = items[i].getKey();
				data.push({
					groupDesc:newGrpText,
					groupKey:newGrpText,
					query:query
				});	
			}
			
			$.ajax({
				url: this.sServiceUrl + "_method=update_user_groups",
				type: "POST",
				cache: false,
				processData: false,//avoid URL parsing of payload!
				data: JSON.stringify(data),
				dataType: "json",
				contentType: "application/json",
				success: function(json) {
					sap.m.MessageToast.show("Group saved succesfully");
				}
			});
			
			this.getView().byId("yourGroups").addItem(new sap.ui.core.Item({key: newGrpText, text: newGrpText}));
			//this.getView().byId("yourGroups").setSelectedItemId(newGrpText);
		},
		//update done by overriding (always sending all values to simplify update logic on backend)
		handleButtonDeletePressed: function(oEvent){
			var selectedGroupItem = this.getView().byId("yourGroups").getSelectedItem();
			var selectedGroupItemKey = selectedGroupItem.getKey();
			var grp_rep = this.getView().getModel().getProperty("/grp_rep");
			var data = [];
			
			for(var i = 0; i < grp_rep.length; i++){
				var groupKey = grp_rep[i].groupKey;
				if(groupKey !== selectedGroupItemKey ){
					data.push(grp_rep[i]);		
				}
			}
			
			$.ajax({
				url: this.sServiceUrl + "_method=update_user_groups",
				type: "POST",
				cache: false,
				processData: false,//avoid URL parsing of payload!
				data: JSON.stringify(data),
				dataType: "json",
				contentType: "application/json",
				success: function(json) {
					sap.m.MessageToast.show("Group deleted succesfully");
				}
			});
			
			this.getView().byId("yourGroups").removeItem(selectedGroupItem);
		},
		
		moveGroupReportsToSelectedGroup: function(oEvent){
			var item = this.getView().byId("reportsSelectedGroup").getSelectedItem();
			if(item){
				this.getView().byId("selectedReports").addItem(new sap.ui.core.Item({key: item.getKey(),text: item.getText()}));	
			}
		},
		
		moveExistingReportsToSelectedGroup: function(oEvent){
			var item = this.getView().byId("availableReports").getSelectedItem();
			if(item){
				this.getView().byId("selectedReports").addItem(new sap.ui.core.Item({key: item.getKey(),text: item.getText()}));	
			}
		},
		
		deleteFromList:  function(oEvent){
			var item = this.getView().byId("selectedReports").getSelectedItem();
			if(item){
				this.getView().byId("selectedReports").removeItem(item);	
			}
		},
		
		groupSelectChange: function(oEvent){
			var itemKey = oEvent.getParameter("selectedItem").getKey();
			var queryListForGroup = this.getView().byId("reportsSelectedGroup");
			queryListForGroup.removeAllItems();
			var jsonGrpRep = this.getView().getModel().getProperty("/grp_rep");
			var reports = this.getView().getModel().getProperty("/reports");
			
			for(var i = 0; i < jsonGrpRep.length; i++){
				var grpEntry = jsonGrpRep[i];
				if(grpEntry.groupKey === itemKey){
					for(var j = 0; j < reports.length; j++){
						var entry = reports[j];	
						if(entry.query === grpEntry.query){
							queryListForGroup.addItem(new sap.ui.core.Item({key: entry.query, text: entry.descr}));
							break;
						}
					}	
				}
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