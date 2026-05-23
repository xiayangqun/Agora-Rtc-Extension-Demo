import { Prefab, instantiate } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IMediaPlayer } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { MediaItem } from './MediaItem';
const { ccclass, property } = _decorator;

@ccclass('MediaList')
export class MediaList extends Component {

    @property(Prefab)
    public mediaItemPrefab: Prefab = null;

    @property(Node)
    public container: Node = null;

    createMediaPlayerItem(mediaPlayer: IMediaPlayer) {
        const item = instantiate(this.mediaItemPrefab);
        item.getComponent(MediaItem).init(mediaPlayer);
        item.parent = this.container;
    }
}

