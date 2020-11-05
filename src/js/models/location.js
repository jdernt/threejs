import * as THREE from 'three';

export default class Location {
  constructor({ app, data }) {
    this.app = app
    this.data = data
    this.id = data.id
    this.siblings = data.siblings
    this.src = data.src
  }

  load = () => {
    const location = this.app.locations.find((location) => location.id === this.id)
    if (location) {
      return new Promise((resolve) => {
        this.texture = location.texture
        resolve(this.texture)
      })
    } else {
      return new Promise((resolve) => {
        new THREE.TextureLoader().load(this.src, (texture) => {
          this.app.locations.push(this)
          this.texture = texture
          resolve(this.texture)
        })
      })
    }
  }
}
