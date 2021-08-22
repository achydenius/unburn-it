import { HemisphericLight, Vector3 } from '@babylonjs/core'
import mainScene from './assets/MAINLEVEL_COMPRESSEDTEXTURES.10.8.2021.glb'
import unburn1 from './assets/V1_UNBURN_13.08.21.mp3'
import unburn2 from './assets/V2_UNBURN_13.08.21.mp3'
import unburn3 from './assets/V3_UNBURN_13.08.21.mp3'
import unburn4 from './assets/V4_UNBURN_13.08.21.mp3'
import createCamera from './camera'
import Level from './level'

const cameraStartY = 20.0
const cameraEndY = -115.0
const audioOffsetSeconds = -5.0

const config = {
  name: 'main',
  scene: mainScene,
  sounds: {
    unburn1,
    unburn2,
    unburn3,
    unburn4,
  },
}

export default class MainLevel extends Level {
  config = config

  positionalSoundNames = ['unburn1', 'unburn2', 'unburn3', 'unburn4']

  init(): void {
    const radius = 1.0

    const camera = createCamera(
      radius,
      new Vector3(0, cameraStartY, 0),
      Math.PI / 2,
      this.getPositionalSounds(),
      this.scene,
      this.scene.getEngine().getRenderingCanvas()!
    )
    new HemisphericLight('Light', new Vector3(0, 1.0, 0), this.scene)

    const audioSeconds =
      this.getPositionalSounds()[0].getAudioBuffer()!.duration
    const cameraDistance = cameraEndY - cameraStartY
    const cameraSpeed =
      cameraDistance / (audioSeconds + audioOffsetSeconds) / 60.0

    let yPosition = cameraStartY
    this.scene.registerBeforeRender(() => {
      camera.target.y = yPosition
      camera.radius = radius

      if (yPosition > cameraEndY) {
        yPosition += this.scene.getAnimationRatio() * cameraSpeed
      }
    })
  }
}
