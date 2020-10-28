import React, { Component } from 'react';
import * as THREE from 'three';
import Models from './models';
import images from './images';

export default class App extends Component {

  locations = {}

  async componentDidMount() {
    const parent = document.getElementById('threejs')
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set( 0, 0, 5 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    parent.appendChild(renderer.domElement);

    const sphere = new Models.Sphere({ image: images[0] })
    await sphere.init()
    scene.add(sphere.mesh)
    const arrow = new Models.Arrow()
    await arrow.init()
    sphere.mesh.add(arrow.mesh)

    const anotherSphere = new Models.Sphere({ image: images[1] });
    await anotherSphere.init()
    anotherSphere.mesh.position.z = -20
    scene.add(anotherSphere.mesh)
    const anotherArrow = new Models.Arrow()
    await anotherArrow.init()
    anotherSphere.mesh.add(anotherArrow.mesh)

    const animate = function () {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    };

    animate();
    console.log(scene)
  }

  render() {
    return (
      <div id='threejs'>

      </div>
    );
  }
}