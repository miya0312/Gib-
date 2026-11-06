export class ControlsManager {
    constructor() {
        this.moveVector = { x: 0, y: 0 };
        this.joystickZone = document.getElementById('joystick-zone');
        this.joystickBase = document.getElementById('joystick-base');
        this.joystickStick = document.getElementById('joystick-stick');
        
        this.touchId = null;
        this.basePosition = { x: 0, y: 0 };
        this.maxRadius = 60; // ジョイスティックの最大移動範囲

        this.initEvents();
    }

    initEvents() {
        this.joystickZone.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.joystickZone.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.joystickZone.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.joystickZone.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (this.touchId !== null) return;

        const touch = e.changedTouches[0];
        this.touchId = touch.identifier;

        const rect = this.joystickZone.getBoundingClientRect();
        this.basePosition.x = rect.left + rect.width / 2;
        this.basePosition.y = rect.top + rect.height / 2;

        this.joystickBase.style.display = 'block';
        this.updateStickPosition(touch.clientX, touch.clientY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.touchId === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.touchId) {
                this.updateStickPosition(touch.clientX, touch.clientY);
                break;
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.touchId) {
                this.touchId = null;
                this.joystickBase.style.display = 'none';
                this.joystickStick.style.transform = `translate(-50%, -50%)`;
                this.moveVector = { x: 0, y: 0 };
                break;
            }
        }
    }

    updateStickPosition(clientX, clientY) {
        let deltaX = clientX - this.basePosition.x;
        let deltaY = clientY - this.basePosition.y;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > this.maxRadius) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * this.maxRadius;
            deltaY = Math.sin(angle) * this.maxRadius;
        }

        this.joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

        // 正規化された移動ベクトル (-1.0 ～ 1.0)
        this.moveVector.x = deltaX / this.maxRadius;
        this.moveVector.y = deltaY / this.maxRadius;
    }
}