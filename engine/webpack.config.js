const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

var config = {
    entry: "./esm/index.js",
    output: {
        path: path.resolve(__dirname, "src"),
        globalObject: "this",
        library: {
            name: "wwtlib",
            type: "umd"
        }
    },
};

module.exports = (_env, argv) => {
    if (argv.mode === "development") {
        config.devtool = "source-map";
        config.output.filename = "index.js";
    }

    if (argv.mode === "production") {
        config.output.filename = "index.min.js";
        config.optimization = {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                            drop_debugger: true,
                            pure_funcs: ['console.log', 'console.debug'],
                        },
                        mangle: true,
                    },
                }),
            ],
        };
    }

    return config;
};
