import {  createRoot } from 'react-dom/client';
// @ts-ignore
import { createFromFetch } from 'react-server-dom-vite-alpha/client.browser'

// @ts-ignore
window.__webpack_require__ = async (id) => {
  return import(id);
};

// @ts-ignore
globalThis.__webpack_require__ = async (id) => {
    return import(id);
}
const root = createRoot(document.getElementById('root')!);


createFromFetch(fetch('/rsc')).then((res: any) => {
    console.log(res);
  root.render(res)
});
