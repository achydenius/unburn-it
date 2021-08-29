import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  RefractionPostProcess,
  Sound,
  Vector3,
} from '@babylonjs/core'

import createCamera from './camera'
import { createSceneContainer, SceneContainer, Stage } from './stage'
import { loadAssets } from './assets'

import mainScene from './assets/main/MAINLEVEL_COMPRESSEDTEXTURES.10.8.2021.glb'
import unburn1 from './assets/main/V1_UNBURN_13.08.21.mp3'
import unburn2 from './assets/main/V2_UNBURN_13.08.21.mp3'
import unburn3 from './assets/main/V3_UNBURN_13.08.21.mp3'
import unburn4 from './assets/main/V4_UNBURN_13.08.21.mp3'
import displacement from './assets/main/displacement-blur.jpg'
import lyrics1 from './assets/main/01_BURN_IT.glb'
import lyrics2 from './assets/main/02_TINRUBNU.glb'
import lyrics3 from './assets/main/03_DRAWKCAB.glb'
import lyrics4 from './assets/main/04_ASH_TO_ASH.glb'
import lyrics5 from './assets/main/05_DUST_TO_TRASH.glb'
import lyrics6 from './assets/main/06_BURN_IT_BACKWARD.glb'
import lyrics7 from './assets/main/07_BACKWARD.glb'
import lyrics8 from './assets/main/08_UNBURN_IT.glb'
import lyrics9 from './assets/main/09_WORLDS_ALMOST_COOKED.glb'
import lyrics10 from './assets/main/10_ITS_ON_FIRE.glb'
import lyrics11 from './assets/main/11_MY_WORLDS_ON_FIRE.glb'
import lyrics12 from './assets/main/12_HOW_BOUT_YOURS.glb'
import lyrics13 from './assets/main/13_IVE_GOT_A_BAD_DESIRE.glb'
import lyrics14 from './assets/main/14_THAT_RING_OF_FIRE.glb'
import lyrics15 from './assets/main/15_OHOH_IM.glb'
import lyrics16 from './assets/main/16_BURNING.glb'

const cameraStartY = 20.0
const cameraEndY = -115.0
const audioOffsetSeconds = -5.0
const refractionDepth = 0.1

const config = {
  scenes: {
    mainScene,
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

const lyricsConfig = {
  scenes: {
    lyrics1,
    lyrics2,
    lyrics3,
    lyrics4,
    lyrics5,
    lyrics6,
    lyrics7,
    lyrics8,
    lyrics9,
    lyrics10,
    lyrics11,
    lyrics12,
    lyrics13,
    lyrics14,
    lyrics15,
    lyrics16,
  },
  sounds: {},
  textures: {
    displacement,
  },
}

const createLyricsScene = ({ scene }: SceneContainer): void => {
  new ArcRotateCamera(
    'LyricsCamera',
    -Math.PI / 2,
    -Math.PI,
    4.0,
    new Vector3(0, 0, 0),
    scene
  )

  new HemisphericLight('LyricsLight', new Vector3(0, 1.0, 0), scene)
}

export default class MainStage extends Stage {
  config = config

  positionalSoundNames = ['unburn1', 'unburn2', 'unburn3', 'unburn4']

  lyrics: SceneContainer

  constructor(engine: Engine) {
    super(engine)
    this.lyrics = createSceneContainer(engine)
    this.lyrics.scene.autoClear = false
  }

  async loadAssets(): Promise<Sound[]> {
    return Promise.all([
      ...(await loadAssets(this.config, this.manager, this.scene)),
      ...(await loadAssets(
        lyricsConfig,
        this.lyrics.manager,
        this.lyrics.scene
      )),
    ])
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

    createLyricsScene(this.lyrics)

    const buffer = positionalSounds[0].getAudioBuffer()
    if (!buffer) {
      throw Error('Audio buffer not defined!')
    }
    const audioSeconds = buffer.duration
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

  render(): void {
    this.scene.render()
    this.lyrics.scene.render()
  }
}
