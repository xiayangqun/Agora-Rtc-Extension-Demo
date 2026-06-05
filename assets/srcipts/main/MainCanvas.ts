import { _decorator, Component, Node } from 'cc';
import { sceneInfoList } from '../base/SceneInfo';
import { SceneList } from '../prefab/SceneList';
import { SceneDetail } from '../prefab/SceneDetail';
import { requestCameraPermission, requestMicrophonePermission, requestScreenCapturePermission} from "db://agora-demo-native-permissions/agora-demo-native-permissions";
const { ccclass, property } = _decorator;

@ccclass('MainCanvas')
export class MainCanvas extends Component {

    @property(SceneList)
    public sceneList: SceneList = null;

    @property(SceneDetail)
    public sceneDetail: SceneDetail = null;
    
    start() {
        for(let i = 0; i < sceneInfoList.length; i++){
            this.sceneList.createSceneIItem(i, (index) => {
                this.onSelectScene(index);
            });
        }
        this.onSelectScene(0);
    }


    onSelectScene(index: number) {
        this.sceneDetail.setIndex(index);
    }

    onCamera(){
        let result = requestCameraPermission();
        console.log("requestCameraPermission result: " + result);
    }

    onMicrophone(){
        let result = requestMicrophonePermission();
        console.log("requestMicrophonePermission result: " + result);
    }

    onScreen(){
        let result = requestScreenCapturePermission();
        console.log("requestScreenCapturePermission result: " + result);
    }
}

