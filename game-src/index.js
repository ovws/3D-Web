import './threejs-override.js'
import { Game } from './Game/Game.js'
import consoleLog from './data/consoleLog.js'

if(import.meta.env.VITE_LOG)
    console.log(
        ...consoleLog
    )

const showStartupError = (error) =>
{
    console.error('Unable to start the 3D scene.', error)

    if(!document.querySelector('.js-startup-error'))
    {
        const notice = document.createElement('section')
        const title = document.createElement('h1')
        const message = document.createElement('p')

        notice.className = 'js-startup-error startup-error'
        notice.setAttribute('role', 'alert')
        title.textContent = '3D 场景未能启动'
        message.textContent = '此体验需要 WebGL2 或 WebGPU。请更新浏览器或开启硬件加速后重试。'

        notice.append(title, message)
        document.body.append(notice)
    }

    if(window.parent !== window)
        window.parent.postMessage({ type: 'ovws-game-startup-error' }, window.location.origin)
}

const supports3DRenderer = () =>
{
    const probe = document.createElement('canvas')
    const hasWebGPU = 'gpu' in navigator
    const hasWebGL2 = Boolean(probe.getContext('webgl2'))

    return hasWebGPU || hasWebGL2
}

if(!supports3DRenderer())
{
    showStartupError(new Error('WebGL2 or WebGPU is unavailable'))
}
else
{
    const game = new Game()

    if(import.meta.env.VITE_GAME_PUBLIC)
        window.game = game

    game.ready.catch(showStartupError)
}
