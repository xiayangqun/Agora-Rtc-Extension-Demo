import { UITransform } from 'cc';
import { Texture2D } from 'cc';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { Rect } from 'cc';
import { Size } from 'cc';
import { _decorator, Component, Node, Vec3, input, Input, EventTouch, Camera } from 'cc';
import { IRtcEngine } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc/interface/IRtcEngine';
const { ccclass, property } = _decorator;

@ccclass('VideoSprite')
export class VideoSprite extends Component {
    private isDragging: boolean = false;
    private touchOffset: Vec3 = new Vec3();
    private camera: Camera | null = null;

    onLoad() {
        this.camera = this.node.scene.getComponentInChildren(Camera);
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    createTextureAndAttachToSelf():Texture2D{
        let texture = new Texture2D();
        let spriteFrame = new SpriteFrame();
        spriteFrame.packable = false;
        spriteFrame.texture = texture;
        this.node.getComponent(Sprite).spriteFrame = spriteFrame;
        return texture;
    }

    resize(width: number, height: number) {
        console.log("resize", width, height);
        const sprite = this.node.getComponent(Sprite);
        const spriteFrame = sprite?.spriteFrame;
        if (spriteFrame) {
            spriteFrame.packable = false;
            (spriteFrame as unknown as { _resetDynamicAtlasFrame?: () => void })._resetDynamicAtlasFrame?.();
        }
        const texture = spriteFrame?.texture;
        if (spriteFrame && texture) {
            spriteFrame.reset({
                texture,
                rect: new Rect(0, 0, width, height),
                originalSize: new Size(width, height),
            });
            const renderer = sprite as unknown as {
                setTextureDirty?: () => void;
                markForUpdateRenderData?: () => void;
            };
            renderer.setTextureDirty?.();
            renderer.markForUpdateRenderData?.();
        }
        this.node.getComponent(UITransform).setContentSize(width, height);
    }

    onTouchStart(event: EventTouch) {
        this.isDragging = true;
        const touchPos = event.getUILocation();
        const worldPos = this.node.getWorldPosition();
        this.touchOffset.set(worldPos.x, worldPos.y, worldPos.z);
        this.bringToFront();
    }

    onTouchMove(event: EventTouch) {
        if (!this.isDragging) return;
        
        const touchPos = event.getUILocation();
        const newPos = new Vec3(touchPos.x, touchPos.y, this.node.position.z);
        this.node.setWorldPosition(newPos);
    }

    onTouchEnd(event: EventTouch) {
        this.isDragging = false;
    }

    bringToFront() {
        if (this.node.parent) {
            const siblingCount = this.node.parent.children.length;
            this.node.setSiblingIndex(siblingCount - 1);
        }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}
