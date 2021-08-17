import { Engine, Scene, AssetsManager } from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import { loadMainAssets } from './assets'
import init from './main'

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)
  const scene = new Scene(engine)
  const manager = new AssetsManager(scene)

  const sounds = await loadMainAssets(manager, scene)
  init(scene, sounds)

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
