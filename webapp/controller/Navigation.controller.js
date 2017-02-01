sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"convista/com/arp/demo/model/sideNavigationModel"
], function(Controller, sideNavigationModel) {
	"use strict";

	jQuery.sap.require("sap.ui.core.format.DateFormat");
	jQuery.sap.require("sap.ui.comp.valuehelpdialog.ValueHelpDialog");

	return Controller.extend("convista.com.arp.demo.controller.Navigation", {

		onInit: function () {
			var that = this;
			
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			that.idPrefix = that.getView().getId()+"--";
			
			var footerBar = that.getView().byId("footerBar");
			var oImage = new sap.m.Image();
			oImage.setSrc([sRootPath,"css/images/cc-logo-white.png"].join("/"));
			oImage.setAlt("Image not loaded");
			oImage.setWidth("90px");
			oImage.setDensityAware(false);
			oImage.addStyleClass("ccImage");
			footerBar.addContent(oImage);
			
			var navigationList = that.getView().byId("navigationList");
			var navigationListModel = sideNavigationModel.createSideNavigationModel();//sideNavigationModel.createSideNavigationModel();
			navigationList.setModel(navigationListModel);
			navigationList.bindAggregation("items","/NavigationItems", this.navigationListItemFactory.bind(this));
			//wait for model to complete json load
			navigationListModel.attachRequestCompleted(function() {
    			var html = that.getView().byId("firstItem_page_html");
	        	//choose first link to be loaded as home page
	        	var src = navigationListModel.getProperty("/NavigationItems/1/subitems/0/link");
				html.setContent("<iframe class='bo_container' src='"+src+"'></iframe>");
				html.addStyleClass("bo_container");
				//using Fioir URL params?
				if(that.getMyComponent().getComponentData()){
					var oStartupParameters = that.getMyComponent().getComponentData().startupParameters;
					if(oStartupParameters.report){
						var preSelectedSection = oStartupParameters.report[0];
						var listItems = navigationList.getItems();
						for(var i=0;i < listItems.length;i++){
							var currentItem = listItems[i].getItems();
							for(var j=0;j < currentItem.length;j++){
								var targetItem = currentItem[j];
								var key = targetItem.getProperty("key");
								if(key === preSelectedSection){
									targetItem.getParent().setExpanded(true);
									navigationList.setSelectedItem(targetItem);
									//trigger select using startup parameter to change view
									navigationList.fireItemSelect({item:targetItem});
									break;
								}	
							}
							
						}
					}	
				}
		    });
			
/*			this.theTokenInput= this.getView().byId("multiInput2");
			this.theTokenInput.setEnableMultiLineMode( sap.ui.Device.system.phone); 
	 
			this.aKeys= ["CompanyCode", "CompanyName"];
	 
			var rangeToken1= new sap.m.Token({key: "i1", text: "ID: a..z"}).data("range", { "exclude": false, "operation": "BT", "keyField": "CompanyCode", "value1": "a", "value2": "z"});
			var rangeToken2= new sap.m.Token({key: "i2", text: "ID: =foo"}).data("range", { "exclude": false, "operation": "EQ", "keyField": "CompanyCode", "value1": "foo", "value2": ""});
			var rangeToken3= new sap.m.Token({key: "e1", text: "ID: !(=foo)"}).data("range", { "exclude": true, "operation": "EQ", "keyField": "CompanyCode", "value1": "foo", "value2": ""});
			this.aTokens= [rangeToken1, rangeToken2, rangeToken3];
			
			this.theTokenInput.setTokens(this.aTokens);*/
		},
		
		navigationListItemFactory: function(sId,oContext) {
			var myPath = oContext.getPath();
			var myModel = oContext.getModel();
			var property = myModel.getProperty(myPath);
			var subItems = property.subitems;
			
			var navigationListItem = new sap.tnt.NavigationListItem({
							key:"{key}",
							text:"{text}",
							icon:"{icon}",
							tooltip:"{tooltip}",
							expanded: false
						});
			if(subItems){
				for(var i=0;i<subItems.length;i++){
					var currItem = subItems[i];
					var subItem = new sap.tnt.NavigationListItem({
							key:currItem.key,
							text:currItem.text,
							icon:currItem.icon,
							tooltip:currItem.tooltip,
							expanded: false
						});
					navigationListItem.addItem(subItem);
				}
			}			
		
			return navigationListItem;
		},
		
		onNavListItemSelect: function(oEvent){
			var source = oEvent.getSource();
			var expanded = source.getExpanded();
			var item = oEvent.getParameters().item;
			var itemExpanded = item.getExpanded();
			var selectedKey = item.getKey();
			var selectedItemText = item.getText();
			var myPath = item.getBindingContext().getPath();
			var hasParent = item.getParent().getBindingContext();
			
			if(selectedKey === "collapse"){
				var sideNavigation = this.getView().byId("navigationList");
				sideNavigation.setExpanded(!expanded);
			}
			
			if(hasParent){
				var tabContainer = this.getView().byId("myTabCon");
				var tabContainerItem = new sap.m.TabContainerItem({
					key: selectedKey + "_tabItem",
					name: selectedItemText
				});
				//workaround to remember path for loosely coupled navigation with NavContainer in hidden text
				tabContainerItem.addContent(new sap.m.Text({text:myPath}));
				tabContainer.addItem(tabContainerItem);
				//select new tab right away
				tabContainer.setSelectedItem(tabContainerItem);
			}else{
				item.setExpanded(!itemExpanded);
			}
		},
		
		tabItemSelectHandler: function(oEvent){
			var that = this;
			var item = oEvent.getParameters().item;
			var selectedTabKey = item.getKey();
			var selectedTabText = item.getName();
			var navigationList = this.getView().byId("navigationList");
			var navlistModel = navigationList.getModel();
			var myPath = item.getContent()[0].getText();

			var data = navlistModel.getProperty(myPath);
			if(data){
				var selectedKey = selectedTabKey.split("_tabItem")[0];
				var targetLink = "";
				for(var i=0;i<data.subitems.length;i++){
					var currItem = data.subitems[i];
					if(currItem.key === selectedKey){
						targetLink = currItem.link;
						break;
					}
				}
				var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
				//make sure to identify tabs by their unique IDs, keys are the same for the same reports to match
				//the navigationlist model and their corresponding iframe links
				var selectedTabId = item.getId();
				
				var navContainer = that.getView().byId("myNavCon");
				var pageId = selectedTabId + "_page";
				var page = navContainer.getPage(pageId);
				var html = null;
				if(page){
					html = page.getContent()[0];
				}else{
					var newPage = new sap.m.Page({
								id: pageId,
								title: selectedTabText,
								showHeader: false,
								showNavButton: true,
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
						html = new sap.ui.core.HTML({
							id: pageId + "_html"
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
				navContainer.to(pageId, "show");
			}
		},
		
		tabItemCloseHandler: function(oEvent){
			var that = this;
			var item = oEvent.getParameters().item;
			var selectedTabId = item.getId();
			
			var navContainer = that.getView().byId("myNavCon");
			var pageId = selectedTabId + "_page";
			var pageToBeRemoved = navContainer.getPage(pageId);
			if(pageToBeRemoved){
				navContainer.removePage();
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
	    },
	    
	    exit: function(){

	    }
	});

});