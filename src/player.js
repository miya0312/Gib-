import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
    constructor(scene, directionalLight, camera) {
        this.scene = scene;
        this.directionalLight = directionalLight; // 影の計算に使うライト
        this.camera = camera;
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);
        
        this.mixer = null;
        this.speed = 5.0;
        this.turnSpeed = 10.0;

        this.characterMaterial = null;

        this.initModel();
    }

    async initModel() {
        // Phase 3: カスタムシェーダーの読み込み
        try {
            const [vertRes, fragRes] = await Promise.all([
                fetch('shaders/character.vert'),
                fetch('shaders/character.frag')
            ]);
            
            if (!vertRes.ok || !fragRes.ok) throw new Error("Shader file not found");
            
            const vertexShader = await vertRes.text();
            const fragmentShader = await fragRes.text();

            this.characterMaterial = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uBaseColor: { value: new THREE.Color(0xe8e8e8) }, // ベースの白
                    uShadowColor: { value: new THREE.Color(0x666677) }, // 影の青みがかったグレー
                    uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                    uRimColor: { value: new THREE.Color(0x88ccff) } // リムライトの水色
                }
            });
        } catch (e) {
            console.warn("シェーダー読み込みエラー。標準マテリアルを使用します:", e);
            this.characterMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        }

        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('assets/models/player.glb');
            const model = gltf.scene;
            // 実際のモデルがある場合はここでマテリアルを置換する処理が入ります
            this.mesh.add(model);
        } catch (error) {
            this.createDummyCharacter();
        }
    }

    createDummyCharacter() {
        // 解像度を上げて滑らかなカプセルに
        const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 16, 32);
        geometry.translate(0, 1.0, 0); 
        
        const capsule = new THREE.Mesh(geometry, this.characterMaterial);
        capsule.castShadow = true;
        capsule.receiveShadow = true;

        // 【高品質化】アウトライン（Inverted Hull法）
        // ポリゴンを少し膨張させ、裏面だけを黒く描画することで輪郭線を作るAAA級ゲームの定番手法
        const outlineMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float outlineThickness;
                void main() {
                    vec3 newPosition = position + normal * outlineThickness;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                void main() {
                    gl_FragColor = vec4(0.15, 0.15, 0.15, 1.0); // 濃いグレーの線
                }
            `,
            side: THREE.BackSide, // 裏面のみ描画
            uniforms: {
                outlineThickness: { value: 0.02 } // 線の太さ
            }
        });
        const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
        capsule.add(outlineMesh);
        
        // 向き確認用の顔パーツ
        const noseGeo = new THREE.BoxGeometry(0.2, 0.2, 0.4);
        noseGeo.translate(0, 1.5, 0.5);
        const noseMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        capsule.add(nose);

        this.mesh.add(capsule);
    }

    update(deltaTime, controls, camera) {
        if (this.mixer) this.mixer.update(deltaTime);

        // シェーダー内の光の向きを、カメラの動きに合わせて更新
        if (this.characterMaterial && this.characterMaterial.uniforms && this.directionalLight) {
            const lightDir = this.directionalLight.position.clone().normalize();
            lightDir.transformDirection(camera.matrixWorldInverse);
            this.characterMaterial.uniforms.uLightDirection.value.copy(lightDir);
        }

        const moveX = controls.moveVector.x;
        const moveY = controls.moveVector.y; 

        if (moveX !== 0 || moveY !== 0) {
            const cameraForward = new THREE.Vector3();
            camera.getWorldDirection(cameraForward);
            cameraForward.y = 0;
            cameraForward.normalize();

            const cameraRight = new THREE.Vector3();
            cameraRight.crossVectors(cameraForward, camera.up).normalize();

            const moveDirection = new THREE.Vector3();
            moveDirection.addScaledVector(cameraRight, moveX);
            moveDirection.addScaledVector(cameraForward, -moveY);
            moveDirection.normalize();

            this.mesh.position.addScaledVector(moveDirection, this.speed * deltaTime);

            const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
            let currentRotation = this.mesh.rotation.y;
            
            const diff = targetRotation - currentRotation;
            const shortestAngle = Math.atan2(Math.sin(diff), Math.cos(diff));
            this.mesh.rotation.y += shortestAngle * this.turnSpeed * deltaTime;
        }
    }
}
