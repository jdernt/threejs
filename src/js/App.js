import React, { Component } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import Models from './models';
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
    this.addEvents();
    const { id, coords, siblings } = data[0];

    this.setId(id);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.parent = document.getElementById('threejs')
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(10, 0, 0)
    this.camera.target = new THREE.Vector3();

    this.light = new THREE.PointLight(0xffffff, 0.8);
    this.light.position.y = 10;
    this.light.position.z = 10;
    this.scene.add(this.light)

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.parent.appendChild(this.renderer.domElement);

    this.sphere = new Models.Sphere({ app: this, data: data[0] })
    await this.sphere.init()
    this.scene.add(this.sphere.mesh)
    this.sphere.mesh.material.opacity = 1
    await this.loadSiblings(siblings)

    this.createArrows(siblings)

    this.anotherSphere = new Models.Sphere({ app: this, data: data[0] });
    await this.anotherSphere.init()
    this.scene.add(this.anotherSphere.mesh)
    this.anotherSphere.mesh.position.set(15, 0, 0);

    requestAnimationFrame(this.animate);

    document.querySelector('.main').addEventListener('click', (e) => {
      if (document.querySelector('.modal')) {
        this.hideModal()
      }
    })
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  animate = (time) => {
    TWEEN.update(time);
    requestAnimationFrame(this.animate);

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

  };

  windowEvents = [
    { type: 'mousedown', listener: 'onDocumentMouseDown' },
    { type: 'mousemove', listener: 'onDocumentMouseMove' },
    { type: 'mouseup', listener: 'onDocumentMouseUp' },
    { type: 'resize', listener: 'onWindowResize' },
  ]

  addEvents = () => {
    this.windowEvents.forEach(({ type, listener }) => window.addEventListener(type, this[listener]));
  }

  removeEvents = () => {
    this.windowEvents.forEach(({ type, listener }) => window.removeEventListener(type, this[listener]));
  }

  onDocumentMouseDown = (event) => {
    event.preventDefault();

    if (!this.isSphereAnimation) {
      this.isUserInteracting = true

      this.downPointerX = event.clientX
      this.downPointerY = event.clientY
      this.downPointerLon = this.lon
      this.downPointerLat = this.lat      
    }
  }

  onDocumentMouseMove = (event) => {
    if (!this.isSphereAnimation) {
      if (this.isUserInteracting) {
        this.lon = (this.downPointerX - event.clientX) * this.dragFactor + this.downPointerLon;
        this.lat = (event.clientY - this.downPointerY) * this.dragFactor + this.downPointerLat;
      } else {

        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        this.intersects = this.raycaster.intersectObjects(this.arrows);

        if (this.intersects.length > 0) {
          if (this.intersects[0].object.material.color.getHexString() === '00ffae') {
            this.intersects[0].object.material.color.set(0xff0000)
          }
        } else {
          if (this.arrows) {
            this.arrows.forEach(arrow => {
              if (arrow.material.color.getHexString() === 'ff0000') {
                arrow.material.color.set(0x00ffae)
              }
            })
          }
        }
      }
      
    }
  }

  onDocumentMouseUp = (event) => {
    const deltaX = Math.abs(event.clientX - this.downPointerX);
    const deltaY = Math.abs(event.clientY - this.downPointerY);

    if (deltaX < 20 && deltaY < 20) {
      if (!this.isSphereAnimation) {  
        this.raycaster.setFromCamera(this.mouse, this.camera);
  
        this.intersects = this.raycaster.intersectObjects(this.arrows);
  
        if (this.intersects.length > 0) {
          this.switchSceneAnimation(this.intersects[0])        
        }          
      }
    }

    this.isUserInteracting = false 
  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createArrows = (siblings) => {
    let arrows = {}
    this.arrowsGroup = new THREE.Group();

    siblings.forEach(id => {
      arrows[id] = new Models.Arrow({ id, app: this })
      this.arrowsGroup.add(arrows[id].mesh)
    })

    this.scene.add(this.arrowsGroup)
    this.arrowsGroup.rotation.y = THREE.MathUtils.degToRad(-90)

    this.arrows = [];
    this.arrowsGroup.children.forEach(group => {
      this.arrows.push(group.children[0])
    })
  }

  switchSceneAnimation = (intersect) => {
    this.scene.remove(this.arrowsGroup)

    const currentData = data.find(({id}) => id === this.state.currentId);
    const siblingData = data.find(({id}) => id === intersect.object.name);

    const unit_vec = helpers.getUnicVector(currentData.coords, siblingData.coords);

    const coefficient = 5;
    const newCoords = {
      x: unit_vec.x * coefficient,
      y: unit_vec.y * coefficient,
      z: unit_vec.z * coefficient,
    };
    
    this.isSphereAnimation = true;

    if (this.isSphereAnimation) {
      this.camera.lookAt(newCoords.x, 0, newCoords.z);

      this.radius = Math.hypot(newCoords.x, newCoords.y, newCoords.z)
      this.phi = Math.acos(newCoords.y / this.radius);
      this.theta = Math.atan2(newCoords.z, newCoords.x);
      this.lon = THREE.Math.radToDeg(this.theta);
      this.lat = 90 - THREE.Math.radToDeg(this.phi);

      this.anotherSphere.mesh.position.set(newCoords.x, newCoords.y, newCoords.z);

      this.anotherSphere.changeTexture(siblingData)
    }

    const position = { ...newCoords, opacity: 1, opacity2: 0 };
    const target = { x: 0, y: 0, z: 0, opacity: 0, opacity2: 1 };

    setTimeout(() => {
      new TWEEN.Tween(position).to(target, this.isSphereAnimation ? 1000 : 0)
        .onUpdate(() => {
          this.anotherSphere.changePosition(position.x, position.y, position.z);
          this.sphere.changeOpacity(position.opacity)
          this.anotherSphere.changeOpacity(position.opacity2)
        })
        .start()
        .onComplete(() => {
          this.sphere.changeOpacity(1)
          this.anotherSphere.changeOpacity(0)
          this.anotherSphere.changePosition(15, 0, 0);

          this.switchScene(siblingData);
          this.isSphereAnimation = false;
        });
    }, this.isSphereAnimation ? 500 : 0)
  }

  switchScene = (siblingData) => {
    this.scene.remove(this.arrowsGroup)

    const { id, siblings } = siblingData;
    this.setId(id);

    this.sphere.changeTexture(siblingData)

    this.createArrows(siblings)
    this.loadSiblings(siblings);
  }

  loadSiblings = async (siblings) => {
    siblings.forEach(siblingId => {
      if (this.locations.find((location) => location.id === siblingId)) {
        return;
      } else {
        this.startLoading();
        let siblingData = data.find(({id}) => id === siblingId);
        let sibling = new Models.Sphere({ app: this, data: siblingData })
        sibling.init()
        this.stopLoading();
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

  clickOnPoint = (e) => {
    this.switchScene(data[e.target.dataset.id])
    setTimeout(() => {
      this.hideModal()
    }, 0);
  }

  showModal = (e) => {

    this.setState({ isActive: true })
    const map = document.querySelector('.map');
    map.classList.add('modal')
    this.isSphereAnimation = true

    const mapItems = document.querySelectorAll('.map__item')
    mapItems.forEach(item => {
      item.addEventListener('click', this.clickOnPoint)
    })
  }

  hideModal = () => {
    this.setState({ isActive: false })
    const map = document.querySelector('.modal');
    map.classList.remove('modal')
    this.isSphereAnimation = false

    const mapItems = document.querySelectorAll('.map__item')
    mapItems.forEach(item => {
      item.removeEventListener('click', this.clickOnPoint)
    })
  }

  render() {
    const { currentId, isLoading } = this.state;
    return (
      <div className='main'>
        <div className={isLoading ? 'main__bg' : 'hidden'}>
          <div className='preloader'>
          </div>
        </div>
        <div id='threejs'>
        </div>
        <Map currentId={currentId} action={this.showModal}/>
      </div>
      
    );
  }
}