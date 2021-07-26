import {
  Scene,
  Engine,
  ArcRotateCamera,
  Color4,
  Vector3,
  HemisphericLight,
  SceneLoader,
  MeshBuilder,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import introScene from './assets/intro.glb'
import createWaterMaterial from './water'

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

  new HemisphericLight('Light', new Vector3(0, 1, 0), scene)

  await SceneLoader.AppendAsync('', introScene, scene)

  const plane = MeshBuilder.CreateGround(
    'Plane',
    { width: 1000, height: 1000 },
    scene
  )
  const waterMaterial = createWaterMaterial(
    scene,
    scene.meshes.filter((mesh) => mesh.id !== 'Plane')
  )
  plane.material = waterMaterial

  let time = 0
  scene.registerBeforeRender(() => {
    time += engine.getDeltaTime() * 0.0005
    waterMaterial.setFloat('time', time)
  })

  return scene
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
