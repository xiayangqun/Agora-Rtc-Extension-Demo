import { CCFloat, view } from 'cc';
import { EditBox } from 'cc';
import { Widget } from 'cc';
import { UITransform } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { AppAcountInfo } from '../base/AppAcountInfo';
const { ccclass, property } = _decorator;

@ccclass('AppAcountPanel')
export class AppAcountPanel extends Component {

    @property(EditBox)
    public appidEditBox: EditBox = null;

    @property(EditBox)
    public channelIdEditBox: EditBox = null;

    @property(EditBox)
    public tokenEditBox: EditBox = null;

    @property(EditBox)
    public numberUid1EditBox: EditBox = null;

    @property(EditBox)
    public numberUid2EditBox: EditBox = null;

    @property(EditBox)
    public stringUid1EditBox: EditBox = null;

    @property(EditBox)
    public stringUid2EditBox: EditBox = null;

    @property(CCFloat)
    public leftPadding: number = 0;

    async start() {
        const transform = this.node.getComponent(UITransform);
        transform.width = view.getVisibleSize().width - this.leftPadding;
        this.updateWidgetRecursively(this.node);

        const appAcountInfo = await AppAcountInfo.instance();
        this.appidEditBox.string = appAcountInfo.appId;
        this.channelIdEditBox.string = appAcountInfo.channelId;
        this.tokenEditBox.string = appAcountInfo.token;
        this.numberUid1EditBox.string = appAcountInfo.numberUid1.toString();
        this.numberUid2EditBox.string = appAcountInfo.numberUid2.toString();
        this.stringUid1EditBox.string = appAcountInfo.stringUid1;
        this.stringUid2EditBox.string = appAcountInfo.stringUid2;
    }

    async flush(){
        const appAcountInfo = await AppAcountInfo.instance();
        appAcountInfo.appId = this.appidEditBox.string;
        appAcountInfo.channelId = this.channelIdEditBox.string;
        appAcountInfo.token = this.tokenEditBox.string;
        appAcountInfo.numberUid1 = Number(this.numberUid1EditBox.string);
        appAcountInfo.numberUid2 = Number(this.numberUid2EditBox.string);
        appAcountInfo.stringUid1 = this.stringUid1EditBox.string;
        appAcountInfo.stringUid2 = this.stringUid2EditBox.string;
        console.log("flush appAcountInfo", appAcountInfo);
    }

    private updateWidgetRecursively(node: Node) {
        const widget = node.getComponent(Widget);
        if (widget) {
            widget.updateAlignment();
        }
        node.children.forEach(child => this.updateWidgetRecursively(child));
    }

    update(deltaTime: number) {

    }
}

