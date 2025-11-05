
var THREE, effects ;
var support = {
	canvas:!!window.HTMLCanvasElement,
	webgl:!!window.WebGLRenderingContext,
	isSmallScreen:(function(){
		// Galaxy Fold 768 x 1076

		return !!window.matchMedia("only screen and (max-width: 769px)").matches
		
		// THAT CHANGE REMOVES THE HOMEPAGE SCREEN EFFECT
		// return true ;
	})(),
	okFX:false
}

// WILL KIP ALL THIS, THREE + EFFECTS LOADING
// if(1){
if((!support.isSmallScreen) && support.canvas && support.webgl){
	THREE = window.THREE = require('./build/three.js') ;
	effects = require('./effects.js') ;
	support.okFX = true ;
}


require('./build/js/controls/OrbitControls.js')
require('./build/js/controls/TrackballControls.js')
require('./build/js/loaders/GLTFLoader.js')
require('./build/js/loaders/DRACOLoader.js')
require('./build/js/loaders/RGBELoader.js') ;
require('./build/js/WebGL.js') ;


var getGTLFLoader = ()=>{
	var gtlfloader = new THREE.GLTFLoader();
	var dracoLoader = new THREE.DRACOLoader();
	dracoLoader.setDecoderPath( '/js/nodeless_app/graphics/three/build/js/libs/draco/gltf/');
	gtlfloader.setDRACOLoader( dracoLoader );
	return gtlfloader;
} ;

var getIMGLoader = ()=>{
	var imgloader = new THREE.RGBELoader()
	.setDataType( THREE.UnsignedByteType )
	.setPath('/hdr/') ;
	return imgloader ;
}
// this utility function allows you to use any three.js
// loader with promises and async/await
var THREELoad = (loader, url) => {
	var time = performance.now();
	return new Promise((resolve, reject) => {
		loader.load(url, data=> {data.loadingtime = ( performance.now() - time ).toFixed( 2 ) ;return resolve(data)}, null, reject);
	});
}
				

var spots = [
	(()=>{
		var s = new THREE.SpotLight( 0xffffff, 1 );
		s.position.set( 5, 10, 5 );
		s.angle = 0.50;
		s.penumbra = 0.75;
		s.intensity = 100;
		s.decay = 1.3;
		return s ;
	}),
	(()=>{
		var s = new THREE.SpotLight( 0x775BBC, 1 );
		s.position.set( -5, 10, -5 );
		s.angle = 0.50;
		s.penumbra = 0.75;
		s.intensity = 100;
		s.decay = 1.3;
		return s ;
	}),
	(()=>{
		var s = new THREE.SpotLight( 0xFFFFFF, 1 );
		s.position.set( 0, -10, 0 );
		s.angle = 0.50;
		s.penumbra = 0.75;
		s.intensity = 100;
		s.decay = 1.3;
		return s ;
	})
] ;

var ground = (() =>{
	var g = new THREE.Mesh( 
		new THREE.PlaneBufferGeometry( 2048, 2048 ), 
		new THREE.MeshStandardMaterial( { color: 0xaaaaaa, transparent:true, opacity:.8, roughness:.4 } )
	) ;
	
	g.receiveShadow = !! SCI.addShadows;

	if ( SCI.groundPosition ) {
		g.position.copy( SCI.groundPosition ) ;
	}
	
	g.rotation.x = -Math.PI / 2 ;
	
	return g ;
}) ;


var geoms = (res) =>{
		
	var opt = {
		time:2.5,
		ease:Expo.easeInOut
	}
	
	var obj = new THREE.Group() ;
	var gcoords = obj.rotation ;
	
	
	var diam = 1 ;
	var rad = diam / 2 ;
	var thickness = .02 ;
	
	var circles = [{x:0, y:0, z:0}, {x:0, y:0, z:0}, {x:0, y:0, z:0}].map( (coords) => {
		
		var geometry = new THREE.CylinderGeometry( rad, rad, thickness, 6 ) ;
		var material = new THREE.MeshBasicMaterial( { color: 0x050505 , side:THREE.DoubleSide, reflectivity: 1, envMap: SCI.envMap} ) ;
		var circle = new THREE.Mesh( geometry, material ) ;
		obj.add(circle) ;
		
		return circle ;
		
	})
	
	var polytw = BetweenJS.parallelTweens(circles.map((circ, i)=>{
		return BTW.create({
			target:circ,
			to:{
				position:{
					x:1.2*(i-1)
				},
				rotation:{
					x:Math.PI
				}
			},
			time:opt.time,
			ease:opt.ease
		}) ;
	})) ;
	
	var tw = BTW.parallel(
		BTW.create({
			target:obj,
			to:{
				rotation:{
					x:0,
					y:Math.PI * 2,
					z:0	
				},
				position:{
					x:0,
					y:.2,
					z:0	
				}
			},
			time:opt.time,
			ease:opt.ease
		}),
		polytw
	) ;
	var tw2 = res.userData.libTW = BTW.serial(tw, BTW.reverse(tw)) ;
	tw2.stopOnComplete = false ;
	
	// tw2.play() ;
	
	return obj ;
}

