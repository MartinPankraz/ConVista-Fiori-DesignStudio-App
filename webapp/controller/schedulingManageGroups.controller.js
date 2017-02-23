sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/thirdparty/jqueryui/jquery-ui-effect",
    "sap/ui/thirdparty/jqueryui/jquery-ui-core",
    "sap/ui/thirdparty/jqueryui/jquery-ui-widget",
    "sap/ui/thirdparty/jqueryui/jquery-ui-mouse",
    "sap/ui/thirdparty/jqueryui/jquery-ui-sortable",
    "sap/ui/thirdparty/jqueryui/jquery-ui-draggable",
    "sap/ui/thirdparty/jqueryui/jquery-ui-droppable"
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
							if(typeof jsonGrpRep.entries[0] !== "undefined"){
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
							
						}
					});
				}
			});
			this.makeAvailableReportsListDragAndDrop();
			this.makeSelectedReportsListDragAndDrop();
			this.makeSelectedGroupsListDragAndDrop();
		},
		
		makeSelectedGroupsListDragAndDrop: function () {
			var that = this;
			var selGrpList = this.getView().byId("reportsSelectedGroup");
			var selGrpListId = "#" + selGrpList.getId() + " li";
			var selGrpContainer = this.getView().byId("reportsSelectedGroupContainer");
			var selGrpContainerId = "#" + selGrpContainer.getId();
			var selRepList = this.getView().byId("selectedReports");
			var selRepListId = "#" + selRepList.getId() + " li";
			
			selGrpList.addEventDelegate({
				onAfterRendering: function (){
					//jQuery(avRepListId).addClass("ui-draggable");
					jQuery(selGrpListId).draggable({
						appendTo: "body",
						scroll: false,
						zIndex: 100,
						revert: "invalid",
						helper:"clone",
						start: function(e, ui)
						 {
						  $(ui.helper).addClass("ui-draggable-helper");
						 }
					}).disableSelection();
				}
			});
			
			selGrpContainer.addEventDelegate({
				onAfterRendering: function (){
					jQuery(selGrpContainerId).droppable({
						accept: selRepListId,
						drop: function( event, ui ) {
							var sender = that.getView().byId("selectedReports");
							var receiver = that.getView().byId("reportsSelectedGroup");
							that.removeItem(ui.draggable, receiver, sender);
						}
					}).disableSelection();
				}
			});
		},
		
		makeAvailableReportsListDragAndDrop: function(){
			var that = this;
			var avRepList = this.getView().byId("availableReports");
			var avRepListId = "#" + avRepList.getId() + " li";
			var avRepContainer = this.getView().byId("availableReportsContainer");
			var avRepContainerId = "#" + avRepContainer.getId();
			var selRepList = this.getView().byId("selectedReports");
			var selRepListId = "#" + selRepList.getId() + " li";
			
			
			avRepList.addEventDelegate({
				onAfterRendering: function (){
					//jQuery(avRepListId).addClass("ui-draggable");
					jQuery(avRepListId).draggable({
						appendTo: "body",
						scroll: false,
						zIndex: 100,
						revert: "invalid",
						helper:"clone",
						start: function(e, ui)
						 {
						  $(ui.helper).addClass("ui-draggable-helper");
						 }
					}).disableSelection();
				}
			});
			
			avRepContainer.addEventDelegate({
				onAfterRendering: function (){
					jQuery(avRepContainerId).droppable({
						accept: selRepListId,
						drop: function( event, ui ) {
							var sender = that.getView().byId("selectedReports");
							var receiver = that.getView().byId("availableReports");
							that.removeItem(ui.draggable, receiver, sender);
						}
					}).disableSelection();
				}
			});
			
		},
		
		makeSelectedReportsListDragAndDrop: function(){
			var that = this;
			var selRepList = this.getView().byId("selectedReports");
			var selRepListId = "#" + selRepList.getId() + " li";
			var selRepContainer = this.getView().byId("selectedReportsContainer");
			var selRepContainerId = "#" + selRepContainer.getId();
			var avRepList = this.getView().byId("availableReports");
			var selGrpList = this.getView().byId("reportsSelectedGroup");
			
			selRepList.addEventDelegate({
				onAfterRendering: function (){
					//jQuery(selRepListId).addClass("special");
					jQuery(selRepListId).draggable({
						appendTo: "body",
						scroll: false,
						zIndex: 100,
						revert: "invalid",
						helper:"clone",
						start: function(e, ui)
						 {
						  $(ui.helper).addClass("ui-draggable-helper");
						 }
					}).disableSelection();
				}
			});
			
			
			selRepList.addEventDelegate({
				onAfterRendering: function (){
					jQuery(selRepContainerId).droppable({
						accept: "#" + avRepList.getId() + " li, #" + selGrpList.getId() + " li" ,
						drop: function( event, ui ) {
							var receiver = that.getView().byId("selectedReports");
							that.addNewItem(ui.draggable, receiver);
						}
					}).disableSelection();
				}
			});
		},

		addNewItem: function(item, receiver){
			var listElementId = item.context.id;
			var draggedElement = sap.ui.getCore().byId(listElementId);
			receiver.addItem(new sap.ui.core.Item({key: draggedElement.getKey(),text: draggedElement.getText()}));
			sap.ui.getCore().byId(item.parent()[0].id).removeItem(draggedElement);
		},
		
		removeItem: function(item, receiver, sender){
			var listElementId = item.context.id;
			var draggedElement = sap.ui.getCore().byId(listElementId);
			receiver.addItem(new sap.ui.core.Item({key: draggedElement.getKey(),text: draggedElement.getText()}));
			sender.removeItem(draggedElement);
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
			this.getView().byId("newGrpInput").setValue("");
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
				this.getView().byId("reportsSelectedGroup").removeItem(item);
			}
		},
		
		moveExistingReportsToSelectedGroup: function(oEvent){
			var item = this.getView().byId("availableReports").getSelectedItem();
			if(item){
				this.getView().byId("selectedReports").addItem(new sap.ui.core.Item({key: item.getKey(),text: item.getText()}));
				this.getView().byId("availableReports").removeItem(item);
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