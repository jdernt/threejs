import React from 'react';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ThreeEntryPoint(sceneRef) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  sceneRef.appendChild(renderer.domElement);

  let geometry = new THREE.SphereGeometry( 15, 64, 64 );
  let texture = new THREE.TextureLoader().load('./img/pano_2.png')
  let material = new THREE.MeshBasicMaterial({ map: texture })
  const sphere = new THREE.Mesh(geometry, material);

  sphere.scale.x = 0.1
  sphere.scale.y = 0.1
  sphere.scale.z = 0.1

  scene.add(sphere);

  geometry = new THREE.PlaneGeometry(10, 10)
  material = new THREE.MeshNormalMaterial();
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = THREE.MathUtils.degToRad(-80)
  plane.rotation.z = THREE.MathUtils.degToRad(-30)
  plane.position.y = -1.5;
  scene.add(plane)  

  const animate = function () {
    requestAnimationFrame(animate);

    // sphere.rotation.x += 0.005
    sphere.rotation.y += 0.005
    // sphere.rotation.z += 0.005

    renderer.render(scene, camera);
  };

  animate();
}