varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
    // 法線（面の向き）をカメラからの視点（ビュー座標系）に変換
    vNormal = normalize(normalMatrix * normal);
    
    // 頂点のビュー座標系での位置を計算
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // カメラから頂点へのベクトル（ビューベクトル）を取得
    vViewDir = normalize(-mvPosition.xyz);
    
    // 最終的な画面上の位置
    gl_Position = projectionMatrix * mvPosition;
}
