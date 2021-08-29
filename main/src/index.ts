import { Engine } from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import IntroStage from './intro'
import MainStage from './main'
import { Stage } from './stage'

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

let stage: Stage
window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)

  const mainStage = new MainStage(engine)
  const introStage = new IntroStage(engine, () => {
    stage = mainStage

    if (inspectorRequested()) {
      introStage.scene.debugLayer.hide()
      mainStage.scene.debugLayer.show()
    }
  })
  stage = introStage

  engine.loadingScreen.displayLoadingUI()

  await introStage.loadAndInit()
  await mainStage.loadAndInit()

  engine.loadingScreen.hideLoadingUI()

  if (inspectorRequested()) {
    introStage.scene.debugLayer.show()
  }

  engine.runRenderLoop(() => {
    stage.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
})
