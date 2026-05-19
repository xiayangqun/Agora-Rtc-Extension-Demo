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

const { ccclass, property } = _decorator;

class CameraCanvasRtcEngineEventHandler extends IRtcEngineEventHandler {
    _cameraCanvas: CameraCanvas = null;
    constructor(cameraCanvas: CameraCanvas) {
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
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
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

@ccclass("CameraCanvas")
export class CameraCanvas extends BaseCanvas {
    public uid: number = 1001;


    async createRtcEngine(): Promise<void> {
        this.rtcEngine = createRtcEngine();
        await this.initAppIdInfo();
        const appIdInfo = this.appIdInfo;
        let config: RtcEngineContext = {
            eventHandler: new CameraCanvasRtcEngineEventHandler(this),
            appId: appIdInfo.appId,
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

        erroCode = await this.rtcEngine.joinChannel(
            this.appIdInfo.token,
            this.appIdInfo.channelId,
            "",
            this.uid,
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
        this.logContent.log("releaseRtcEngine success");
    }
}
