const data = [
  {
    id: 1,
    src: "./img/pano_1.png",
    coords: {
      x: 0,
      y: 0,
      z: 0
    },
    description: 'центр перекрестка',
    siblings: [2, 3]
  },
  {
    id: 2,
    src: "./img/pano_2.png",
    coords: {
      x: 4,
      y: 0,
      z: 1
    },
    description: 'у пекарни',
    siblings: [1]
  },
  {
    id: 3,
    src: "./img/pano_4.png",
    coords: {
      x: -4,
      y: 0,
      z: 1
    },
    description: 'напротив пекарни',
    siblings: [1, 4]
  },
  {
    id: 4,
    src: "./img/pano_4_1.png",
    coords: {
      x: -8,
      y: 0,
      z: 1
    },
    description: 'еще дальше от пекарни',
    siblings: [3]
  },
]

export default data;