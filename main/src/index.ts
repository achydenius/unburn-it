import { Engine, Scene, AssetsManager, Sound } from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import { loadIntroAssets, loadMainAssets, SceneLoader } from './assets'
import initIntro from './intro'
import initMain from './main'

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

const createScene = async (
  engine: Engine,
  loader: SceneLoader
): Promise<[Scene, Sound[]]> => {
  const scene = new Scene(engine)
  const manager = new AssetsManager(scene)
  manager.useDefaultLoadingScreen = false
  manager.autoHideLoadingUI = false
  const sounds = await loader(manager, scene)

  return [scene, sounds]
}

window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)

  engine.loadingScreen.displayLoadingUI()

  const [introScene, introSounds] = await createScene(engine, loadIntroAssets)
  const [mainScene, mainSounds] = await createScene(engine, loadMainAssets)

  let showIntro = true
  initIntro(introScene, introSounds, () => {
    showIntro = false
  })
  initMain(mainScene, mainSounds)

  engine.loadingScreen.hideLoadingUI()

  if (inspectorRequested()) {
    introScene.debugLayer.show()
    mainScene.debugLayer.show()
  }

  engine.runRenderLoop(() => {
    const scene = showIntro ? introScene : mainScene
    scene.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
})
