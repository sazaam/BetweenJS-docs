
require('../strawnode_modules/strawnode_modules/jquery-1.8.1.min.js') ;
require('../strawnode_modules/strawnode_modules/jquery.ba-hashchange.min.js') ;
require('../strawnode_modules/betweenjs.js') ;


require('../events/index.js', {arrows:1, touch:{mobile:1}}) ;


// var threeFX = require('./three/index.js', {viz3D:"viz3D"}) ;

var PARAMS = {
	EASE:Quad,
	TIME:0.25,
	DELAY:0.001
} ;


var Helper = require('./helper.js') ;

var TweenControl = Helper.TweenControl ;
var Closure = Helper.Closure ;



// TOPSECTIONS MAIN TWEEN
new Closure('topsections', function(res){
	
	var template 					= res.template ;
	var tweens 						= [] ;
	
	var id 							= res.id == 	'' ? res.parentStep.id : res.id ;
	var ind 						= res.id == '' ? res.parentStep.index : res.index ;
	
	var isAPI						= id == 'api' ;
	var isINTRO 					= id == 'intro' ;
	var isABOUT 					= id == 'about' ;
	
	var body 						= $(isAPI ? '.flow' : '.origin') ;
	var pagecont					= $(isAPI ? '.flow' : '.origin') ;
	
	var time 						= PARAMS.TIME ;
	var delay						= PARAMS.DELAY ;
	var ease 						= PARAMS.EASE ;
	
	var viewport3D = $("#viewport") ;
	
	if(res.opening){
		
		TweenControl.register('BACKGROUND_CHANGE', 
			// BACKGROUND CHANGE
			BetweenJS.delay(BetweenJS.create({
				target:$('#cinema'),
				to:{
					'left::%':-(100 * ind)
				},
				time:time,
				ease:ease.easeInOut
			}), delay, delay)
		) ;
		
		TweenControl.register('TEMPLATE_HIDE', 
			// TEMPLATE HIDING
			BetweenJS.func(function(){
				$('.sections .'+ id).removeClass('inactive') ;
				
				template.addClass('hidden') ;
				pagecont.addClass('zi30') ;
				template.css({'opacity':0})
			})
		) ;
		
		TweenControl.register('TEMPLATE_ADD', 
			// TEMPLATE ADDING
			BetweenJS.delay(BetweenJS.addChild(template, body), delay, delay)
		) ;
		
		TweenControl.register('TEMPLATE_SHOW', 
			// TEMPLATE ADDING
			BetweenJS.func(function(){
				template.removeClass('hidden') ;
			}),
			// TEMPLATE SHOWING
			BetweenJS.delay(BetweenJS.create({
				target:template,
				to:{
					'opacity':100
				},
				from:{
					'opacity':0
				},
				time:time,
				ease:ease.easeInOut
			}), delay, delay)
		) ;
		
		TweenControl.register('INTRO_SPECIAL', 
			// INTRO SPECIAL
			 BetweenJS.delay(BetweenJS.create({
				target:$('.maindesc'),
				to:{
					'font-size::em':3
				},
				time:time,
				ease:ease.easeInOut
				
			}), delay, delay),
			BetweenJS.func(function(){
				
				// threeFX.viz3D.enable(true, viewport3D, res) ;
				//if(!window.spinner)
				  //window.spinner = new Spinner3D('#viewport', 0xFFFFFF, .3, 8, 70, 500, 'cylinder', 'lambert').start() ;
				
				
			})
		) ;
		
		tweens = ['TEMPLATE_HIDE', 'TEMPLATE_ADD', 'TEMPLATE_SHOW', 'BACKGROUND_CHANGE'] ;
		
		if(isINTRO){
			tweens.splice(3, 0, 'INTRO_SPECIAL') ;
		}
		
	} else {
		
		TweenControl.register('INTRO_SPECIAL_OUT', 
			// INTRO SPECIAL
			BetweenJS.func(function(){
				
				//threeFX.viz3D.enable(false, viewport3D, res) ;
				
				//if(!window.spinner)
				  //window.spinner.stop() ;
				
				
			}),
			BetweenJS.delay(BetweenJS.create({
				target:$('.maindesc'),
				to:{
					'font-size::em':.5
				},
				time:time,
				ease:ease.easeInOut
			}), delay, delay)
		) ;
		
		TweenControl.register('TEMPLATE_SHOW_OUT', 
			// TEMPLATE FADING
			BetweenJS.delay(BetweenJS.create({
				target:template,
				to:{
					'opacity':0
				},
				time:time,
				ease:ease.easeInOut
			}), delay, delay)
		) ;
		
		TweenControl.register('TEMPLATE_ADD_OUT', 
			// TEMPLATE REMOVE
			BetweenJS.delay(BetweenJS.removeFromParent(template), delay, delay)
		) ;
		
		TweenControl.register('TEMPLATE_HIDE_OUT', 
			// TEMPLATE REMOVE
			BetweenJS.func(function(){
				$('.sections .'+ id).addClass('inactive') ;
				pagecont.removeClass('zi30') ;
			})
		) ;
		
		tweens = ['TEMPLATE_SHOW_OUT', 'TEMPLATE_ADD_OUT', 'TEMPLATE_HIDE_OUT'] ;
		
		if(isINTRO){
			tweens.unshift('INTRO_SPECIAL_OUT') ;
		}
		
	}
	
	return TweenControl.registerAlias(this.id, tweens) ;
	
}) ;



