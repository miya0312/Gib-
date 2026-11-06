import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);
        
        this.mixer = null;
        this.speed = 5.0; // 移動速度
        this.turnSpeed = 10.0; // 旋回速度

        this.initModel();
    }

    async initModel() {
        const loader = new GLTFLoader();
        try {
            // assets/models/player.glb がある場合は読み込む
            const gltf = await loader.loadAsync('assets/models/player.glb');
            const model = gltf.scene;
            
            // 影のキャスト設定
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.mesh.add(model);
            
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(model);
                // 後に待機・走行アニメーションを管理する処理をここに追加
            }
        } catch (error) {
            console.warn("player.glbが見つかりません。テスト用のダミーキャラクターを生成します。");
            this.createDummyCharacter();
        }
    }

    createDummyCharacter() {
        // ヒト型に近いカプセル形状のダミー
        const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 16);
        geometry.translate(0, 1.0, 0); // 足元を原点に合わせる
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff4444, 
            roughness: 0.7, 
            metalness: 0.1 
        });
        
        const capsule = new THREE.Mesh(geometry, material);
        capsule.castShadow = true;
        capsule.receiveShadow = true;
        
        // 向きが視覚的にわかるように「鼻」をつける
        const noseGeo = new THREE.BoxGeometry(0.2, 0.2, 0.4);
        noseGeo.translate(0, 1.5, 0.5);
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x4444ff });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        capsule.add(nose);

        this.mesh.add(capsule);
    }

    update(deltaTime, controls, camera) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        const moveX = controls.moveVector.x;
        const moveY = controls.moveVector.y; // 前後移動（スティックの上 = 負, 下 = 正）

        if (moveX !== 0 || moveY !== 0) {
            // カメラの向きを取得し、Y軸のみの回転に制限する
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            // カメラの右方向ベクトルを計算
            const cameraRight = new THREE.Vector3();
            cameraRight.crossVectors(camera.up, cameraDirection).normalize();

            // 入力に基づいた移動ベクトルを計算
            const moveDirection = new THREE.Vector3();
            moveDirection.addScaledVector(cameraRight, moveX);
            moveDirection.addScaledVector(cameraDirection, -moveY);
            moveDirection.normalize();

            // 移動の適用
            this.mesh.position.addScaledVector(moveDirection, this.speed * deltaTime);

            // キャラクターの向きを滑らかに変更
            const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
            let currentRotation = this.mesh.rotation.y;
            
            // 角度の補間計算（最短距離で回転させる）
            const diff = targetRotation - currentRotation;
            const shortestAngle = Math.atan2(Math.sin(diff), Math.cos(diff));
            this.mesh.rotation.y += shortestAngle * this.turnSpeed * deltaTime;
        }
    }
}
