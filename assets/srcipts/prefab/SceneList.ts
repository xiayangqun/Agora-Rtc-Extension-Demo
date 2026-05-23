import { Prefab, instantiate } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { SceneIItem } from './SceneIItem';
const { ccclass, property } = _decorator;

@ccclass('SceneList')
export class SceneList extends Component {
   
    @property(Prefab)
    public sceneIItemPrefab: Prefab = null;

    @property(Node)
    public container: Node = null;


    createSceneIItem(index:number, cb:(index:number)=>void  ){
        const item = instantiate(this.sceneIItemPrefab);
        item.parent = this.container;
        item.getComponent(SceneIItem).init(index, cb);
    }
}

