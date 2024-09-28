import express from 'express';
import esbuild from 'esbuild';
import fs from 'fs';
import { fileURLToPath } from 'node:url'
import { createElement } from 'react';
import path from 'path';
import { parse } from 'es-module-lexer';
import { writeFile } from 'node:fs/promises';
// import * as ReactServerDOM  from 'react-server-dom-webpack/server.browser';
import * as ReactServerDOM from 'react-server-dom-vite-alpha/server.browser';

const { renderToPipeableStream, renderToReadableStream } = ReactServerDOM;

console.log(renderToReadableStream);


const app = express();

app.use("/dist", express.static('./dist'));

app.get('/', (req, res) => {
    // render the client-side app
    // load the html file
    const html = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
    return res.send(html);
});

const appDirectory = new URL('./app/', import.meta.url);

const resolveApp = (path = '') => {
    return fileURLToPath(new URL(path, appDirectory));
}

const clientComponentMap = {};


async function buildJsx() {
    const clientComponents = new Set();
    // regex for .tsx and .jsx files
    const reactComponentRegex = /\.(tsx|jsx)$/i;

    // Build the server components
    await esbuild.build({
        bundle: true,
        format: "esm",
        entryPoints: [resolveApp('entry-server.tsx')],
        outdir: "dist",
        packages: "external",
        platform: "node",
        resolveExtensions: [".ts", ".tsx", ".js", ".jsx"],
        jsx: "transform",
        plugins: [
            {
                name: "resolve-client-imports",
                setup(build) {
                    build.onResolve({ filter: reactComponentRegex }, async ({ path }) => {
                        const relativePath = path.replace(/['"]/g, '');
                        const contents = fs.readFileSync(relativePath, 'utf-8');

                        if (contents.startsWith("'use client'")) {
                            clientComponents.add(relativePath);
                            console.log('clientComponents', clientComponents);
                            return {
                                external: true,
                                path: path
                            }


                        }
                    })
                }

            }
        ]
    });

    // build the cleint components
    const { outputFiles } = await esbuild.build({
        bundle: true,
        entryPoints: [resolveApp('entry-client.tsx')],
        format: "esm",
        outdir: "dist",
        jsx: "transform",
        splitting: true,
    });

    if (!outputFiles) return;

    outputFiles.forEach(async (file) => {
        const [, exports] = parse(file.path);
        let contents = file.text;

        for (const exp of exports) {
            const key = file.path + exp.e;

            clientComponentMap[key] = {
                id : `/dist/${path.basename(file.path)}`,
                name: exp.n,
                chunks: [],
                async: true
            }

            contents += `
            ${exp.ln}.$$id = ${JSON.stringify(key)};
            ${exp.ln}.$$typeof = Symbol.for("react.client.reference");`

            await writeFile(file.path, contents, {
                encoding: 'utf-8'
            });
        }


    })
}

// app.get('/render', async (req, res) => {
//     // Basic render to string using the react-dom/server
//     // @ts-ignore
//     const page = await import('./dist/entry-server.js');

//     const stream = renderToPipeableStream(createElement(page.default));
//     res.setHeader('Content-Type', 'text/html');

//     stream.pipe(res);
// });


app.get('/rsc', async (req, res) => {
    // This is where we would import the server-rendered content
    // @ts-ignore
    const page = await import('./dist/entry-server.js');
    const reactApp = createElement(page.default);
    const stream = await renderToReadableStream(reactApp, clientComponentMap);

    const reader = stream.getReader();
    res.setHeader('Content-Type', 'text/html');

    // Function to push chunks from the Web stream to the Express response
    async function push() {
        const { done, value } = await reader.read();
        if (done) {
            return res.end();
        }

        // Write chunk to the response
        res.write(value);
        push(); // Continue reading the next chunk
    }
    push();

});

app.listen(4000, async () => {
    await buildJsx();
    console.log('Server is running on http://localhost:4000');
});
