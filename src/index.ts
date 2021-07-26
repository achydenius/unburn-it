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
import '@babylonjs/inspector'
import introScene from './assets/intro.glb'

const createScene = async (
  engine: Engine,
  canvas: HTMLCanvasElement
): Promise<Scene> => {
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

  return SceneLoader.AppendAsync('', introScene, scene)
}

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)
  const scene = await createScene(engine, canvas)

  if (inspectorRequested()) {
    scene.debugLayer.show()
  }

  engine.runRenderLoop(() => {
    scene.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
})
