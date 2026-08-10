import 'dotenv/config'
import restart from 'vite-plugin-restart'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default ({ command }) => ({
    root: './',
    envDir: './',
    publicDir: command === 'serve' ? '../public/game/' : false,
    base: './',
    server: {
        host: true,
        open: false,
    },
    build: {
        outDir: '../public/game',
        emptyOutDir: false,
        sourcemap: false,
    },
    plugins: [
        wasm(),
        topLevelAwait(),
        restart({ restart: [ '../public/game/**' ] }),
        nodePolyfills(),
    ],
})
