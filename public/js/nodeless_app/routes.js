
	// what steps are going to do graphically , extracted from './graphics.js'
	// on toggle (both opening / closing) and focus events
	
	var graphics = require('./graphics') ;
	var focus = graphics.focus ;
	var toggle = graphics.toggle ;
	var focus_api_main = graphics.focus_api_main ;
	var toggle_api_main = graphics.toggle_api_main ;
	var focus_api_item = graphics.focus_api_item ;
	var toggle_api_item = graphics.toggle_api_item ;
	
	// Express.app.set('liveautoremove', true) ; // erases live-generated regexp steps on close
	
	var jadepath = './jade/nodeless_app/' ;
	var jsonpath = './json/nodeless_app/' ;


	// hierarchy sections descriptor object written as in 'exports' object
	

	module.exports = {
		intro : (function(){
			var intro = function intro (req, res){ return res.ready() } ;
			
			intro.index = function intro_index (req, res){
				
				if(res.opening){
					res.userData.urljade = jadepath + 'intro.jade' ;
					res.userData.urljson = jsonpath + 'intro.json' ;
					res.userData.parameters = {response:res.parentStep} ;
				}
				return res ;
			} ;
			
			intro.index['@focus'] = focus ;
			intro.index['@toggle'] = toggle ;
			
			return intro ;
		})(),
		about : (function(){
			var about = function about (req, res){ return res.ready() } ;
			
			about.index = function about_index (req, res){
				
				if(res.opening){
					res.userData.urljade = jadepath + 'about.jade' ;
					res.userData.urljson = jsonpath + 'about.json' ;
					res.userData.parameters = {response:res.parentStep} ;
				}
				return res ;
			} ;
			
			about.index['@focus'] = focus ;
			about.index['@toggle'] = toggle ;
			
			return about ;
		})(),
		api : (function(){
			
			var api = function api (req, res){
				
				if(res.opening){
					res.userData.urljade = jadepath + 'api.jade' ;
					res.userData.urljson = jsonpath + 'api.json' ;
					res.userData.parameters = {response:res.parentStep} ;
				}
				
				return res ;
			} ;
			
			api['@focus'] = focus ;
			api['@toggle'] = toggle ;
			
			api.betweenjs = function api_betweenjs(req, res){
				
				if(res.opening){
					res.userData.urljade = jadepath + 'api_item.jade' ;
					res.userData.urljson = jsonpath + 'api_item.json' ;
					res.userData.parameters = {response:res} ;
				}
				
				return res ;
			}
			
			api.betweenjs['@focus'] = focus_api_main ;
			api.betweenjs['@toggle'] = toggle_api_main ;
			
			
			var routesJSON = require("./routes.json", {}, true) ;
			
			for(var s in routesJSON){
				api.betweenjs[s] = function api_betweenjs_api_item(req, res){ 
					if(res.opening){
						// res.userData.urljade = jadepath + 'api_item.jade' ;
						// res.userData.urljson = jsonpath + 'api_item.json' ;
						
					}
					
					return res ;
				}
				
				api.betweenjs[s]['@focus'] = focus_api_item ;
				api.betweenjs[s]['@toggle'] = toggle_api_item ;
				
				api.betweenjs[s]['userData'] = routesJSON[s] ;
				
			}
			
			
			
			
			
			return api ;
		})()
	} ;

	
	
	
	
	
	