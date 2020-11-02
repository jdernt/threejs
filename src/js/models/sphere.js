import * as THREE from 'three';
import Models from './index.js'

export default class Sphere {

  init = async () => {
    return new Promise((resolve) => {
      this.geometry = new THREE.SphereGeometry(10, 32, 32);
      this.geometry.scale(-1, 1, 1);
      this.texture = new Models.Location({ src: './img/pano_1.png' })
      this.texture.load().then((texture) => {
        this.material = new THREE.MeshBasicMaterial({ map: texture });
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