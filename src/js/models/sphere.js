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
    return new Promise(resolve => {
      this.app.startLoading()
      this.texture = new Models.Location({ app: this.app, data: this.data })
      this.texture.load().then(texture => {
        this.geometry = new THREE.SphereGeometry(5, 32, 32);
        this.material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.scale.set(-1, 1, -1)
        this.app.stopLoading()
        resolve(this)
      })
    })
  }

  changeTexture = async (data) => {
    this.app.startLoading()
    let location = this.app.locations[data.id];
    if (!location) {
      location = new Models.Location({ app: this.app, data: data })
    }
    if (!location.texture) {
      await location.load()
    }
    this.mesh.material.map = location.texture;
    this.changeRotation(data.direction)
    this.app.stopLoading()
  }

  changeOpacity = (opacity) => {
    this.mesh.material.opacity = opacity
  }

  changePosition = (x, y, z) => {
    this.mesh.position.set(x, y, z)
  }

  changeRotation = (deg) => {
    this.mesh.rotation.y = THREE.MathUtils.degToRad(deg)
  }
}