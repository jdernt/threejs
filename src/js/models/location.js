import React, { Component } from 'react';
import * as THREE from 'three';

export default class Location extends Component {
  constructor(props) {
    super(props)
    this.state = { src: props.src}
  }

  load = async () => {
    return await new THREE.TextureLoader().load(this.state.src)
  }
}