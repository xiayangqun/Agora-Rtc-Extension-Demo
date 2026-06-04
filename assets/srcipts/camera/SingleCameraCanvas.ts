import { _decorator, Component, Prefab, instantiate } from "cc";
import {
    IRtcEngineEventHandler,
    IRtcEngineEx,
    createRtcEngine,
    LOG_LEVEL,
    RtcEngineContext,
    VIDEO_MIRROR_MODE_TYPE,
    RtcConnection,
    RENDER_MODE_TYPE,
    VIDEO_SOURCE_TYPE,
    VIDEO_VIEW_SETUP_MODE,
    VIDEO_MODULE_POSITION,
    CHANNEL_PROFILE_TYPE,
    CLIENT_ROLE_TYPE,
    AREA_CODE,
    AUDIO_SCENARIO_TYPE,
    ChannelMediaOptions,
    VideoCanvas,
    USER_OFFLINE_REASON_TYPE
} from "db://agora-rtc-extension-for-cocos-creator/agora-rtc";
import { VideoSprite } from "../prefab/VideoSprite";
import { BaseCanvas } from "../base/BaseCanvas";
import { app } from "electron";
import { VideoContent } from "../prefab/VideoContent";
import { AppAcountInfo } from "../base/AppAcountInfo";
import { LOG_CONTENT_LEVEL } from "../prefab/LogContent";

const { ccclass, property } = _decorator;

class SingleCameraCanvasRtcEngineEventHandler extends IRtcEngineEventHandler {
    _cameraCanvas: SingleCameraCanvas = null;
    constructor(cameraCanvas: SingleCameraCanvas) {
        super();
        this._cameraCanvas = cameraCanvas;
    }

    onJoinChannelSuccess(connection: RtcConnection, elapsed: number): void {
        console.log(" onJoinChannelSuccess, connection: ", connection);
        let canvas: VideoCanvas = {
            uid: 0,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
            mediaPlayerId: 0,
        };
        this._cameraCanvas.videoContent.createVideoItem(this._cameraCanvas.rtcEngine, canvas, null);
    }

    onUserJoined(connection: RtcConnection, remoteUid: number, elapsed: number): void {
        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onUserJoined, remoteUid: ", remoteUid);
        let canvas: VideoCanvas = {
            uid: remoteUid,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_REMOTE,
            mediaPlayerId: 0,
        };
        this._cameraCanvas.videoContent.createVideoItem(this._cameraCanvas.rtcEngine, canvas, null);
    }

    onLeaveChannel(connection: RtcConnection): void {
        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onLeaveChannel, connection: ", connection);
    }

    onUserOffline(connection: RtcConnection, remoteUid: number, reason: USER_OFFLINE_REASON_TYPE): void {
        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onUserOffline, remoteUid: ", remoteUid);
        let canvas: VideoCanvas = {
            uid: remoteUid,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
            mediaPlayerId: 0,
        };
        this._cameraCanvas.videoContent.destroyVideoItem(canvas, null);
    }
}

@ccclass("SingleCameraCanvas")
export class SingleCameraCanvas extends BaseCanvas {

    @property(VideoContent)
    public videoContent: VideoContent = null;


    async createRtcEngine(): Promise<void> {
        this.rtcEngine = createRtcEngine();

        const appAcountInfo = await AppAcountInfo.instance();
        let config: RtcEngineContext = {
            eventHandler: new SingleCameraCanvasRtcEngineEventHandler(this),
            appId: appAcountInfo.appId,
            context: 0,
            channelProfile: CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_GAME,
            license: "",
            audioScenario: AUDIO_SCENARIO_TYPE.AUDIO_SCENARIO_AI_CLIENT,
            areaCode: AREA_CODE.AREA_CODE_CN | AREA_CODE.AREA_CODE_AS,
            logConfig: {
                filePath: "log.txt",
                fileSizeInKB: 1024,
                level: LOG_LEVEL.LOG_LEVEL_INFO,
            },
            useExternalEglContext: false,
            domainLimit: false,
            autoRegisterAgoraExtensions: false,
        };
        let erroCode = 0;
        erroCode = await this.rtcEngine.initialize(config);
        if (erroCode !== 0) {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "initialize failed, errorCode: ", erroCode);
            return;
        }
        this.logContent.print(LOG_CONTENT_LEVEL.INFO, "initialize success");

        const {version, build }  = await this.rtcEngine.getVersion();
        this.logContent.print(LOG_CONTENT_LEVEL.INFO, `rtc engine version: ${version}, build: ${build}`);
    }

    async startPreview(): Promise<void> {
        let errorCode = await this.rtcEngine.startPreview();
        if (errorCode == 0) {
            this.logContent.print(LOG_CONTENT_LEVEL.INFO, "startPreview success");
            this.videoContent.createVideoItem(this.rtcEngine, {
                uid: 0,
                view: null,
                sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
                mediaPlayerId: 0,
            }, null);
        }
        else {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "startPreview failed, errorCode: ", errorCode);
        }
    }

    async joinChannel(): Promise<void> {
        let erroCode = await this.rtcEngine.enableVideo();
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "enableVideo errorCode: ", erroCode);

        erroCode = await this.rtcEngine.setRtcVideoDebugViewEnabled(true);
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "setRtcVideoDebugViewEnabled errorCode: ", erroCode);

        const appAcountInfo = await AppAcountInfo.instance();
        const options: ChannelMediaOptions = {
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishCameraTrack: true,
            publishMicrophoneTrack: true,
            autoSubscribeAudio: true,
            autoSubscribeVideo: true,
        };
        erroCode = await this.rtcEngine.joinChannel(
            appAcountInfo.token,
            appAcountInfo.channelId,
            appAcountInfo.numberUid1,
            options
        );
        if (erroCode !== 0) {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "joinChannel failed, errorCode: ", erroCode);
            return;
        }
        this.logContent.print(LOG_CONTENT_LEVEL.INFO, "joinChannel success");
    }

    async leaveChannel(): Promise<void> {
        let errorCode = await this.rtcEngine.leaveChannel();
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "leaveChannel errorCode: ", errorCode);
    }

    async releaseRtcEngine(): Promise<void> {
        if (this.rtcEngine) {
            //before release engine, make sure all video canvas is unbinded and all texture is destroyed, 
            await this.videoContent.clear();
            await this.rtcEngine.release(true);
            this.rtcEngine = null;
            this.logContent.print(LOG_CONTENT_LEVEL.INFO, "releaseRtcEngine success");
        }
    }

    //this is call before back main
    async clearSelf(): Promise<void> {
        await this.releaseRtcEngine();
    }
}
