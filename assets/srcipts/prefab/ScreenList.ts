import { find, Prefab } from 'cc';
import { instantiate } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ScreenCaptureSourceInfo, VIDEO_SOURCE_TYPE } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { ScreenItem } from './ScreenItem';
import { IScreenCaptureSourceList } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc/interface/IScreenCaptureSourceList';
import { BaseCanvas } from '../base/BaseCanvas';
import { LOG_CONTENT_LEVEL } from './LogContent';
const { ccclass, property } = _decorator;

@ccclass('ScreenList')
export class ScreenList extends Component {

    @property(Prefab)
    screenItemPrefab: Prefab = null;

    @property(Node)
    public container: Node = null;

    get logContent() {
        return find('Canvas').getComponent(BaseCanvas).logContent;
    }

    async init(list: IScreenCaptureSourceList) {
        this.container.removeAllChildren();
        let sourceType: VIDEO_SOURCE_TYPE[] = [
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY,
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY,
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_THIRD,
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_FOURTH,
        ]

        let count = await list.getCount();
        if (count > 4) {
            this.logContent.print(LOG_CONTENT_LEVEL.INFO, `there is ${count} screen capture source, only show 4 of them`);
            count = 4;
        }

        for (let i = 0; i < count; i++) {
            let screenItem = instantiate(this.screenItemPrefab);
            screenItem.parent = this.container;
            let source = sourceType[i % sourceType.length];
            let info = await list.getSourceInfo(i);
            screenItem.getComponent(ScreenItem).init(source, info);
        }
    }

    async initEmpty() {
        let screenItem = instantiate(this.screenItemPrefab);
        screenItem.parent = this.container;
        screenItem.getComponent(ScreenItem).init(null, null);
    }
}

