sap.ui.define([
	"convista/com/arp/demo/controller/BaseController",
	"convista/com/arp/demo/model/sideNavigationModel"
], function(BaseController, sideNavigationModel) {
	"use strict";

	return BaseController.extend("convista.com.arp.demo.controller.Navigation", {

		onInit: function () {
			
			var that = this;
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			that.idPrefix = that.getView().getId()+"--";
			
			var params= {
				"mainViewId": that.getView().getId(),
				"selectedTab":"",
				"hiddenItems":[],
				"selectedListItem":"",
				"targetLink":""
			};
			var globalModel = new sap.ui.model.json.JSONModel(params);
			sap.ui.getCore().setModel(globalModel, "globalParameters");
			
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
				//html.setContent("<iframe class='bo_container' src='"+src+"'></iframe>");
				html.setContent("<img class='bo_container'width='100%' height='100%' src='" + sRootPath + src + "'></img>");
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
				var currentPageId = that.getView().byId("myNavCon").getCurrentPage().getId();
				$(document).on("click", "#" + currentPageId, function(){ 
				     sap.m.MessageToast.show("This is a demo app using only DesignStudio dashboard screens. Feel free to contact us for a live demo of the integration.", {
						duration: 5000
					});
				});
		    });
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
			//this.getRouter().navTo(selectedKey);
		},
		/*tabItemSelectNavigation: function(oEvent){
			var item = oEvent.getParameters().item;
			var selectedTabKey = item.getKey();
			var selectedKey = selectedTabKey.split("_tabItem")[0];
			this.getRouter().navTo(selectedKey);
		},*/
		
		tabItemSelectHandler: function(oEvent){
			var oRouter = this.getRouter(); 
			var that = this;
			var item = oEvent.getParameters().item;
			var selectedTabKey = item.getKey();
			var selectedTabText = item.getName();
			var hiddenItems = [];
			var navigationList = this.getView().byId("navigationList");
			var navlistModel = navigationList.getModel();
			var myPath = item.getContent()[0].getText();
			
			//var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var data = navlistModel.getProperty(myPath);
			
			if(data){
				var selectedKey = selectedTabKey.split("_tabItem")[0];
				var targetLink = "";
				var selectionScreen = "";
				var listItem = "";
				for(var i=0;i<data.subitems.length;i++){
					var currItem = data.subitems[i];
					if(currItem.key === selectedKey){
						targetLink = currItem.link;
						selectionScreen = currItem.selectionscreen;
						listItem = selectedKey;
						hiddenItems = currItem.hiddenscreenparts;                         
						break;
					}
				}
				//Remember selections for selection screen controller. Global model ensures correct state handling!
				var params= {
					"mainViewId": that.getView().getId(),
					"selectedTab":selectedTabKey,
					"selectedListItem":listItem,
					"hiddenItems":hiddenItems,
					"targetLink":targetLink
				};
				sap.ui.getCore().getModel("globalParameters").setData(params);
				
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
					navContainer.to(pageId, "show");
				}else{
					var newPage;
					
					if(selectedKey === "naic_sr"){
						newPage = new sap.ui.view({
											id: pageId,
											title: selectedTabText,
											viewName:"convista.com.arp.demo.view.NAICReports",
											type: sap.ui.core.mvc.ViewType.XML
						});
					}
					else if(selectedKey === "sched_1"){
					/*if(selectedKey === "naic_sr" || selectedKey === "sched_1" || selectedKey === "sched_2" || selectedKey === "sched_3" || selectedKey === "sched_4"){
						oRouter.navTo(selectedKey,{
							id: pageId
						});
					}*/
						newPage = new sap.ui.view({
											id: pageId,
											title: selectedTabText,
											viewName:"convista.com.arp.demo.view.schedulingOverview",
											type: sap.ui.core.mvc.ViewType.XML
						});
					}else if(selectedKey === "sched_2"){
						newPage = new sap.ui.view({
											id: pageId,
											title: selectedTabText,
											viewName:"convista.com.arp.demo.view.schedulingManageGroups",
											type: sap.ui.core.mvc.ViewType.XML
						});
					}else if(selectedKey === "sched_3"){
						newPage = new sap.ui.view({
											id: pageId,
											title: selectedTabText,
											viewName:"convista.com.arp.demo.view.schedulingMyFiles",
											type: sap.ui.core.mvc.ViewType.XML
						});
					}else if(selectedKey === "sched_4"){
						newPage = new sap.ui.view({
											id: pageId,
											title: selectedTabText,
											viewName:"convista.com.arp.demo.view.schedulingHistory",
											type: sap.ui.core.mvc.ViewType.XML
						});
					}else{
						newPage = new sap.m.Page({
								id: pageId,
								title: selectedTabText,
								showHeader: false,
								showNavButton: true,
								navButtonPress: function(oNavButtonEvent){
									var myNavContainer = that.getView().byId("myNavCon");
									myNavContainer.back();
								}
						});
						
						if(selectionScreen){//use selection screen in case it is defined
							var selView = new sap.ui.view({
								viewName:"convista.com.arp.demo.view." + selectionScreen,
								type: sap.ui.core.mvc.ViewType.XML
							});
							newPage.addContent(selView);
						}
						else{
							html = new sap.ui.core.HTML({
								id: pageId + "_html"
							});
							newPage.addContent(html);
							if(targetLink === ""){
								var src = [sRootPath,"view/test.html"].join("/");
								//html.setContent("<iframe class='html_container' src='"+src+"'></iframe>");
								html.setContent("<iframe class='html_container'width='100%' height='100%' src='"+src+"'></iframe>");
							}else{
								//html.setContent("<iframe class='bo_container' src='"+targetLink+"'></iframe>");
								html.setContent("<img class='bo_container' width='100%' height='100%' src='"+targetLink+"'></img>");
							}
							$("#" + pageId + "_html").on("click", function(){
								sap.m.MessageToast.show("Toasted", {
									duration: 3000
								});
							});
						}
					}
					//newPage.addStyleClass("myPageOverflow");
					navContainer.addPage(newPage);
					navContainer.to(newPage, "show");
				}
				
				//oHashChanger.replaceHash(selectedKey);
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
			/* eslint-disable */
			sap.m.URLHelper.redirect("https://twitter.com/hashtag/convista", true);
			/* eslint-enable */
		},
		
		onFacebookIconPressed: function(oEvent){
			/* eslint-disable */
			sap.m.URLHelper.redirect("https://www.facebook.com/ConVista", true);
			/* eslint-enable */
		},
		
		onLinkedInIconPressed: function(oEvent){
			/* eslint-disable */
			sap.m.URLHelper.redirect("https://www.linkedin.com/company/convista-consulting", true);
			/* eslint-enable */
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
		
		getMyComponent: function() {
		    "use strict";
		    var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
	    },
	    
	    onExit: function(){
			
	    }
	});

});