import {
  Axis,
  Color3,
  HemisphericLight,
  RefractionPostProcess,
  Sound,
  Space,
  Vector3,
} from '@babylonjs/core'

import EnvironmentCamera from './camera'
import { Stage } from './stage'
import { loadAssets } from './assets'

import mainScene from '../assets/main/MAINLEVEL_COMPRESSEDTEXTURES.10.8.2021.glb'
import unburn1 from '../assets/main/V1_UNBURN_02.09.21.mp3'
import unburn2 from '../assets/main/V2_UNBURN_02.09.21.mp3'
import unburn3 from '../assets/main/V3_UNBURN_02.09.21.mp3'
import unburn4 from '../assets/main/V4_UNBURN_02.09.21.mp3'
import end1 from '../assets/main/V1_END.mp3'
import end2 from '../assets/main/V2_END.mp3'
import end3 from '../assets/main/V3_END.mp3'
import end4 from '../assets/main/V4_END.mp3'
import displacement from '../assets/main/displacement-blur.jpg'
import { lyricsMeshes, initLyrics, handleLyricsVisibility } from './lyrics'

const cameraStartY = 20.0
const cameraEndY = -115.0
const audioOffsetSeconds = -5.0
const refractionDepth = 0.1
const endSoundsIncrement = 0.0001

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
    end1,
    end2,
    end3,
    end4,
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

  async initialize(
    allSounds: Sound[],
    positionalSounds: Sound[]
  ): Promise<void> {
    const radius = 1.0

    const endSounds = allSounds.filter(({ name }) =>
      ['end1', 'end2', 'end3', 'end4'].includes(name)
    )

    const camera = new EnvironmentCamera(
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
      camera.camera
    )

    const lyrics = initLyrics(this.scene)

    const cameraSpeed = getCameraSpeed(positionalSounds[0])
    let yPosition = cameraStartY
    let endSoundsVolume = 0
    let isEndSoundsPlaying = false
    this.scene.registerBeforeRender(() => {
      const { currentTime } = positionalSounds[0]
      handleLyricsVisibility(
        lyrics,
        currentTime,
        yPosition,
        camera.camera.alpha
      )

      camera.camera.target.y = yPosition
      camera.camera.radius = radius

      // Move camera until bottom of the scene
      if (yPosition > cameraEndY) {
        yPosition += this.scene.getAnimationRatio() * cameraSpeed
        // At the bottom move the last lyrics up
      } else {
        lyrics[lyrics.length - 1].node.translate(
          Axis.Y,
          -(this.scene.getAnimationRatio() * cameraSpeed),
          Space.WORLD
        )

        // Initialize end sounds
        if (!isEndSoundsPlaying) {
          camera.positionalSounds = endSounds
          camera.masterVolume = 0
          camera.applyPositionalSounds((sound) => {
            sound.loop = true
            sound.setVolume(0)
            sound.play()
          })
          isEndSoundsPlaying = true
          // Fade in end sounds
        } else {
          camera.masterVolume = endSoundsVolume
          endSoundsVolume += endSoundsIncrement
          if (endSoundsVolume > 1.0) {
            endSoundsVolume = 1.0
          }
        }
      }
    })
  }

  render(): void {
    this.scene.render()
  }
}
