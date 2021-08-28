import {
  Color3,
  HemisphericLight,
  RefractionPostProcess,
  Vector3,
} from '@babylonjs/core'
import mainScene from './assets/main/MAINLEVEL_COMPRESSEDTEXTURES.10.8.2021.glb'
import unburn1 from './assets/main/V1_UNBURN_13.08.21.mp3'
import unburn2 from './assets/main/V2_UNBURN_13.08.21.mp3'
import unburn3 from './assets/main/V3_UNBURN_13.08.21.mp3'
import unburn4 from './assets/main/V4_UNBURN_13.08.21.mp3'
import displacement from './assets/main/displacement-blur.jpg'
import createCamera from './camera'
import Level from './level'

const cameraStartY = 20.0
const cameraEndY = -115.0
const audioOffsetSeconds = -5.0
const refractionDepth = 0.1

const config = {
  name: 'main',
  scene: mainScene,
  sounds: {
    unburn1,
    unburn2,
    unburn3,
    unburn4,
  },
  textures: {
    displacement,
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

    new RefractionPostProcess(
      'Refraction',
      displacement,
      new Color3(1.0, 1.0, 1.0),
      refractionDepth,
      0,
      1.0,
      camera
    )

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