var viz3D = {
  settings:{
		scenes:{
			Machine: {
			name: 'DKT Machine (MicroGravure)',
			
			gtlf: '/model/shoe.glb',
			
			author: 'Sazaam',
			authorURL: 'https://www.sazaam.net/',
			cameraPosition: new THREE.Vector3( 0.02, 0, 3 ),
			
			objectRotation: new THREE.Euler( 0, 0, 0 ),
			objectPosition: new THREE.Vector3( 0, -.4, 0 ),
			
			addLights:spots,
			// addShadows:true,
			// groundPosition: new THREE.Vector3( 0, -1.04, 0 ),
			envMap: 'venice_sunset_1k.hdr',
			showEnvMap:false
		}
		},
		state:{
			scene: 'Machine',
			variant:'variant_1'
		}
	},
  enable:function(cond, canvascontainer, res){
    
    // var res = e.target ;
		var ANIM_TW ;
		
    if(cond){
      
			
      if(!res.userData.ANIM_TW){
	      
				var state, scene, renderer, controls, camera ;
				var lights ;
				
	      //COMPOSITING
	      // var composer, effect ;
				
				var render = () => {
	        renderer.render( scene, camera );
	      }
				
				var onWinResize = () => {
	        camera.aspect = canvascontainer.width() / canvascontainer.height() ;
	        camera.updateProjectionMatrix() ;
	        renderer.setSize( canvascontainer.width(), canvascontainer.height() ) ;
	      }
				
	      // const clock = new THREE.Clock();
				
				
				// Renderer
				var setRenderer = () => {
	        renderer = new THREE.WebGLRenderer( { antialias: true,  alpha: true } );
	        renderer.setPixelRatio( window.devicePixelRatio );
	        
	        renderer.setSize( canvascontainer.width(), canvascontainer.height() );
	        // renderer.setClearColor(0xDDDDDD, 1);
	        renderer.outputEncoding = THREE.sRGBEncoding;
	        renderer.toneMapping = THREE.ACESFilmicToneMapping;
	        renderer.toneMappingExposure = 1;
	        renderer.physicallyCorrectLights = true;
	        canvascontainer.append( renderer.domElement );
					
					return renderer ;
				} ;
				
				// Scene
				var setScene = () => {
	        return new THREE.Scene() ;
				}
				
				// Camera
				var setCamera = () => {
	        var cam = new THREE.PerspectiveCamera( 45, canvascontainer.width() / canvascontainer.height(), 0.25, 20 ) ;
					scene.add( cam ) ;
					return cam ;
				}
				
				// Controls
				var setControls = () => {
					return new THREE.OrbitControls( camera, renderer.domElement ) ;
				}
				
				// Lights
				var setLights = () => {
					return SCI.addLights.map((spot)=>{
						
						s = spot() ;
						
						if ( SCI.addShadows ) {
							s.castShadow = true;
							s.shadow.bias = 0.0001;
							s.shadow.mapSize.width = 2048;
							s.shadow.mapSize.height = 2048;
						}	
						
						scene.add( s );
						return s ;
					}) ;
				}
				
				
				
				

				async function loads(SCI) {
					
					// if images is required
							// for(...)
					
					if(!!SCI.envMap){
						var imgData = await THREELoad(getIMGLoader(), SCI.envMap) ;
						// console.info( 'Load time: ' + imgData.loadingtime + ' ms.' );
						
						const pmremGenerator = new THREE.PMREMGenerator( renderer );
						pmremGenerator.compileEquirectangularShader();
						
						SCI.envMap = pmremGenerator.fromEquirectangular( imgData ).texture ;
						pmremGenerator.dispose() ;
						
						if(SCI.showEnvMap) background = envMap ;
					}
					
					
					
					// if models are required
							// for(...)
					if(!!SCI.gtlf){
						var gltfData = await THREELoad(getGTLFLoader(), '/model/shoe.glb') ;
						console.info( 'Load time: ' + gltfData.loadingtime + ' ms.' );
						
						var gltf = gltfData;
						var gscene = gltf.scene ;
						
						
						if(gltf.userData.gltfExtensions){
							// Details of the KHR_materials_variants extension used here can be found below
							// https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_variants
							const parser = gltf.parser;
							const variantsExtension = gltf.userData.gltfExtensions[ 'KHR_materials_variants' ];
							const variants = variantsExtension.variants.map( ( variant ) => variant.name );
							
							var selectVariant = ( gscene, parser, extension, variantName ) => {
								
								const variantIndex = extension.variants.findIndex( ( v ) => v.name.includes( variantName ) ) ;
								
								gscene.traverse( async ( object ) => {

									if ( ! object.isMesh || ! object.userData.gltfExtensions ) return ;
									const meshVariantDef = object.userData.gltfExtensions[ 'KHR_materials_variants' ] ;
									if ( ! meshVariantDef ) return ;
									if ( ! object.userData.originalMaterial ) {
										object.userData.originalMaterial = object.material;
									}

									var mapping = meshVariantDef.mappings.find( ( mapping ) => mapping.variants.includes( variantIndex ) ) ;

									if ( mapping ) {
										object.material = await parser.getDependency( 'material', mapping.material ) ;
										parser.assignFinalMaterial(object) ;
									} else {
										object.material = object.userData.originalMaterial ;
									}

								} ) ;
								
								// render() ;
								
							}
							
							selectVariant( gscene, parser, variantsExtension, SCI.state.variant ) ;
							
							$('<div id="uinav">').addClass('abs top0 right0 pad sizeSm').appendTo($("#universe")) ;
							
							$(variants).each((i, el) => {
								
								$('<a href="#">').prependTo($("#uinav")).addClass('fw6 floatL variantChange padSm').text(variants[i]).on('click', (e) => {
									e.preventDefault() ;
									e.stopPropagation() ;
									
									selectVariant(gscene, parser, variantsExtension, el) ;
									
								}) ;
							})
							
							
							SCI.gscene = gscene ;
								
						}
						
					}
				
					
					return 'sazaam' ;
				}
				
				
				async function setup(){
					
					var SET = viz3D.settings ;
					
					// 0. declare scene state
					
					SCI = SET.scenes[ SET.state.scene ] ;
					SCI.state = SET.state ;
					
					renderer = setRenderer() ;
					scene = setScene() ;
					camera = setCamera() ;
					controls = setControls() ;
					
					window.addEventListener( 'resize', onWinResize, false );
					
					
					// LIGHTS
	        if (!!SCI.addLights) {
						
						lights = setLights() ;
						
						
	        }
					// SHADOWS
	        if (!!SCI.addShadows) {
	          renderer.shadowMap.enabled = true;
	          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	        }
					//GROUND
	        if (!!SCI.addGround) {
						scene.add( SCI.ground = SCI.addGround() ) ;
	        }
					
					// 1. loadings
					var p = await loads(SCI).catch(error => { console.error(error); }) ;
					
					/// CAMERA
					if ( SCI.cameraPosition ) {
						camera.position.copy( SCI.cameraPosition ) ;
					}
					
					/// CONTROLS
					if ( SCI.center ) {
						controls.target.copy( SCI.objectPosition ) ;
					}
					
					
					
					/// LOCROTSCALE
					if ( SCI.objectPosition ) {
						if(!!SCI.gscene) SCI.gscene.position.copy( SCI.objectPosition );
						
						
						if ( SCI.addLights ) {
							lights.map( (spot) => {
								spot.target.position.copy( SCI.objectPosition );	
							})								
						}
						
						
						
					}
					
					if(!!SCI.gscene) scene.add( SCI.gscene ) ;
					
					ANIM_TW = res.userData.ANIM_TW = new BTW.$.Animation(undefined, render) ;
					ANIM_TW.start() ;
					
					
				}
				
				setup() ;
				
				
			}else{
				
				ANIM_TW = res.userData.ANIM_TW ;
				ANIM_TW.start() ;
				if(res.userData.libTW) res.userData.libTW.play() ;
				
			}
			
			
    }else{
			if(res.userData.libTW) res.userData.libTW.stop() ;
			ANIM_TW = res.userData.ANIM_TW ;
			ANIM_TW.halt() ;
			
			
			// window.removeEventListener( 'resize', onWinResize, false ) ;
			
    }

  }
}




