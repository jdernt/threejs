import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class App extends Component {

  componentDidMount() {
    const parent = document.getElementById('threejs')
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set( 0, 2, 10 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    parent.appendChild(renderer.domElement);

    // let geometry = new THREE.SphereGeometry( 15, 32, 32 );
    let geometry = new THREE.SphereGeometry( 500, 60, 40 );
    let texture = new THREE.TextureLoader().load('./img/pano_1.png')
    let material = new THREE.MeshBasicMaterial({ map: texture })
    const sphere = new THREE.Mesh(geometry, material);

    // sphere.scale.x = 0.1
    // sphere.scale.y = 0.1
    // sphere.scale.z = 0.1
    geometry.scale( - 1, 1, 1 );

    scene.add(sphere);

    geometry = new THREE.PlaneGeometry(10, 10)
    material = new THREE.MeshNormalMaterial();
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = THREE.MathUtils.degToRad(-90)
    plane.rotation.z = THREE.MathUtils.degToRad(-30)
    plane.position.y = -1.5;
    // scene.add(plane)  

    let controls = new OrbitControls(camera, parent);
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 8;
    controls.minDistance = 10
    controls.maxDistance = 200;
    controls.update();

    const animate = function () {
      requestAnimationFrame(animate);

      // sphere.rotation.x += 0.005
      // sphere.rotation.y += 0.003
      // sphere.rotation.z += 0.005

      renderer.render(scene, camera);
    };

    animate();
  }

  render() {
    return (
      <div id='threejs'>

      </div>
    );
  }
}