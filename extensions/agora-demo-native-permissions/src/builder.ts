const PACKAGE_NAME = "agora-demo-native-permissions";

export const load: BuildPlugin.load = function () {
    console.debug(`[${PACKAGE_NAME}] builder load`);
};

export const unload: BuildPlugin.Unload = function () {
    console.debug(`[${PACKAGE_NAME}] builder unload`);
};

export const configs: BuildPlugin.Configs = {
    mac: {
        hooks: "./build-hooks",
    },
    ios: {
        hooks: "./build-hooks",
    },
    android: {
        hooks: "./build-hooks",
    },
    "google-play": {
        hooks: "./build-hooks",
    },
    windows: {
        hooks: "./build-hooks",
    },
};