var geoms2 = (res, mat) =>{
		
	var opt = {
		time:2.5,
		ease:Expo.easeInOut
	}
	
	var obj = new THREE.Group() ;
	var gcoords = obj.rotation ;
	var hexes = [] ;
	
	var diam = .5 ;
	var rad = diam / 2 ;
	var thickness = .03 ;
	var space = 0.01 ;
	
	var matrix = [
		2,
		3,
		4,
		5,
		6,
		7,
		6,
		5,
		4,
		3,
		2
	] ;
	
	
	var rows, cols ;
	// var max = rows * cols ;
	
	
	var offset = diam + rad + space/2 ;
	
	var sqr = (Math.sqrt(3)/2) + space ;
	var mul = sqr * rad ;
	
	
	var l = matrix.length ;
	for(var i = 0 ; i < l ; i ++){
		var ll = matrix[i] ;
		
		for(var j = 0 ; j < ll ; j++){
			
			rows = Math.max(rows?? 0, i) ;
			cols = Math.max(cols?? 0, j) ;
			
			
			var r = i ;
			var c = j ;
		
			var geometry = new THREE.CylinderGeometry( rad, rad, thickness, 6 ) ;
			// material = new THREE.MeshPhongMaterial( {opacity:.8, color:0x900A0B}) ;
			
			var posx = (c - ll/2) * offset + offset/2 ;
			var posz = mul * (r- l/2) + mul/2 ;
			
			var rr = 2 ;
			
			var loader = new THREE.TextureLoader();
			var tex = loader.load('/maps/BetweenJS.jpg') ;
			
			var mm = 3 ;
			
			tex.repeat.set(rad/mm, (rad/mm) * Math.sqrt(3) ) ;
			// material = new THREE.MeshBasicMaterial( {opacity:.1, color:0x050505, reflectivity:1, envMap:SCI.envMap}) ;
			material = new THREE.MeshBasicMaterial( {color:0x121212, reflectivity:1, envMap:SCI.envMap, map: tex}) ;
			
			material.map.offset.x = (posx * diam/3 ) +.45 ;
			material.map.offset.y = -(posz * diam/3 * Math.sqrt(3) ) +.45 ;
			
			var hex = new THREE.Mesh( geometry, material ) ;
			
			hex.rotation.y = Math.PI / 2 ; // SET in the right visual orientation
			
			hex.position.x = posx ;
			hex.position.z = posz ;
			
			hex.rotation.x = - Math.PI/2 ;
			
			hex.scale.x = 0 ;
			hex.scale.y = 0 ;
			hex.scale.z = 0 ;
			
			
			obj.add(hex) ;
			
			hexes.push(hex) ;
		}
	
	}
	
	
	obj.rotation.copy(new THREE.Euler( Math.PI / 2, 0, 0 )) ;
	
	
	
	hexes = hexes.sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5) ;
		var hexpos = hexes.map((hex, i)=>{
			return {x:hex.position.x, z:hex.position.z, y:hex.position.y} ;
		}) ;
	
	var tww = function(){
		
		var polytw = BetweenJS.parallelTweens(hexes.map((hex, i)=>{
			
			var pos = hexpos[i] ;
			
			var xx = cols * offset ;
			var yy = rows * mul ;
			// hex.position.x = -xx + Math.random() * xx * 2 ;
			// hex.position.z = yy + Math.random() * -yy * 2 ;
			// hex.position.x = 0 ;
			// hex.position.z = 0 ;
			// hex.position.y = Math.random () * 1 ;
			// var mmx = -xx + Math.random() * xx * 2 ;
			// var mmy = yy + Math.random() * -yy * 2 ;
			return BTW.parallel(
				BTW.create({
					target:hex,
					to:{
						// position:pos,
						scale:{
							x:1,y:1,z:1
						},
						rotation:{
							x:0
						}
					},
					time:.1 + (.025* i),
					ease:Expo.easeOut
				})
			) ;
		})) ;
		
		var tw = BTW.delay(polytw, !!res.userData.libTW ? .1 : 1, 1) ;
		
		var tw2 = res.userData.libTW = BTW.serial(tw, BTW.reverse(tw)) ;
		tw2.onComplete = function(){
			tw2.destroy() ;
			tww() ;
		}
		
		tw2.play() ;
	} ;
	
	tww() ;
	
	
	return obj ;
}

