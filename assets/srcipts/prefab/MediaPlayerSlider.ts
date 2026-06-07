import { _decorator, Component, EventTouch, Node, Slider } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MediaPlayerSlider')
export class MediaPlayerSlider extends Slider {
   
    public get canSetProgress(){
        return !(this as any)._dragging;
    }

     protected _onTouchMoved (event?: EventTouch): void {
        if (!(this as any)._dragging || !event) {
            return;
        }

        this._updateProgress(event.touch);
        event.propagationStopped = true;
    }

}

