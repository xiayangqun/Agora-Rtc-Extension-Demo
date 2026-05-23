import { Label } from 'cc';
import { Mesh } from 'cc';
import { Texture2D, SpriteFrame, Rect, Size, UITransform } from 'cc';
import { Material } from 'cc';
import { MeshRenderer } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IRtcEngineEx, RtcConnection, VIDEO_SOURCE_TYPE, VideoCanvas } from 'db://agora-rtc-extension-for-cocos-creator/agora-rtc';
const { ccclass, property } = _decorator;

@ccclass('VideoItemBase')
export class VideoItemBase extends Component {

    @property(Label)
    public belongLabel: Label = null;

    @property(Label)
    public infoLabel: Label = null;

    @property(Sprite)
    public videoSprite: Sprite = null;

    @property(MeshRenderer)
    public videoMeshRenderer: MeshRenderer = null;

    protected rtcEngine: IRtcEngineEx = null;

    protected texture: Texture2D = null;

    protected spriteFrame: SpriteFrame = null;

    protected material: Material = null;

    protected canvasClone: VideoCanvas = null;

    protected connectionClone: RtcConnection = null;


    setupVideoCanvas(rtcEngine: IRtcEngineEx, canvas: VideoCanvas, connection?: RtcConnection) {
        this.canvasClone = { ...canvas };
        if (connection) {
            this.connectionClone = { ...connection };
        }

        this.rtcEngine = rtcEngine;
        if (canvas.uid == 0) {
            //is local video canvas
            this.belongLabel.string = "Local";
            if (canvas.mediaPlayerId != 0) {
                this.infoLabel.string = `MediaPlayer ID: ${canvas.mediaPlayerId}`;
            }
            else {
                this.infoLabel.string = VIDEO_SOURCE_TYPE[canvas.sourceType];
            }

            this.createTextureAndAttachToSelf();
            canvas.view = this.texture;
            rtcEngine.setupLocalVideo(canvas, (width, height) => {
                this.resize(width, height);
            });
        }
        else {
            //is remote video canvas
            this.belongLabel.string = "Remote";
           
            this.createTextureAndAttachToSelf();
            canvas.view = this.texture;
            if (connection) {
                this.infoLabel.string = `ex: { ${connection.channelId} : ${connection.localUid}, remote UID: ${canvas.uid} }`;
                rtcEngine.setupRemoteVideoEx(canvas, connection, (width, height) => {
                    this.resize(width, height);
                });
            } else {
                this.infoLabel.string = `main UID: ${canvas.uid}`;
                rtcEngine.setupRemoteVideo(canvas, (width, height) => {
                    this.resize(width, height);
                });
            }
        }
    }

    unsetupVideoCanvas(canvas: VideoCanvas, connection?: RtcConnection) {
        canvas.view = null;
        if (canvas.uid == 0) {
            this.rtcEngine.setupLocalVideo(canvas);
        } else {
            if (connection) {
                this.rtcEngine.setupRemoteVideoEx(canvas, connection);
            } else {
                this.rtcEngine.setupRemoteVideo(canvas);
            }
        }
    }

    isSameVideoItem(canvas: VideoCanvas, connection?: RtcConnection): boolean {
        if (canvas.uid != this.canvasClone.uid) {
            return false;
        }
        if (canvas.sourceType != this.canvasClone.sourceType) {
            return false;
        }
        if (canvas.sourceType == VIDEO_SOURCE_TYPE.VIDEO_SOURCE_MEDIA_PLAYER &&
            this.canvasClone.sourceType == VIDEO_SOURCE_TYPE.VIDEO_SOURCE_MEDIA_PLAYER) {
            if (canvas.mediaPlayerId != this.canvasClone.mediaPlayerId) {
                return false;
            }
        }

        if (connection && this.connectionClone) {
            if (connection.channelId != this.connectionClone.channelId) {
                return false;
            }
            if (connection.localUid != this.connectionClone.localUid) {
                return false;
            }
        }

        if (connection == null && this.connectionClone != null) {
            return false;
        }

        if(connection != null && this.connectionClone == null){
            return false;
        }
        return true;
    }

    createTextureAndAttachToSelf(): void {
        this.texture = new Texture2D();

        this.spriteFrame = new SpriteFrame();
        this.spriteFrame.texture = this.texture;
        // Keep video frames out of Cocos dynamic atlas. Do not remove: dynamic
        // atlas repacking can copy changing video textures with stale bounds.
        this.spriteFrame.packable = false;

        this.videoSprite.spriteFrame = this.spriteFrame;
        this.material = this.videoMeshRenderer.getMaterialInstance(0);
        this.material.setProperty("mainTexture", this.texture);
    }

    resize(width: number, height: number) {
        console.log("resize", width, height);

        // If Cocos packed this frame before packable was disabled, restore the
        // original video texture first. Do not remove: it prevents atlas-state
        // residue from corrupting later SpriteFrame.reset() calls.
        (this.spriteFrame as unknown as { _resetDynamicAtlasFrame?: () => void })._resetDynamicAtlasFrame?.();
        this.spriteFrame.reset({
            texture: this.texture,
            rect: new Rect(0, 0, width, height),
            originalSize: new Size(width, height),
        });
        // SpriteFrame.reset({ texture }) may re-run Cocos' packable checks.
        // Do not remove: video textures must stay unpackable after every reset.
        this.spriteFrame.packable = false;

        const spriteRenderer = this.videoSprite as unknown as {
            setTextureDirty?: () => void;
            markForUpdateRenderData?: () => void;
        };
        // Force the Sprite assembler to sample the rebuilt Texture2D. Do not
        // remove: Texture2D.reset() recreates the underlying GPU texture.
        spriteRenderer.setTextureDirty?.();
        spriteRenderer.markForUpdateRenderData?.();

        const spriteTrans = this.videoSprite.getComponent(UITransform);
        spriteTrans.width = spriteTrans.height * width / height;

        this.material.setProperty("mainTexture", this.texture);
    }

    protected onDestroy(): void {
        this.spriteFrame?.destroy();
        this.texture?.destroy();
    }
}
