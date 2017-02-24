sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
    "convista/com/arp/demo/view/utils/BExHelperFunctions"
], function(Controller, ODataModel, BExHelper) {
	"use strict";
	
     jQuery.sap.require("sap.ui.core.format.DateFormat");

	return Controller.extend("convista.com.arp.demo.controller.BOSelectionScreen1", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf convista.com.arp.demo.view.BOSelectionScreen1
		 */
		onInit: function() {
			var oModel = new ODataModel("/sap/opu/odata/sap/ZARP_COMPCODE_SRV", {defaultBindingMode: "TwoWay",defaultCountMode: "Inline"});
			this.getView().byId("companyCode").setModel(oModel);
			this.getView().byId("securityAccount").setModel(oModel);
			this.getView().byId("glAccount").setModel(oModel);
			
			var globalParams = sap.ui.getCore().getModel("globalParameters").getData();
			var itemsToHide = globalParams.hiddenItems;
			if(itemsToHide){
				for(var i=0;i<itemsToHide.length;i++){
					var itemId = itemsToHide[i];
					this.getView().byId(itemId).setVisible(false);
				}
			}
			if(this.getView().byId("datePicker2").getVisible()){
				var date = new Date(), y = date.getFullYear();//, m = date.getMonth();
				var firstDay = new Date(y, 0, 1);
				//var lastDay = new Date(y, m + 1, 0);
				this.getView().byId("datePicker1").setDateValue(firstDay);
				this.getView().byId("datePicker2").setDateValue(new Date());
			}else{
				this.getView().byId("datePicker1").setDateValue(new Date());
				this.getView().byId("datePicker2").setDateValue(new Date());	
			}
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
				var ld = "&X_LD=" + this.getView().byId("ledgerBasis").getSelectedKey();
				var cc = "&X_CC=" + BExHelper.getBExReadyFormatString(this.getView().byId("companyCode").getSelectedKeys());
				var date = "&X_DATE=" + BExHelper.formatDateForBEx(this.getView().byId("datePicker1").getDateValue());
				//create date range in case second date picker is used
				if(this.getView().byId("datePicker2").getVisible()){
					date += " - " + BExHelper.formatDateForBEx(this.getView().byId("datePicker2").getDateValue());
				}
				var dateswitch = this.getView().byId("rbg1").getSelectedIndex();
				var dateVar = "";
				if(dateswitch === 0){
					dateVar = "&X_DATEVAR=POSTING";	
				}else{
					dateVar = "&X_DATEVAR=POSITION";	
				}
				var sec = "&X_SEC=" + BExHelper.getBExReadyFormatString(this.getView().byId("securityAccount").getSelectedKeys());
				var gla = "&X_GLA=" + BExHelper.getBExReadyFormatString(this.getView().byId("glAccount").getSelectedKeys());
				
				var period = "&X_PERIOD=" + this.getView().byId("period").getSelectedKey();
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
					targetLink += va + cc + date + dateVar + sec + ld + gla + period;
					html.setContent("<iframe class='bo_container' src='" + targetLink + "'></iframe>");
				}
			}
		},

		validateForm: function() {
			var validated = true;
			var oForm = this.getView().byId("myForm");
			// get the content (as array)
			var content = oForm.getFormContainers()[0].getFormElements();
			// check every single control
			for (var i in content) {
				var fields = content[i].getFields();
				for(var j in fields){
					var control = fields[j];
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
		}
	});

});