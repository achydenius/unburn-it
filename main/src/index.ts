import { Engine } from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import IntroLevel from './intro'
import MainLevel from './main'

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

let showIntro = true
window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)

  const introLevel = new IntroLevel(engine, () => {
    showIntro = false
  })
  const mainLevel = new MainLevel(engine)

  engine.loadingScreen.displayLoadingUI()

  await introLevel.loadAssets()
  await mainLevel.loadAssets()

  introLevel.init()
  mainLevel.init()

  engine.loadingScreen.hideLoadingUI()

  if (inspectorRequested()) {
    introLevel.scene.debugLayer.show()
    mainLevel.scene.debugLayer.show()
  }

  engine.runRenderLoop(() => {
    const level = showIntro ? introLevel : mainLevel
    level.scene.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
})
