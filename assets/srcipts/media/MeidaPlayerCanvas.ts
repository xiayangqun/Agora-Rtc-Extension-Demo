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
    USER_OFFLINE_REASON_TYPE,
    IVideoDeviceCollection,
    ScreenCaptureSourceInfo,
    ChannelMediaOptions
} from "db://agora-rtc-extension-for-cocos-creator/agora-rtc";
import { BaseCanvas } from "../base/BaseCanvas";
import { VideoContent } from "../prefab/VideoContent";
import { AppAcountInfo } from "../base/AppAcountInfo";
import { MediaList } from "../prefab/MediaList";
import { EditBox } from "cc";

const { ccclass, property } = _decorator;

class MediaPlayerCanvasRtcEngineEventHandler extends IRtcEngineEventHandler {
    _canvas: MediaPlayerCanvas = null;

    constructor(canvas: MediaPlayerCanvas) {
        super();
        this._canvas = canvas;
    }

    async onJoinChannelSuccess(connection: RtcConnection, elapsed: number): Promise<void> {
        this._canvas.logContent.log(" onJoinChannelSuccess, connection: ", connection);
    }

    async onUserJoined(connection: RtcConnection, remoteUid: number, elapsed: number): Promise<void> {
        this._canvas.logContent.log(" onUserJoined, remoteUid: ", remoteUid);
        const appAcountInfo = await AppAcountInfo.instance();
        if (remoteUid == appAcountInfo.numberUid1 || remoteUid == appAcountInfo.numberUid2) {
            //main channel will see sub channel user join, and sub channel will see main channel user join
            //so, we need to check if the remoteUid is the main channel user or sub channel user
            //if it is the main channel user or sub channel user, we will do nothing
            return;
        }

        this._canvas.logContent.log("onUserJoined, remoteUid: ", remoteUid);

        const videoConnection = connection.localUid == appAcountInfo.numberUid2 ? connection : null;
        let canvas: VideoCanvas = {
            uid: remoteUid,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_FOURTH,
            mediaPlayerId: 0,
        };
        this._canvas.videoContent.createVideoItem(this._canvas.rtcEngine, canvas, videoConnection);
    }

    onLeaveChannel(connection: RtcConnection): void {
        this._canvas.logContent.log("onLeaveChannel, connection: ", connection);
    }

    async onUserOffline(connection: RtcConnection, remoteUid: number, reason: USER_OFFLINE_REASON_TYPE): Promise<void> {
        this._canvas.logContent.log("onUserOffline, remoteUid: ", remoteUid);
        const appAcountInfo = await AppAcountInfo.instance();
        const videoConnection = connection.localUid == appAcountInfo.numberUid2 ? connection : null;
        let canvas: VideoCanvas = {
            uid: remoteUid,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_FOURTH,
            mediaPlayerId: 0,
        };
        this._canvas.videoContent.destroyVideoItem(canvas, videoConnection);
    }
}


@ccclass('MediaPlayerCanvas')
export class MediaPlayerCanvas extends BaseCanvas {
    @property(VideoContent)
    public videoContent: VideoContent = null;

    @property(MediaList)
    public mediaList: MediaList = null;

    @property(EditBox)
    public idBox: EditBox = null;

    async createRtcEngine(): Promise<void> {
        this.rtcEngine = createRtcEngine();

        const appAcountInfo = await AppAcountInfo.instance();
        let config: RtcEngineContext = {
            eventHandler: new MediaPlayerCanvasRtcEngineEventHandler(this),
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

        let videoDeviceManager = await this.rtcEngine.getVideoDeviceManager();
        const collection: IVideoDeviceCollection = await videoDeviceManager.enumerateVideoDevices();
        const count = await collection.getCount();
        for (let i = 0; i < count; i++) {
            const devices = await collection.getDevice(i);
            this.logContent.log(`videoDevice ${i}: 
                deviceIdUTF8: ${devices.deviceIdUTF8},
                deviceNameUTF8: ${devices.deviceNameUTF8}, 
                errorCode: ${devices.errorCode}`);
        }
        if (count < 2) {
            this.logContent.error("less two camera use in this case");
        }

        erroCode = await this.rtcEngine.setRtcVideoDebugViewEnabled(true);
        if (erroCode !== 0) {
            this.logContent.error("setRtcVideoDebugViewEnabled failed, errorCode: ", erroCode);
        }
        else {
            this.logContent.log("setRtcVideoDebugViewEnabled success");
        }

        erroCode = await this.rtcEngine.enableVideo();
        if (erroCode !== 0) {
            this.logContent.error(" enableVideo failed, errorCode: ", erroCode);
        }
        else {
            this.logContent.log("enableVideo success");
        }
    }

    async joinChannel(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        let erroCode = await this.rtcEngine.joinChannel(
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

        this.videoContent.createVideoItem(this.rtcEngine, {
            uid: 0,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
            mediaPlayerId: 0,
        }, null);
    }

    async createMediaPlayer(){
        let mediaPlayer = await this.rtcEngine.createMediaPlayer();
        this.mediaList.createMediaPlayerItem(mediaPlayer);
    }

    async publishCamera() {
        let options: ChannelMediaOptions = {
            publishCameraTrack: true,
            publishMicrophoneTrack: true,
            publishMediaPlayerAudioTrack: false,
            publishMediaPlayerVideoTrack: false,
        };

        let errorCode = await this.rtcEngine.updateChannelMediaOptions(options);
        if (errorCode !== 0) {
            this.logContent.error("updateChannelMediaOptions failed, errorCode: ", errorCode);
        }
        else {
            this.logContent.log(" updateChannelMediaOptions success");
        }
    }

    async publishMediaPlayer() {
        let id = this.idBox.string;
        if (id === "") {
            this.logContent.error("id is empty");
            return;
        }
        let idNum = parseInt(id);
        if (isNaN(idNum)) {
            this.logContent.error("id is not a number");
            return;
        }
        await this._publishMediaPlayer(idNum);
    }

    async _publishMediaPlayer(id: number) {
        let options: ChannelMediaOptions = {
            publishCameraTrack: false,
            publishMicrophoneTrack: false,
            publishMediaPlayerAudioTrack: true,
            publishMediaPlayerVideoTrack: true,
            publishMediaPlayerId: id,
        };
        let errorCode = await this.rtcEngine.updateChannelMediaOptions(options);
        if (errorCode !== 0) {
            this.logContent.error("updateChannelMediaOptions failed, errorCode: ", errorCode);
        }
        else {
            this.logContent.log(" updateChannelMediaOptions success");
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
