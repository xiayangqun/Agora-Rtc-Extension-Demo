export interface SceneInfo{
    sceneName: string;
    sceneDesc: string;
}

export const sceneInfoList: SceneInfo[] = [
    {
        sceneName: 'singleCamera',
        sceneDesc: 'Join a channel with a single camera for video calls',
    },
    {
        sceneName: 'multCamera',
        sceneDesc: 'Join the same channel with two cameras and two user IDs for multi-camera calls',
    },
    {
        sceneName: 'cameraAndScreen',
        sceneDesc: 'Join a channel with camera and screen sharing for simultaneous video call and screen share',
    },
    {
        sceneName: 'mediaPlayer',
        sceneDesc: 'Join a channel with media player for video calls and streaming media files to remote users',
    },
]