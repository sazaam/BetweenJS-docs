

var TWEENS 				= {} ;
var ALIASES 			= {} ;
var CLOSURES 			= {} ;



var Helper = Type.define({
	pkg:'org.libspark.betweenjs.helpers::Helper',
	domain:Type.appdomain,
	
	statics:{
		closures:CLOSURES,
		aliases:ALIASES,
		tweens:TWEENS,
		register: function(alias, closure){
			var args = [].slice.call(arguments) ;
			alias = args.shift() ;
			return CLOSURES[alias] = args.constructor == Array ? args.length > 1 ? args : args[0] : args ;
		},
		unregister:function(alias){
			delete CLOSURES[alias] ;
		},
		getClosure:function(alias){
			return CLOSURES[alias] ;
		},
		create:function(alias){
			var args = [].slice.call(arguments) ;
			alias = args.shift() ;
			
			var closure = this.getClosure(alias) ;
			closure.execute.apply(closure, [].concat(args)) ;
			
			return TweenControl.invoque(alias) ;
		},

		focus:function(e){
			var res = e.target ;
			
			if(e.type == 'focusOut'){
				res.focusReady() ;
			}
		},
		
		toggle:function(e, closure){
			var res = e.target ;
			if(res.opening){
				
				var ready = function(){
					var tw = Helper.create(closure, res).bind('complete', function(){
									
						// ON DATA, LAUNCH OPENING TWEENS
						res.ready() ;
						// clean up
						this.destroy() ;
						
					}).play() ;
				}
				
				
				
				// IF NO LOADINGS ARE REQUIRED
				if(!res.userData.urljade && !res.userData.urljson){
					
					return ready() ;
					
				}
				
				
				if(!res.template){ // IF TEMPLATE NOT LOAD
					
					// FETCHING DATA // (ASYNC) ONLY ONCE
					res.renderJade(
						res.userData.urljade, 
						res.fetch(
							res.userData.urljson, 
							res.userData.parameters
						), 
						function(){
							ready() ;
					})	
				}else{
					ready() ;
				}
			}else{
				// LAUNCH CLOSING TWEENS
				Helper.create(closure, res).bind('complete', function(){
					
					res.ready() ;
					// clean up
					this.destroy() ;
					
				}).play() ;	
			}
		}
		
		
	}
})

var TweenControl = Type.define({
	domain:Helper,
	pkg:'org.libspark.betweenjs.helpers::TweenControl',
	statics:{
		register: function(alias, tween){
			var args = [].slice.call(arguments) ;
			alias = args.shift() ;
			return TWEENS[alias] = args.constructor == Array ? args.length > 1 ? args : args[0] : args ;
		},
		unregister:function(alias){
			delete TWEENS[alias] ;
		},
		registerAlias: function(alias, tweenaliases){
			var args = [].slice.call(arguments) ;
			alias = args.shift() ;
			return ALIASES[alias] = args.constructor == Array ? args.length > 1 ? args : args[0] : args ;
		},
		unregisterAlias: function(alias){
			delete ALIASES[alias] ;
		},
		isRegistered:function(alias){
			return alias in TWEENS ;
		},
		isAliasRegistered:function(alias){
			return alias in ALIASES ;
		},
		find:function(aliases, result, l){
			
			aliases 	= [].slice.call(arguments),
			result 		= [],
			l			= aliases.length ;
			
			for(var i = 0 ; i < l ; i ++){
				
				var alias = aliases[i] ;
				
				if(typeof alias == 'string') alias = this.find.apply(this, [(alias in ALIASES) ? ALIASES[alias] : TWEENS[alias]]) ;
				else if(alias.constructor == Array) alias = this.find.apply(this, [].concat(alias)) ;
				
				result.push.apply(result, [].concat(alias)) ;
			}
			
			return result ;
		},
		invoque:function(aliases){
			return BetweenJS.serialTweens(this.find.apply(this, [].slice.call(arguments))) ;
		},
		getTween:function(alias){
			return TWEENS[alias] ;
		},
		getAlias:function(alias){
			return ALIASES[alias] ;
		}
		
	}
}) ;

var Closure = Type.define({
	pkg:'org.libspark.betweenjs.helpers::Closure',
	domain:Helper,
	constructor:Closure = function Closure(id, closure, params){
		var args 			= [].slice.call(arguments) ;
		this.id 			= args.shift() ;
		this.closure 		= args.shift() ;
		this.params 		= args ;
		
		Helper.register(id, this) ;
	},
	execute:function(params){
		var args = [].slice.call(arguments) ;
		return this.closure.apply(this, args.length ? args : this.params) ;
	}
})



module.exports = Helper ;