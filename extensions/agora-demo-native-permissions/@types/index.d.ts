declare namespace BuildPlugin {
    type load = () => void;
    type Unload = () => void;
    type Configs = Record<string, any>;
}

declare namespace BuildHook {
    type throwError = boolean;
    type title = string;
    type onAfterBuild = (options: any, result: any) => Promise<void> | void;
    type onBeforeMake = (root: string, options: any) => Promise<void> | void;
    type onAfterMake = (root: string, options: any) => Promise<void> | void;
}

declare const Editor: any;
