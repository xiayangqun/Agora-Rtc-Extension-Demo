import { Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { find } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IRtcEngineEx, ScreenCaptureParameters, ScreenCaptureSourceInfo, ScreenCaptureSourceType, VIDEO_SOURCE_TYPE } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { BaseCanvas } from '../base/BaseCanvas';
import { LogContent } from '../prefab/LogContent';
import { VideoContent } from './VideoContent';
const { ccclass, property } = _decorator;

@ccclass('ScreenItem')
export class ScreenItem extends Component {

    @property(Sprite)
    public iconImage: Sprite = null;

    @property(Sprite)
    public thumbImage: Sprite = null;


    protected iconTexture: Texture2D = null;
    protected iconFrame: SpriteFrame = null;

    protected thumbTexture: Texture2D = null;
    protected thumbFrame: SpriteFrame = null;


    @property(Label)
    public desLabel: Label = null;

    protected sourceType: VIDEO_SOURCE_TYPE = VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY;
    protected info: ScreenCaptureSourceInfo = null;

    private __screenCaptureParameters: ScreenCaptureParameters = {
        captureAudio: false,
        audioParams: {
            sampleRate: 16000,
            channels: 2,
            captureSignalVolume: 100,
            excludeCurrentProcessAudio: true,
        },
        dimensions: {
            width: 1920,
            height: 1080,
        },
        frameRate: 5,
        bitrate: 0,
        captureMouseCursor: true,
        windowFocus: false,
        excludeWindowList: null,
        excludeWindowCount: 0,
        highLightWidth: 0,
        highLightColor: 0,
        enableHighLight: false,
    }

    init(sourceType: VIDEO_SOURCE_TYPE, info: ScreenCaptureSourceInfo) {
        this.sourceType = sourceType;
        this.info = info;
        this.desLabel.string = `${ScreenCaptureSourceType[this.info.type]}, ${this.info.sourceName}, ${this.info.sourceTitle}, ${this.info.sourceId}`;

        if (info.iconImage.width > 0 && info.iconImage.height > 0) {
            this.iconTexture = new Texture2D();
            this.iconTexture.reset({
                width: info.iconImage.width,
                height: info.iconImage.height,
                format: Texture2D.PixelFormat.RGBA8888
            });
            this.iconTexture.uploadData(new Uint8Array(info.iconImage.buffer));
            this.iconFrame = new SpriteFrame();
            this.iconFrame.packable = false;
            this.iconFrame.texture = this.iconTexture;
            this.iconImage.spriteFrame = this.iconFrame;
            let iconWidth = 70 * info.iconImage.width / info.iconImage.height;
            this.iconImage.getComponent(UITransform).setContentSize(iconWidth, 70);
        }


        if (info.thumbImage.width > 0 && info.thumbImage.height > 0) {
            this.thumbTexture = new Texture2D();
            this.thumbTexture.reset({
                width: info.thumbImage.width,
                height: info.thumbImage.height,
                format: Texture2D.PixelFormat.RGBA8888
            });
            this.thumbTexture.uploadData(new Uint8Array(info.thumbImage.buffer));
            this.thumbFrame = new SpriteFrame();
            this.thumbFrame.packable = false;
            this.thumbFrame.texture = this.thumbTexture;
            this.thumbImage.spriteFrame = this.thumbFrame;
            let thumbWidth = 70 * info.thumbImage.width / info.thumbImage.height;
            this.thumbImage.getComponent(UITransform).setContentSize(thumbWidth, 70);
        }
    }

    get rtcEngine(): IRtcEngineEx {
        return find('Canvas').getComponent(BaseCanvas).rtcEngine;
    }

    get logContent(): LogContent {
        return find('Canvas').getComponent(BaseCanvas).logContent;
    }

    get videoContent(): VideoContent {
        return (find('Canvas').getComponent(BaseCanvas) as any).videoContent;
    }

    async startScreenShare(): Promise<void> {
        let errroCode = 0;
        if (this.info.type == ScreenCaptureSourceType.ScreenCaptureSourceType_Window) {
            errroCode = await this.rtcEngine.startScreenCapture(this.sourceType, {
                isCaptureWindow: true,
                displayId: this.info.sourceId,
                screenRect: { x: 0, y: 0, width: 0, height: 0 },
                windowId: this.info.sourceId,
                params: this.__screenCaptureParameters,
                regionRect: { x: 0, y: 0, width: 0, height: 0 }
            });
        }
        else if (this.info.type == ScreenCaptureSourceType.ScreenCaptureSourceType_Screen) {
            errroCode = await this.rtcEngine.startScreenCapture(this.sourceType, {
                isCaptureWindow: false,
                displayId: this.info.sourceId,
                screenRect: { x: 0, y: 0, width: 0, height: 0 },
                windowId: this.info.sourceId,
                params: this.__screenCaptureParameters,
                regionRect: { x: 0, y: 0, width: 0, height: 0 }
            });
        }
        if (errroCode !== 0) {
            this.logContent.error(`startScreenCapture failed, errorCode: ${errroCode}`);

        }
        else {
            this.logContent.log(`startScreenCapture success, errorCode: ${errroCode}`);
            this.videoContent?.createVideoItem(this.rtcEngine, {
                uid: 0,
                view: null,
                sourceType: this.sourceType,
                mediaPlayerId: 0,
            }, null);
        }

    }

    async stopScreenShare(): Promise<void> {
        let erroCode = await this.rtcEngine.stopScreenCapture(this.sourceType);
        if (erroCode !== 0) {
            this.logContent.error(`stopScreenCapture failed, errorCode: ${erroCode}`);
        }
        else {
            this.logContent.log(`stopScreenCapture success, errorCode: ${erroCode}`);
        }
    }

    onDestroy() {
        this.iconFrame?.destroy();
        this.iconTexture?.destroy();
        this.thumbFrame?.destroy();
        this.thumbTexture?.destroy();
    }
}

