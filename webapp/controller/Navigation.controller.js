sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"convista/com/arp/demo/model/iconBarModel",
	"convista/com/arp/demo/model/sideNavigationModel"
], function(Controller, iconBarModel, sideNavigationModel) {
	"use strict";

	jQuery.sap.require("sap.ui.core.format.DateFormat");
	jQuery.sap.require("sap.ui.comp.valuehelpdialog.ValueHelpDialog");

	return Controller.extend("convista.com.arp.demo.controller.Navigation", {

		onInit: function () {
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			var that = this;
			this.idPrefix = this.getView().getId()+"--";
			
			var footerBar = this.getView().byId("footerBar");
			var oImage = new sap.m.Image();
			oImage.setSrc([sRootPath,"css/images/cc-logo-white.png"].join("/"));
			oImage.setAlt("Image not loaded");
			oImage.setWidth("90px");
			oImage.setDensityAware(false);
			oImage.addStyleClass("ccImage");
			footerBar.addContent(oImage);
			
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
			var navigationListModel = sideNavigationModel.createSideNavigationModel();
			navigationList.setModel(navigationListModel);
			/*navigationList.attachItemSelect(this.onNavListItemSelect);*/
			var navigationListItem = new sap.tnt.NavigationListItem({
										key:"{key}",
										text:"{text}",
										icon:"{icon}",
										tooltip:"{tooltip}"
									});
			navigationList.bindAggregation("items","/home", navigationListItem);
			//wait for model to complete json load
			navigationListModel.attachRequestCompleted(function() {
    			var html = that.getView().byId("home_landing_html");
	        	//choose first link to be loaded as home page
	        	var src = navigationListModel.getProperty("/home/1/link");
				html.setContent("<iframe class='bo_container' src='"+src+"'></iframe>");
				html.addStyleClass("bo_container");
				
				var oStartupParameters = that.getMyComponent().getComponentData().startupParameters;
				var preSelectedSection = oStartupParameters.preselect[0];
				if(preSelectedSection){
					var barItems = iconTabBar.getItems();
					for(var i=0;i < barItems.length;i++){
						var targetItem = barItems[i];
						var key = targetItem.getProperty("key");
						if(key === preSelectedSection){
							iconTabBar.setSelectedKey(preSelectedSection);
							var mArguments = {
								item: targetItem,
								key: preSelectedSection,
								selectedItem: targetItem,
								selectedKey: preSelectedSection,
								startupTrigger: true
							};
							//trigger select using startup parameter to change view
							iconTabBar.fireSelect(mArguments);
							break;
						}
					}
				}
		    });
			
		/*	var timeInstance = sap.ui.core.format.DateFormat.getTimeInstance({style:"short"});
			var clock1 = this.getView().byId("clock1");
			clock1.setText("Köln " + timeInstance.format(new Date()));
			window.setInterval(function() {
				var time = timeInstance.format(new Date());
				clock1.setText("Köln " + time);
			}, 30000);*/
			
/*			this.theTokenInput= this.getView().byId("multiInput2");
			this.theTokenInput.setEnableMultiLineMode( sap.ui.Device.system.phone); 
	 
			this.aKeys= ["CompanyCode", "CompanyName"];
	 
			var rangeToken1= new sap.m.Token({key: "i1", text: "ID: a..z"}).data("range", { "exclude": false, "operation": "BT", "keyField": "CompanyCode", "value1": "a", "value2": "z"});
			var rangeToken2= new sap.m.Token({key: "i2", text: "ID: =foo"}).data("range", { "exclude": false, "operation": "EQ", "keyField": "CompanyCode", "value1": "foo", "value2": ""});
			var rangeToken3= new sap.m.Token({key: "e1", text: "ID: !(=foo)"}).data("range", { "exclude": true, "operation": "EQ", "keyField": "CompanyCode", "value1": "foo", "value2": ""});
			this.aTokens= [rangeToken1, rangeToken2, rangeToken3];
			
			this.theTokenInput.setTokens(this.aTokens);*/
		},
		
		onNavListItemSelect: function(oEvent){
			var that = this;
			var source = oEvent.getSource();
			var expanded =source.getExpanded();
			var item = oEvent.getParameters().item;
			var selectedKey = item.getKey();
			var selectedItemText = item.getText();
			
			if(selectedKey === "collapse"){
				var sideNavigation = this.getView().byId("navigationList");
				sideNavigation.setExpanded(!expanded);
			}
			else{
				//ToDo Use OData to retrieve BO OpenDocument links to fill IFrame
				var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
				var iconTabBar = this.getView().byId("idIconTabBarFiori1");
				var selectedSection = iconTabBar.getSelectedKey();
				var sourceModel = source.getModel().getData();
				var workingSet = sourceModel[selectedSection];
				var targetLink = "";
				for(var i=0;i < workingSet.length; i++){
					var currentItem = workingSet[i];
					if(currentItem.key === selectedKey){
						targetLink = currentItem.link;
						//quit loop since we found the object
						break;
					}
				}

				var navContainer = this.getView().byId("myNavCon");
				var pageId = this.idPrefix + selectedSection + "_" + selectedKey;
				var page = navContainer.getPage(pageId);
				var html = null;
				if(page){
					html = page.getContent()[0];
				}else{
					
					var newPage = new sap.m.Page({
								id:pageId,
								title:selectedItemText,
								showHeader:true,
								showNavButton:true,
								navButtonPress: function(oNavButtonEvent){
									var myNavContainer = that.getView().byId("myNavCon");
									myNavContainer.back();
								}
					});
					
					if(selectedKey === "sched_1"){
						var viewSched = new sap.ui.view({
											viewName:"convista.com.arp.demo.view.schedulingOverview",
											type: sap.ui.core.mvc.ViewType.XML,
											height:"100%"
							
						});
						newPage.addContent(viewSched);
						
					}else{
						
						newPage.addHeaderContent(
							new sap.m.Button({
								icon:"sap-icon://refresh",
			                	press: function (oRefreshButtonEvent) {
									var currPage = that.getView().byId("myNavCon").getCurrentPage();
									var currhtml = currPage.getContent()[0];
									var iframe = currhtml.getContent();
									var srcToReload = jQuery(iframe).attr("src");
						
									currhtml.setContent("<iframe class='bo_container' src='"+srcToReload+"'></iframe>");
								}
							})
						);
						html = new sap.ui.core.HTML({
							id:selectedSection + "_" + selectedKey + "_html"
						});
						newPage.addContent(html);
						if(targetLink === ""){
							var src = [sRootPath,"view/test.html"].join("/");
							html.setContent("<iframe class='bo_container' src='"+src+"'></iframe>");
						}else{
							html.setContent("<iframe class='bo_container' src='"+targetLink+"'></iframe>");
						}
					}
					newPage.addStyleClass("myPageOverflow");
					navContainer.addPage(newPage);
				}
				navContainer.to(pageId, "slide");
			}
		},
 
		handleIconTabBarSelect : function (oEvent) {
			var params = oEvent.getParameters();
			var selectedKey = params.selectedKey;
			var navigationList = this.getView().byId("navigationList");
			//navigationList.bindAggregation("items","/"+selectedKey, navigationListItem);
			var item = new sap.tnt.NavigationListItem({
										key:"{key}",
										text:"{text}",
										icon:"{icon}"
									});
			var navContainer = this.getView().byId("myNavCon");
			var pageId = this.idPrefix + "home_landing";
			if(selectedKey === "home"){
				navContainer.to(pageId, "slide");
			}
			/*if(selectedKey === "bi_folder"){
				window.open("https://sapwebdcbw.sap.convista.local:8444/BOE/BI?startFolder=AdKUWGHO7gRNhWMb5eUrOOE&noDetailsPanel=true&isCat=false");
			}*/
        	navigationList.bindAggregation("items","/" + selectedKey, item);
        	//fire select to open first page for external navigation triggered by Fiori startup parameter
        	if(params.startupTrigger){
        		var firstItem = navigationList.getItems()[1];
        		navigationList.fireItemSelect({item:firstItem});
        	}
		},
		
		onContactUsClicked: function(oEvent){
			var oText = oEvent.getSource();
			// create action sheet only once
			if (!this._contactUs) {
				this._contactUs = sap.ui.xmlfragment("convista.com.arp.demo.view.ContactUs",this);
				this.getView().addDependent(this._contactUs);
			}
			if(this._contactUs.isOpen()){
				this._contactUs.close();
			}else{
				this._contactUs.openBy(oText);	
			}
		},
		
		handleContactUsCloseButton: function(oEvent){
			this._contactUs.close();
		},
		
		onEmailClicked: function(oEvent){
			sap.m.URLHelper.triggerEmail("Info_Cologne@ConVista.com", "Info Request");
		},
		
		onTwitterIconPressed: function(oEvent){
			sap.m.URLHelper.redirect("https://twitter.com/hashtag/convista", true);
		},
		
		onFacebookIconPressed: function(oEvent){
			sap.m.URLHelper.redirect("https://www.facebook.com/ConVista", true);
		},
		
		onLinkedInIconPressed: function(oEvent){
			sap.m.URLHelper.redirect("https://www.linkedin.com/company/convista-consulting", true);
		},
		
		getSectionFromId: function(givenId){
			var split = givenId.split("--")[1];
			var section = split.split("_")[0];
			return section;
		},
		
		handleHomeHtmlRefresh: function(oEvent){
			var currhtml = this.getView().byId("home_landing_html");
			var iframe = currhtml.getContent();
			var srcToReload = jQuery(iframe).attr("src");
			currhtml.setContent("<iframe class='bo_container' src='" + srcToReload + "'></iframe>");
		},
		
		onSelectionScreenRequest: function(oEvent){
			var that= this;
		
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: this.theTokenInput.getValue(), 
				title: "Company",
				supportRanges: true,
				supportRangesOnly: true, 
				key: this.aKeys[0],				
				descriptionKey: this.aKeys[1],
				stretch: sap.ui.Device.system.phone, 
	 
				ok: function(oControlEvent) {
					that.aTokens = oControlEvent.getParameter("tokens");
					that.theTokenInput.setTokens(that.aTokens);
	 
					oValueHelpDialog.close();
				},
	 
				cancel: function(oControlEvent) {
					sap.m.MessageToast.show("Cancel pressed!");
					oValueHelpDialog.close();
				},
	 
				afterClose: function() {
					oValueHelpDialog.destroy();
				}
			});
			
			oValueHelpDialog.setRangeKeyFields([{label: "Company Code", key: "CompanyCode"}, {label : "Company Name", key:"CompanyName"}]); 
			oValueHelpDialog.setTokens(this.theTokenInput.getTokens());
			
			if (this.theTokenInput.$().closest(".sapUiSizeCompact").length > 0) { // check if the Token field runs in Compact mode
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			} else {
				oValueHelpDialog.addStyleClass("sapUiSizeCozy");			
			}
			
			oValueHelpDialog.open();
		},
		
		getMyComponent: function() {
		    "use strict";
		    var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
	    }
	});

});