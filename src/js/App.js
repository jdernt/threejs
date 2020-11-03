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
  locations = []

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

    this.sphere = new Models.Sphere({ app: this, data: data[0] })
    await this.sphere.init()
    this.scene.add(this.sphere.mesh)
    this.sphere.mesh.material.opacity = 1
    this.loadSiblings(siblings)

    this.anotherSphere = new Models.Sphere({ app: this, data: data[0] });
    await this.anotherSphere.init()
    this.scene.add(this.anotherSphere.mesh)
    this.anotherSphere.mesh.position.set(15, 0, 0);

    this.createArrows(siblings, coords);

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

    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);
    window.addEventListener('resize', this.onWindowResize, false);
    document.querySelector('.main').addEventListener('click', (e) => {
      if (!e.target.classList.contains('modal')) {
        this.hideModal()
      }
    })
  }

  onDocumentMouseDown = (event) => {
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

        this.scene.remove(this.arrows.arrowGroup)

        const currentData = data.find(({id}) => id === this.state.currentId);
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

        this.anotherSphere.mesh.rotation.y = siblingData.direction

        const texture = new Models.Location({ app: this, data: siblingData })
        this.startLoading();
        texture.load().then((texture) => {
          this.anotherSphere.changeTexture(texture);
          this.stopLoading();
        })

        this.anotherSphere.mesh.position.set(newCoords.x, newCoords.y, newCoords.z);

        const position = { ...newCoords, opacity: 1, opacity2: 0 };
        const target = { x: 0, y: 0, z: 0, opacity: 0, opacity2: 1 };
        const tween = new TWEEN.Tween(position).to(target, 2000)
        tween.onUpdate(() => {
          this.anotherSphere.mesh.position.set(position.x, position.y, position.z);
          this.sphere.mesh.material.opacity = position.opacity;
          this.anotherSphere.mesh.material.opacity = position.opacity2;
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

  onDocumentMouseMove = (event) => {
    if (!this.isSphereAnimation) {
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      if (this.isUserInteracting) {
        this.lon = (this.downPointerX - event.clientX) * this.dragFactor + this.downPointerLon;
        this.lat = (event.clientY - this.downPointerY) * this.dragFactor + this.downPointerLat;
      }
    }
  }

  onDocumentMouseUp = () => {
    if (!this.isSphereAnimation) {
      this.isUserInteracting = false
    }
  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createArrows = (siblings, coords) => {
    this.arrows = new Arrows();
    this.arrows.init(siblings, coords);
    this.scene.add(this.arrows.arrowGroup);
  };

  switchScene = async (siblingData) => {
    this.scene.remove(this.arrows.arrowGroup);

    this.sphere.mesh.rotation.y = siblingData.direction

    const { id, coords, siblings } = siblingData;
    this.setId(id);

    this.startLoading();
    const texture = new Models.Location({ app: this, data: siblingData })
    texture.load().then((texture) => {
      this.sphere.changeTexture(texture);
      this.stopLoading();
    })

    this.createArrows(siblings, coords);
    this.loadSiblings(siblingData.siblings)
  }

  loadSiblings = async (siblings) => {
    siblings.forEach(siblingId => {
      if (this.locations.find((location) => location.id === siblingId)) {
        return
      } else {
        let siblingData = data.find(({id}) => id === siblingId);
        let sibling = new Models.Sphere({ app: this, data: siblingData })
        sibling.init()
        console.log(this.locations)        
      }
    })
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
        <Map currentId={currentId} onClick={this.showModal} />
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
                  { top: coords.z * 60 + 100 + 'px',
                    left: coords.x * 60 + 250 + 'px',
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