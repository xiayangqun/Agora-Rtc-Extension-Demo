import { find, Slider, Node } from 'cc';
import { _decorator, Component } from 'cc';
import { IMediaPlayer, IMediaPlayerSourceObserver, MEDIA_PLAYER_STATE, MEDIA_PLAYER_REASON, MEDIA_PLAYER_EVENT, PLAYER_PRELOAD_EVENT, VIDEO_SOURCE_TYPE } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import type { SrcInfo, PlayerUpdatedInfo, CacheStatistics, PlayerPlaybackStats, IRtcEngineEx } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { LogContent } from './LogContent';
import { resources, VideoClip, Asset } from 'cc';
import { BaseCanvas } from '../base/BaseCanvas';
import { Label } from 'cc';
import { Texture2D, SpriteFrame, Rect, Size, UITransform } from 'cc';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Observer that forwards media player events to the owning MediaItem component.
 * All callbacks log their arguments via logContent.
 */
class MediaItemPlayerObserver extends IMediaPlayerSourceObserver {
    private _owner: MediaItem;

    constructor(owner: MediaItem) {
        super();
        this._owner = owner;
    }

    override onPlayerSourceStateChanged(state: MEDIA_PLAYER_STATE, reason: MEDIA_PLAYER_REASON): void {
        this._owner.logContent.log('onPlayerSourceStateChanged, ', MEDIA_PLAYER_STATE[state], MEDIA_PLAYER_REASON[reason]);
        if (state == MEDIA_PLAYER_STATE.PLAYER_STATE_OPEN_COMPLETED) {
            this._owner.onOpenMediaComplete();
        }
    }

    override onPositionChanged(positionMs: number, timestampMs: number): void {
        this._owner.logContent.log('onPositionChanged, positionMs: ', positionMs, ', timestampMs: ', timestampMs);
        this._owner._onPositionUpdate(positionMs);
    }

    override onPlayerEvent(eventCode: MEDIA_PLAYER_EVENT, elapsedTime: number, message: string): void {
        this._owner.logContent.log('onPlayerEvent, eventCode: ', eventCode, ', elapsedTime: ', elapsedTime, ', message: ', message);
    }

    override onMetaData(data: Uint8Array, length: number): void {
        this._owner.logContent.log('onMetaData, length: ', length);
    }

    override onPlayBufferUpdated(playCachedBuffer: number): void {
        this._owner.logContent.log('onPlayBufferUpdated, playCachedBuffer: ', playCachedBuffer);
    }

    override onPreloadEvent(src: string, event: PLAYER_PRELOAD_EVENT): void {
        this._owner.logContent.log('onPreloadEvent, src: ', src, ', event: ', event);
    }

    override onCompleted(): void {
        this._owner.logContent.log('onCompleted');
        this._owner._onPlaybackComplete();
    }

    override onAgoraCDNTokenWillExpire(): void {
        this._owner.logContent.log('onAgoraCDNTokenWillExpire');
    }

    override onPlayerSrcInfoChanged(from: SrcInfo, to: SrcInfo): void {
        this._owner.logContent.log('onPlayerSrcInfoChanged, from: ', JSON.stringify(from), ', to: ', JSON.stringify(to));
    }

    override onPlayerInfoUpdated(info: PlayerUpdatedInfo): void {
        this._owner.logContent.log('onPlayerInfoUpdated, info: ', JSON.stringify(info));
    }

    override onPlayerCacheStats(stats: CacheStatistics): void {
        this._owner.logContent.log('onPlayerCacheStats, stats: ', JSON.stringify(stats));
    }

    override onPlayerPlaybackStats(stats: PlayerPlaybackStats): void {
        this._owner.logContent.log('onPlayerPlaybackStats, stats: ', JSON.stringify(stats));
    }

    override onAudioVolumeIndication(volume: number): void {
        this._owner.logContent.log('onAudioVolumeIndication, volume: ', volume);
    }
}

@ccclass('MediaItem')
export class MediaItem extends Component {

    protected _meidaPlayer: IMediaPlayer = null;

    get mediaPlayer(): IMediaPlayer {
        return this._meidaPlayer;
    }

    /** Slider component reference — both displays progress and allows seek. */
    @property(Slider)
    public seekSlider: Slider = null;

    @property(Label)
    public idLabel: Label = null;

    @property(Sprite)
    public videoSprite: Sprite = null;

