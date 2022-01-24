import { WEBGL } from './webgl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { LoadingManager, PMREMGenerator, Scene, PerspectiveCamera, WebGLRenderer, Color, BoxGeometry, MeshBasicMaterial, Mesh, AmbientLight, DirectionalLight, SphereGeometry, PointLight, Clock, AnimationMixer, LoopOnce } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//variables globales
const colors = {
    red: 0xff6961,
    white: 0xffffff,
    blue: 0x090424,
    dark: 0x1a1a1a,
    ambient: 0xffffff,
    green: 0x77dd77,
};

const URLMODELO = 'assets/models/animacion2.glb';
let modelo1;
let light1, light2, light3, light4;
let mixer;
let animatedOn = false;
const clock = new Clock();

export default function init3d(wrapper) {
    const contenedor = wrapper.querySelector('#modelo3d');

    if (!contenedor) {
        console.log('container not found')
        return;
    }

    if ( WEBGL.isWebGLAvailable() ) {
        // Initiate function or other initializations here
        console.log('init 3d');
        start(contenedor);
    } else {
        const warning = WEBGL.getWebGLErrorMessage();
        contenedor.appendChild( warning );
        return;
    }

}

//funcion principal
function start(contenedor) {
    
    //renderer
    const renderer = new WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    contenedor.appendChild( renderer.domElement );
    
    //scene
    const pmremGenerator = new PMREMGenerator(renderer);
    const scene = new Scene();
    scene.background = new Color(colors.blue);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    //camera & controls
    const camera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
    let controls = new OrbitControls (camera, renderer.domElement);
    camera.position.set(0, 2, 7); //(x,y,z), NO SON PIXELES, son unidades
    scene.add( camera );
    controls.update();

    //iluminacion
    const ilumination = createIlumination(scene, colors);

    //modelo
    const p1 = loadModel(URLMODELO).then((result) => {
		modelo1 = result;
	});

    //si todos los modelos fueron cargados:
	Promise.all([p1]).then(() => {
        
        let pcModelada = modelo1.scene;
        
        // Escala
        let scale = 0.1;
        pcModelada.scale.set(scale, scale, scale);

		// Sombras
		pcModelada.traverse((object) => {
			if (object.isMesh) object.castShadow = true;
		});

        //luces
        pcModelada.receiveShadow = true;
        
        //posicion y rotacion
        pcModelada.position.set(0, -2, 0);
        pcModelada.rotation.set(0, 0, 0);

        // Añaadir modelos a la escena
        scene.add( pcModelada );

        const animationPc = modelo1.animations; // Selecciona la animacion del modelo

        // El mixer se encarga de poder reproducir las animaciones
        mixer = new AnimationMixer(pcModelada);

        // Seleccionar la animacion
        const onPc = mixer.clipAction(animationPc[0]);
        let actions = [onPc];
       
       //activateAnimation(onPc, true);
        
        contenedor.addEventListener('dblclick', (event) => {
            
            if (animatedOn ) {
                activateAnimation(onPc, false);
                animatedOn = false;
            } else {
                activateAnimation(onPc, true);
                animatedOn = true;
            }
            
        });
        
        animate();
    });

    

    function animate() {
        
        const delta = clock.getDelta();

        requestAnimationFrame(animate);

        mixer.update(delta); // Esto es necesario para lograr que la animacion se reproduzca

        controls.update();

        render();
    
    }

    /// Animations ///
    function activateAnimation(action, start) {
        console.log("Nombre de la animacion:", action._clip.name);
        //if (action.paused === true) action.paused = false; // Si esta en pausa, lo reanuda
        //if (action._clip.name === "animation_0") action.setLoop(LoopOnce); // Lo reproduce una sola vez
  
        if (start) {
            action.clampWhenFinished = true;
            action.loop = LoopOnce;
            action.play();
        } else {
            action.stop()
        }
        
    }

    function render() {
        renderer.render(scene, camera);
    }
 

}




//helpers
function loadModel(url) {
    const loader = new GLTFLoader();
    const manager = new LoadingManager();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('js/libs/draco/gltf/');
  
    return new Promise((resolve) => {
      const loader = new GLTFLoader(manager);
      loader.setDRACOLoader(dracoLoader);
      loader.load(url, resolve);
    });
}

function createIlumination(scene, colors) {
	const { red, white, blue, dark, ambient, green } = colors;

	const ambientLight = new AmbientLight(blue, 0.1);
	scene.add(ambientLight);

	const dirLight = new DirectionalLight(blue, 0.05);
	dirLight.position.set(0, 50, 5).normalize();

	const sphere = new SphereGeometry(0.5, 16, 8);

	//lights

	light1 = new PointLight(0xff0040, 2, 50);
	
    light1.position.set(2, 1, 2);
	scene.add(light1);

	light2 = new PointLight(0x0040ff, 2, 50);
	
    light2.position.set(3, 0, 1);
	scene.add(light2);

	light3 = new PointLight(0x80ff80, 2, 50);
	
    light3.position.set(-2, 0.5, 0);
	scene.add(light3);

	light4 = new PointLight(0xffaa00, 2, 50);
	
    light4.position.set(-3, 0, -1);
	scene.add(light4);
}