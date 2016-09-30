sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"convista/com/model/iconBarModel",
	"convista/com/model/sideNavigationModel"
], function(Controller, iconBarModel, sideNavigationModel) {
	"use strict";

	return Controller.extend("convista.com.controller.Navigation", {

		onInit: function () {
			var iconTabBar = this.getView().byId('idIconTabBarFiori1');
			// set the model
			iconTabBar.setModel(iconBarModel.createIconBarModel());
			var iconTabFilter = new sap.m.IconTabFilter({
										key:"{key}",
										text:"{text}",
										icon:"{icon}"
									});
			iconTabBar.bindAggregation("items","/NavigationItems", iconTabFilter);
			
			var navigationList = this.getView().byId('navigationList');
			navigationList.setModel(sideNavigationModel.createSideNavigationModel());
			
			var navigationListItem = new sap.tnt.NavigationListItem({
										key:"{key}",
										text:"{text}",
										icon:"{icon}"
									});
			navigationList.bindAggregation("items","/home", navigationListItem);
			
			var html = this.getView().byId('html');
			html.setContent("<iframe class='bo_container' src='view/test.html'></iframe>");
			
			html.addStyleClass("bo_container");
			
			
		},
 
		onCollapseExapandPress: function (event) {
			var sideNavigation = this.getView().byId('sideNavigation');
			var expanded = !sideNavigation.getExpanded();
 
			sideNavigation.setExpanded(expanded);
			
			var source = event.getSource();
			if(expanded){
				source.setIcon("sap-icon://navigation-left-arrow");
			}else{
				source.setIcon("sap-icon://navigation-right-arrow");
			}
		},
 
		handleIconTabBarSelect : function (oEvent) {
			var source = oEvent.getSource();
			var selectedKey = source.getSelectedKey();
			var navigationList = this.getView().byId('navigationList');
			//navigationList.bindAggregation("items","/"+selectedKey, navigationListItem);
			
        	navigationList.bindAggregation("items","/" + selectedKey,
            						new sap.tnt.NavigationListItem({
										key:"{key}",
										text:"{text}",
										icon:"{icon}"
									})
			);
		}
	});

});