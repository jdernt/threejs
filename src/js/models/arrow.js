import * as THREE from 'three';
import data from '../data'
import * as helpers from '../components/helpers';

export default class Arrow {
  
  init = (siblings, currentCoords) => {
    this.arrowGroup = new THREE.Group();

    siblings.forEach(sibling => {
      const arrowGeometry = new THREE.Geometry();

      const currentSibling = (data.filter(({ id }) => sibling === id)[0]);
      const { id, coords } = currentSibling;

      const unit_vec = helpers.getUnicVector(currentCoords, coords);
      const leftPoint = helpers.rotationMatrix(unit_vec, 45,)
      const rightPoint = helpers.rotationMatrix(unit_vec, -45)

      const x0 = (leftPoint.x + unit_vec.x + rightPoint.x) / 3;
      const z0 = (leftPoint.z + unit_vec.z + rightPoint.z) / 3;

      const newLeftPoint = helpers.resizeTriangle(leftPoint, x0, z0)
      const newRightPoint = helpers.resizeTriangle(rightPoint, x0, z0)
      const newMiddlePoint = helpers.resizeTriangle(unit_vec, x0, z0)

      const coefficient = 5;
      arrowGeometry.vertices.push(
        new THREE.Vector3(newLeftPoint.x * (coefficient - 1), -3, newLeftPoint.z * (coefficient - 1)),
        new THREE.Vector3(newMiddlePoint.x * coefficient, -3, newMiddlePoint.z * coefficient),
        new THREE.Vector3(newRightPoint.x * (coefficient - 1), -3, newRightPoint.z * (coefficient - 1))
      );
      arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));

      const material = new THREE.LineBasicMaterial({ color: 'red', linewidth: 2 });
      const mesh = new THREE.Mesh(arrowGeometry, material);
      mesh.name = id;
      // mesh.lookAt(coords.x, coords.y, coords.z)
      // mesh.rotation.x = 0
      // mesh.rotation.z = 0

      this.arrowGroup.add(mesh);
    });

    // siblings.forEach(sibling => {
    //   const currentSibling = (data.filter(({ id }) => sibling === id)[0]);
    //   const { id, coords } = currentSibling;

    //   const triangleShape = new THREE.Shape()
    //   .moveTo(0, 0)
    //   .lineTo(-0.25, 0.25)
    //   .lineTo(0.25, 0.25)
    //   .lineTo(0, 0)

    //   const extrudeSettings = { depth: 0.05, bevelEnabled: false, steps: 1 };
      
    //   this.geometry = new THREE.ExtrudeBufferGeometry( triangleShape, extrudeSettings );
    //   this.material = new THREE.MeshBasicMaterial({ color: 0xffffff});
    //   this.mesh = new THREE.Mesh(this.geometry, this.material);
    //   this.mesh.name = id;

    //   this.arrowGroup.add(this.mesh);
    //   this.arrowGroup.rotation.x = THREE.MathUtils.degToRad(-90)
    //   this.arrowGroup.rotation.z = THREE.MathUtils.degToRad(90)
    //   this.arrowGroup.position.y = -2;
    // })
  }
}