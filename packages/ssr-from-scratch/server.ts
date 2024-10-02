import register from 'react-server-dom-webpack/node-register'
import express from 'express';
import esbuild from 'esbuild';
import fs from 'fs';
import { fileURLToPath } from 'node:url'
import { createElement } from 'react';
import path from 'path';
import { parse } from 'es-module-lexer';
import { readFile, writeFile } from 'node:fs/promises';
// import * as ReactServerDOM  from 'react-server-dom-webpack/server.browser';
import ReactServerDOM from 'react-server-dom-webpack/server.node';
import { relative } from 'node:path';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

register();

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(
  new URL('.', import.meta.url),
);


const appDirectory = new URL('./app/', import.meta.url);
const distDirectory = new URL('./dist/', import.meta.url);

const resolveApp = (path = '') => {
    return fileURLToPath(new URL(path, appDirectory));
}

const resolveDist = (path = '') => {
    return fileURLToPath(new URL(path, distDirectory));
}

const clientComponentMap = JSON.parse(
    await readFile(resolveDist('react-client-manifest.json'), {
        encoding: 'utf-8'
    })
);

// console.log(clientComponentMa);
  


const { renderToReadableStream, renderToPipeableStream } = ReactServerDOM;
// const { renderToPipeableStream, renderToReadableStream } = ReactServerDOM2;
console.log(renderToPipeableStream);


const app = express();
app.use("/dist", express.static('./dist'));

app.get('/', (req, res) => {
    // render the client-side app
    // load the html file
    const html = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
    return res.send(html);
});


// async function buildJsx() {
//     const clientComponents = new Set();
//     // regex for .tsx and .jsx files
//     const reactFileRegex = /\.(tsx|jsx|ts|js)$/;
//     const clientComponentRegex = /^['"]use client['"];?\s*(?:import|export|const|let|var|function)/;
//     const serverComponentRegex = /^['"]use server['"];?\s*(?:import|export|const|let|var|function)/;
//     // Build the server components
//     await esbuild.build({
//         bundle: true,
//         format: "esm",
//         logLevel: "info",
//         entryPoints: [resolveApp('entry-server.tsx')],
//         outdir: "dist",
//         packages: "external",
//         plugins: [
//             {
//                 name: "resolve-client-imports",
//                 setup(build) {
//                     build.onResolve({ filter: reactFileRegex }, async ({ path: rp }) => {
//                         const formatPath = rp.replace(/['"]/g, '');
//                         const relativePath = resolveApp(formatPath);

//                         const contents = fs.readFileSync(relativePath, 'utf-8');

//                         if (contents.startsWith("'use client'")) {
//                             clientComponents.add(relativePath);
//                             // only extract the file name
//                             return {
//                                 external: true,
//                                 path: relativePath
//                             }


//                         }
//                     })
//                 }

//             }
//         ]
//     });

//     const formattedClientComponents = Array.from(clientComponents).map((c: any) => {
//         return resolveApp(c);
//     });

//     // build client entry file
//     await esbuild.build({
//         bundle: true,
//         entryPoints: [resolveApp('entry-client.tsx')],
//         format: "cjs",
//         outdir: "dist",
//         write: true,
//     });

//     // build the client components
//     const { outputFiles } = await esbuild.build({
//         bundle: true,
//         // @ts-ignore
//         entryPoints: [resolveApp('entry-client.tsx'), ...clientComponents.values()],
//         format: "esm",
//         outdir: "dist",
//         write: false,
//         splitting: true,
//         metafile: true,

//     });

//     if (!outputFiles) {
//         return;
//     }

//     outputFiles.forEach(async (file) => {
//         const [, exports] = parse(file.text);
//         let contents = file.text;

//         for (const exp of exports) {
//             const key = file.path + exp.n;

//             clientComponentMap[key] = {
//                 id: `/dist/${relative(resolveDist(), file.path)}`,
//                 name: exp.n,
//                 chunks: [],
//                 async: true
//             }


//             contents += `
//             ${exp.ln}.$$id = ${JSON.stringify(key)};
//             ${exp.ln}.$$typeof = Symbol.for("react.client.reference");
//                         `;
//             fs.writeFileSync(file.path, contents, {
//                 encoding: 'utf-8'
//             });
//         }
//     });
// }


function renderReactTree(writable: any, component: any, props: any) {
    const { pipe } = renderToPipeableStream(
      createElement(component, props),
      clientComponentMap,
    );
    pipe(writable);
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
    const stream = await renderToPipeableStream(reactApp, clientComponentMap);
    // res.setHeader("Content-type", "application/octet-stream");
    stream.pipe(res);

    // const reader = stream.getReader();
    // res.setHeader('Content-Type', 'text/html');

    // Function to push chunks from the Web stream to the Express response
    // async function push() {
    //     const { done, value } = await reader.read();
    //     if (done) {
    //         return res.end();
    //     }

    //     // Write chunk to the response
    //     res.write(value);
    //     push(); // Continue reading the next chunk
    // }
    // push();

});

app.listen(4000, async () => {
    // await buildJsx();
    console.log('Server is running on http://localhost:4000');
});
