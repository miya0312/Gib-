import * as THREE from 'three';

export class CameraManager {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // カメラの追従ターゲットからの相対オフセット（鳴潮のような肩越しの距離感）
        this.offset = new THREE.Vector3(0, 2.5, 5.0);
        this.camera.position.copy(this.offset);
        this.lookAtOffset = new THREE.Vector3(0, 1.0, 0); // キャラクターの胸元あたりを見る
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    update(playerTarget) {
        // ターゲット（プレイヤー）の位置に対してカメラを配置
        const targetPosition = playerTarget.position.clone();
        
        // 理想的なカメラ位置
        const idealPosition = targetPosition.clone().add(this.offset);
        
        // なめらかなカメラ追従（Lerp）
        this.camera.position.lerp(idealPosition, 0.1);
        
        // 注視点の更新
        const lookAtPosition = targetPosition.clone().add(this.lookAtOffset);
        this.camera.lookAt(lookAtPosition);
    }
}
