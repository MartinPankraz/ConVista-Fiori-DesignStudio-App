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
			var oModel = new ODataModel("/sap/opu/odata/sap/ZARP_COMPCODE_SRV", true);
			this.getView().byId("companyCode").setModel(oModel);
			this.getView().byId("securityAccount").setModel(oModel);
			
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
				
				var va = "&X_VA=" + this.getView().byId("valuationArea").getSelectedKey();
				var cc = "&X_CC=" + this.getBExReadyFormatString(this.getView().byId("companyCode").getSelectedKeys());
				var date = "&X_DATE=" + this.getView().byId("datePicker1").getValue();
				var dateswitch = this.getView().byId("rbg1").getSelectedIndex();
				var dateVar = "";
				if(dateswitch === 0){
					dateVar = "&X_DATEVAR=POSTING";	
				}else{
					dateVar = "&X_DATEVAR=POSITION";	
				}
				var sec = "&X_SEC=" + this.getBExReadyFormatString(this.getView().byId("securityAccount").getSelectedKeys());
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
		},
		
		onCompanySelectionFinish: function(oEvent) {
			var selectedCompanies = this.getView().byId("companyCode").getSelectedKeys();
			var filters = [];
			for(var i=0;i<selectedCompanies.length;i++){
				var key = selectedCompanies[i];
				filters.push(
					new sap.ui.model.Filter({
			          path: 'Compcode',
			          operator: sap.ui.model.FilterOperator.EQ,
			          value1: key
			    	})
			     );
			}
			// invoking entity by passing parameters
			/*oModel.read("/securityAccountSet", {
			     filters: filters
			});*/
			this.getView().byId("securityAccount").getBinding("items").filter(filters);
		},
		
		getBExReadyFormatString: function(values){
			var result = "";
			for(var i=0;i<values.length;i++){
				if(i<values.length-1){
					result += values[i] + ";";	
				}else{
					result += values[i];	
				}
			}
			return result;
		}

	});

});