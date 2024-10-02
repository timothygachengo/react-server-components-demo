import webpack from 'webpack';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import ReactServerWebpackPlugin from 'react-server-dom-webpack/plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import nodeExternals from 'webpack-node-externals';

const isProduction = process.env.NODE_ENV === 'production';
const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(
    new URL('.', import.meta.url),
);

/** @type {import('webpack').Configuration} */
const csrConfig = {
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
const rscConfig = {
    mode: isProduction ? 'production' : 'development',
    devtool: false,
    entry: [resolve(__dirname, '../app/entry-server.tsx')],
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
    ]
};

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