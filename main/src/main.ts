import {
  Color3,
  HemisphericLight,
  RefractionPostProcess,
  Sound,
  Vector3,
} from '@babylonjs/core'

import createCamera from './camera'
import { Stage } from './stage'
import { loadAssets } from './assets'

import mainScene from './assets/main/MAINLEVEL_COMPRESSEDTEXTURES.10.8.2021.glb'
import unburn1 from './assets/main/V1_UNBURN_13.08.21.mp3'
import unburn2 from './assets/main/V2_UNBURN_13.08.21.mp3'
import unburn3 from './assets/main/V3_UNBURN_13.08.21.mp3'
import unburn4 from './assets/main/V4_UNBURN_13.08.21.mp3'
import displacement from './assets/main/displacement-blur.jpg'
import { lyricsMeshes, initLyrics, handleLyricsVisibility } from './lyrics'

const cameraStartY = 20.0
const cameraEndY = -115.0
const audioOffsetSeconds = -5.0
const refractionDepth = 0.1

const config = {
  scenes: {
    mainScene,
    ...lyricsMeshes,
  },
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

const getCameraSpeed = (music: Sound): number => {
  const buffer = music.getAudioBuffer()
  if (!buffer) {
    throw Error('Audio buffer not defined!')
  }
  const audioSeconds = buffer.duration
  const cameraDistance = cameraEndY - cameraStartY
  return cameraDistance / (audioSeconds + audioOffsetSeconds) / 60.0
}

export default class MainStage extends Stage {
  config = config

  positionalSoundNames = ['unburn1', 'unburn2', 'unburn3', 'unburn4']

  async loadAssets(): Promise<Sound[]> {
    return loadAssets(this.config, this.manager, this.scene)
  }

  async initialize(_: Sound[], positionalSounds: Sound[]): Promise<void> {
    const radius = 1.0

    const camera = createCamera(
      radius,
      new Vector3(0, cameraStartY, 0),
      Math.PI / 2,
      positionalSounds,
      this.scene,
      this.canvas
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

    const lyrics = initLyrics(this.scene)

    const cameraSpeed = getCameraSpeed(positionalSounds[0])
    let yPosition = cameraStartY
    this.scene.registerBeforeRender(() => {
      const { currentTime } = positionalSounds[0]
      handleLyricsVisibility(lyrics, currentTime, yPosition, camera.alpha)

      camera.target.y = yPosition
      camera.radius = radius

      if (yPosition > cameraEndY) {
        yPosition += this.scene.getAnimationRatio() * cameraSpeed
      }
    })
  }

  render(): void {
    this.scene.render()
  }
}
