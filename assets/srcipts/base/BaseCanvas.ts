import { _decorator, Component, Node, resources, TextAsset } from 'cc';
import { LogContent } from '../prefab/LogContent';
import { IRtcEngineEx } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { VideoContent } from '../prefab/VideoContent';
import { JsonAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseCanvas')
export class BaseCanvas extends Component {

    @property(LogContent)
    public logContent: LogContent = null;

    @property(VideoContent)
    public videoContent: VideoContent = null;

    public rtcEngine: IRtcEngineEx = null;

    public appIdInfo: {appId:string, channelId:string, token:string} = null;

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

    protected async initAppIdInfo(): Promise<void> {
        this.appIdInfo =await this.loadJsonFile("appId");
    }

}
