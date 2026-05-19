import { instantiate } from 'cc';
import { Label } from 'cc';
import { Color } from 'cc';
import { UITransform, Widget, view, CCFloat, _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LogContent')
export class LogContent extends Component {

    @property(Node)
    public modelLabel: Node = null;

    @property(Node)
    public logContent: Node = null;

    private logContentWidth: number = 0;

    @property(CCFloat)
    public leftPadding: number = 0;

    static readonly INFO_COLOR: Color = new Color(0, 255, 0, 255);
    static readonly ERROR_COLOR: Color = new Color(255, 0, 0);
    static readonly WARNING_COLOR: Color = new Color(255, 255, 0, 255);
    static readonly MOUDLE_NAME: string = "[AgoraRTCDemo]";

    start() {
        const transform = this.node.getComponent(UITransform);
        transform.width = view.getVisibleSize().width - this.leftPadding;
        this.updateWidgetRecursively(this.node);
        this.logContentWidth = this.logContent.getComponent(UITransform).width;
    }

    private updateWidgetRecursively(node: Node) {
        const widget = node.getComponent(Widget);
        if (widget) {
            widget.updateAlignment();
        }
        node.children.forEach(child => this.updateWidgetRecursively(child));
    }

    formatDateTime(date: Date = new Date()): string {
        const pad = (n: number) => String(n).padStart(2, '0');

        const Y = date.getFullYear();
        const M = pad(date.getMonth() + 1);   // 月份从 0 开始
        const D = pad(date.getDate());
        const h = pad(date.getHours());
        const m = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    }

    log(...args: any[]) {
        const dateTime = this.formatDateTime();
        let labelNode = instantiate(this.modelLabel);
        labelNode.getComponent(UITransform).width = this.logContentWidth - 10;
        labelNode.getComponent(Label).string = `${dateTime} ${LogContent.MOUDLE_NAME} ${args.join(' ')}`;
        labelNode.parent = this.logContent; 
        labelNode.getComponent(Label).color = LogContent.INFO_COLOR;
        console.log(LogContent.MOUDLE_NAME, ...args);
    }

    warn(...args: any[]) {
        const dateTime = this.formatDateTime();
        let labelNode = instantiate(this.modelLabel);
        labelNode.getComponent(UITransform).width = this.logContentWidth - 10;
        labelNode.getComponent(Label).string = `${dateTime} ${LogContent.MOUDLE_NAME} ${args.join(' ')}`;
        labelNode.parent = this.logContent;
        labelNode.getComponent(Label).color = LogContent.WARNING_COLOR;
        console.warn(LogContent.MOUDLE_NAME, ...args);
    }

    error(...args: any[]) {
        const dateTime = this.formatDateTime();
        let labelNode = instantiate(this.modelLabel);
        labelNode.getComponent(UITransform).width = this.logContentWidth - 10;
        labelNode.getComponent(Label).string = `${dateTime} ${LogContent.MOUDLE_NAME} ${args.join(' ')}`;
        labelNode.parent = this.logContent;
        labelNode.getComponent(Label).color = LogContent.ERROR_COLOR;
        console.error(LogContent.MOUDLE_NAME, ...args);
    }
}