    @property([Node])
    public optionsBtns: Node[] = [];

    /** Total media duration in milliseconds. */
    _duration: number = 0;

    set duration(value: number) {
        this._duration = value;
    }

    /** Whether the user is currently dragging the seek slider. */
    _isSeeking: boolean = false;

    /** Player event observer instance. */
    private _playerObserver: MediaItemPlayerObserver = null;

    protected texture: Texture2D = null;

    protected spriteFrame: SpriteFrame = null;

    get logContent(): LogContent {
        return find('Canvas/LogContent').getComponent(LogContent);
    }

    get rtcEngine(): IRtcEngineEx {
        return find("Canvas").getComponent(BaseCanvas).rtcEngine;
    }

    /** Public getter for progress (0~1), usable for UI property binding. */
    get progress(): number {
        return this.seekSlider ? this.seekSlider.progress : 0;
    }

    // ===================== Lifecycle =====================

    onLoad() {
        this.optionsBtns.forEach(btn => btn.active = false);
    }

    async init(mediaPlayer: IMediaPlayer) {
        this._meidaPlayer = mediaPlayer;
        this.idLabel.string = "mediaPlayerId" + await this._meidaPlayer.getId();
        this.createTextureAndAttachToSelf();
        this.rtcEngine.setupLocalVideo({
            uid: 0,
            view: this.texture,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_MEDIA_PLAYER,
            mediaPlayerId: await this._meidaPlayer.getId(),
        }, (width, height) => {
            this.resize(width, height);
        });
        this._initObserver();
    }

    onDestroy() {

    }


    createTextureAndAttachToSelf(): void {
        this.texture = new Texture2D();

        this.spriteFrame = new SpriteFrame();
        this.spriteFrame.texture = this.texture;
        // Keep video frames out of Cocos dynamic atlas. Do not remove: dynamic
        // atlas repacking can copy changing video textures with stale bounds.
        this.spriteFrame.packable = false;

        this.videoSprite.spriteFrame = this.spriteFrame;
    }

    resize(width: number, height: number) {
        console.log("resize", width, height);

        // If Cocos packed this frame before packable was disabled, restore the
        // original video texture first. Do not remove: it prevents atlas-state
        // residue from corrupting later SpriteFrame.reset() calls.
        (this.spriteFrame as unknown as { _resetDynamicAtlasFrame?: () => void })._resetDynamicAtlasFrame?.();
        this.spriteFrame.reset({
            texture: this.texture,
            rect: new Rect(0, 0, width, height),
            originalSize: new Size(width, height),
        });
        // SpriteFrame.reset({ texture }) may re-run Cocos' packable checks.
        // Do not remove: video textures must stay unpackable after every reset.
        this.spriteFrame.packable = false;

        const spriteRenderer = this.videoSprite as unknown as {
            setTextureDirty?: () => void;
            markForUpdateRenderData?: () => void;
        };
        // Force the Sprite assembler to sample the rebuilt Texture2D. Do not
        // remove: Texture2D.reset() recreates the underlying GPU texture.
        spriteRenderer.setTextureDirty?.();
        spriteRenderer.markForUpdateRenderData?.();

        const spriteTrans = this.videoSprite.getComponent(UITransform);
        spriteTrans.width = spriteTrans.height * width / height;
    }

    // ===================== Observer callbacks (called by MediaItemPlayerObserver) =====================

    /** @internal Called by MediaItemPlayerObserver.onPositionChanged */
    _onPositionUpdate(positionMs: number) {
        if (this._isSeeking || !this.seekSlider) return;
        if (this._duration > 0) {
            this.seekSlider.progress = Math.min(positionMs / this._duration, 1);
        }
    }

    /** @internal Called by MediaItemPlayerObserver.onCompleted */
    _onPlaybackComplete() {
        if (this.seekSlider) {
            this.seekSlider.progress = 1;
        }
    }

    // ===================== Internal =====================

    private _initObserver() {
        if (!this._meidaPlayer) return;
        this._playerObserver = new MediaItemPlayerObserver(this);
        this._meidaPlayer.initEventHandler(this._playerObserver);
    }

    async onOpenMediaComplete() {
        this.duration = (await this._meidaPlayer.getDuration()).duration;
        this.logContent.log('onOpenMediaComplete, duration: ', this.duration);
        this.optionsBtns.forEach(btn => btn.active = true);


    }

