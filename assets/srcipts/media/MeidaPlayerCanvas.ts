import { _decorator, Component, Prefab, instantiate, sys } from "cc";
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
import { LOG_CONTENT_LEVEL } from "../prefab/LogContent";

const { ccclass, property } = _decorator;

class MediaPlayerCanvasRtcEngineEventHandler extends IRtcEngineEventHandler {
    _canvas: MediaPlayerCanvas = null;

    constructor(canvas: MediaPlayerCanvas) {
        super();
        this._canvas = canvas;
    }

    async onJoinChannelSuccess(connection: RtcConnection, elapsed: number): Promise<void> {
        this._canvas.logContent.print(LOG_CONTENT_LEVEL.INFO, " onJoinChannelSuccess, connection: ", connection);
    }

    async onUserJoined(connection: RtcConnection, remoteUid: number, elapsed: number): Promise<void> {
        this._canvas.logContent.print(LOG_CONTENT_LEVEL.INFO, " onUserJoined, remoteUid: ", remoteUid);
        const appAcountInfo = await AppAcountInfo.instance();
        if (remoteUid == appAcountInfo.numberUid1 || remoteUid == appAcountInfo.numberUid2) {
            //main channel will see sub channel user join, and sub channel will see main channel user join
            //so, we need to check if the remoteUid is the main channel user or sub channel user
            //if it is the main channel user or sub channel user, we will do nothing
            return;
        }

        this._canvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onUserJoined, remoteUid: ", remoteUid);

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
        this._canvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onLeaveChannel, connection: ", connection);
    }

    async onUserOffline(connection: RtcConnection, remoteUid: number, reason: USER_OFFLINE_REASON_TYPE): Promise<void> {
        this._canvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onUserOffline, remoteUid: ", remoteUid);
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
            autoRegisterAgoraExtensions: true,
        };
        let erroCode = 0;
        erroCode = await this.rtcEngine.initialize(config);
        if (erroCode !== 0) {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "initialize failed, errorCode: ", erroCode);
            return;
        }
        this.logContent.print(LOG_CONTENT_LEVEL.INFO, "initialize success");

        if (sys.isNative && sys.platform === sys.Platform.IOS) {
            //in ios need this make cocos sound engine effect
            erroCode = await this.rtcEngine.setParameters('{"che.audio.keep.audiosession":true}');
            this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "setParameters for iOS audio session, errorCode: ", erroCode);
        }

        //in web, you can see video element in debug view
        erroCode = await this.rtcEngine.setRtcVideoDebugViewEnabled(true);
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "setRtcVideoDebugViewEnabled errorCode: ", erroCode);

        erroCode = await this.rtcEngine.enableVideo();
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "enableVideo errorCode: ", erroCode);

        const { version, build } = await this.rtcEngine.getVersion();
        this.logContent.print(LOG_CONTENT_LEVEL.INFO, `rtc engine version: ${version}, build: ${build}`);
    }

    async joinChannel(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        const options: ChannelMediaOptions = {
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            autoSubscribeAudio: true,
            autoSubscribeVideo: true,
        };
        let erroCode = await this.rtcEngine.joinChannel(
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

        this.videoContent.createVideoItem(this.rtcEngine, {
            uid: 0,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
            mediaPlayerId: 0,
        }, null);
    }

    async createMediaPlayer() {
        let mediaPlayer = await this.rtcEngine.createMediaPlayer();
        await this.mediaList.createMediaPlayerItem(mediaPlayer);
    }

    async publishCamera() {
        let options: ChannelMediaOptions = {
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishCameraTrack: true,
            publishMicrophoneTrack: true,
            publishMediaPlayerAudioTrack: false,
            publishMediaPlayerVideoTrack: false,
        };

        let errorCode = await this.rtcEngine.updateChannelMediaOptions(options);
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "publishCamera updateChannelMediaOptions errorCode: ", errorCode);
    }

    async publishMediaPlayer() {
        let id = this.idBox.string;
        if (id === "") {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "id is empty");
            return;
        }
        let idNum = parseInt(id);
        if (isNaN(idNum)) {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "id is not a number");
            return;
        }
        await this._publishMediaPlayer(idNum);
    }

    async _publishMediaPlayer(id: number) {
        let options: ChannelMediaOptions = {
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishCameraTrack: false,
            publishMicrophoneTrack: false,
            publishMediaPlayerAudioTrack: true,
            publishMediaPlayerVideoTrack: true,
            publishMediaPlayerId: id,
        };
        let errorCode = await this.rtcEngine.updateChannelMediaOptions(options);
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "publishMediaPlayer updateChannelMediaOptions errorCode: ", errorCode);
    }

    async leaveChannel(): Promise<void> {
        let errorCode = await this.rtcEngine.leaveChannel();
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "leaveChannel errorCode: ", errorCode);
    }

    async releaseRtcEngine(): Promise<void> {
        if (this.rtcEngine) {
            //before release engine, make sure all video canvas is unbinded and all texture is destroyed, 
            await this.videoContent.clear();
            //before release engine, make sure all media player is destroyed,
            await this.mediaList.clear();
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
