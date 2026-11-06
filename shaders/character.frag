uniform vec3 uBaseColor;
uniform vec3 uShadowColor;
uniform vec3 uLightDirection;
uniform vec3 uRimColor;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDirection);

    // 光の当たり具合（内積）
    float nDotL = dot(normal, lightDir);
    
    // セルルック（アニメ調）の影。iPadでのジャギーを防ぐためsmoothstepで僅かに境界をぼかす
    float toonIntensity = smoothstep(-0.01, 0.05, nDotL);
    vec3 color = mix(uShadowColor, uBaseColor, toonIntensity);

    // 鳴潮風のリムライト（逆光時にエッジが光る表現）
    float rimDot = 1.0 - max(dot(vViewDir, normal), 0.0);
    float rimIntensity = smoothstep(0.65, 0.75, rimDot) * toonIntensity;
    vec3 rim = uRimColor * rimIntensity;

    gl_FragColor = vec4(color + rim, 1.0);
}
