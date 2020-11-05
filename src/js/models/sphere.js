import * as THREE from 'three';
import Models from './index.js'

export default class Sphere {
  constructor({ app, data }){
    this.app = app
    this.data = data
    this.id = data.id
    this.siblings = data.siblings
    this.src = data.src
  }

  init = async () => {
    return new Promise((resolve) => {
      this.geometry = new THREE.SphereGeometry(10, 32, 32);
      this.geometry.scale(-1, 1, 1);
      this.texture = new Models.Location({ app: this.app, data: this.data })
      this.texture.load().then((texture) => {
        this.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        resolve(this)
      })
    })          
  }

  changeTexture = (texture) => {
    this.mesh.material.map = texture;
    this.mesh.material.needsUpdate = true;
  }
}