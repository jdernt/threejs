const data = [
  {
    id: 0,
    src: "./img/pano_1.png",
    coords: {
      x: 0,
      y: 0,
      z: 0
    },
    description: 'центр перекрестка',
    siblings: [1, 2, 3],
    direction: 0
  },
  {
    id: 1,
    src: "./img/pano_2.png",
    coords: {
      x: 1,
      y: 0,
      z: 0
    },
    description: 'у пекарни',
    siblings: [0],
    direction: 130
  },
  {
    id: 2,
    src: "./img/pano_3.png",
    coords: {
      x: 1.5,
      y: 0,
      z: 1
    },
    description: 'возле рекламы',
    siblings: [0],
    direction: -90
  },
  {
    id: 3,
    src: "./img/pano_4.png",
    coords: {
      x: -1,
      y: 0,
      z: 0
    },
    description: 'напротив пекарни',
    siblings: [0, 7],
    direction: 0
  },
  {
    id: 7,
    src: "./img/pano_4_1.png",
    coords: {
      x: -2,
      y: 0,
      z: 0
    },
    description: 'еще дальше от пекарни',
    siblings: [3],
    direction: 0
  },
]

export default data;