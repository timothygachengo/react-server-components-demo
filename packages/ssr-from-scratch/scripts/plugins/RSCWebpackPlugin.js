export default async function RSCWebpackPlugin(
    source,
    sourceMap,
) {
    // @ts-ignore
    const callback = this.async();
    if (!source.includes('use client')) {
        return callback(null, source, sourceMap);
    }

    
    const esmSource = `
      export default {
        $$typeof: Symbol.for("react.client.reference"),
        $$id: "file://${
      // @ts-ignore
      this.resourcePath}#default",
      }
    `;
    return callback(null, esmSource, sourceMap);
}