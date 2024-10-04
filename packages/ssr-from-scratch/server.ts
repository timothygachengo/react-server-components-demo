import register from 'react-server-dom-webpack/node-register'
import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'node:url'
import { createElement } from 'react';
import path from 'path';
import { readFile, writeFile } from 'node:fs/promises';
// import * as ReactServerDOM  from 'react-server-dom-webpack/server.browser';
import ReactServerDOM from 'react-server-dom-webpack/server.node';
import { relative } from 'node:path';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import webpack from 'webpack';
import { csrConfig, rscConfig } from './scripts/build.js'
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


app.get('/rsc', async (req, res) => {
    // This is where we would import the server-rendered content
    // @ts-ignore
    const page = await import('./dist/entry-server.js');

    const clientComponentMap = JSON.parse(
        await readFile(resolveDist('react-client-manifest.json'), {
            encoding: 'utf-8'
        })
    );

    // @ts-ignore
    const reactApp = createElement(page.default);
    const stream = await renderToPipeableStream(reactApp, clientComponentMap);
    // res.setHeader("Content-type", "application/octet-stream");
    stream.pipe(res);

});


app.all(/(.*)/, async (req, res) => {
    console.log(req.url);
    console.log(req.path);
    if (req.url === '/') {
        const html = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
        return res.send(html);
    }

    // File-based router
    const filePath = path.join(__dirname, 'dist', 'routes', req.path,  'index.js');
    console.log(filePath);
    if (fs.existsSync(filePath)) {
        // try {
            // Dynamically import the component
            const Component = await import(filePath);

            const reactElement = createElement(Component.default);
            console.log(reactElement);
            // Create a readable stream from the component
            // const stream = await renderToPipeableStream(reactElement);

            // console.log(stream);


            // Pipe the stream to the response
            // stream.pipe(res);
        // } catch (error) {
        //     console.error('Error rendering component:', error);
        //     res.status(500).send('Internal Server Error');
        // }
    }

})

async function buildJsx() {
    // @ts-ignore
    webpack([csrConfig, rscConfig], (err, stats) => {
        if (err) {
            console.error(err.stack || err);
            if (err.message) {
                console.error(err.message);
            }
            process.exit(1);
            return;
        }

        if (!stats) {
            console.error('No stats object found.');
            process.exit(1);
            return;
        }

        const info = stats.toJson();
        if (stats.hasErrors()) {
            console.log('Finished running webpack with errors.');
            // @ts-ignore
            info.errors.forEach((e) => console.error(e));
            process.exit(1);
        } else {
            console.log('Finished running webpack.');
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



app.listen(4000, async () => {
    await buildJsx();
    console.log('Server is running on http://localhost:4000');
});
