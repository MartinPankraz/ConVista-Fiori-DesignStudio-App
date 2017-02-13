sap.ui.define([], function() {
   "use strict";

   return {
		getSAPInternatlDate: function(oDate){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "YYYYMMdd"
			});
			var resultDate = oDateFormat.format(oDate);
			return resultDate;
		},
		
		getSAPInternatlTime: function(oTime){
			var oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HHmm"
			});
			var resultTime = oTimeFormat.format(oTime);
			return resultTime;	
		},
		
		getTimeStamp: function(){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "YYYYMMddHHmmss"
			});
			var resultTS = oDateFormat.format(new Date());
			return resultTS;
		}
   };
});