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
    ChannelMediaOptions,
    VideoCanvas,
    USER_OFFLINE_REASON_TYPE,
    IVideoDeviceCollection,
    ScreenCaptureSourceInfo
} from "db://agora-rtc-extension-for-cocos-creator/agora-rtc";
import { BaseCanvas } from "../base/BaseCanvas";
import { VideoContent } from "../prefab/VideoContent";
import { AppAcountInfo } from "../base/AppAcountInfo";
import { ScreenList } from "../prefab/ScreenList";
import { IScreenCaptureSourceList } from "db://agora-rtc-extension-for-cocos-creator/agora-rtc/interface/IScreenCaptureSourceList";
import { LOG_CONTENT_LEVEL } from "../prefab/LogContent";

const { ccclass, property } = _decorator;

class CameraAndScreenCanvasRtcEngineEventHandler extends IRtcEngineEventHandler {
    _canvas: CameraAndScreenCanvas = null;
    constructor(canvas: CameraAndScreenCanvas) {
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


@ccclass('CameraAndScreenCanvas')
export class CameraAndScreenCanvas extends BaseCanvas {
    @property(VideoContent)
    public videoContent: VideoContent = null;

    @property(ScreenList)
    public screenList: ScreenList = null;

    async createRtcEngine(): Promise<void> {
        this.rtcEngine = createRtcEngine();

        const appAcountInfo = await AppAcountInfo.instance();
        let config: RtcEngineContext = {
            eventHandler: new CameraAndScreenCanvasRtcEngineEventHandler(this),
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

    async listScreen(): Promise<void> {
        let list: IScreenCaptureSourceList = await this.rtcEngine.getScreenCaptureSources({
            width: 640,
            height: 480,
        }, {
            width: 128, height: 128
        }, true);

        if (list != null) {
            await this.screenList.init(list);
        }
        else {
            this.logContent.print(LOG_CONTENT_LEVEL.WARNING, "getScreenCaptureSources not support in this platform :" + sys.platform);
            await this.screenList.initEmpty();
        }


    }

    async joinChannelWithUid1(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        const options: ChannelMediaOptions = {
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishCameraTrack: true,
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

    async joinChannelExWithUid2(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        let erroCode = await this.rtcEngine.joinChannelEx(
            appAcountInfo.token,
            {
                channelId: appAcountInfo.channelId,
                localUid: appAcountInfo.numberUid2
            },
            {
                clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
                publishCameraTrack: false,
                publishScreenTrack: true,
                autoSubscribeAudio: false,
                autoSubscribeVideo: false,
                publishSecondaryScreenTrack: false,
                publishThirdScreenTrack: false,
                publishFourthScreenTrack: false,
            }
        );
        if (erroCode !== 0) {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "joinChannelEx failed, errorCode: ", erroCode);
            return;
        }
        this.logContent.print(LOG_CONTENT_LEVEL.INFO, "joinChannelEx success");
    }

    async publishFirstScreen(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        let erroCode = await this.rtcEngine.updateChannelMediaOptionsEx({
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishScreenTrack: true,
            publishSecondaryScreenTrack: false,
            publishThirdScreenTrack: false,
            publishFourthScreenTrack: false,
        }, {
            channelId: appAcountInfo.channelId,
            localUid: appAcountInfo.numberUid2,
        });
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "publishFirstScreen errorCode: ", erroCode);
    }

    async publishSecondScreen(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        let erroCode = await this.rtcEngine.updateChannelMediaOptionsEx({
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishScreenTrack: false,
            publishSecondaryScreenTrack: true,
            publishThirdScreenTrack: false,
            publishFourthScreenTrack: false,
        }, {
            channelId: appAcountInfo.channelId,
            localUid: appAcountInfo.numberUid2,
        });
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "publishSecondScreen errorCode: ", erroCode);
    }

    async publishThirdScreen(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        let erroCode = await this.rtcEngine.updateChannelMediaOptionsEx({
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishScreenTrack: false,
            publishSecondaryScreenTrack: false,
            publishThirdScreenTrack: true,
            publishFourthScreenTrack: false,
        }, {
            channelId: appAcountInfo.channelId,
            localUid: appAcountInfo.numberUid2,
        });
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "publishThirdScreen errorCode: ", erroCode);
    }

    async publishFourthScreen(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        let erroCode = await this.rtcEngine.updateChannelMediaOptionsEx({
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            publishScreenTrack: false,
            publishSecondaryScreenTrack: false,
            publishThirdScreenTrack: false,
            publishFourthScreenTrack: true,
        }, {
            channelId: appAcountInfo.channelId,
            localUid: appAcountInfo.numberUid2,
        });
        this.logContent.print(erroCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "publishFourthScreen errorCode: ", erroCode);
    }

    async leaveChannel(): Promise<void> {
        let errorCode = await this.rtcEngine.leaveChannel();
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "leaveChannel errorCode: ", errorCode);
    }

    async leaveChannelEx(): Promise<void> {
        const appAcountInfo = await AppAcountInfo.instance();
        let errorCode = await this.rtcEngine.leaveChannelEx({
            channelId: appAcountInfo.channelId,
            localUid: appAcountInfo.numberUid2
        });
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "leaveChannelEx errorCode: ", errorCode);
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
