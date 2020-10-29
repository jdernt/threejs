import * as THREE from 'three';

export default class Location {
  constructor({ src }) {
    this.src = src
  }

  load = () => {
    return new Promise((resolve) => {
      new THREE.TextureLoader().load(this.src, (texture) => {
        this.texture = texture
        resolve(this.texture)
      })
    })
  }
}