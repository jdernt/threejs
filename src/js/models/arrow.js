import React, { Component } from 'react';
import * as THREE from 'three';

export default class Arrow {
  init = () => {
    this.geometry = new THREE.ConeBufferGeometry(1, 2, 2);
    this.material = new THREE.MeshBasicMaterial({ color: 0xffffff});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = THREE.MathUtils.degToRad(-80)
    this.mesh.rotation.y = THREE.MathUtils.degToRad(-90)
    this.mesh.position.set(0, -2, -3)
    return (this)
  }
}