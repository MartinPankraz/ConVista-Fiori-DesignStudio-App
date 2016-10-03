sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel, Device) {
	"use strict";

	return {

		createSideNavigationModel: function() {
			var oModel = new JSONModel("model/sideNavigationModel.json");
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};

});