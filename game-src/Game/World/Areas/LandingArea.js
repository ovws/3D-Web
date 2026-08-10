import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'

export class LandingArea extends Area
{
    constructor(model)
    {
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    setLetters()
    {
        const references = this.references.items.get('letters')

        const name = '文山木公'
        const activeReferenceIndexes = [ 0, 1, 2, 5 ]
        const activeReferences = activeReferenceIndexes.map(index => references[index])
        const firstPosition = references[0].position.clone()
        const lastPosition = references.at(-1).position.clone()
        // The exported references are stored in reverse reading order.
        const direction = firstPosition.clone().sub(lastPosition).setY(0).normalize()
        const center = firstPosition.clone().add(lastPosition).multiplyScalar(0.5)
        const spacing = 1.65
        const redraws = []
        const letterItems = []

        const fonts = [
            { family: 'OVWS Home Common', file: 'NotoSansSC-118-wght-normal.woff2' },
            { family: 'OVWS Home Mountain', file: 'NotoSansSC-116-wght-normal.woff2' },
            { family: 'OVWS Home Wood', file: 'NotoSansSC-114-wght-normal.woff2' },
        ]
        const characterFonts = [ fonts[0], fonts[1], fonts[2], fonts[0] ]

        const createCharacter = (reference, character, font) =>
        {
            const canvas = document.createElement('canvas')
            canvas.width = 512
            canvas.height = 512
            const context = canvas.getContext('2d')
            const texture = new THREE.CanvasTexture(canvas)
            texture.colorSpace = THREE.SRGBColorSpace
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.generateMipmaps = false

            const redraw = () =>
            {
                context.clearRect(0, 0, canvas.width, canvas.height)
                context.font = `800 390px "${font.family}", sans-serif`
                context.fillStyle = '#ffffff'
                context.textAlign = 'center'
                context.textBaseline = 'alphabetic'

                const metrics = context.measureText(character)
                const baseline = canvas.height * 0.5 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) * 0.5
                context.fillText(character, canvas.width * 0.5, baseline)
                texture.needsUpdate = true
            }
            redraw()
            redraws.push(redraw)

            reference.geometry.dispose()
            reference.geometry = new THREE.BufferGeometry()

            const geometry = new THREE.PlaneGeometry(1.5, 1.5)
            const layerCount = 9
            const depth = 0.44

            for(let layerIndex = 0; layerIndex < layerCount; layerIndex++)
            {
                const isFace = layerIndex === 0 || layerIndex === layerCount - 1
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    color: isFace ? 0xffb2c8 : 0x521442,
                    transparent: true,
                    alphaTest: 0.25,
                    opacity: 0,
                    side: THREE.DoubleSide,
                })
                const layer = new THREE.Mesh(geometry, material)
                layer.position.z = (layerIndex / (layerCount - 1) - 0.5) * depth
                layer.castShadow = true
                layer.receiveShadow = true
                reference.add(layer)
            }
        }

        for(let referenceIndex = 0; referenceIndex < references.length; referenceIndex++)
        {
            const reference = references[referenceIndex]
            const physical = reference.userData.object.physical

            if(!activeReferenceIndexes.includes(referenceIndex))
            {
                reference.visible = false
                physical.body.setEnabled(false)
                continue
            }

            const characterIndex = activeReferences.indexOf(reference)
            reference.visible = false
            physical.body.setEnabled(false)

            const offset = (characterIndex - (name.length - 1) * 0.5) * spacing
            const targetPosition = center.clone().addScaledVector(direction, offset)
            targetPosition.y = center.y
            reference.position.copy(targetPosition)
            physical.body.setTranslation(targetPosition, false)
            physical.initialState.position = { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }

            createCharacter(reference, name[characterIndex], characterFonts[characterIndex])
            letterItems.push({ reference, physical })

            physical.colliders[0].setActiveEvents(this.game.RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
            physical.colliders[0].setContactForceEventThreshold(5)
            physical.onCollision = (force, position) =>
            {
                this.game.audio.groups.get('hitBrick').playRandomNext(force, position)
            }
        }

        const revealLetters = () =>
        {
            if(this.game.reveal.step < 2)
                return

            this.game.ticker.events.off('tick', revealLetters)

            gsap.delayedCall(0.15, () =>
            {
                for(const { reference, physical } of letterItems)
                {
                    reference.visible = true
                    physical.body.setEnabled(true)

                    for(const layer of reference.children)
                    {
                        if(layer.isMesh && layer.material)
                            gsap.to(layer.material, { opacity: 1, duration: 0.8, ease: 'power2.out', overwrite: true })
                    }
                }
            })
        }

        this.game.ticker.events.on('tick', revealLetters, 11)
        revealLetters()

        if(typeof FontFace === 'function' && document.fonts)
        {
            Promise.allSettled(fonts.map(async (font) =>
            {
                const url = new URL(`fonts/${font.file}`, document.baseURI)
                const fontFace = new FontFace(font.family, `url("${url.href}") format("woff2")`, { weight: '100 900' })
                await fontFace.load()
                document.fonts.add(fontFace)
            })).then(() =>
            {
                for(const redraw of redraws)
                    redraw()
            })
        }
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            '地图',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            '操作说明',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            '重置世界',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}