new Closure('apilaunch', function(res){
	
	var template 		= res.template ;
	var id 				= res.id == '' ? res.parentStep.id : res.id ;
	var ind 			= res.id == '' ? res.parentStep.index : res.index ;
	
	var page 			= $('.page') ;
	var cont 			= $('.pageinside') ;
	var head 			= $('.contenthead') ;
	var downlink		= $('.downlink') ;
	var backlink		= $('.backlink') ;
	
	var time 			= PARAMS.TIME ;
	var delay 			= PARAMS.DELAY ;
	var ease 			= PARAMS.EASE ;
	
	if(res.opening){
		
		TweenControl.register('API_UNHIDE', 
			// TEMPLATE HIDING
			BetweenJS.func(function(){
				downlink.addClass('none') ;
				backlink.removeClass('none') ;
			}),
			
			BetweenJS.delay(
				BetweenJS.create({
					target:head,
					to:{
						'height::%':22.5
					},
					time:time,
					ease:ease.easeInOut
			}), delay, delay),
			
			BetweenJS.addChild(template, cont),
			
			BetweenJS.delay(
				BetweenJS.create({
					target:template,
					to:{
						'opacity':100
					},
					from:{
						'opacity':0
					},
					time:time,
					ease:ease.easeInOut
			}), delay, delay)
		) ;
		
		tweens = ['API_UNHIDE'] ;
		
	}else{
		
		TweenControl.register('API_UNHIDE_OUT', 
			// TEMPLATE HIDING
			BetweenJS.delay(BetweenJS.create({
				target:template,
				to:{
					'opacity':0.0
				},
				time:time,
				ease:ease.easeInOut
			}), delay, delay),
			BetweenJS.removeFromParent(template),
			BetweenJS.func(function(){
				backlink.addClass('none') ;
				downlink.removeClass('none') ;
			}),
			BetweenJS.delay(BetweenJS.create({
				target:head,
				to:{
					'height::%':100
				},
				time:time,
				ease:ease.easeInOut
			}), delay, delay)
		) ;
		
		tweens = ['API_UNHIDE_OUT'] ;
		
	}
	
	return TweenControl.registerAlias(this.id, tweens) ;
})

