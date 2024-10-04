
/**
 * @this {any}
 */
export default async function ClientComponentLoader(source) {
    // @ts-ignore
    const callback = this.async();

    // Check if the component is a client component
    const isClientComponent = source.includes('use client');

    if (isClientComponent) {
        // If it's a client component, wrap it with React.lazy
        const wrappedSource = `
import React from 'react';
const ClientComponent = React.lazy(() => import(/* webpackChunkName: "client-component" */ './${this.resourcePath}'));
export default function WrappedClientComponent(props) {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ClientComponent {...props} />
        </React.Suspense>
    );
}
`;
        callback(null, wrappedSource);
    } else {
        // If it's not a client component, return the source as-is
        callback(null, source);
    }
}
