import { Application, Sprite, WRAP_MODES, filters, Loader } from './pixi'
import './styles.css'
import BackgroundImage from './assets/unburn1M-CVWingren-scaled-compressed.jpg'
import DisplacementImage from './assets/displacement.jpg'

const displacementScale = 0.5
const animationSpeed = 1.0
const movementFriction = 0.9
const movementScale = 0.05

const app = new Application({
  view: document.getElementById('canvas'),
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
})
const { stage, ticker, renderer } = app

const createBackgroundSprite = (texture) => {
  const sprite = Sprite.from(texture)
  sprite.anchor.set(0.5)
  return sprite
}

const createDisplacementSprite = (texture) => {
  const sprite = Sprite.from(texture)
  sprite.texture.baseTexture.wrapMode = WRAP_MODES.REPEAT
  sprite.scale.set(displacementScale)
  return sprite
}

const resize = (bgSprite) => {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight

  const ratio = Math.max(
    width / bgSprite.texture.width,
    height / bgSprite.texture.height
  )
  bgSprite.scale.set(ratio)
  bgSprite.position.set(width / 2, height / 2)

  renderer.resize(width, height)
}

let previousMove = { x: 0, y: 0 }
let velocity = { x: 0, y: 0 }
const move = (x, y) => {
  velocity.x += x - previousMove.x
  velocity.y += y - previousMove.y
  previousMove = { x, y }
}

const init = ({ background, displacement }) => {
  const bgSprite = createBackgroundSprite(background.texture)
  stage.addChild(bgSprite)

  const dispSprite = createDisplacementSprite(displacement.texture)
  stage.addChild(dispSprite)

  const filter = new filters.DisplacementFilter(dispSprite)
  stage.filters = [filter]

  ticker.add(() => {
    dispSprite.position.x += velocity.x * movementScale - animationSpeed
    dispSprite.position.y += velocity.y * movementScale + animationSpeed
    velocity.x *= movementFriction
    velocity.y *= movementFriction
  })

  window.addEventListener('resize', () => resize(bgSprite))

  const canvas = document.getElementById('canvas')
  canvas.addEventListener('mousemove', ({ clientX, clientY }) =>
    move(clientX, clientY)
  )
  canvas.addEventListener('touchstart', ({ touches }) => {
    previousMove = { x: touches[0].clientX, y: touches[0].clientY }
  })
  canvas.addEventListener('touchmove', ({ touches }) =>
    move(touches[0].clientX, touches[0].clientY)
  )

  resize(bgSprite)
}

const loader = new Loader()
loader.add('background', BackgroundImage).add('displacement', DisplacementImage)
loader.load((_, resources) => init(resources))
