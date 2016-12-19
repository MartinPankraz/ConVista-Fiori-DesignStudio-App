sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel, Device) {
	"use strict";

	return {

		createSideNavigationModel: function() {
			
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
			
			var oModel = new JSONModel([sRootPath,"model/sideNavigationModel.json"].join("/"));
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};

});