import * as THREE from 'three/webgpu'

const text = `
 ██████╗ ██╗   ██╗██╗    ██╗███████╗
██╔═══██╗██║   ██║██║    ██║██╔════╝
██║   ██║██║   ██║██║ █╗ ██║███████╗
██║   ██║╚██╗ ██╔╝██║███╗██║╚════██║
╚██████╔╝ ╚████╔╝ ╚███╔███╔╝███████║
 ╚═════╝   ╚═══╝   ╚══╝╚══╝ ╚══════╝

╔═ Profile ═════════════╗
║ 文山木公 · OVWS
║ 無法改變現狀，那就享受當下。
║ Self-hosting · Rime · AI tooling · Ops craft
║ Shenzhen · CN
╚═══════════════════════╝

╔═ Links ═══════════════╗
║ Home    ⇒ https://www.qiwensong.com/
║ Blog    ⇒ https://blog.loser.dev/
║ Mail    ⇒ work@qiwensong.com
║ GitHub  ⇒ https://github.com/ovws
║ X       ⇒ https://x.com/qwstdx
║ Zhihu   ⇒ https://www.zhihu.com/people/tdws
║ Gallery ⇒ https://ovws.github.io/Gallery-Yan/
╚═══════════════════════╝

╔═ Current focus ═══════╗
║ Bringing systems thinking into e-commerce operations.
║ Building self-hosted services, Rime workflows and practical AI glue.
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ Add #debug to the URL and reload. Press [V] for the free camera.
╚═══════════════════════╝

╔═ 3D foundation ═══════╗
║ Three.js ${THREE.REVISION} · Rapier · Howler.js
║ Personalized from Bruno Simon's Folio 2025 under the MIT license.
║ https://github.com/brunosimon/folio-2025
║ Music by Kounine, released under CC0.
╚═══════════════════════╝
`

let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'
        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
