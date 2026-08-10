const fallbackMessage = '此体验需要 WebGL2 或 WebGPU。请更新浏览器或开启硬件加速后重试。'

const showStartupError = (error) =>
{
    if(error)
        console.error('Unable to start the 3D scene.', error)

    if(!document.querySelector('.js-startup-error'))
    {
        const notice = document.createElement('section')
        const title = document.createElement('h1')
        const message = document.createElement('p')

        notice.className = 'js-startup-error'
        notice.setAttribute('role', 'alert')
        notice.setAttribute('aria-live', 'assertive')
        title.textContent = '3D 场景未能启动'
        message.textContent = fallbackMessage

        Object.assign(notice.style, {
            position: 'fixed',
            inset: '0',
            zIndex: '9999',
            display: 'grid',
            placeContent: 'center',
            padding: '32px',
            color: '#fff8f3',
            background: 'radial-gradient(farthest-side at 0 0, #2b2330, #1d1721)',
            fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
            textAlign: 'center',
        })
        Object.assign(title.style, {
            margin: '0 0 12px',
            fontSize: 'clamp(28px, 5vw, 52px)',
        })
        Object.assign(message.style, {
            maxWidth: '460px',
            margin: '0',
            color: 'rgba(255, 248, 243, 0.78)',
            fontSize: 'clamp(15px, 2vw, 20px)',
            lineHeight: '1.6',
        })

        notice.append(title, message)
        document.body.append(notice)
    }

    if(window.parent !== window)
        window.parent.postMessage({ type: 'ovws-game-startup-error' }, window.location.origin)
}

const supports3DRenderer = () =>
{
    const probe = document.createElement('canvas')

    return 'gpu' in navigator || Boolean(probe.getContext('webgl2'))
}

window.addEventListener('error', (event) =>
{
    if(event.error)
        showStartupError(event.error)
})

window.addEventListener('unhandledrejection', (event) =>
{
    showStartupError(event.reason)
})

if(supports3DRenderer())
    import('./index-BSIXIL5J.js').catch(showStartupError)
else
    showStartupError()
