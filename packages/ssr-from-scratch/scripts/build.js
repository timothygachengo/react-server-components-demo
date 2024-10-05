import webpack from 'webpack';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob'
import { resolve, relative, join, parse } from 'node:path';
import fs from 'fs';
import { createRequire } from 'node:module';
import ReactServerWebpackPlugin from 'react-server-dom-webpack/plugin';

const isProduction = process.env.NODE_ENV === 'production';
const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(
    new URL('.', import.meta.url),
);

/** @type {import('webpack').Configuration} */
export const csrConfig = {
    mode: isProduction ? 'production' : 'development',
    devtool: false,
    entry: [resolve(__dirname, '../app/entry-client.tsx')],
    output: {
        path: resolve(__dirname, '../dist'),
        filename: 'entry-client.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(t|j)sx?$/,
                loader: require.resolve('swc-loader'),
                options: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                            dynamicImport: true,
                        },
                        target: 'es2022',
                        transform: {
                            // Use a JSX runtime module (e.g. react/jsx-runtime introduced in React 17).
                            react: {
                                runtime: 'automatic',
                            },
                        },
                    },
                    isModule: true,
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    plugins: [
        new ReactServerWebpackPlugin({ isServer: false }),
        // new WebpackManifestPlugin({
        //     fileName: 'client-manifest.json',
        // }),
    ],
};

/** @type {import('webpack').Configuration} */
export const rscConfig = {
    mode: isProduction ? 'production' : 'development',
    devtool: false,
    entry: [
        resolve(__dirname, '../app/entry-server.tsx')
    ],
    output: {
        path: resolve(__dirname, '../dist'),
        filename: 'entry-server.js',
        library: {
            type: 'module',
        },
    },
    target: 'node20',
    node: false,
    experiments: {
        outputModule: true,
    },
    resolve: {
        extensionAlias: {
            '.js': ['.tsx', '.ts', '.js'],
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: require.resolve('swc-loader'),
                options: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                            dynamicImport: true,
                        },
                        target: 'es2022',
                        transform: {
                            // Use a JSX runtime module (e.g. react/jsx-runtime introduced in React 17).
                            react: {
                                runtime: 'automatic',
                            },
                        },
                    },
                    isModule: true,
                },
            },
            {
                test: /\.tsx?$/,
                use: {
                    loader: require.resolve(
                        './plugins/RSCWebpackPlugin.js',
                    ),
                },
            },
        ],
    },

    plugins: [
        // new ReactServerWebpackPlugin({ isServer: true }),
        // new WebpackManifestPlugin({
        //     fileName: 'server-manifest.json',
        // })
        new webpack.HotModuleReplacementPlugin(),
    ]
};


// Webpack configuration for file-based router

// export const routerConfig = {
//     mode: 'development',
//     entry: () => {
//         const routesDir = resolve(__dirname, '../routes');
//         const entries = {};

//         function scanDir(dir) {
//             const files = fs.readdirSync(dir);
//             files.forEach(file => {
//                 const filePath = join(dir, file);
//                 const stat = fs.statSync(filePath);
//                 if (stat.isDirectory()) {
//                     scanDir(filePath);
//                 } else if (file.endsWith('.tsx')) {
//                     const relativePath = relative(routesDir, filePath);
//                     const entryName = relativePath.replace(/\.tsx$/, '');
//                     entries[entryName] = filePath;
//                 }
//             });
//         }

//         scanDir(routesDir);
//         return entries;
//     },
//     output: {
//         path: resolve(__dirname, '../dist/routes'),
//         filename: '[name].js',
//         library: {
//             type: 'module',
//         },
//     },
//     experiments: {
//         outputModule: true,
//     },
//     resolve: {
//         extensions: ['.tsx', '.ts', '.js'],
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.tsx?$/,
//                 use: [
//                     'swc-loader',
//                     {
//                         loader: resolve(__dirname, './plugins/RSCWebpackPlugin.js'),
//                         options: {
//                             isServer: false,
//                         },
//                     },
//                 ],
//                 exclude: /node_modules/,
//             },
//         ],
//     },
//     plugins: [
//         new webpack.DefinePlugin({
//             'process.env.NODE_ENV': JSON.stringify('development'),
//         }),
//     ],
// };

