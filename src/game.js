import * as THREE from 'three';
import { RendererManager } from './renderer.js';
import { CameraManager } from './camera.js';

export class Game {
    constructor() {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        
        // 開発初期の仮背景色（空色）
        this.scene.background = new THREE.Color(0x87ceeb);
        
        this.cameraManager = new CameraManager();
        this.rendererManager = new RendererManager(this.scene, this.cameraManager.camera);
        this.isRunning = false;
        this.testMesh = null;
    }

    async init() {
        this.setupBasicEnvironment();
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    setupBasicEnvironment() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 平行光源（太陽光の代用）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // 描画エンジンの動作確認用メッシュ
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff88,
            roughness: 0.4,
            metalness: 0.2
        });
        this.testMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.testMesh);
        
        // 空間認識用のグリッド
        const gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(gridHelper);
    }

    start() {
        this.isRunning = true;
        this.rendererManager.renderer.setAnimationLoop(this.update.bind(this));
    }

    update() {
        if (!this.isRunning) return;
        
        const deltaTime = this.clock.getDelta();
        
        // 動作確認用メッシュの回転
        if (this.testMesh) {
            this.testMesh.rotation.x += 1.0 * deltaTime;
            this.testMesh.rotation.y += 1.2 * deltaTime;
        }

        // レンダリング実行
        this.rendererManager.render(deltaTime);
    }

    onWindowResize() {
        this.cameraManager.resize();
        this.rendererManager.resize();
    }
}
