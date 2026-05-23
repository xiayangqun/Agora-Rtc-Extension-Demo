import { instantiate, Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { RtcConnection, VideoCanvas, IRtcEngineEx } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { VideoItem } from '../prefab/VideoItem';
const { ccclass, property } = _decorator;

@ccclass('VideoContent')
export class VideoContent extends Component {

    @property(Prefab)
    public videoItemPrefab: Prefab = null;

    @property(Node)
    public videoItemContainer: Node = null;

    createVideoItem(rtcEngine: IRtcEngineEx, canvas: VideoCanvas, connection?: RtcConnection): Node {
        const children = this.videoItemContainer.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const item = children[i].getComponent(VideoItem);
            if (item && item.isSameVideoItem(canvas, connection)) {
                console.warn("createVideoItem, item is same");
                return item.node;
            }
        }

        const videoItem = instantiate(this.videoItemPrefab);
        videoItem.getComponent(VideoItem)?.setupVideoCanvas(rtcEngine, canvas, connection);
        videoItem.parent = this.videoItemContainer;
        return videoItem;
    }

    destroyVideoItem(canvas: VideoCanvas, connection?: RtcConnection) {
        const children = this.videoItemContainer.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const item = children[i].getComponent(VideoItem);
            if (item && item.isSameVideoItem(canvas, connection)) {
                item.unsetupVideoCanvas(canvas, connection);
                children[i].destroy();
                return;
            }
        }
    }

    clear(){
        this.videoItemContainer.removeAllChildren();
    }
}

