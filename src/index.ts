import {
  Scene,
  Engine,
  ArcRotateCamera,
  Color4,
  Vector3,
  HemisphericLight,
  SceneLoader,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import sceneFile from './assets/scene.glb'

const createScene = (engine: Engine, canvas: HTMLCanvasElement) => {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0, 0, 0, 1.0)

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

  SceneLoader.Append('', sceneFile, scene, (s) => {
    console.log(s)
  })

  return scene
}

window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)
  const scene = createScene(engine, canvas)

  engine.runRenderLoop(() => {
    scene.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
})