var geoms3D = {
	settings:{
		scenes:{
				Shapes: {
				name: 'Shapes',
				
				geoms: geoms2,
				
				author: 'Sazaam',
				authorURL: 'https://www.sazaam.net/',
				cameraPosition: new THREE.Vector3( 0.02, 0, 3 ),
				objectRotation: new THREE.Euler( Math.PI / 2, 0, 0 ),
				objectPosition: new THREE.Vector3( 0, 0, 0 ),
				
				groupRotation: new THREE.Euler( 0, 0, 0 ),
				
				addLights:spots,
				
				// envMap: 'nebula_test.hdr',
				envMap: 'venice_sunset_1k.hdr',
				// envMap: 'to.hdr',
				// envMap: 'test.hdr',
				showEnvMap:false,
				// showEnvMap:true,
			}
		},
		state:{
			scene: 'Shapes'
		}
	},
	enable:function(cond, canvascontainer, res){
    
		var ANIM_TW ;
		
    if(cond){
      
			
      if(!res.userData.ANIM_TW){
	      
				var state, scene, renderer, controls, camera ;
				var lights ;
				
	      //COMPOSITING
	      // var composer, effect ;
				
				var render = () => {
	        renderer.render( scene, camera );
	      }
				
				var onWinResize = () => {
	        camera.aspect = canvascontainer.width() / canvascontainer.height() ;
	        camera.updateProjectionMatrix() ;
	        renderer.setSize( canvascontainer.width(), canvascontainer.height() ) ;
	      }
				
	      // const clock = new THREE.Clock();
				
				
				// Renderer
				var setRenderer = () => {
	        renderer = new THREE.WebGLRenderer( { antialias: true,  alpha: true } );
	        renderer.setPixelRatio( window.devicePixelRatio );
	        
	        renderer.setSize( canvascontainer.width(), canvascontainer.height() );
	        // renderer.setClearColor(0xDDDDDD, 1);
	        renderer.outputEncoding = THREE.sRGBEncoding;
	        renderer.toneMapping = THREE.ACESFilmicToneMapping;
	        renderer.toneMappingExposure = 2;
	        renderer.physicallyCorrectLights = true;
	        canvascontainer.append( renderer.domElement );
					
					return renderer ;
				} ;
				
				// Scene
				var setScene = () => {
	        return new THREE.Scene() ;
				}
				
				// Camera
				var setCamera = () => {
	        var cam = new THREE.PerspectiveCamera( 45, canvascontainer.width() / canvascontainer.height(), .25, 20 ) ;
					scene.add( cam ) ;
					return cam ;
				}
				
				// Controls
				var setControls = () => {
					return new THREE.OrbitControls( camera, renderer.domElement ) ;
				}
				
				// Lights
				var setLights = () => {
					return SCI.addLights.map((spot)=>{
						
						s = spot() ;
						
						if ( SCI.addShadows ) {
							s.castShadow = true;
							s.shadow.bias = 0.0001;
							s.shadow.mapSize.width = 2048;
							s.shadow.mapSize.height = 2048;
						}	
						
						scene.add( s );
						return s ;
					}) ;
				}
				
				
				
				

				async function loads(SCI) {
					
					// if images is required
							// for(...)
					
					if(!!SCI.envMap){
						const pmremGenerator = new THREE.PMREMGenerator( renderer );
						pmremGenerator.compileEquirectangularShader();
						
						var imgData = await THREELoad(getIMGLoader(), SCI.envMap) ;
						console.info( 'Load time: ' + imgData.loadingtime + ' ms.' );
						
						SCI.envMap = pmremGenerator.fromEquirectangular( imgData ).texture ;
						SCI.envMapIntensity = 2 ;
						pmremGenerator.dispose() ;
						
						if(SCI.showEnvMap) scene.background = SCI.envMap ;
					}
					
					if(!!SCI.geoms){
						
						
						
						// var gg = new THREE.TorusKnotGeometry( 1, .3, 200, 32);
						// var mat = new THREE.MeshBasicMaterial( {transparent:true, opacity:.8, color:0xd60000, reflectivity:1, envMap:SCI.envMap}) ;
						// mat = new THREE.MeshDepthMaterial( {transparent:true, opacity:.8, color:0xFFFFFF, precision:"highp"}) ;
						// var cube = new THREE.Mesh( gg, mat) ;
						// cube.position.copy(new THREE.Vector3( 0, 0, 0 )) ;
						
						// scene.add(cube) ;
						// trace(cube)
						
						
						/* 
						
						var gg2 = new THREE.CubeGeometry( 1, 1, 1);
						var mat2 = new THREE.MeshBasicMaterial( {opacity:1, color:0xd60000, reflectivity:1, envMap:SCI.envMap}) ;
						var cube2 = new THREE.Mesh( gg2, mat2) ;
						cube2.position.copy(new THREE.Vector3( 0, 0, 3 )) ;
						
						scene.add(cube2) ;
						
						
						
						 */
						
						SCI.gscene = SCI.geoms(res) ;
						
						
						
						
					}
					
					// scene.rotateX(.5);
					// scene.rotateY(Math.PI);
					
					
					// scene.rotateX(-Math.PI);
					scene.rotateZ(.2);
					scene.rotateY(Math.PI/2);
					
					return 'sazaam' ;
				}
				
				
				async function setup(){
					
					var SET = geoms3D.settings ;
					
					// 0. declare scene state
					
					SCI = SET.scenes[ SET.state.scene ] ;
					SCI.state = SET.state ;
					
					renderer = setRenderer() ;
					scene = setScene() ;
					camera = setCamera() ;
					controls = setControls() ;
					
					window.addEventListener( 'resize', onWinResize, false );
					
					
					// LIGHTS
	        if (!!SCI.addLights) {
						
						// lights = setLights() ;
						// var directionalLight = new THREE.DirectionalLight( 0xffffff , 1);
						// directionalLight.position.x = 0;
						// directionalLight.position.y = -1;
						// directionalLight.position.z = 1;
						// scene.add( directionalLight );
				
	        }
					// SHADOWS
	        if (!!SCI.addShadows) {
	          renderer.shadowMap.enabled = true;
	          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	        }
					//GROUND
	        if (!!SCI.addGround) {
						scene.add( SCI.ground = SCI.addGround() ) ;
	        }
					
					// 1. loadings
					var p = await loads(SCI).catch(error => { console.error(error); }) ;
					
					/// CAMERA
					if ( SCI.cameraPosition ) {
						camera.position.copy( SCI.cameraPosition ) ;
					}
					
					/// CONTROLS
					if ( SCI.center ) {
						controls.target.copy( SCI.objectPosition ) ;
					}
					
					
					
					/// LOCROTSCALE
					if ( SCI.objectPosition ) {
						if(!!SCI.gscene) {
							
							// SCI.gscene.position.copy( SCI.objectPosition );
							// SCI.gscene.rotation.copy( SCI.objectRotation );
							
						}
						
						
						if ( SCI.addLights && !!lights) {
							lights.map( (spot) => {
								spot.target.position.copy( SCI.objectPosition );	
							})								
						}
						
						
						
					}
					
					if(!!SCI.gscene) scene.add( SCI.gscene ) ;
					
					ANIM_TW = res.userData.ANIM_TW = new BTW.$.Animation(undefined, render) ;
					ANIM_TW.start() ;
					
					
				}
				
				setup() ;
				
				
			}else{
				
				ANIM_TW = res.userData.ANIM_TW ;
				ANIM_TW.start() ;
				if(res.userData.libTW) res.userData.libTW.play() ;
				
			}
			
			
    }else{
			if(res.userData.libTW) res.userData.libTW.stop() ;
			ANIM_TW = res.userData.ANIM_TW ;
			ANIM_TW.halt() ;
			
			
			// window.removeEventListener( 'resize', onWinResize, false ) ;
			
    }

  }
}


