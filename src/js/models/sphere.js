import React, { Component } from 'react';
import * as THREE from 'three';
import Models from './index.js'

export default class Sphere extends Component {
  constructor(props){
    super(props)
    this.src = props.image.src
  }

  init = async () => {
    return new Promise((resolve) => {
        this.geometry = new THREE.SphereGeometry(5, 32, 32);
        this.texture = new Models.Location({ src: this.src })
        this.texture.load().then((texture) => {
          this.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
          this.mesh = new THREE.Mesh(this.geometry, this.material)
          resolve(this.mesh)
        })
      })
    
  }
}