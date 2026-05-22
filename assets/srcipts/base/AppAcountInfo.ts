import { resources, JsonAsset } from "cc";

export class AppAcountInfo {
    public appId: string = "";
    public channelId: string = "";
    public token: string = "";
    public numberUid1: number = 0;
    public numberUid2: number = 0;
    public stringUid1: string = "";
    public stringUid2: string = "";

    private static _instance: AppAcountInfo = null;
    public static async instance(): Promise<AppAcountInfo> {
        if (!this._instance) {
            this._instance = new AppAcountInfo();
            await this._instance.init();
        }
        return this._instance;
    }

    protected loadJsonFile(path: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load<JsonAsset>(path, JsonAsset, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset.json);
            });
        });
    }

    protected async init(): Promise<void> {
        let appInfo  = await this.loadJsonFile("appid");
        this.appId = appInfo.appId;
        this.channelId = appInfo.channelId;
        this.token = appInfo.token;
        this.numberUid1 = appInfo.numberUid1;
        this.numberUid2 = appInfo.numberUid2;
        this.stringUid1 = appInfo.stringUid1;
        this.stringUid2 = appInfo.stringUid2;
    }
}


