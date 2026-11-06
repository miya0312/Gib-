import * as THREE from 'three';

export class CameraManager {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            60, // FOV: 鳴潮のようなアクションRPGに適した視野角
            window.innerWidth / window.innerHeight,
            0.1, // Near
            1000 // Far (Phase 9のLOD実装時に調整)
        );
        
        // 初期のカメラ位置
        this.camera.position.set(0, 3, 6);
        this.camera.lookAt(0, 0, 0);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
