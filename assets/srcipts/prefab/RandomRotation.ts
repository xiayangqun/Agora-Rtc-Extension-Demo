import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RandomRotation')
export class RandomRotation extends Component {

    private _angularVelocity: Vec3 = new Vec3();
    private _timer: number = 0;
    private _changeInterval: number = 0;

    start() {
        this.randomizeVelocity();
        this._changeInterval = 1 + Math.random() * 2;
    }

    update(deltaTime: number) {
        this._timer += deltaTime;
        if (this._timer >= this._changeInterval) {
            this._timer = 0;
            this._changeInterval = 1 + Math.random() * 2;
            this.randomizeVelocity();
        }

        const euler = this.node.eulerAngles;
        this.node.setRotationFromEuler(
            euler.x + this._angularVelocity.x * deltaTime,
            euler.y + this._angularVelocity.y * deltaTime,
            euler.z + this._angularVelocity.z * deltaTime,
        );
    }

    private randomizeVelocity() {
        this._angularVelocity.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
        );
    }
}

