import { _decorator, Component, Node, resources, TextAsset } from 'cc';
import { LogContent } from '../prefab/LogContent';
import { IRtcEngineEx } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { VideoContent } from '../prefab/VideoContent';
import { JsonAsset } from 'cc';
import { AudioClip } from 'cc';
import { AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseCanvas')
export class BaseCanvas extends Component {

    @property(LogContent)
    public logContent: LogContent = null;

    @property(AudioSource)
    public bgmSource: AudioSource = null;

    @property(AudioSource)
    public btnSource: AudioSource = null;

    public rtcEngine: IRtcEngineEx = null;


    BgmOnOff() {
        if (this.bgmSource.playing) {
            this.bgmSource.stop();
        } else {
            this.bgmSource.play();
        }
    }

    soundBtn() {
        this.btnSource.play();
    }
}
