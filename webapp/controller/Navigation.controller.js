sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"convista/com/model/iconBarModel",
	"convista/com/model/sideNavigationModel"
], function(Controller, iconBarModel, sideNavigationModel) {
	"use strict";

	return Controller.extend("convista.com.controller.Navigation", {

		onInit: function () {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			
			var iconTabBar = this.getView().byId("idIconTabBarFiori1");
			// set the model
			iconTabBar.setModel(iconBarModel.createIconBarModel());
			var iconTabFilter = new sap.m.IconTabFilter({
										key:"{key}",
										text:"{text}",
										icon:"{icon}"
									});
			iconTabBar.bindAggregation("items","/NavigationItems", iconTabFilter);
			
			var navigationList = this.getView().byId("navigationList");
			navigationList.setModel(sideNavigationModel.createSideNavigationModel());
			
			var navigationListItem = new sap.tnt.NavigationListItem({
										key:"{key}",
										text:"{text}",
										icon:"{icon}"
									});
			navigationList.bindAggregation("items","/home", navigationListItem);
			
			var html = this.getView().byId("html");
			html.setContent("<iframe class='bo_container' src='view/test.html'></iframe>");
			html.addStyleClass("bo_container");
			
			var timeInstance = sap.ui.core.format.DateFormat.getTimeInstance({style:"short"});
			var clock1 = this.getView().byId("clock1");
			clock1.setText("Köln " + timeInstance.format(new Date()));
			window.setInterval(function() {
				var time = timeInstance.format(new Date());
				clock1.setText("Köln " + time);
			}, 30000);
			//source: https://blogs.sap.com/2015/04/16/using-the-hcp-user-api-in-web-ide/
			// {userapi>/ [name,firstName,lastName,displayName,email]
			/*var userModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
			var userView = this.getView().byId("username");
			userView.setModel(userModel, "userapi");*/
			
		},
 
		onCollapseExapandPress: function (event) {
			var sideNavigation = this.getView().byId("sideNavigation");
			var expanded = !sideNavigation.getExpanded();
 
			sideNavigation.setExpanded(expanded);
			
			var source = event.getSource();
			if(!expanded){
				source.setIcon("sap-icon://navigation-right-arrow");
			}else{
				source.setIcon("sap-icon://navigation-left-arrow");
			}
		},
 
		handleIconTabBarSelect : function (oEvent) {
			var source = oEvent.getSource();
			var selectedKey = source.getSelectedKey();
			var navigationList = this.getView().byId("navigationList");
			//navigationList.bindAggregation("items","/"+selectedKey, navigationListItem);
			var item = new sap.tnt.NavigationListItem({
										key:"{key}",
										text:"{text}",
										icon:"{icon}"
									});
			if(selectedKey === "bi_folder"){
				window.open("http://CDSAPBJ.sap.convista.local:50000/BOE/BI?startFolder=AdKUWGHO7gRNhWMb5eUrOOE&noDetailsPanel=true&isCat=false");
			}
        	navigationList.bindAggregation("items","/" + selectedKey, item);	
		},
		
		onUserImagePressed: function(oEvent){
			var oImage = oEvent.getSource();
 
			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment("convista.com.view.ActionSheet",this);
				this.getView().addDependent(this._actionSheet);
			}
			if(this._actionSheet.isOpen()){
				this._actionSheet.close();
			}else{
				this._actionSheet.openBy(oImage);	
			}
		},
		
		handleActionClose: function(oEvent){
			/*var oPopOver = oEvent.getSource();*/
			this._actionSheet.close();
		}
	});

});