import * as THREE from 'three';

export class RendererManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.container = document.getElementById('game-container');
        
        // パフォーマンス最優先・モバイル向け設定
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true
        });

        // Retinaディスプレイ対応（最大2倍までにしてGPU負荷を軽減）
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // PBR表現に必須のカラースペース設定
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // シャドウマップの有効化（Phase 6向けの準備）
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(deltaTime) {
        this.renderer.render(this.scene, this.camera);
    }
}