

var Displayer = require('./graphics/index.js') ;
var Events = require('./events/index.js') ;



module.exports = {
	
	/* 

		MAIN TOP SECTIONS

	*/
	

	focus : function(e){
		
		return Displayer.focus(e, 'topsections') ;
	},
	
	toggle : function(e){
		return Displayer.toggle(e, 'topsections') ;
	},
	/* 

		API INSIDE SECTIONS

	*/
	
	focus_api_main : function(e){
		
		return Displayer.focus(e, 'apilaunch') ;
		
	},
	
	toggle_api_main : function(e){
		
		return Displayer.toggle(e, 'apilaunch') ;
	},
	
	focus_api_item : function(e){
		
		return Displayer.focus(e, 'apiitemshow') ;
		
	},
	
	toggle_api_item : function(e){
		
		return Displayer.toggle(e, 'apiitemshow') ;
	}
	
	
}



