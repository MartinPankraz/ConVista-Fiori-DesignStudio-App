sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return {

		createIconBarModel: function() {
			var oModel = new JSONModel("model/iconBarModel.json");
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};

});