var Spinner3D = Type.define({
	pkg:'org.libspark',
	domain:Type.appdomain,
	constructor:function Spinner3D(id, color, alpha, max,  factor, radius , geom, shader){
			
		var sp = this ;
		var tg = sp.tg = $(id) ;
		var color = sp.color = color ;
		
		var alpha = sp.alpha = alpha || .5 ;
		var factor = factor || 2000 ;
			
			
			////////////////////////
		var container;
		var camera, scene, projector, renderer;
		var particleMaterial;

		var objects = sp.objects = [];

		
		container = tg ;
		

		camera = sp.camera = new THREE.PerspectiveCamera( factor, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 300, 500);

		scene = sp.scene = new THREE.Scene();

		scene.add( camera );
		
		if(!window.isSafariMobile){
			var directionalLight = sp.directionalLight =  new THREE.DirectionalLight( 0xffffff , 1);
			//directionalLight.position.x = Math.random() - 0.5;
			directionalLight.position.x = 0;
			// directionalLight.position.y = Math.random() - 0.5;
			directionalLight.position.y = 0;
			// directionalLight.position.z = Math.random() - 0.5;
			directionalLight.position.z = 400;
			directionalLight.position.normalize();
			scene.add( directionalLight );
			
			var pointLight = sp.pointLight =  new THREE.PointLight( 0xFFFFFF, 1 );
			pointLight.position.z = -450;
			pointLight.position.y = 250;
			scene.add( pointLight );
		
			
		}
		
		//var geometry = new THREE.CubeGeometry( 100, 100, tick );
		
							
		var geometry ;
		switch(geom){
			
			case 'star' :
				var californiaPts = [];
				
				var intersections = 10 ;
				
				for(var j = 0 ; j < intersections ; j++){
					
					var rand = Math.random() * 50 ;
					var ind = (j)/intersections ;
					
					var dia = 100 + ((j % 2 == 0)? 0: -60) ;
					
					var rX = Math.cos((Math.PI * 2) * ind) * dia ;
					var rY = Math.sin((Math.PI * 2) * ind)  * dia;
					
					var pX = Math.round(rX) ;
					var pY = Math.round(rY) ;
					
					californiaPts.push( new THREE.Vector2 ( pX, pY) );
				}
				
				var star = new THREE.Shape( californiaPts );
				var geometry = new THREE.ExtrudeGeometry(star, {depth:7, bevelEnabled:false});
			break;
			
			case 'cylinder' :
				var geometry = new THREE.CylinderGeometry( 100, 100, 2, 6 );
			break;
			case 'plane' :
				var geometry = new THREE.CubeGeometry( 100, 100, 1);
			break;
			case 'thickplane' :
				var geometry = new THREE.CubeGeometry( 100, 100, 10);
			break;
			case 'thinplane' :
				var geometry = new THREE.CubeGeometry( 100, 100, 2);
			break;
			case 'cube' :
				var geometry = new THREE.CubeGeometry( 100, 100, 100);
			break;
			
		}
		
		
		for ( var i = 0; i < max; i ++ ) {
			
			var mat ;
			if(window.isSafariMobile || shader !== 'lambert'){
				mat = new THREE.MeshBasicMaterial({color:color, opacity:alpha }) ;
			}else{
				mat = new THREE.MeshLambertMaterial( {opacity:alpha, flatShading:true, color:color }) ;
			}
			
			var object = new THREE.Mesh( geometry, mat );
			
			var rad = radius ;
			var ind = i/max ;
			
			var x = Math.cos(ind * Math.PI * 2) * rad ;
			var y = Math.sin(ind * Math.PI * 2) * rad ;
			var z = 0 ;//Math.cos(ind * Math.PI * 2) * rad ;
			
			object.position.x = x ;
			object.position.y = y ;
			object.position.z = x ;

			// object.scale.x = Math.random() * 2 + 1;
			// object.scale.y = Math.random() * 2 + 1;
			// object.scale.z = Math.random() * 2 + 1;
			
			object.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
			object.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
			object.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;

			object.hover =  function(cond){
				var n = this ;
				if(cond){
					n.originalAlpha = n.material.opacity ;
					//n.originalColor = n.material.color.getHex() ;
					n.material.opacity = n.originalAlpha + .4 ;
					//n.material.color.setHex('0xA40133') ;
					n.overed = true ;
				}else{
					if(n.originalAlpha !== undefined ){
						n.material.opacity = n.originalAlpha ;
						//n.material.color.setHex(n.originalColor) ;
						n.originalAlpha = undefined ;
						//n.originalColor = undefined ;
						n.overed = false ;
					}
				}
			}
			
			
			scene.add( object );

			objects.push( object );

		}

		// projector = sp.projector = new THREE.Projector();

		renderer = new THREE.WebGLRenderer( { antialias: true,  alpha: true } );
		renderer.setSize( tg.width(), tg.height());
		
		sp.canvas = $(renderer.domElement) ;
		
		container.append( renderer.domElement );

		
		var radius = 1200 ;
		if(window.isSafariMobile){
				radius = 600 ;
			}
			
		var theta = sp.theta = 0;
		var ind = sp.ind =  1 ;
		var speed = sp.speed = 0 ;
		
		sp.old = -1 ;
		
		
		// var ctx = sp.canvas.context.getContext('2d') ;
		// ctx.strokeStyle = "#A40133" ;
		
		var render = sp.render = function() {
			// ctx.clearRect ( 0 , 0, window.innerWidth, window.innerHeight);
			if(sp.speed > 0) sp.speed *= .8 ;
			else if(sp.speed < 0) sp.speed *= .8 ;
			else{
				sp.speed = 0 ;
			}
			
			sp.theta += (0.2 + sp.speed) * sp.ind;
			
			
			var l = sp.objects.length ;
			
			for ( var i = 0; i < l; i ++ ) {
				
				var o = sp.objects[i] ;
				
				o.rotation.x += (Math.random() * 100)/36000 ;
				o.rotation.y += (Math.random() * 100)/36000 ;
				
			}
			
			
			
			
			camera.position.x = radius * Math.sin( sp.theta * Math.PI / 360 );
			camera.position.y = radius * Math.sin( sp.theta * Math.PI / 360 );
			camera.position.z = radius * Math.cos( sp.theta * Math.PI / 360 );
			
			
			
			sp.camera.lookAt( sp.scene.position );
			if(!window.isSafariMobile){
				sp.directionalLight.position = sp.scene.position ;
				sp.directionalLight.lookAt(sp.camera.position) ;
				
				sp.pointLight.position = sp.camera.position ;
				sp.pointLight.lookAt(sp.scene.position) ;
			}
			
			renderer.render( sp.scene, camera );
			
			
		}
		
		
		sp.once = true ;
		
	},
	start : function(){
		var sp = this ;
		
		ANIM_TW = sp.ANIM_TW = new BTW.$.Animation(undefined, sp.render) ;
		ANIM_TW.start() ;
		
		return this ;
	},
	stop : function(){
		var sp = this ;
		 
		sp.ANIM_TW.stop() ;
		
		return this ;
	}
})






