sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return {

		createIconBarModel: function() {
			
			var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");

			var oModel = new JSONModel([sRootPath,'model/iconBarModel.json'].join("/"));
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};

});