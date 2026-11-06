import * as THREE from 'three';
import { RendererManager } from './renderer.js';
import { CameraManager } from './camera.js';
import { ControlsManager } from './controls.js';
import { Player } from './player.js';

export class Game {
    constructor() {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // 追って天球（Skybox）に差し替えます
        
        this.cameraManager = new CameraManager();
        this.rendererManager = new RendererManager(this.scene, this.cameraManager.camera);
        this.controlsManager = new ControlsManager();
        
        this.player = null;
        this.isRunning = false;
    }

    async init() {
        this.setupEnvironment();
        this.player = new Player(this.scene);
        
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    setupEnvironment() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 平行光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // 仮の地面
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({ 
            color: 0x336633,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // グリッドを広く
        const gridHelper = new THREE.GridHelper(100, 100);
        this.scene.add(gridHelper);
    }

    start() {
        this.isRunning = true;
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'none';
        
        this.rendererManager.renderer.setAnimationLoop(this.update.bind(this));
    }

    update() {
        if (!this.isRunning) return;
        
        const deltaTime = this.clock.getDelta();
        
        // プレイヤーの更新
        if (this.player) {
            this.player.update(deltaTime, this.controlsManager, this.cameraManager.camera);
            // カメラの追従
            this.cameraManager.update(this.player.mesh);
        }

        this.rendererManager.render(deltaTime);
    }

    onWindowResize() {
        this.cameraManager.resize();
        this.rendererManager.resize();
    }
}