module.exports = {
	support:support,
  	//viz3D:geoms3D
	viz3D:viz3D
}





/* 
var Spinner3D = NS('Spinner3D', NS('test::Spinner3D', Class.$extend({
	__classvars__ : {
			version:'0.0.1',
			toString:function(){
					return '[class Spinner3D]' ;
			}
	},
	__init__ : function(id, color, alpha, max,  factor, geom, shader) {
		var sp = this ;
			var tg = sp.tg = $(id) ;
			var color = sp.color = ('0x'+color.replace(/#/, '')) || "0xFFFFFF" ;
			
			var alpha = sp.alpha = alpha || .5 ;
			var factor = factor || 2000 ;
			
			
			////////////////////////
		var container;
		var camera, scene, projector, renderer;
		var particleMaterial;

		var objects = sp.objects = [];

		
		container = tg ;
		

		camera = sp.camera = new THREE.PerspectiveCamera( factor, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 300, 500);

		scene = sp.scene = new THREE.Scene();

		scene.add( camera );
		
		if(!window.isSafariMobile){
			var directionalLight = sp.directionalLight =  new THREE.DirectionalLight( 0xffffff , 1);
			//directionalLight.position.x = Math.random() - 0.5;
			directionalLight.position.x = 0;
			// directionalLight.position.y = Math.random() - 0.5;
			directionalLight.position.y = 0;
			// directionalLight.position.z = Math.random() - 0.5;
			directionalLight.position.z = 400;
			directionalLight.position.normalize();
			scene.add( directionalLight );
			
			var pointLight = sp.pointLight =  new THREE.PointLight( 0xFFFFFF, 1 );
			pointLight.position.z = -450;
			pointLight.position.y = 250;
			scene.add( pointLight );
		
			
		}
		
		//var geometry = new THREE.CubeGeometry( 100, 100, tick );
		
		
		
		
						
									
									
									
									
									
									var geometry ;
									switch(geom){
										
										case 'star' :
											var californiaPts = [new THREE.Vector2 ( 31, -95)];
								
								var intersections = 10 ;
								
								for(var j = 0 ; j < intersections ; j++){
									
									var rand = Math.random() * 50 ;
									var ind = (j)/intersections ;
									
									var dia = 100 + ((j % 2 == 0)? 0: -60) ;
									
									var rX = Math.cos((Math.PI * 2) * ind) * dia ;
									var rY = Math.sin((Math.PI * 2) * ind)  * dia;
									
									var pX = Math.round(rX) ;
									var pY = Math.round(rY) ;
									trace(j, pX, pY, dia)
									
									
									californiaPts.push( new THREE.Vector2 ( pX, pY) );
									
								}
											
											var star = new THREE.Shape( californiaPts );
											var geometry = new THREE.ExtrudeGeometry(star, {amount:6, bevelEnabled:false});
										break;
										case 'plane' :
											var geometry = new THREE.CubeGeometry( 100, 100, 1);
										break;
										case 'thickplane' :
											var geometry = new THREE.CubeGeometry( 100, 100, 10);
										break;
										case 'thinplane' :
											var geometry = new THREE.CubeGeometry( 100, 100, 2);
										break;
										case 'cube' :
											var geometry = new THREE.CubeGeometry( 100, 100, 100);
										break;
										
									}
		
		
		for ( var i = 0; i < max; i ++ ) {
			
			var mat ;
			if(window.isSafariMobile || shader !== 'lambert'){
				mat = new THREE.MeshBasicMaterial({color:color, opacity:alpha }) ;
			}else{
				mat = new THREE.MeshLambertMaterial( {opacity:alpha, shading:THREE.FlatShading, color:color }) ;
			}
			
			var object = new THREE.Mesh( geometry, mat );
			
			var rad = 250 ;
			var ind = i/max ;
			
			var x = Math.cos(ind * Math.PI * 2) * rad ;
			var y = Math.sin(ind * Math.PI * 2) * rad ;
			var z = 0 ;//Math.cos(ind * Math.PI * 2) * rad ;
			
			object.position.x = x ;
			object.position.y = y ;
			object.position.z = x ;

			object.scale.x = Math.random() * 2 + 1;
			object.scale.y = Math.random() * 2 + 1;
			object.scale.z = Math.random() * 2 + 1;
			
			object.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
			object.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
			//object.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;

			object.hover =  function(cond){
				var n = this ;
				if(cond){
					n.originalAlpha = n.material.opacity ;
					//n.originalColor = n.material.color.getHex() ;
					n.material.opacity = n.originalAlpha + .4 ;
					//n.material.color.setHex('0xA40133') ;
					n.overed = true ;
				}else{
					if(n.originalAlpha !== undefined ){
						n.material.opacity = n.originalAlpha ;
						//n.material.color.setHex(n.originalColor) ;
						n.originalAlpha = undefined ;
						//n.originalColor = undefined ;
						n.overed = false ;
					}
				}
			}
			
			
			// object.position.x = Math.random() * 800 - 400;
			// object.position.y = Math.random() * 800 - 400;
			// object.position.z = Math.random() * 800 - 400;

			// object.scale.x = Math.random() * 2 + 1;
			// object.scale.y = Math.random() * 2 + 1;
			// object.scale.z = Math.random() * 2 + 1;

			// object.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
			// object.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
			// object.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;
			
			
			
			scene.add( object );

			objects.push( object );

		}

		projector = sp.projector = new THREE.Projector();

		renderer = new THREE.CanvasRenderer();
		renderer.setSize( tg.width(), tg.height());
		
		sp.canvas = $(renderer.domElement).addClass('abs top0 left0') ;
		
		sp.canvas.appendTo(container) ;


		

		//

		function animate() {

			requestAnimationFrame( animate );
			render();

		}
		var radius = 1200 ;
		if(window.isSafariMobile){
				radius = 600 ;
			}
			
		var theta = sp.theta = 0;
		var ind = sp.ind =  1 ;
		var speed = sp.speed = 0 ;
		
		sp.old = -1 ;
		
		
		var ctx = sp.canvas.context.getContext('2d') ;
		ctx.strokeStyle = "#A40133" ;
		
		var render = sp.render = function() {
			ctx.clearRect ( 0 , 0, window.innerWidth, window.innerHeight);
			if(sp.speed > 0) sp.speed *= .8 ;
			else if(sp.speed < 0) sp.speed *= .8 ;
			else{
				sp.speed = 0 ;
			}
			
			sp.theta += (0.2 + sp.speed) * sp.ind;
			
			
			var l = sp.objects.length ;
			
			for ( var i = 0; i < l; i ++ ) {
				
				var o = sp.objects[i] ;
				
				o.rotation.x += (Math.random() * 100)/36000 ;
				o.rotation.y += (Math.random() * 100)/36000 ;
				
			}
			
			
			
			
			camera.position.x = radius * Math.sin( sp.theta * Math.PI / 360 );
			camera.position.y = radius * Math.sin( sp.theta * Math.PI / 360 );
			camera.position.z = radius * Math.cos( sp.theta * Math.PI / 360 );
			
			
			
			sp.camera.lookAt( sp.scene.position );
			if(!window.isSafariMobile){
				sp.directionalLight.position = sp.scene.position ;
				sp.directionalLight.lookAt(sp.camera.position) ;
				
				sp.pointLight.position = sp.camera.position ;
				sp.pointLight.lookAt(sp.scene.position) ;
			}
			
			renderer.render( sp.scene, camera );
			
			
			
			
			if(window.desc !== undefined){
				
				var item = sp.cur ;
				var	p3D = new THREE.Vector3(item.position.x, item.position.y, item.position.z) ;
				var p2D = projector.projectVector(p3D, camera);
				//p3D = projector.unprojectVector(p2D, camera);
				
				//need extra steps to convert p2D to window's coordinates
				p2D.x = (p2D.x + 1)/2 * window.innerWidth;
				p2D.y = - (p2D.y - 1)/2 * window.innerHeight;
				
				
				ctx.beginPath() ;
							ctx.lineWidth = 2 ;
							
				var indic = window.desc.find('.indicator') ;
				var spr = window.desc.find('.t1') ;
				var left = spr.position().left ;
				var top = spr.position().top ;
							var x = left + indic.position().left + (indic.width() >> 1) ;
				var y = top + indic.position().top + (indic.height() >> 1) ;
							//var y = window.desc.position().top + window.desc.outerHeight() ;
							
				
							//ctx.moveTo(x - 150, y) ;
							//ctx.lineTo(x + 150, y ) ;
							ctx.moveTo(x, y) ;
							ctx.lineTo(p2D.x , p2D.y ) ;
							
							//trace(ctx.drawCircle)
							
							
							ctx.stroke() ;
							ctx.closePath() ;
				
				
			}
		}
		
		
		sp.once = true ;
		
			
	},
	adapt : function(n, ascend, ind){
		
		var sp = this ;
		var nuspeed = 20 ;
		var objs = sp.objects ;
		
		
		var item = objs[ind] ;
		var speed = sp.speed ;
		
		var max = nuspeed * 3;
		
		if(ascend === true){
		sp.ind = 1 ;
		sp.speed += nuspeed * n;
		}else if(ascend === false){
		sp.ind = - 1 ;
		sp.speed -= nuspeed * n;
		}
		
		if(sp.speed > max) {
			//trace('reached max up')
			sp.speed = max ;
		}
		if(sp.speed < -max) {
			//trace('reached max down')
			sp.speed = -max ;
		}
		
		//trace(sp.speed)
		//alert(ind)
		var l = objs.length ;
		for(var i = 0 ; i < l ; i++){
			var o = objs[i] ;
			if(i == ind){
				if(o.overed !== true) o.hover(true) ;
			}else{
				if(o.overed === true) o.hover(false) ;
			}
		}
		sp.cur = item ;
		//var vector = new THREE.Vector3( ( item.position.x / window.innerWidth ) * 2 - 1, - ( item.position.y / window.innerHeight ) * 2 + 1, 0.5 );
	
	
	
	
	
	
	//trace(p2D.x, p2D.y)
	
	
	
	
	
		
	},
	detectClick:function(e){
		var sp = this ;
		
		var cam = sp.camera ;
		var objs = sp.objects ;
		var l = objs.length ;
		
		var vector = new THREE.Vector3( ( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1, 0.5 );
	sp.projector.unprojectVector( vector, cam );

	var pos = cam.position ;
	
	var ray = new THREE.Ray( pos, vector.subSelf(pos).normalize() );

	var intersects = ray.intersectObjects( objs );
	
	var ind = -1 ;
	
	
	if ( intersects.length > 0 ) {
		var tch = intersects[ 0 ] ;
		var obj = tch.object ;
		
		for(var i = 0 ; i < l ; i ++){
			var o = objs[i] ;
			
			if(o === obj){
				return i ;
			}
		}
	}
	return -1 ;
	},
	start : function(){
		var sp = this ;
		
		var dur = window.isSafariMobile ? 10 : 5 ;
		window.interval = setInterval(function(){
			sp.render() ;
			}, dur) ;
		
			return this ;
	},
	stop : function(){
		var sp = this ;
		 
		clearInterval(window.interval) ;
		
			return this ;
	},
	getElement : function(){
			return this.tg ;
	},
	getCanvas : function(){
			return this.canvas ;
	},
	toString : function(){
			return '[ object ' + this.$class.ns + ' v.'+this.$class.version +']';
	}
}))) ;

 */

