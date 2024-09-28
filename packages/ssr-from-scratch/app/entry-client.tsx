import {  createRoot } from 'react-dom/client';
// @ts-ignore
import { createFromFetch } from 'react-server-dom-vite-alpha/client.browser'

// // HACK: map webpack resolution to native ESM
// // @ts-expect-error Property '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
// window.__webpack_require__ = async (id) => {
//     return import(id);
// };

// @ts-ignore
globalThis.__webpack_require__ = async (id) => {
    return import(id);
}
const root = createRoot(document.getElementById('root')!);


createFromFetch(fetch('/rsc')).then((res: any) => {
    console.log(res);
  root.render(res)
});
