import { Label, director } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { sceneInfoList } from '../base/SceneInfo';
import { CCFloat } from 'cc';
import { UITransform, view } from 'cc';
import { Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneDetail')
export class SceneDetail extends Component {

    @property(Label)
    public sceneNameLabel: Label = null;

    @property(Label)
    public sceneDescLabel: Label = null;

    private _index: number = 0;

    @property(CCFloat)
    public leftPadding: number = 0;


    start() {
        const transform = this.node.getComponent(UITransform);
        transform.width = view.getVisibleSize().width - this.leftPadding;
        this.updateWidgetRecursively(this.node);
    }

    private updateWidgetRecursively(node: Node) {
        const widget = node.getComponent(Widget);
        if (widget) {
            widget.updateAlignment();
        }
        node.children.forEach(child => this.updateWidgetRecursively(child));
    }

    setIndex(index: number) {
        this._index = index;
        this.sceneNameLabel.string = sceneInfoList[index].sceneName;
        this.sceneDescLabel.string = sceneInfoList[index].sceneDesc;
    }

    onGo() {
        console.log(`Go to scene ${this._index}`);
        director.loadScene(sceneInfoList[this._index].sceneName);
    }
}

