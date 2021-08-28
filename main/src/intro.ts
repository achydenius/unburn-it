import {
  ActionManager,
  Color3,
  CombineAction,
  Engine,
  ExecuteCodeAction,
  HemisphericLight,
  InterpolateValueAction,
  MeshBuilder,
  PlaySoundAction,
  ShaderMaterial,
  Sound,
  StopSoundAction,
  Vector3,
} from '@babylonjs/core'
import introScene from './assets/intro/SCENE_1.COMPRESSED_TEXTURES.10.8.2021.glb'
import center from './assets/intro/1(CENTER)_ENTRY_26.07.21.mp3'
import left from './assets/intro/2(LEFT)_ENTRY_26.07.21.mp3'
import right from './assets/intro/3(RIGHT)_ENTRY_26.07.21.mp3'
import back from './assets/intro/4(BACK)_ENTRY_26.07.21.mp3'
import hover from './assets/intro/PLAY_HOVER.mp3'
import click1 from './assets/intro/PLAY_CLICK1.mp3'
import click2 from './assets/intro/PLAY_CLICK2.mp3'
import click3 from './assets/intro/PLAY_CLICK3.mp3'
import click4 from './assets/intro/PLAY_CLICK4.mp3'
import click5 from './assets/intro/PLAY_CLICK5.mp3'
import Level from './level'
import createCamera from './camera'
import createWaterMaterial from './water'

const config = {
  name: 'intro',
  scene: introScene,
  sounds: {
    center,
    left,
    right,
    back,
    hover,
    click1,
    click2,
    click3,
    click4,
    click5,
  },
  textures: {},
}

export default class IntroLevel extends Level {
  config = config

  positionalSoundNames = ['center', 'left', 'right', 'back']

  onClick: () => void

  constructor(engine: Engine, onClick: () => void) {
    super(engine)
    this.onClick = onClick
  }

  init(): void {
    createCamera(
      20.0,
      new Vector3(0, 0, 0),
      Math.PI / 2.5,
      this.getPositionalSounds(),
      this.scene,
      this.scene.getEngine().getRenderingCanvas()!
    )
    new HemisphericLight('Light', new Vector3(0, 1.0, 0), this.scene)
    const waterMaterial = this.createWater()

    this.initPlayButton(this.onClick)

    let time = 0
    this.scene.registerBeforeRender(() => {
      // Update water
      time += this.scene.getEngine().getDeltaTime() * 0.0005
      waterMaterial.setFloat('time', time)
    })
  }

  private getHoverSound(): Sound {
    return this.sounds!.find(({ name }) => name === 'hover')!
  }

  private getClickSounds(): Sound[] {
    return this.sounds!.filter(({ name }) => name.startsWith('click'))
  }

  private createWater(): ShaderMaterial {
    const plane = MeshBuilder.CreateGround(
      'Plane',
      { width: 1000, height: 1000 },
      this.scene
    )
    const waterMaterial = createWaterMaterial(
      this.scene,
      this.scene.meshes.filter((mesh) => mesh.id !== 'Plane')
    )
    plane.material = waterMaterial

    return waterMaterial
  }

  private initPlayButton(onClick: () => void): void {
    const plane = this.scene.getMeshByID('Plane')
    plane!.isPickable = false

    const mesh = this.scene.getMeshByID('play_start_text')
    if (!mesh) {
      throw Error('play_start_text mesh not found!')
    }

    const hoverSound = this.getHoverSound()
    const clickSounds = this.getClickSounds()
    const positionalSounds = this.getPositionalSounds()

    mesh.actionManager = new ActionManager(this.scene)

    mesh.actionManager.registerAction(
      new CombineAction(ActionManager.OnPointerOverTrigger, [
        new InterpolateValueAction(
          ActionManager.NothingTrigger,
          mesh.material,
          'emissiveColor',
          new Color3(1.0, 1.0, 1.0),
          250
        ),
        new PlaySoundAction(ActionManager.NothingTrigger, hoverSound),
      ])
    )

    mesh.actionManager.registerAction(
      new CombineAction(ActionManager.OnPointerOutTrigger, [
        new InterpolateValueAction(
          ActionManager.NothingTrigger,
          mesh.material,
          'emissiveColor',
          new Color3(0, 0, 0),
          250
        ),
        new StopSoundAction(ActionManager.NothingTrigger, hoverSound),
      ])
    )

    let clickIndex = 0
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        if (clickIndex >= 0) {
          clickSounds[clickIndex].stop()
        }
        clickIndex = (clickIndex + 1) % clickSounds.length
        clickSounds[clickIndex].play()

        hoverSound.stop()
        positionalSounds.forEach((sound) => sound.stop())
        mesh.actionManager!.actions.forEach((action) =>
          mesh.actionManager!.unregisterAction(action)
        )
        onClick()
      })
    )
  }
}
