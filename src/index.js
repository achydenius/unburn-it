import {
  Scene,
  Engine,
  ArcRotateCamera,
  Color3,
  Vector3,
  HemisphericLight,
  MeshBuilder,
} from 'babylonjs'

const createScene = (engine, canvas) => {
  const scene = new Scene(engine)
  scene.clearColor = Color3.Black

  const camera = new ArcRotateCamera(
    'Camera',
    -Math.PI / 2,
    Math.PI / 2.5,
    5,
    new Vector3(0, 0, 0),
    scene
  )
  camera.attachControl(canvas, true)

  new HemisphericLight('Light', new Vector3(1, 1, 0), scene)

  MeshBuilder.CreateBox('Box', {}, scene)

  return scene
}

window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas')
  const engine = new Engine(canvas, true)
  const scene = createScene(engine, canvas)

  engine.runRenderLoop(() => {
    scene.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
})