var hexa = function(res, time, delay, ease, cond){
	
	var cont = res.userData.cont ;
	var hexas = cont.find('.shapes') ;
	var lim = 5 ;
	
	var arr = [] ;
	
	
	var nr = Math.random() * 360 ;
	var rescolor = BetweenJS.$.Color.HSVtoRGB({h:nr, s:100, v:85}) ;
	
	
	hexas.each(function(i, el){
		var stacolor = BetweenJS.$.Color.HSVtoRGB({h:nr, s:0, v:Math.random() * 100}) ;
		
		
		var h = $(el) ;
		
		var col = i % lim ;
		var row = Math.floor(i / lim) ;
		
		var sizeX = h.width() ;
		var sizeY = h.height() ;
		
		var biasX = 371 ;
		var offset = biasX / 2 * (row % 2) ;
		
		h.css("left", offset + (col * biasX)) ; 
		h.css("top", row * 106) ;
		
		arr[i] = BetweenJS.create({
			target:h,
			from:{
				"margin-left::PX":-400 + (Math.random() * 800),
				"margin-top::PX":-200 + (Math.random() * 400),
				"color":stacolor,
			},
			to:{
				"margin-left::PX":0,
				"margin-top::PX":0,
				"color":rescolor,
			},
			time:.25 + .005*i, 
			ease:Expo.easeOut
		}) ;
		
		
		
	})

	var loctime = .75 ;
	arr.push(BJS.create({
		target:$('.frameline, .pentoneblock'),
		to:{
			background:rescolor
		},
		time:loctime,
		ease:Linear.easeOut
	})) ;
	arr.push(BJS.create({
		target:$('.pentoneB'),
		to:{
			color:rescolor
		},
		time:loctime,
		ease:Linear.easeOut
	})) ;
	arr.push(BJS.create({
		target:$('.pentoneborder'),
		to:{
			'border-color':rescolor
		},
		time:loctime,
		ease:Linear.easeOut
	})) ;
	// var tw ;
	// if(cond){
	// 	tw = BetweenJS.parallelTweens(arr) ;
	// }else{
	// 	tw = BetweenJS.reverse(BetweenJS.parallelTweens(arr)) ;
	// }
	return BetweenJS.parallelTweens(arr) ;
	
}

new Closure('apiitemshow', function(res){
	
	var template 		= res.template ;
	var id 				= res.id == '' ? res.parentStep.id : res.id ;
	var ind 			= res.id == '' ? res.parentStep.index : res.index ;
	
	var page 			= $('.page') ;
	var cont 			= $('.pageinside') ;
	var head 			= $('.contenthead') ;
	var downlink		= $('.downlink') ;
	var backlink		= $('.backlink') ;
	
	var time = PARAMS.TIME ;
	var delay = PARAMS.DELAY ;
	var ease = PARAMS.EASE ;
	
	var s = res.userData.cont = $('#' + res.id) ;
	var r = $('.rest') ;
	var shapes = res.userData.cont.find('.shapes') ;
	var animback = res.userData.cont.find('.animback') ;
	
	if(res.opening){
		var xx = s.position().top ;
		
		TweenControl.register('API_ITEM_SHOW', 
			
			// TEMPLATE HIDING
			
			BetweenJS.parallel(
				BetweenJS.func(function(){
					s.addClass('opened') ;
				}),
				BetweenJS.create({
					target:page,
					to:{
						scrollTop:xx
					},
					time:time,
					easing:ease
				}),
				hexa(res, time, delay, ease, res.opening),
				BetweenJS.create({
					target:animback,
					to:{
						"alpha":100
					},
					from:{
						"alpha":0
					},
					time:time, 
					easing:ease
				})
			)
		) ;
		
		tweens = ['API_ITEM_SHOW'] ;
		
	}else{
		
		// trace("close")
		TweenControl.register('API_ITEM_SHOW_OUT', 
			// TEMPLATE HIDING
			BetweenJS.func(function(){
				// s.removeClass('darkshadeBG') ;
				animback.css("opacity", 0) ;
				s.removeClass('opened') ;
				
				res.ready() ;
			})
		) ;
		
		tweens = ['API_ITEM_SHOW_OUT'] ;
		
	}
	
	return TweenControl.registerAlias(this.id, tweens) ;
})

module.exports = Helper ;
