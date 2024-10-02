import { rimraf } from "rimraf";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
// @ts-ignore
import ReactServerWebpackPlugin from "react-server-dom-webpack/plugin";
import nodeExternals from 'webpack-node-externals';

export async function WebpackBuild() {
    console.log("Start running webpack...");
    // Build server components
    // @ts-ignore
    new Promise((resolve, reject) => {
        const isProduction = process.env.NODE_ENV === "production";
        rimraf.sync(resolveDist());
        webpack(
            {
                target: "node20.0",
                mode: isProduction ? "production" : "development",
                devtool: isProduction ? "source-map" : "cheap-module-source-map",
                entry: [resolveApp('entry-server.tsx')],
                resolve: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
                output: {
                    path: resolveDist(),
                    filename: "entry-server.cjs",
                    scriptType: "module"
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            use: "babel-loader",
                            exclude: /node_modules/,
                        },
                        {
                            test: /\.(ts|tsx)$/,
                            use: "ts-loader",
                            exclude: /node_modules/,
                        }
                    ],
                },
                externals: nodeExternals(),

            },

            (err, stats) => {
                if (err) {
                    console.error(err.stack || err);
                    // @ts-ignore
                    if (err.details) {
                        // @ts-ignore
                        console.error(err.details);
                    }
                    process.exit(1);
                }
                // @ts-ignore
                const info = stats.toJson();
                if (stats?.hasErrors()) {
                    console.log("Finished running server components webpack with errors.");
                    // @ts-ignore
                    info.errors.forEach((e) => console.error(e));
                    process.exit(1);
                } else {
                    console.log("Finished running server components webpack.");
                    // @ts-ignore
                    resolve();
                }
            },
        );
    });

    // Build client components
    // @ts-ignore
    new Promise((resolve, reject) => {
        const isProduction = process.env.NODE_ENV === "production";
        rimraf.sync(resolveDist());
        webpack(
            {
                mode: isProduction ? "production" : "development",
                devtool: isProduction ? "source-map" : "cheap-module-source-map",
                entry: [resolveApp('entry-client.tsx')],
                output: {
                    path: resolveDist(),
                    filename: "entry-client.cjs",
                },
                resolve: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
                optimization: {
                    splitChunks: {
                        chunks: "async",
                    }
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            use: "babel-loader",
                            exclude: /node_modules/,
                        },
                        {
                            test: /\.(ts|tsx)$/,
                            use: "ts-loader",
                            exclude: /node_modules/,
                        }
                    ],
                },
                plugins: [
                    // new HtmlWebpackPlugin({
                    //   inject: true,
                    //   template: "./index.html",
                    // }),
                    new ReactServerWebpackPlugin({ isServer: false }),
                ],
            },
            (err, stats) => {
                if (err) {
                    console.error(err.stack || err);
                    // @ts-ignore
                    if (err.details) {
                        // @ts-ignore
                        console.error(err.details);
                    }
                    process.exit(1);
                }
                // @ts-ignore
                const info = stats.toJson();
                if (stats?.hasErrors()) {
                    console.log("Finished running client components webpack with errors.");
                    // @ts-ignore
                    info.errors.forEach((e) => console.error(e));
                    process.exit(1);
                } else {
                    console.log("Finished running client components webpack.");
                    // @ts-ignore
                    resolve();
                }
            },
        );
    });
}