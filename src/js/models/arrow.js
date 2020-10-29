import * as THREE from 'three';

export default class Arrow {
  init = () => {
    const triangleShape = new THREE.Shape()
      .moveTo( 0, 0 )
      .lineTo( -0.25, 0.25)
      .lineTo( 0.25, 0.25)

    const extrudeSettings = { depth: 0.05, bevelEnabled: false, steps: 1 };
    
    this.geometry = new THREE.ExtrudeBufferGeometry( triangleShape, extrudeSettings );
    this.material = new THREE.MeshBasicMaterial({ color: 0xffffff});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = THREE.MathUtils.degToRad(-90)
    this.mesh.position.set(0, -0.5, 0)
    return this;
  }
}