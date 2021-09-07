import { ActionManager, Engine, ILoadingScreen } from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import IntroStage from './intro'
import MainStage from './main'
import { Stage } from './stage'

class LoadingScreen implements ILoadingScreen {
  loadingUIBackgroundColor = '#000'

  loadingUIText = ''

  /* eslint-disable */
  displayLoadingUI(): void {
    document.getElementById('loader')!.style.display = 'block'
  }

  hideLoadingUI() {
    document.getElementById('loader')!.style.display = 'none'
  }
  /* eslint-enable */
}

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

let stage: Stage
window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)

  engine.loadingScreen = new LoadingScreen()

  const mainStage = new MainStage(engine)
  const introStage = new IntroStage(engine, (manager: ActionManager) => {
    stage = mainStage

    manager.actions.forEach((action) => manager.unregisterAction(action))

    if (inspectorRequested()) {
      introStage.scene.debugLayer.hide()
      mainStage.scene.debugLayer.show()
    }
  })

  mainStage.scene.doNotHandleCursors = true
  introStage.scene.doNotHandleCursors = true

  stage = introStage

  engine.loadingScreen.displayLoadingUI()

  await introStage.loadAndInit()
  await mainStage.loadAndInit()

  engine.loadingScreen.hideLoadingUI()

  Engine.audioEngine.setGlobalVolume(0.5)

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
