sap.ui.define([], function() {
	"use strict";

	return {

		getBExReadyFormatString: function(values) {
			var result = "";
			for (var i = 0; i < values.length; i++) {
				if (i < values.length - 1) {
					result += values[i] + ";";
				} else {
					result += values[i];
				}
			}
			return result;
		},
		/**
		 * Make sure to put <all> placeholder for empty selection on Select or MultiComboBox for backend parsing
		 */ 
		getAllStringForEmptySelection: function(values) {
			if(values.length === 0){
				return "<all>";
			}
			return values;
		},
		
		formatDateForBEx: function(v) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "MM/dd/YYYY"
			});
			var result = oDateFormat.format(new Date(v));
			return result;
		}

	};
});