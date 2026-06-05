declare const __dirname: string;
declare const console: {
    debug(...args: any[]): void;
    log(...args: any[]): void;
};

declare module "fs" {
    export function copyFileSync(src: string, dest: string): void;
    export function existsSync(path: string): boolean;
    export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
    export function readdirSync(path: string): string[];
    export function readFileSync(path: string, encoding: string): string;
    export function statSync(path: string): { isDirectory(): boolean; isFile(): boolean };
    export function writeFileSync(path: string, data: string): void;
}

declare module "path" {
    export function basename(path: string): string;
    export function dirname(path: string): string;
    export function join(...paths: string[]): string;
    export function resolve(path: string): string;
}
