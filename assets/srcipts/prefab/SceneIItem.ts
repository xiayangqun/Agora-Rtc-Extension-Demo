import { _decorator, Component, Node } from 'cc';
import { sceneInfoList } from '../base/SceneInfo';
import { Label } from 'cc';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneIItem')
export class SceneIItem extends Component {
   
    @property(Label)
    public sceneNameLabel: Label = null;

    @property([SpriteFrame])
    public bgSpriteFrames: SpriteFrame[] = [];

    protected index: number = 0;

    protected cb: (index:number)=>void = null;

    init(index:number, cb:(index:number)=>void  ){
        this.index = index;
        this.cb = cb;
        this.sceneNameLabel.string = sceneInfoList[index].sceneName;
        this.getComponent(Sprite).spriteFrame = this.bgSpriteFrames[index%this.bgSpriteFrames.length];
    }

    onClick(){
        if(this.cb){
            this.cb(this.index);
        }
    }
}

