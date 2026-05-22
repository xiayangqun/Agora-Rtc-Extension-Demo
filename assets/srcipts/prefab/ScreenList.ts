import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ScreenCaptureSourceInfo, VIDEO_SOURCE_TYPE } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { ScreenItem } from './ScreenItem';
const { ccclass, property } = _decorator;

@ccclass('ScreenList')
export class ScreenList extends Component {
    
    @property(Prefab)
    screenItemPrefab: Prefab = null;

    @property(Node)
    public container:Node = null;

    init(list:ScreenCaptureSourceInfo[]){
        this.container.removeAllChildren();
        let sourceType:VIDEO_SOURCE_TYPE[] = [
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY,
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY,
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_THIRD,
            VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_FOURTH,
        ]
        for(let i=0;i< list.length;i++){
            let screenItem = instantiate(this.screenItemPrefab);
            screenItem.parent = this.container;
            let source = sourceType[i%sourceType.length];   
            screenItem.getComponent(ScreenItem).init(source, list[i]);
        }
    }

}

