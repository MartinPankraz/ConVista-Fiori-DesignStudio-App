sap.ui.define([
	"convista/com/arp/demo/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/thirdparty/jqueryui/jquery-ui-effect",
    "sap/ui/thirdparty/jqueryui/jquery-ui-core",
    "sap/ui/thirdparty/jqueryui/jquery-ui-widget",
    "sap/ui/thirdparty/jqueryui/jquery-ui-mouse",
    "sap/ui/thirdparty/jqueryui/jquery-ui-sortable",
    "sap/ui/thirdparty/jqueryui/jquery-ui-draggable",
    "sap/ui/thirdparty/jqueryui/jquery-ui-droppable",
    "convista/com/arp/demo/lib/TouchPunch"
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
			this.makeDragAndDropAvailable();
			this.initTouchHandler();
		},
		// Touch handler for enabling scrolling on draggable lists
		touchHandler: function(event) {
		    var self = this;
		    var touches = event.changedTouches,
		        first = touches[0],
		        type = "";
		
		    switch (event.type) {
		    case "touchstart":
		        type = "mousedown";
		        window.startY = event.pageY;
		        break;
		    case "touchmove":
		        type = "mousemove";
		        break;
		    case "touchend":
		        type = "mouseup";
		        break;
		    default:
		        return;
		    }
		    var simulatedEvent = document.createEvent("MouseEvent");
		    simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/ , null);
		
		    first.target.dispatchEvent(simulatedEvent);
		
		    var scrollables = [];
		    var clickedInScrollArea = false;
		    // check if any of the parents has is-scollable class
		    var parentEls = jQuery(event.target).parents().map(function() {
		        try {
		            if (jQuery(this).hasClass('is-scrollable')) {
		                clickedInScrollArea = true;
		                // get vertical direction of touch event
		                var direction = (window.startY < first.clientY) ? 'down' : 'up';
		                // calculate stuff... :o)
		                if (((jQuery(this).scrollTop() <= 0) && (direction === 'down')) || ((jQuery(this).height() <= jQuery(this).scrollTop()) && (direction === 'up')) ){
		
		                } else {
		                    scrollables.push(this);
		                }
		            }
		        } catch (e) {}
		    });
		    // if not, prevent default to prevent bouncing
		    if ((scrollables.length === 0) && (type === 'mousemove')) {
		        event.preventDefault();
		    }
		
		},
		
		initTouchHandler: function() {
		    document.addEventListener("touchstart", this.touchHandler, true);
		    document.addEventListener("touchmove", this.touchHandler, true);
		    document.addEventListener("touchend", this.touchHandler, true);
		    document.addEventListener("touchcancel", this.touchHandler, true);
		
		},
		
		
		
		
		// Make the drag and drop function available
		makeDragAndDropAvailable:  function(){
			var that = this;
			var selRepList = this.getView().byId("selectedReports");
			var selRepListId = "#" + selRepList.getId() + " li";
			var avRepList = this.getView().byId("availableReports");
			var avRepListId = "#" + avRepList.getId() + " li";
			var selRepContainer = this.getView().byId("selectedReportsContainer");
			var selRepContainerId = "#" + selRepContainer.getId();
			var garbageContainer = this.getView().byId("garbageContainer");
			var garbageContainerId = "#" + garbageContainer.getId();
			
			
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
						//only accept not duplicated elements
						accept: function(draggable){
							var listItemDragged = $(draggable).html();
							var aAccepted = [];
							var accepted;
							
							//Check if list is empty, if so, add report
							if($(selRepListId).length === 0){
									accepted = true;
							}
							//If list is not empty, check if the report is already there
							// if so, add it to a temporary array and return false
							else{
								$(selRepListId).each(function(){
									if($(this).html() === listItemDragged){
										aAccepted.push($(this));
									}
								});
								if(aAccepted.length > 0){
										accepted = false;
									}else{
										accepted = true;
									}
								}
							return accepted;
							
						},
						drop: function( event, ui ) {
							that.addNewItem(ui.draggable);
						}
					}).disableSelection();
				}
			});
			
			garbageContainer.addEventDelegate({
				onAfterRendering: function (){
					jQuery(garbageContainerId).droppable({
						accept: selRepListId,
						drop: function( event, ui ) {
							that.removeItem(ui.draggable);
						}
					}).disableSelection();
				}
			});
		},
		// Add new item when dropped to the selected reports list 
		addNewItem: function(item){
			var listElementId = item.context.id;
			var draggedElement = sap.ui.getCore().byId(listElementId);
			var selectedIcon = this.getView().byId("selectedIcon");
			var selectedText = this.getView().byId("selectedText");
			var selectedReportsList = this.getView().byId("selectedReports");
			if(selectedReportsList.getItems().length === 0){
				selectedIcon.addStyleClass("invisible");
				selectedText.addStyleClass("invisible");
				selectedReportsList.addItem(new sap.ui.core.Item({key: draggedElement.getKey(),text: draggedElement.getText()}));
			}else{
				selectedReportsList.addItem(new sap.ui.core.Item({key: draggedElement.getKey(),text: draggedElement.getText()}));
			}
			
			//sap.ui.getCore().byId(item.parent()[0].id).removeItem(draggedElement);
		},
		// Remove item when dragged to the garbage
		removeItem: function(item){
			var listElementId = item.context.id;
			var draggedElement = sap.ui.getCore().byId(listElementId);
			var selectedIcon = this.getView().byId("selectedIcon");
			var selectedText = this.getView().byId("selectedText");
			var selectedReportsList = this.getView().byId("selectedReports");
			
			selectedReportsList.removeItem(draggedElement);
			if(selectedReportsList.getItems().length === 0){
				selectedIcon.removeStyleClass("invisible");
				selectedText.removeStyleClass("invisible");
			}
		},
		
		groupNameCheck: function(key) {
			var grpRep = this.getView().getModel().getProperty("/grp_rep");
			for(var i = 0; i < grpRep.length; i++){
					var groupKey = grpRep[i].groupKey;
					if(groupKey === key ){
						return true;
					}
				}
			return false;
		},
		
		//update done by overriding (always sending all values to simplify update logic on backend)
		handleButtonSavePressed: function(oEvent){
			var newGrpText = this.getView().byId("newGrpInput").getValue();
			if(newGrpText === ""){
				sap.m.MessageToast.show("Enter a group name");
			}else if(this.groupNameCheck(newGrpText)){
				sap.m.MessageToast.show("The group name you selected already exists");
			}else if(this.getView().byId("selectedReports").getItems().length === 0){
				sap.m.MessageToast.show("Add at least one report to the list");
			}else{
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
				this.groupSelectChange();
				this.getView().byId("selectedReports").removeAllItems();
				this.getView().byId("availableReports").unbindItems();
				var oTemplate = new sap.ui.core.Item({
				   key: "{query}",
				   text: "{descr}"
				  });
				this.getView().byId("availableReports").bindAggregation("items",{
					path:"/reports",
					template: oTemplate
				});
				var selectedIcon = this.getView().byId("selectedIcon");
				var selectedText = this.getView().byId("selectedText");
				selectedIcon.removeStyleClass("invisible");
				selectedText.removeStyleClass("invisible");
				
			}
			
		},
		//update done by overriding (always sending all values to simplify update logic on backend)
		handleButtonDeletePressed: function(oEvent){
			var selectedGroupItem = this.getView().byId("yourGroups").getSelectedItem();
			if(selectedGroupItem === null){
				sap.m.MessageToast.show("Select or create a group first");
			}else{
				var selectedGroupItemKey = selectedGroupItem.getKey();
				var grp_rep = this.getView().getModel().getProperty("/grp_rep");
				var newGrp_rep = [];
				
				for(var i = 0; i < grp_rep.length; i++){
					var groupKey = grp_rep[i].groupKey;
					if(groupKey !== selectedGroupItemKey ){
						newGrp_rep.push(grp_rep[i]);
						//grp_rep.splice(i,1);
					}
				}
				
				$.ajax({
					url: this.sServiceUrl + "_method=update_user_groups",
					type: "POST",
					cache: false,
					processData: false,//avoid URL parsing of payload!
					data: JSON.stringify(newGrp_rep),
					dataType: "json",
					contentType: "application/json",
					success: function(json) {
						sap.m.MessageToast.show("Group deleted succesfully");
					}
				});
				
				this.getView().byId("yourGroups").removeItem(selectedGroupItem);
				this.groupSelectChange();
			}
			
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
		
		groupSelectChange: function(){
			var yourGroups = this.getView().byId("yourGroups").getItems();
			var item = this.getView().byId("yourGroups").getSelectedItem();
			if(!item){
				item = yourGroups[0];
			}
			var queryListForGroup = this.getView().byId("reportsSelectedGroup");
			if(item === null){
				queryListForGroup.removeAllItems();
			}else{
				var itemKey = item.getKey();
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