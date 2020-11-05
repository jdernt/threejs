import * as THREE from 'three';
import data from '../data'
import * as helpers from '../components/helpers';

export default class Arrow {
  constructor({ id, app }) {
    this.id = id;
    this.app = app;
    this.init()
  }

  init = () => {
    this.mesh = new THREE.Group()
    this.mesh.add(this.createArrow())
    this.mesh.rotation.z = THREE.MathUtils.degToRad(-90)

    const currentData = data.find(({ id }) => id === this.app.state.currentId);
    const siblingData = data[this.id];

    const unit_vec = helpers.getUnicVector(
      currentData.coords,
      siblingData.coords
    );

    const coefficient = 1;
    const newCoords = {
      x: unit_vec.x * coefficient,
      y: unit_vec.y * coefficient,
      z: unit_vec.z * coefficient,
    };

    this.mesh.lookAt(new THREE.Vector3(newCoords.x, newCoords.y, newCoords.z))
  }

  createArrow = () => {
    const triangleShape = new THREE.Shape()
      .moveTo(0, 0)
      .lineTo(-0.05, 0.1)
      .lineTo(0.05, 0.1)

    const extrudeSettings = { depth: 0.01, bevelEnabled: false, steps: 1 };
    const geometry = new THREE.ExtrudeBufferGeometry(triangleShape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffae });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = THREE.MathUtils.degToRad(-90)
    mesh.rotation.z = THREE.MathUtils.degToRad(90)
    mesh.position.x = 0.4
    mesh.position.y = -0.2
    mesh.name = this.id
    this.arrow = mesh;
    return mesh;
  }
}
