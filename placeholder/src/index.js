import { Application, Sprite, WRAP_MODES, filters, Loader } from 'pixi.js'
import './styles.css'
import BackgroundImage from './unburn1M-CVWingren-scaled.jpg'
import DisplacementImage from './displacement.jpg'

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
  sprite.scale.set(0.25)
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

const init = ({ background, displacement }) => {
  const bgSprite = createBackgroundSprite(background.texture)
  stage.addChild(bgSprite)

  const dispSprite = createDisplacementSprite(displacement.texture)
  stage.addChild(dispSprite)

  const filter = new filters.DisplacementFilter(dispSprite)
  stage.filters = [filter]

  let time = 0
  ticker.add(() => {
    dispSprite.position.set(-time, time)
    time++
  })

  window.addEventListener('resize', () => resize(bgSprite))

  resize(bgSprite)
}

const loader = new Loader()
loader.add('background', BackgroundImage).add('displacement', DisplacementImage)
loader.load((_, resources) => init(resources))