    async loadVideoUrl(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            resources.load(path, VideoClip, (err, clip) => {
                if (err) {
                    // 兜底：如果 VideoClip 类型注册失败，尝试作为通用 Asset 加载
                    resources.load(path, Asset, (err2, asset) => {
                        if (err2) {
                            reject(new Error(`加载视频失败 [${path}]: ${err2.message}`));
                            return;
                        }
                        resolve(this.extractUrl(asset));
                    });
                    return;
                }
                resolve(this.extractUrl(clip));
            });
        });
    }

    extractUrl(asset: Asset): string {
        // nativeUrl 是跨平台的标准接口
        const url = asset.nativeUrl || (asset as any)._nativeUrl || '';
        if (!url) {
            throw new Error('get media url failed');
        }
        return url;
    }


    // ===================== Button methods (bind to Button.clickEvents) =====================

    /** Open the media file. */
    async open0() {
        const url = await this.loadVideoUrl("mpk0");
        this.logContent.log('open url: ', url);
        await this._open(url);
    }

    async open1() {
        const url = await this.loadVideoUrl("mpk1");
        this.logContent.log('open url: ', url);
        await this._open(url);
    }

    async _open(url: string) {
        const errorCode = await this._meidaPlayer.open(url, 0);
        if (errorCode === 0) {
            this.logContent.log('open success, errorCode: ', errorCode);
            this.optionsBtns.forEach(btn => btn.active = false);
        } else {
            this.logContent.error('open failed, errorCode: ', errorCode);
        }

    }

    /** Start playback. */
    async play() {
        if (!this._meidaPlayer) return;
        const errorCode = await this._meidaPlayer.play();
        if (errorCode === 0) {
            this.logContent.log('play success, errorCode: ', errorCode);
        } else {
            this.logContent.error('play failed, errorCode: ', errorCode);
        }
    }

    /** Pause playback. */
    async pasue() {
        if (!this._meidaPlayer) return;
        const errorCode = await this._meidaPlayer.pause();
        if (errorCode === 0) {
            this.logContent.log('pause success, errorCode: ', errorCode);
        } else {
            this.logContent.error('pause failed, errorCode: ', errorCode);
        }
    }

    /** Resume playback. */
    async resume() {
        if (!this._meidaPlayer) return;
        const errorCode = await this._meidaPlayer.resume();
        if (errorCode === 0) {
            this.logContent.log('resume success, errorCode: ', errorCode);
        } else {
            this.logContent.error('resume failed, errorCode: ', errorCode);
        }
    }

    /** Stop and close the media player. */
    async stop() {
        if (!this._meidaPlayer) return;
        const errorCode = await this._meidaPlayer.stop();
        if (errorCode === 0) {
            this.logContent.log('stop success, errorCode: ', errorCode);
        } else {
            this.logContent.error('stop failed, errorCode: ', errorCode);
        }
        if (this.seekSlider) this.seekSlider.progress = 0;
        this._duration = 0;
    }

    async destroyMediaPlayer() {
        this.rtcEngine.setupLocalVideo({
            uid: 0,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_MEDIA_PLAYER,
            mediaPlayerId: await this._meidaPlayer.getId(),
        });

        this.spriteFrame?.destroy();
        this.texture?.destroy();
        await this.rtcEngine.destroyMediaPlayer(this._meidaPlayer);
        this._meidaPlayer = null;
        this.node.destroy();
    }

    // ===================== Seek slider (bind to Slider.slideEvents) =====================

    /**
     * Called when the user drags the seek slider.
     * @param value Slider position 0~1.
     */
    async seek(slider: Slider) {
        const value = slider.progress;
        if (!this._meidaPlayer || this._duration <= 0) return;
        this._isSeeking = true;
        const clampedValue = Math.max(0, Math.min(1, value));
        if (this.seekSlider) this.seekSlider.progress = clampedValue;
        const seekPos = Math.floor(clampedValue * this._duration);
        const errorCode = await this._meidaPlayer.seek(seekPos);
        if (errorCode === 0) {
            this.logContent.log('seek success, pos: ', seekPos, 'ms, errorCode: ', errorCode);
        } else {
            this.logContent.error('seek failed, pos: ', seekPos, 'ms, errorCode: ', errorCode);
        }
        this._isSeeking = false;
    }
}
