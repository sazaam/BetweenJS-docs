
	// All required dependancies listed in package.json should be loaded now 


	// But still can load any time other required libs...
	

	// require('./strawnode_tests.js?env=' + module.params.env) ;
	// return ;
	

	var express = require('Express') ;
	var routes = require('./routes') ;
	
	var app = express() ;
	
	app
		.set('view engine', 'jade')
		.set('views', '/js/jade/')
		.set('address', {
			home:'intro',
			base:'undefined' !== typeof __parameters ? __parameters.base : location.protocol + '//' + location.host + location.pathname,
			useLocale:true
	}) ;

	app
		.listen('load', function(e){
			// PAGE LOAD	
			app.discard('load', arguments.callee) ;
			
			// WHEN ADDRESS SYSTEM REALLY STARTS
			if(app.isReady())
				app
					.createClient()
					.get('/', routes)
					.initJSAddress() ;
				
			else // WHEN REAL DEEPLINK ARRIVES WITHOUT HASH, RELOAD W/ HASH
				app.createClient() ;
			
		})
		.listen('unload', function(e){
			// PAGE UNLOAD
			app.discard('unload',arguments.callee) ;
			//app.destroy() ;
		}) ;	

	
