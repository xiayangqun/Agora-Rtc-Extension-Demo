import { _decorator, Component, Prefab, instantiate, sys, native } from "cc";
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
    IVideoDeviceManager,
    CAMERA_DIRECTION,
    CameraCapturerConfiguration
} from "db://agora-rtc-extension-for-cocos-creator/agora-rtc";
import { BaseCanvas } from "../base/BaseCanvas";
import { app } from "electron";
import { VideoContent } from "../prefab/VideoContent";
import { AppAcountInfo } from "../base/AppAcountInfo";
import { LOG_CONTENT_LEVEL } from "../prefab/LogContent";

const { ccclass, property } = _decorator;

class MultCameraCanvasRtcEngineEventHandler extends IRtcEngineEventHandler {
    _cameraCanvas: MultCameraCanvas = null;
    constructor(cameraCanvas: MultCameraCanvas) {
        super();
        this._cameraCanvas = cameraCanvas;
    }

    async onJoinChannelSuccess(connection: RtcConnection, elapsed: number): Promise<void> {
        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, " onJoinChannelSuccess, connection: ", connection);
    }

    async onUserJoined(connection: RtcConnection, remoteUid: number, elapsed: number): Promise<void> {
        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, " onUserJoined, remoteUid: ", remoteUid);
        const appAcountInfo = await AppAcountInfo.instance();
        if (remoteUid == appAcountInfo.numberUid1 || remoteUid == appAcountInfo.numberUid2) {
            //main channel will see sub channel user join, and sub channel will see main channel user join
            //so, we need to check if the remoteUid is the main channel user or sub channel user
            //if it is the main channel user or sub channel user, we will do nothing
            return;
        }

        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onUserJoined, remoteUid: ", remoteUid);

        const videoConnection = connection.localUid == appAcountInfo.numberUid2 ? connection : null;
        let canvas: VideoCanvas = {
            uid: remoteUid,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_FOURTH,
            mediaPlayerId: 0,
        };
        this._cameraCanvas.videoContent.createVideoItem(this._cameraCanvas.rtcEngine, canvas, videoConnection);
    }

    onLeaveChannel(connection: RtcConnection): void {
        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onLeaveChannel, connection: ", connection);
    }

    async onUserOffline(connection: RtcConnection, remoteUid: number, reason: USER_OFFLINE_REASON_TYPE): Promise<void> {
        this._cameraCanvas.logContent.print(LOG_CONTENT_LEVEL.INFO, "onUserOffline, remoteUid: ", remoteUid);
        const appAcountInfo = await AppAcountInfo.instance();
        const videoConnection = connection.localUid == appAcountInfo.numberUid2 ? connection : null;
        let canvas: VideoCanvas = {
            uid: remoteUid,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_FOURTH,
            mediaPlayerId: 0,
        };
        this._cameraCanvas.videoContent.destroyVideoItem(canvas, videoConnection);
    }
}


@ccclass('MultCameraCanvas')
export class MultCameraCanvas extends BaseCanvas {
    @property(VideoContent)
    public videoContent: VideoContent = null;

    videoDeviceManager: IVideoDeviceManager = null;
    collection: IVideoDeviceCollection = null;


    async createRtcEngine(): Promise<void> {

        if (sys.platform === sys.Platform.ANDROID) {
            this.logContent.print(LOG_CONTENT_LEVEL.INFO, "Android is not supported for dual camera, but you could see how it works on the Windows/MacOS");
        }

        if (sys.platform === sys.Platform.IOS) {
            this.logContent.print(LOG_CONTENT_LEVEL.INFO, "iPhone only supports iPhone XR or better. iOS version requires 13.0 or better");
        }

        this.rtcEngine = createRtcEngine();
        const appAcountInfo = await AppAcountInfo.instance();
        let config: RtcEngineContext = {
            eventHandler: new MultCameraCanvasRtcEngineEventHandler(this),
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


        this.videoDeviceManager = await this.rtcEngine.getVideoDeviceManager();
        if (this.videoDeviceManager != null) {
            this.collection = await this.videoDeviceManager.enumerateVideoDevices();
            if (this.collection != null) {
                const count = await this.collection.getCount();
                for (let i = 0; i < count; i++) {
                    const devices = await this.collection.getDevice(i);
                    this.logContent.print(LOG_CONTENT_LEVEL.INFO, `videoDevice ${i}: 
                deviceIdUTF8: ${devices.deviceIdUTF8},
                deviceNameUTF8: ${devices.deviceNameUTF8}, 
                errorCode: ${devices.errorCode}`);
                }
                if (count < 2) {
                    this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "less two camera use in this case");
                }
            }
            else {
                this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "enumerateVideoDevices is not supported in current platform: ", sys.platform);
            }
        }
        else {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "videoDeviceManager is not supported in current platform:", sys.platform);
        }
    }

    async startFirstCameraCapture(): Promise<void> {
        let deviceIdUTF8 = "";
        if (this.collection != null) {
            deviceIdUTF8 = (await this.collection.getDevice(0)).deviceIdUTF8;
        }

        let errorCode = await this.rtcEngine.startCameraCapture(VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA, {
            deviceId: deviceIdUTF8,
            format: {
                width: 640,
                height: 480,
                fps: 15
            }
        });
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "startCameraCapture errorCode: ", errorCode);
        let canvas: VideoCanvas = {
            uid: 0,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA,
            mediaPlayerId: 0,
        };
        this.videoContent.createVideoItem(this.rtcEngine, canvas, null);

    }

    async startSecondCameraCapture(): Promise<void> {
        let config: CameraCapturerConfiguration = {
            format: {
                width: 640,
                height: 480,
                fps: 15
            }
        };
        if (this.collection != null) {
            const deviceIdUTF8 = (await this.collection.getDevice(0)).deviceIdUTF8;
            config.deviceId = deviceIdUTF8;
        }
        if (sys.platform === sys.Platform.IOS) {
            //on iOS, we use CAMERA_DIRECTION to start different camera, so we don't need to set deviceId
            config.cameraDirection = CAMERA_DIRECTION.CAMERA_REAR;
            const errorCode = await this.rtcEngine.enableMultiCamera(true, config);
            this.logContent.print(LOG_CONTENT_LEVEL.INFO, "enableMultiCamera errorCode:" + errorCode);
        }

        let errorCode = await this.rtcEngine.startCameraCapture(VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY, config);
        this.logContent.print(errorCode === 0 ? LOG_CONTENT_LEVEL.INFO : LOG_CONTENT_LEVEL.ERROR, "startCameraCapture errorCode: ", errorCode);
        let canvas: VideoCanvas = {
            uid: 0,
            view: null,
            sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY,
            mediaPlayerId: 0,
        };
        this.videoContent.createVideoItem(this.rtcEngine, canvas, null);
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
                publishSecondaryCameraTrack: true,
                autoSubscribeAudio: false,
                autoSubscribeVideo: false
            }
        );
        if (erroCode !== 0) {
            this.logContent.print(LOG_CONTENT_LEVEL.ERROR, "joinChannelEx failed, errorCode: ", erroCode);
            return;
        }
        this.logContent.print(LOG_CONTENT_LEVEL.INFO, "joinChannelEx success");
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
