import {
  Color4,
  HemisphericLight,
  Scene,
  Sound,
  Vector3,
} from '@babylonjs/core'
import createCamera from './camera'

const cameraStartY = 20.0
const cameraEndY = -115.0
const audioOffsetSeconds = -5.0

export default function init(scene: Scene, sounds: Sound[]): void {
  scene.clearColor = new Color4(0, 0, 0, 1.0)

  const radius = 1.0

  const camera = createCamera(
    radius,
    new Vector3(0, cameraStartY, 0),
    Math.PI / 2,
    sounds,
    scene,
    scene.getEngine().getRenderingCanvas()!
  )
  new HemisphericLight('Light', new Vector3(0, 1.0, 0), scene)

  const audioSeconds = sounds[0].getAudioBuffer()!.duration
  const cameraDistance = cameraEndY - cameraStartY
  const cameraSpeed =
    cameraDistance / (audioSeconds + audioOffsetSeconds) / 60.0

  let yPosition = cameraStartY
  scene.registerBeforeRender(() => {
    camera.target.y = yPosition
    camera.radius = radius

    if (yPosition > cameraEndY) {
      yPosition += scene.getAnimationRatio() * cameraSpeed
    }
  })
}
