import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import path from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),
    kit: {
        adapter: adapter(),

        // Override http methods in the Todo forms
        methodOverride: {
            allowed: ['PATCH', 'DELETE'],
        },
        package: {
            dir: 'package',
            emitTypes: true,
        },
        vite: {
            resolve: {
                alias: {
                    $lib: path.resolve('./src/lib'),
                },
            },
            ssr: {
                noExternal: ['@popperjs/core'],
            },
        },
    },
}

export default config
