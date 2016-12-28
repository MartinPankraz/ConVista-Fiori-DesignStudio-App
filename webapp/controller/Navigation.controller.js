sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"convista/com/arp/demo/model/iconBarModel",
	"convista/com/arp/demo/model/sideNavigationModel"
], function(Controller, iconBarModel, sideNavigationModel) {
	"use strict";

	return Controller.extend("convista.com.arp.demo.controller.Navigation", {

		onInit: function () {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			
			var footerBar = this.getView().byId("footerBar");
			var oImage = new sap.m.Image();
			oImage.setSrc([sRootPath,"css/images/cc-logo-white.png"].join("/"));
			oImage.setAlt("Image not loaded");
			oImage.setWidth("90px");
			oImage.setDensityAware(false);
			oImage.addStyleClass("ccImage");
			footerBar.addContentRight(oImage);
			
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
			/*navigationList.attachItemSelect(this.onNavListItemSelect);*/
			var navigationListItem = new sap.tnt.NavigationListItem({
										key:"{key}",
										text:"{text}",
										icon:"{icon}",
										tooltip:"{tooltip}"
									});
			navigationList.bindAggregation("items","/home", navigationListItem);
			
			var html = this.getView().byId("html");
			
			//var src = [sRootPath,'view/test.html'].join("/");
			var src = "http://cdsapbj.sap.convista.local:50000/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AShpWcml_ydMhyDYk.wCuHg&noDetailsPanel=true";
			/*html.setContent("<iframe class='bo_container' src='"+src+"'></iframe>");*/
			html.setContent("<iframe class='bo_container' src='"+src+"'></iframe>");
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
		
		onNavListItemSelect: function(oEvent){
			var source = oEvent.getSource();
			var expanded =source.getExpanded();
			var item = oEvent.getParameters().item;
			var selectedKey = item.getKey();
			
			if(selectedKey === "collapse"){
				var sideNavigation = this.getView().byId("navigationList");
				sideNavigation.setExpanded(!expanded);
			}else{
				//ToDo Use OData to retrieve BO OpenDocument links to fill IFrame
				var iconTabBar = this.getView().byId("idIconTabBarFiori1");
				var selectedSection = iconTabBar.getSelectedKey();
				var sourceModel = source.getModel().getData();
				var workingSet = sourceModel[selectedSection];
				var targetLink = "";
				for(var i=0;i<workingSet.length;i++){
					var currentItem = workingSet[i];
					if(currentItem.key === selectedKey){
						targetLink = currentItem.link;
						//quit loop since we found the object
						break;
					}
				}
				var html = this.getView().byId("html");
				var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
				if(targetLink === ""){
					var src = [sRootPath,'view/test.html'].join("/");
					html.setContent("<iframe class='bo_container' src='"+src+"'></iframe>");
				}else{
					html.setContent("<iframe class='bo_container' src='"+targetLink+"'></iframe>");					
				}
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
				this._actionSheet = sap.ui.xmlfragment("convista.com.arp.demo.view.ActionSheet",this);
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