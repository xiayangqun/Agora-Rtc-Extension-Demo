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

    async createMediaPlayerItem(mediaPlayer: IMediaPlayer) {
        const item = instantiate(this.mediaItemPrefab);
        await item.getComponent(MediaItem).init(mediaPlayer);
        item.parent = this.container;
    }

    async clear() {
        for (let i = 0; i < this.container.children.length; i++) {
            const child = this.container.children[i];
            await child.getComponent(MediaItem).clearSelf();
        }
        this.container.removeAllChildren();
    }
}

