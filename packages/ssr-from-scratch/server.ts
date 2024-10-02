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
import { preserveDirectivesPlugin } from 'esbuild-plugin-preserve-directives';
import ReactServerDOM2 from 'react-server-dom-esm/server';
import { relative } from 'node:path';
import e from 'express';

const { renderToReadableStream } = ReactServerDOM;
// const { renderToPipeableStream, renderToReadableStream } = ReactServerDOM2;
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
const distDirectory = new URL('./dist/', import.meta.url);

const resolveApp = (path = '') => {
    return fileURLToPath(new URL(path, appDirectory));
}

const resolveDist = (path = '') => {
    return fileURLToPath(new URL(path, distDirectory));
}
const clientComponentMap = {};


async function buildJsx() {
    const clientComponents = new Set();
    // regex for .tsx and .jsx files
    const reactFileRegex = /\.(tsx|jsx|ts|js)$/;
    const clientComponentRegex = /^['"]use client['"];?\s*(?:import|export|const|let|var|function)/;
    const serverComponentRegex = /^['"]use server['"];?\s*(?:import|export|const|let|var|function)/;
    // Build the server components
    await esbuild.build({
        bundle: true,
        format: "esm",
        logLevel: "info",
        entryPoints: [resolveApp('entry-server.tsx')],
        outdir: "dist",
        packages: "external",
        plugins: [
            {
                name: "resolve-client-imports",
                setup(build) {
                    build.onResolve({ filter: reactFileRegex }, async ({ path: rp }) => {
                        const formatPath = rp.replace(/['"]/g, '');
                        const relativePath = resolveApp(formatPath);

                        const contents = fs.readFileSync(relativePath, 'utf-8');

                        if (contents.startsWith("'use client'")) {
                            clientComponents.add(relativePath);
                            // only extract the file name
                            return {
                                external: true,
                                path: relativePath
                            }


                        }
                    })
                }

            }
        ]
    });

    const formattedClientComponents = Array.from(clientComponents).map((c: any) => {
        return resolveApp(c);
    });

    // build client entry file
    await esbuild.build({
        bundle: true,
        entryPoints: [resolveApp('entry-client.tsx')],
        format: "cjs",
        outdir: "dist",
        write: true,
    });

    // build the client components
    const { outputFiles } = await esbuild.build({
        bundle: true,
        // @ts-ignore
        entryPoints: [resolveApp('entry-client.tsx'), ...clientComponents.values()],
        format: "esm",
        outdir: "dist",
        write: false,
        splitting: true,
        metafile: true,
        plugins: [
            preserveDirectivesPlugin({
                directives: ['use client', 'use server', 'use strict'],
                include: /\.(js|ts|jsx|tsx)$/,
                exclude: /node_modules/,
            })
        ]

    });

    if (!outputFiles) {
        return;
    }

    outputFiles.forEach(async (file) => {
        const [, exports] = parse(file.text);
        let contents = file.text;

        for (const exp of exports) {
            const key = file.path + exp.n;

            clientComponentMap[key] = {
                id: `/dist/${relative(resolveDist(), file.path)}`,
                name: exp.n,
                chunks: [],
                async: true
            }


            contents += `
            ${exp.ln}.$$id = ${JSON.stringify(key)};
            ${exp.ln}.$$typeof = Symbol.for("react.client.reference");`
            fs.writeFileSync(file.path, contents, {
                encoding: 'utf-8'
            });
        }
    });
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
    // @ts-ignore
    const reactApp = createElement(page.default);
    console.log(clientComponentMap);
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
