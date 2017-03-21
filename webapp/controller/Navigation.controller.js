sap.ui.define([
	"convista/com/arp/demo/controller/BaseController",
	"convista/com/arp/demo/model/sideNavigationModel"
], function(BaseController, sideNavigationModel) {
	"use strict";

	return BaseController.extend("convista.com.arp.demo.controller.Navigation", {

		_onObjectMatched: function(oEvent){
			var that = this;
			var pageId = oEvent.getParameter("arguments").key;
			var selectedKey = oEvent.getParameter("name");
			var tabContainer = that.getView().byId("myTabCon");
			var tabContainerItem = new sap.m.TabContainerItem({
				key: selectedKey + "_tabItem",
				name: "Scheduling Overview"
			});
			//workaround to remember path for loosely coupled navigation with NavContainer in hidden text
			//tabContainerItem.addContent(new sap.m.Text({text:myPath}));
			tabContainer.addItem(tabContainerItem);
			//tabContainer.setSelectedItem(tabContainerItem);
		},

		onInit: function () {
			var that = this;
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			that.idPrefix = that.getView().getId() + "--";
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

			var oSideNavModel = that.getMyComponent().getModel("sideNavigationData");
			oSideNavModel.attachRequestCompleted(function(res){
				that.createFirstTab();
			});
			
			var tabContainer = that.getView().byId("myTabCon");
			var navContainer = that.getView().byId("myNavCon");
			window.addEventListener("popstate", function(){
				if(history.state !== null){
					var pageId = history.state.id;
					//var key = history.state.key;
					//var tab = history.state.tab;
					navContainer.to(pageId, "slide");
					//tabContainer.setSelectedItem(tabContainer.getItems()[0],true,false);
				}
			});

			//window.addEventListener("popstate", this.sayHello(navContainer));
			
			//that.getRouter().attachRoutePatternMatched(that._onObjectMatched, that);
		    
		},

		createFirstTab: function(){
			var hash = window.location.hash;
			var key = hash.split("/")[1];
			var tabContainer = this.getView().byId("myTabCon");
			var tabContainerItem;
			if(key === undefined || key === "landing"){
				var oSideNavModel = this.getMyComponent().getModel("sideNavigationData");
				var html = this.getView().byId("firstItem_page_html");
	        	//choose first link to be loaded as home page
	        	var src = oSideNavModel.getProperty("/NavigationItems/1/subitems/0/link");
				html.setContent("<iframe style='width:100%; height:100%;' src='" + src + "'></iframe>");

				tabContainerItem = new sap.m.TabContainerItem({
					key: "landing_tabItem",
					name: "Dashboard Library",
					id: "firstItem"
				});
				//workaround to remember path for loosely coupled navigation with NavContainer in hidden text
				tabContainer.addItem(tabContainerItem);
			}else{
				var	result = this.findObjectMatch(key);
				tabContainerItem = new sap.m.TabContainerItem({
					key: key + "_tabItem",
					name: result[0].text
				});
				tabContainer.addItem(tabContainerItem);
				//Call the createpage method to create the selected item
				this.createPage(tabContainerItem);
				//select new tab right away
				//tabContainer.setSelectedItem(tabContainerItem);
			}
			
		},
		
		// What to do if selected item is collapse button or a main item
		onNavListItemSelect: function(oEvent){
			var selectedKey = oEvent.getParameters().item.getKey();
			var bIsExpanded;
			
			if(selectedKey === "collapse"){
				var sideNavigation = this.getView().byId("navigationList");
				bIsExpanded = sideNavigation.getExpanded();
				sideNavigation.setExpanded(!bIsExpanded);
			}else{
				bIsExpanded = oEvent.getParameters().item.getExpanded();
				oEvent.getParameters().item.setExpanded(!bIsExpanded);
			}

		},
		// What to do if selected item is a subItem
		onItemSelect: function(oEvent){
			var item = oEvent.getParameters().item;
			var selectedKey = item.getKey();
			var selectedItemText = item.getText();
			var tabContainer = this.getView().byId("myTabCon");
			//var myPath = item.oBindingContexts.sideNavigationData.sPath;
			
			var tabContainerItem = new sap.m.TabContainerItem({
				key: selectedKey + "_tabItem",
				name: selectedItemText
			});
			tabContainerItem.addContent(new sap.m.Text({text:"holaaaaa"}));
			tabContainer.addItem(tabContainerItem);
			//Call the createpage method to create the selected item
			this.createPage(tabContainerItem);
			//select new tab right away
			tabContainer.setSelectedItem(tabContainerItem);
		},
		
		// Method for iterating through the navigation model to find the object selected
		findObjectMatch: function(selectedKey){
			var navlistModel = this.getView().getModel("sideNavigationData");
			var navItems = navlistModel.getData().NavigationItems;
			var findObject = function(e){
				return e.key === selectedKey;
			};
			var result = $.grep(navItems, findObject);
			if(result.length === 0){
				for(var i = 0; i < navItems.length; i++){
					if(navItems[i].subitems){
						if($.grep(navItems[i].subitems, findObject).length !== 0){
							result = $.grep(navItems[i].subitems, findObject);
						}
						
					}
				}
			}
			return result;
		},
		//Method for creating pages depending on selected item
		createPage: function(tabItem){
			var that = this;
			// var stateObj;
			var selectedTabKey = tabItem.getKey();
			var selectedTabText = tabItem.getName();
			var selectedKey = selectedTabKey.split("_tabItem")[0];
			var hiddenItems = [];
			//var myPath = tabItem.getContent()[0].getText();
			var result = that.findObjectMatch(selectedKey);
	
			//var data = navlistModel.getProperty(myPath);
			
			if(result.length !== 0){
				selectedKey = result[0].key;
				var targetLink = result[0].link;
				var selectionScreen = result[0].selectionscreen;
				var listItem = selectedKey;
				hiddenItems = result[0].hiddenscreenparts; 
				//Remember selections for selection screen controller. Global model ensures correct state handling!
				var params = {
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
				var selectedTabId = tabItem.getId();
				
				var navContainer = that.getView().byId("myNavCon");
				var pageId = selectedTabId + "_page";
				var html = null;
				
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
							html.setContent("<iframe class='html_container' src='" + src + "'></iframe>");
						}else{
							html.setContent("<iframe class='bo_container' src='" + targetLink + "'></iframe>");
						}
					}
				}
				/*stateObj = { 
					id: pageId, 
					key: selectedKey
				};
				history.pushState(stateObj, selectedKey,"#fioriHtmlBuilder-display&/" + selectedKey + "/" + pageId);*/
				navContainer.addPage(newPage);
				//navContainer.to(newPage, "slide");
			}
		},
		
		tabItemSelectHandler: function(oEvent){
			var item = oEvent.getParameters().item;
			if(item !== null && typeof item !== "string"){
				var stateObj;
				var that = this;
				var selectedTabId = item.getId();
				var selectedTab = item.getKey();
				var selectedKey = item.getKey().split("_tabItem")[0];
				var navContainer = that.getView().byId("myNavCon");
				var result = that.findObjectMatch(selectedKey);
				var pageId;
				if(selectedKey === "landing"){
					pageId = navContainer.getPages()[0].getId();
				}else{
					pageId = selectedTabId + "_page";
				}
				var page = navContainer.getPage(pageId);

				if(result.length !== 0 || selectedKey === "landing"){
					if(page){
						//selectedKey = result[0].key;
						navContainer.to(pageId, "slide");
						stateObj = { 
							id: pageId, 
							key: selectedKey,
							tab: selectedTab
						};
						history.pushState(stateObj, selectedKey,"#fioriHtmlBuilder-display&/" + selectedKey);
					}
				}
			}
		},

		
		tabItemCloseHandler: function(oEvent){
			var item = oEvent.getParameters().item;
			var selectedTabId = item.getId();
			
			var navContainer = this.getView().byId("myNavCon");
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