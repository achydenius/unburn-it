import {
  AbstractMesh,
  ActionManager,
  Color3,
  CombineAction,
  ExecuteCodeAction,
  InterpolateValueAction,
  PlaySoundAction,
  StopSoundAction,
} from '@babylonjs/core'
import { Sound } from '@babylonjs/core/Audio/sound'

export const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)]

export const getHoverSound = (sounds: Sound[]): Sound => {
  const sound = sounds.find(({ name }) => name === 'hoverSound')
  if (sound) {
    return sound
  }
  throw Error('Hover sound not found!')
}

export const getClickSounds = (sounds: Sound[]): Sound[] =>
  sounds.filter(({ name }) => name.startsWith('click'))

export const createButtonActions = (
  mesh: AbstractMesh,
  sounds: Sound[],
  positionalSounds: Sound[],
  onClick: (manager: ActionManager) => void
): void => {
  const manager = new ActionManager(mesh.getScene())
  const hoverSound = getHoverSound(sounds)

  manager.registerAction(
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

  manager.registerAction(
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

  const clickSounds = getClickSounds(sounds)
  manager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      pickRandom(clickSounds).play()
      positionalSounds.forEach((sound) => sound.stop())
      onClick(manager)
    })
  )

  mesh.actionManager = manager
}
