sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataModel"
], function(Controller, ODataModel) {
	"use strict";

	return Controller.extend("convista.com.arp.demo.controller.BOSelectionScreen1", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf convista.com.arp.demo.view.BOSelectionScreen1
		 */
		onInit: function() {
			this.getView().byId("datePicker1").setDateValue(new Date());
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf convista.com.arp.demo.view.BOSelectionScreen1
		 */
		onExit: function() {
			
		},

		onSelectionScreenExecutePress: function(oEvent) {
			var globalParams = sap.ui.getCore().getModel("globalParameters").getData();
			if(this.validateForm()){
				var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
				var targetLink = globalParams.targetLink;
	
				var mainView = sap.ui.core.Core().byId(globalParams.mainViewId);
				var navContainer = mainView.byId("myNavCon");
				var currentPage = navContainer.getCurrentPage();
				var pageId = currentPage.getId();
				
				var va = "", cc = "", date = "", dateVar = "", sec = "";
				
				var oForm = this.getView().byId("myForm");
				// get the content (as array)
				var content = oForm.getContent();
				// check every single control
				for (var i in content) {
					var control = content[i];
					if(i === "1"){
						va = "&X_VA=" + control.getSelectedKey();
					}
					if(i === "3"){
						cc = "&X_CC=" + control.getSelectedKeys();
					}
					if(i === "5"){
						date = "&X_DATE=" + control.getValue();
					}
					if(i === "6"){
						if(control.getSelectedIndex() === 0){
							dateVar = "&X_DATEVAR=POSTING";	
						}else{
							dateVar = "&X_DATEVAR=POSITION";	
						}
					}
					if(i === "8"){
						sec = "&X_SEC=" + control.getSelectedKeys();
					}
				}
				//clear page from selection screen
				currentPage.removeAllContent();
				var html = new sap.ui.core.HTML({
					id: pageId + "_html"
				});
				currentPage.addContent(html);
				if (targetLink === "") {
					var src = [sRootPath, "view/test.html"].join("/");
					html.setContent("<iframe class='bo_container' src='" + src + "'></iframe>");
				} else {
					targetLink += va + cc + date + dateVar + sec;
					html.setContent("<iframe class='bo_container' src='" + targetLink + "'></iframe>");
				}
			}
		},

		validateForm: function() {
			var validated = true;
			var oForm = this.getView().byId("myForm");
			// get the content (as array)
			var content = oForm.getContent();
			// check every single control
			for (var i in content) {
				var control = content[i];
				// check control only if it has the function getValue
				// a rather primitive way to filter the TextFields
				if (control.getValue) {
					// check the value on empty text
					if (control.getValue() === "" && control.getRequired() === true) {
						// do whatever you want to show the user he has to provide more input
						control.setValueState(sap.ui.core.ValueState.Error);
						validated = false;
					}
				}
			}
			return validated;
		}

	});

});