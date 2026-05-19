import { _decorator, Component, Node, UI, UITransform } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;


@ccclass('DottedLineCtrl')
@executeInEditMode
export class DottedLineCtrl extends Component {

    protected onEnable(): void {
        if (CC_EDITOR) {
            this.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        }
    }

    protected onDisable(): void {
        if (CC_EDITOR) {
            this.node.off(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        }
    }

    protected onSizeChanged() {
        if (CC_EDITOR) {
            let letfTop = this.node.getChildByName("leftTop");
            let rightTop = this.node.getChildByName("rightTop");
            let leftBottom = this.node.getChildByName("leftBottom");
            let rightBottom = this.node.getChildByName("rightBottom");
            let top = this.node.getChildByName("top");
            let bottom = this.node.getChildByName("bottom");
            let left = this.node.getChildByName("left");
            let right = this.node.getChildByName("right");

            let width = this.node.getComponent(UITransform).width;
            let height = this.node.getComponent(UITransform).height;

            letfTop.setPosition(-width / 2, height / 2);
            rightTop.setPosition(width / 2, height / 2);
            leftBottom.setPosition(-width / 2, -height / 2);
            rightBottom.setPosition(width / 2, -height / 2);

            left.setPosition(-width / 2 + 1.5, 0);
            left.getComponent(UITransform).height = height - 70;

            right.setPosition(width / 2 - 1.5, 0);
            right.getComponent(UITransform).height = height - 70;

            top.setPosition(0, height / 2 - 1.5);
            top.getComponent(UITransform).width = width - 70;

            bottom.setPosition(0, -height / 2 + 1.5);
            bottom.getComponent(UITransform).width = width - 70;

        }

    }
}

