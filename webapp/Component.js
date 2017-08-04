sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"convista/com/arp/demo/model/models"
], function(UIComponent, Device, models) {
	"use strict";
	
	/*var that = null;*/
	
	return UIComponent.extend("convista.com.arp.demo.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			/*that = this;*/
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// create the views based on the url/hash
            this.getRouter().initialize();
            //Retrieve Shell to add custom functions to header bar
            /*var oRendererExtensions = jQuery.sap.getObject('sap.ushell.renderers.fiori2.RendererExtensions');
            var oBundle = this.getModel("i18n").getResourceBundle();
            var title = oBundle.getText("title");
            
            //running Fiori?
            if(oRendererExtensions){
            	oRendererExtensions.setHeaderTitle(title);
            
	            that.oFavoriteHeaderItem = new sap.ushell.ui.shell.ShellHeadItem('supportFavorite', {
	                icon: sap.ui.core.IconPool.getIconURI( 'favorite' ),
	                tooltip:'My Favorites',
	                showSeparator: true,
	                press: that.onFavoritesHeaderItemPress
	            });
	
				// add button to the right side of the shellbar
	            oRendererExtensions.addHeaderEndItem(that.oFavoriteHeaderItem);
            }*/
            
            /*var sRootPath = jQuery.sap.getModulePath("convista.com.arp.demo");
            jQuery.sap.registerModulePath("FileSaver",sRootPath + "/lib/FileSaver.min");*/

		},
		
		exit: function(){
			//running Fiori?
			/*var oRendererExtensions = jQuery.sap.getObject('sap.ushell.renderers.fiori2.RendererExtensions');
            if(oRendererExtensions){
				//clean up custom icon from bar
				oRendererExtensions.removeHeaderEndItem(that.oFavoriteHeaderItem);
				that.oFavoriteHeaderItem.destroy();
				//clean up custom title
	            oRendererExtensions.setHeaderTitle("");
            }*/
		},
		
		onFavoritesHeaderItemPress: function(oEvent){
            var source = oEvent.getSource();
            // create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment("convista.com.arp.demo.view.ActionSheet",this);
				source.addDependent(this._actionSheet);
			}
			if(this._actionSheet.isOpen()){
				this._actionSheet.close();
			}else{
				this._actionSheet.openBy(source);	
			}
        }
	});
});