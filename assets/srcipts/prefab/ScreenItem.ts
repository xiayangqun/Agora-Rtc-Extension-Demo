import { Sprite, SpriteFrame, sys, Texture2D, UITransform } from 'cc';
import { find } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IRtcEngineEx, ScreenCaptureParameters, ScreenCaptureParameters2, ScreenCaptureSourceInfo, ScreenCaptureSourceType, VIDEO_CONTENT_HINT, VIDEO_SOURCE_TYPE } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
import { BaseCanvas } from '../base/BaseCanvas';
import { LogContent, LOG_CONTENT_LEVEL } from '../prefab/LogContent';
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

        if (this.info != null) {
            this.initDesktop();
        }
        else {
            this.initMobile();
        }


    }

    initMobile() {
        this.desLabel.string = `platform: ${sys.platform}`;
    }

    initDesktop() {
        this.desLabel.string = `${ScreenCaptureSourceType[this.info.type]}, ${this.info.sourceName}, ${this.info.sourceTitle}, ${this.info.sourceId}`;

        if (this.info.iconImage.width > 0 && this.info.iconImage.height > 0) {
            this.iconTexture = new Texture2D();
            this.iconTexture.reset({
                width: this.info.iconImage.width,
                height: this.info.iconImage.height,
                format: Texture2D.PixelFormat.RGBA8888
            });
            this.iconTexture.uploadData(new Uint8Array(this.info.iconImage.buffer));
            this.iconFrame = new SpriteFrame();
            this.iconFrame.packable = false;
            this.iconFrame.texture = this.iconTexture;
            this.iconImage.spriteFrame = this.iconFrame;
            let iconWidth = 70 * this.info.iconImage.width / this.info.iconImage.height;
            this.iconImage.getComponent(UITransform).setContentSize(iconWidth, 70);
        }


        if (this.info.thumbImage.width > 0 && this.info.thumbImage.height > 0) {
            this.thumbTexture = new Texture2D();
            this.thumbTexture.reset({
                width: this.info.thumbImage.width,
                height: this.info.thumbImage.height,
                format: Texture2D.PixelFormat.RGBA8888
            });
            this.thumbTexture.uploadData(new Uint8Array(this.info.thumbImage.buffer));
            this.thumbFrame = new SpriteFrame();
            this.thumbFrame.packable = false;
            this.thumbFrame.texture = this.thumbTexture;
            this.thumbImage.spriteFrame = this.thumbFrame;
            let thumbWidth = 70 * this.info.thumbImage.width / this.info.thumbImage.height;
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
        if (this.info != null) {
            //this is desktop platform, start screen capture with source id
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
            this.logContent.print(errroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, `startScreenCapture errorCode: ${errroCode}`);
            if (errroCode === 0) {
                this.videoContent?.createVideoItem(this.rtcEngine, {
                    uid: 0,
                    view: null,
                    sourceType: this.sourceType,
                    mediaPlayerId: 0,
                }, null);
            }
        }
        else if (sys.isNative && (sys.platform === sys.Platform.IOS || sys.platform === sys.Platform.ANDROID)) {
            //this is mobile platform
            let parameters2: ScreenCaptureParameters2 = {
                captureAudio: true,
                captureVideo: true,
                audioParams: {
                    sampleRate: 16000,
                    channels: 2,
                    captureSignalVolume: 100,
                    excludeCurrentProcessAudio: true,
                },
                videoParams: {
                    dimensions: {
                        width: 1920,
                        height: 1080,
                    },
                    frameRate: 5,
                    bitrate: 0,
                    contentHint: VIDEO_CONTENT_HINT.CONTENT_HINT_DETAILS,
                }
            };
            let errorCode = this.rtcEngine.startScreenCapture(parameters2);
            this.logContent.print(LOG_CONTENT_LEVEL.INFO, "StartScreenCapture errorCode: " + errorCode);
        }
    }

    async stopScreenShare(): Promise<void> {
        if (this.sourceType != null) {
            let erroCode = await this.rtcEngine.stopScreenCapture(this.sourceType);
            this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, `stopScreenCapture errorCode: ${erroCode}`);
        }
        else{
            let errorCode = await this.rtcEngine.stopScreenCapture();
            this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, `stopScreenCapture errorCode: ${errorCode}`);
        }
    }

    onDestroy() {
        this.iconFrame?.destroy();
        this.iconTexture?.destroy();
        this.thumbFrame?.destroy();
        this.thumbTexture?.destroy();
    }
}

