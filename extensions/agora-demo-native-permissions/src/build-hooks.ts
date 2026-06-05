import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "fs";
import { basename, dirname, join, resolve } from "path";

const PACKAGE_NAME = "agora-demo-native-permissions";

type PermissionBuildTaskOption = {
    platform?: string;
    outputName?: string;
};

export const throwError: BuildHook.throwError = true;
export const title: BuildHook.title = "i18n:agora-demo-native-permissions.build_hook_title";

function log(...args: any[]) {
    console.log(`[${PACKAGE_NAME}]`, ...args);
}

function isAndroidLikePlatform(platform?: string): boolean {
    return platform === "android" || platform === "google-play";
}

function collectFiles(root: string, predicate: (path: string) => boolean): string[] {
    if (!root || !existsSync(root)) return [];
    const result: string[] = [];
    const stack = [root];
    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) continue;
        const stat = statSync(current);
        if (stat.isDirectory()) {
            for (const entry of readdirSync(current)) {
                stack.push(join(current, entry));
            }
            continue;
        }
        if (stat.isFile() && predicate(current)) result.push(current);
    }
    return result;
}

function uniqueExisting(paths: string[]): string[] {
    return Array.from(new Set(paths.filter((item) => item && existsSync(item)).map((item) => resolve(item))));
}

function getBuildRoots(options: PermissionBuildTaskOption, result?: any, makeRoot?: string): string[] {
    const projectPath = (Editor as any).Project?.path || "";
    return uniqueExisting([
        makeRoot || "",
        result?.dest || "",
        result?.paths?.dir || "",
        projectPath && options.outputName ? join(projectPath, "build", options.outputName) : "",
        projectPath && options.platform ? join(projectPath, "build", options.platform) : "",
        projectPath && options.platform ? join(projectPath, "native", "engine", options.platform) : "",
    ]);
}

function copyAndroidHelper(roots: string[]) {
    const pluginDir = dirname(__dirname);
    const sourceRoot = join(pluginDir, "android", "java");
    const helperFile = join(sourceRoot, "io", "agora", "demo", "permissions", "AgoraDemoPermissionHelper.java");
    if (!existsSync(helperFile)) return;

    const moduleRoots = uniqueExisting(
        roots.flatMap((root) => [
            root,
            join(root, "app"),
            join(root, "proj", "app"),
        ]),
    ).filter((root) => {
        const buildGradlePath = join(root, "build.gradle");
        return (
            existsSync(buildGradlePath) &&
            existsSync(join(root, "src")) &&
            readFileSync(buildGradlePath, "utf-8").includes("com.android.application")
        );
    });

    for (const moduleRoot of moduleRoots) {
        const destDir = join(moduleRoot, "src", "main", "java", "io", "agora", "demo", "permissions");
        mkdirSync(destDir, { recursive: true });
        copyFileSync(helperFile, join(destDir, basename(helperFile)));
    }
    log(`android helper copied. modules: ${moduleRoots.length}`);
}

function applyAndroid(options: PermissionBuildTaskOption, result?: any, makeRoot?: string) {
    if (!isAndroidLikePlatform(options.platform)) return;

    const roots = getBuildRoots(options, result, makeRoot);
    copyAndroidHelper(roots);
}

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: PermissionBuildTaskOption, result: any) {
    applyAndroid(options, result);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root: string, options: PermissionBuildTaskOption) {
    applyAndroid(options, undefined, root);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root: string, options: PermissionBuildTaskOption) {
    applyAndroid(options, undefined, root);
};
