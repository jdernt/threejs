import React, { Component } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import Models from './models';
import Arrows from './models/arrow'
import data from './data';
import * as helpers from './components/helpers'
import Map from './components/Map';

export default class App extends Component {
  state = {
    currentId: 0,
    isLoading: false,
    isActive: false
  }

  isUserInteracting = false;
  isSphereAnimation = false;
  lon = 0; lat = 0;
  phi = 0; theta = 0;
  downPointerX = 0; downPointerY = 0; 
  downPointerLon = 0; downPointerLat = 0;
  dragFactor = 0.2;
  radius = 10;

  componentDidMount = async () => {
    const { id, coords, siblings } = data[0];

    this.currentId = id;
    this.setId(id);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.parent = document.getElementById('threejs')
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(10, 0, 0)
    this.camera.target = new THREE.Vector3();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.parent.appendChild(this.renderer.domElement);

    this.sphere = new Models.Sphere()
    await this.sphere.init()
    this.scene.add(this.sphere.mesh)

    this.anotherSphere = new Models.Sphere();
    await this.anotherSphere.init()
    this.scene.add(this.anotherSphere.mesh)
    this.anotherSphere.mesh.opacity = 0
    this.anotherSphere.mesh.position.set(15, 0, 0);

    this.createArrows(siblings, coords);

    const onDocumentMouseDown = (event) => {
      event.preventDefault();

      if (!this.isSphereAnimation) {
        this.isUserInteracting = true

        this.downPointerX = event.clientX
        this.downPointerY = event.clientY
        this.downPointerLon = this.lon
        this.downPointerLat = this.lat

        this.raycaster.setFromCamera(this.mouse, this.camera);

        let arrows;

        this.scene.children.forEach(children => {
          if (children.type === 'Group') {
            arrows = children.children;
          }
        })

        const intersects = this.raycaster.intersectObjects(arrows);

        for ( let i = 0; i < intersects.length; i ++ ) {

          this.scene.remove(this.arrowGroup.arrowGroup)

          const currentData = data.find(({id}) => id === this.currentId);
          const siblingData = data.find(({id}) => id === intersects[i].object.name);

          const unit_vec = helpers.getUnicVector(currentData.coords, siblingData.coords);

          const coefficient = 5;
          const newCoords = {
            x: unit_vec.x * coefficient,
            y: unit_vec.y * coefficient,
            z: unit_vec.z * coefficient,
          };
          
          this.isSphereAnimation = true;
          this.isUserInteracting = false;

          this.camera.lookAt(newCoords.x, 0, newCoords.z);

          this.radius = Math.hypot(newCoords.x, newCoords.y, newCoords.z)
          this.phi = Math.acos(newCoords.y / this.radius);
          this.theta = Math.atan2(newCoords.z, newCoords.x);
          this.lon = THREE.Math.radToDeg(this.theta);
          this.lat = 90 - THREE.Math.radToDeg(this.phi);

          const texture = new Models.Location({ src: siblingData.src })
          this.startLoading();
          texture.load().then((texture) => {
            this.anotherSphere.changeTexture(texture);
            this.stopLoading();
          })

          this.anotherSphere.mesh.position.set(newCoords.x, newCoords.y, newCoords.z);

          const target = { ...newCoords, opacity: 1, opacity2: 0 };
          const tween = new TWEEN.Tween(target).to({ x: 0, y: 0, z: 0, opacity: 0, opacity2: 1 }, 2000)
          tween.onUpdate(() => {
            this.anotherSphere.mesh.position.set(target.x, target.y, target.z);
            this.sphere.mesh.material.opacity = target.opacity;
            this.anotherSphere.mesh.material.opacity = target.opacity2;
          })
          tween.start()
          tween.onComplete(() => {
            this.sphere.mesh.material.opacity = 1;
            this.anotherSphere.mesh.material.opacity = 0;
            this.anotherSphere.mesh.position.set(15, 0, 0);

            this.isSphereAnimation = false;
            this.switchScene(siblingData);
          });
        }
      }
    }

    const onDocumentMouseMove = (event) => {
      if (!this.isSphereAnimation) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        if (this.isUserInteracting) {
          this.lon = (this.downPointerX - event.clientX) * this.dragFactor + this.downPointerLon;
          this.lat = (event.clientY - this.downPointerY) * this.dragFactor + this.downPointerLat;
        }
      }
    }

    const onDocumentMouseUp = (event) => {
      if (!this.isSphereAnimation) {
        this.isUserInteracting = false
      }
    }

    const onWindowResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
 
    const update = () => {
      if (this.isUserInteracting) {
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);
        this.theta = THREE.Math.degToRad(this.lon);

        this.camera.target.x = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.target.y = this.radius * Math.cos(this.phi);
        this.camera.target.z = this.radius * Math.sin(this.phi) * Math.sin(this.theta);   

        this.radius = Math.hypot(this.camera.target.x, this.camera.target.y, this.camera.target.z);   

        this.camera.lookAt(this.camera.target);
      }
      
      this.renderer.render(this.scene, this.camera);
    }

    const animate = (time) => {
      requestAnimationFrame(animate);
      update();
      TWEEN.update(time);
    };

    animate();

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    window.addEventListener('resize', onWindowResize, false);
    document.querySelector('.main').addEventListener('click', (e) => {
      if (!e.target.classList.contains('modal')) {
        this.hideModal()
      }
    })
  }

  createArrows = (siblings, coords) => {
    const arrows = new Arrows();
    arrows.init(siblings, coords);
    this.arrowGroup = arrows;
    this.scene.add(this.arrowGroup.arrowGroup);
  };

  switchScene = async (siblingData) => {
    for (let i = 0; i < this.scene.children.length; i++) {
      if (this.scene.children[i].type === 'Group') {
        this.scene.remove(this.scene.children[i]);
      }
    }

    const { id, coords, siblings } = siblingData;
    this.currentId = id;
    this.setId(id);

    this.startLoading();
    const texture = new Models.Location({ src: siblingData.src })
    texture.load().then((texture) => {
      this.sphere.changeTexture(texture);
      this.stopLoading();
    })

    this.createArrows(siblings, coords);
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

  showModal = () => {
    this.setState({ isActive: true })
  }

  hideModal = () => {
    this.setState({ isActive: false })
  }

  render() {
    const { currentId, isLoading, isActive } = this.state;
    return (
      <div className='main'>
        <div className={isLoading ? 'main__bg' : 'hidden'}>
          <div className='preloader'>
          </div>
        </div>
        <div id='threejs'>
        </div>
        <Map currentId={currentId} action={this.showModal} />
        <div className={isActive ? 'main__bg' : 'hidden'}>
          <div className='modal'>
            {data.map(({ id, coords }, i) => (
              <span
                onClick={() => { 
                  this.hideModal()
                  this.switchScene(data[i]) }}
                className="modal__item"
                data-id={id}
                key={id}
                style={
                  { top: coords.z * 30 + 150 + 'px',
                    left: coords.x * 30 + 320 + 'px',
                    backgroundColor: id === currentId ? '#42f5e3' : '#3b04b3'
                  }
                }></span>
            ))}
          </div>
        </div>
      </div>
      
    );
  }
}