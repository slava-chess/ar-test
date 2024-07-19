import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create a video element to capture the camera feed
const video = document.createElement('video');
video.autoplay = true;
video.playsInline = true;

// Request access to the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(error => {
        console.error('Error accessing camera:', error);
    });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a video texture from the video element
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

// Create a plane to display the video texture
const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
const videoGeometry = new THREE.PlaneGeometry(16, 9);
const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);

// Adjust the plane to fill the screen and position it behind the scene
videoMesh.scale.set(4, 4, 4); // Twice the original size
videoMesh.position.z = -10;
scene.add(videoMesh);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 50);
controls.update();

const loader = new GLTFLoader();
let model;

loader.load(
    './assets/Brama.glb',
    function (gltf) {
        model = gltf.scene;
        scene.add(model);

        // Check model size and position
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        console.log('Model size:', size);
        console.log('Model center:', center);

        // Adjust camera if necessary
        camera.lookAt(center);
        controls.update();
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened', error);
    }
);

let angle = 0;
const speed = 0.01;

function render() {
    if (model) {
        // Rotate the model around its Y axis
        model.rotation.y += speed;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

render();
