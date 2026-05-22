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
    AREA_CODE,
    AUDIO_SCENARIO_TYPE,
    VideoCanvas,
    USER_OFFLINE_REASON_TYPE
} from "db://agora-rtc-extension-for-cocos-creator/agora-rtc";
import { VideoSprite } from "../prefab/VideoSprite";
import { BaseCanvas } from "../base/BaseCanvas";
import { app } from "electron";
import { VideoContent } from "../prefab/VideoContent";
import { AppAcountInfo } from "../base/AppAcountInfo";

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
        this._cameraCanvas.logContent.log("onUserJoined, remoteUid: ", remoteUid);
        let canvas: VideoCanvas = {
            uid: remoteUid,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_REMOTE,
            mediaPlayerId: 0,
        };
        this._cameraCanvas.videoContent.createVideoItem(this._cameraCanvas.rtcEngine, canvas, null);
    }

    onLeaveChannel(connection: RtcConnection): void {
        this._cameraCanvas.logContent.log("onLeaveChannel, connection: ", connection);
    }

    onUserOffline(connection: RtcConnection, remoteUid: number, reason: USER_OFFLINE_REASON_TYPE): void {
        this._cameraCanvas.logContent.log("onUserOffline, remoteUid: ", remoteUid);
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
            this.logContent.error("initialize failed, errorCode: ", erroCode);
            return;
        }
        else {
            this.logContent.log("initialize success");
        }
    }

    async startPreview(): Promise<void> {
        let errorCode = await this.rtcEngine.startPreview();
        if (errorCode == 0) {
            this.logContent.log("startPreview success");
            this.videoContent.createVideoItem(this.rtcEngine, {
                uid: 0,
                view: null,
                sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
                mediaPlayerId: 0,
            }, null);
        }
        else {
            this.logContent.error("startPreview failed, errorCode: ", errorCode);
        }
    }

    async joinChannel(): Promise<void> {
        let erroCode = await this.rtcEngine.enableVideo();
        if (erroCode !== 0) {
            this.logContent.error(" enableVideo failed, errorCode: ", erroCode);
        }
        else {
            this.logContent.log("enableVideo success");
        }

        erroCode = await this.rtcEngine.setRtcVideoDebugViewEnabled(true);
        if (erroCode !== 0) {
            this.logContent.error("setRtcVideoDebugViewEnabled failed, errorCode: ", erroCode);
        }
        else {
            this.logContent.log("setRtcVideoDebugViewEnabled success");
        }

        const appAcountInfo = await AppAcountInfo.instance();
        erroCode = await this.rtcEngine.joinChannel(
            appAcountInfo.token,
            appAcountInfo.channelId,
            "",
            appAcountInfo.numberUid1
        );
        if (erroCode !== 0) {
            this.logContent.error(" joinChannel failed, errorCode: ", erroCode);
            return;
        }
        else {
            this.logContent.log(" joinChannel success");
        }
    }

    async leaveChannel(): Promise<void> {
        let errorCode = await this.rtcEngine.leaveChannel();
        if (errorCode !== 0) {
            this.logContent.error("leaveChannel failed, errorCode: ", errorCode);
        }
        else {
            this.logContent.log(" leaveChannel success");
        }
    }

    async releaseRtcEngine(): Promise<void> {
        await this.rtcEngine.release(true);
        this.rtcEngine = null;
        this.videoContent.clear();
        this.logContent.log("releaseRtcEngine success");
    }
}
