import React, { Component } from 'react';
import * as THREE from 'three';
import TWEEN from "@tweenjs/tween.js";

import Models from './models';
import Arrows from './models/arrow'
import data from './data';
import Map from './components/Map';

export default class App extends Component {
  state = {
    currentId: 0,
    isLoading: false
  }

  componentDidMount = async () => {
    let isUserInteracting = false;
    let isSphereAnimation = false;
    let lon = 0, lat = 0;
    let phi = 0, theta = 0;
    let downPointerX = 0, downPointerY = 0, 
        downPointerLon = 0, downPointerLat = 0;
    const dragFactor = 0.2;
    let radius = 10;

    const { id, coords, siblings } = data[0];

    let currentId = id;
    this.setId(id);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const parent = document.getElementById('threejs')
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);
    camera.lookAt(10, 0, 0)
    camera.target = new THREE.Vector3();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    parent.appendChild(renderer.domElement);

    const sphere = new Models.Sphere()
    await sphere.init()
    scene.add(sphere.mesh)

    const anotherSphere = new Models.Sphere();
    await anotherSphere.init()
    scene.add(anotherSphere.mesh)
    anotherSphere.mesh.opacity = 0
    anotherSphere.mesh.position.set(0, -15, 0);

    const createArrows = (siblings, coords) => {
      const arrows = new Arrows();
      arrows.init(siblings, coords);
      this.arrowGroup = arrows;
      scene.add(this.arrowGroup.arrowGroup);
    };

    createArrows(siblings, coords);

    const switchScene = async (siblingData) => {
      for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].type === 'Group') {
          scene.remove(scene.children[i]);
        }
      }

      const { id, coords, siblings } = siblingData;
      currentId = id;
      this.setId(id);

      this.startLoading();
      const texture = new Models.Location({ src: siblingData.src })
      texture.load().then((texture) => {
        sphere.changeTexture(texture);
        this.stopLoading();
        isSphereAnimation = false;
      })

      createArrows(siblings, coords);
    }

    const onDocumentMouseDown = (event) => {
      event.preventDefault();

      if (!isSphereAnimation) {
        isUserInteracting = true

        downPointerX = event.clientX
        downPointerY = event.clientY
        downPointerLon = lon
        downPointerLat = lat

        raycaster.setFromCamera(mouse, camera);

        let arrows;

        scene.children.forEach(children => {
          if (children.type === 'Group') {
            arrows = children.children;
          }
        })

        const intersects = raycaster.intersectObjects(arrows);

        for ( let i = 0; i < intersects.length; i ++ ) {
          intersects[i].object.material.color.set(0xff0000);

          const currentData = data.find(({ id }) => id === currentId);
          const siblingData = data.find(({ id }) => id === intersects[i].object.name);
          
          isSphereAnimation = true;
          isUserInteracting = false;

          // const texture = new Models.Location({ src: siblingData.src })
          // this.startLoading();
          // texture.load().then((texture) => {
          //   anotherSphere.changeTexture(texture);
          // })

          switchScene(siblingData);
        }
      }
    }

    function onDocumentMouseMove(event) {
      if (!isSphereAnimation) {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        if (isUserInteracting) {
          lon = (downPointerX - event.clientX) * dragFactor + downPointerLon;
          lat = (event.clientY - downPointerY) * dragFactor + downPointerLat;
        }
      }
    }

    function onDocumentMouseUp(event) {
      if (!isSphereAnimation) {
        isUserInteracting = false
      }
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }
 
    function update() {
      if (isUserInteracting) {
        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.Math.degToRad(90 - lat);
        theta = THREE.Math.degToRad(lon);

        camera.target.x = radius * Math.sin(phi) * Math.cos(theta);
        camera.target.y = radius * Math.cos(phi);
        camera.target.z = radius * Math.sin(phi) * Math.sin(theta);   

        radius = Math.hypot(camera.target.x, camera.target.y, camera.target.z);   

        camera.lookAt(camera.target);
      }
      
      renderer.render(scene, camera);
    }

    const animate =  function () {
      requestAnimationFrame(animate);
      update();
    };

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    window.addEventListener( 'resize', onWindowResize, false );

    animate();
  }

  setId = (id) => {
    this.setState({ currentId: id })
  }

  startLoading = () => {
    this.setState({ isLoading: true })
  }

  stopLoading = () => {
    this.setState({ isLoading: false })
  }

  render() {
    const { currentId, isLoading } = this.state;
    return (
      <div className="main">
        <div className={isLoading ? "main__bg" : "hidden"}>
          <div className="preloader">
          </div>
        </div>
        <div id='threejs'>
        </div>
        <Map currentId={currentId} />
      </div>
      
    );
  }
}