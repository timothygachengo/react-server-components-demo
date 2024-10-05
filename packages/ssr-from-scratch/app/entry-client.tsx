'use client';
import {  createRoot, hydrateRoot } from 'react-dom/client';
// @ts-ignore
import { createFromFetch } from 'react-server-dom-webpack/client.browser'
import App from './App';

// @ts-ignore
window.__webpack_require__ = async (id) => {
  return import(id);
};

// @ts-ignore
globalThis.__webpack_require__ = async (id) => {
    return import(id);
}
const root = createRoot(document.getElementById('root')!);

root.render(<App />);

createFromFetch(fetch('/rsc')).then((res: any) => {
    console.log(res);
    hydrateRoot(document.getElementById('root')!, res);
});
