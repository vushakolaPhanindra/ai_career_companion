/*
    Component to manage 3D Experience including Lighting, Camera, and the Avatar
*/
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import Avatar3D from "./Avatar3D";
import { Suspense } from "react";

export default function Experience({ currentViseme, speaking }) {
    return (
        <Canvas shadows camera={{ position: [0, 0, 3], fov: 30 }}>
            {/* Soft Studio Lighting */}
            <ambientLight intensity={1.2} />
            <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} shadow-bias={-0.0001} intensity={2} color="#fff" />
            <directionalLight position={[-5, 5, 5]} intensity={1.5} color="#fff" />
            <pointLight position={[0, 0, 2]} intensity={0.5} color="#fff" />

            {/* Environment Reflection */}
            <Environment preset="city" />
            <color attach="background" args={['#0f172a']} />

            <Suspense fallback={null}>
                {/* 3D Avatar Model 
                    User Adjustment: 
                    Position: [0, -0.9, 0] -> Shifts model up so feet are lower (-0.9). Head is higher.
                    Wait, if I want to see face, and camera looks at 0...
                    Head needs to be at 0.
                    RPM Head is ~1.6m from origin.
                    So Position should be [0, -1.6, 0].
                    Let's try standardizing:
                */}
                <Avatar3D position={[0, -1.6, 0]} scale={2.4} currentViseme={currentViseme} speaking={speaking} />
            </Suspense>

            {/* Shadow Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <shadowMaterial opacity={0.2} color="#000" />
            </mesh>

            <OrbitControls
                target={[0, 0.4, 0]}
                enableZoom={false}
                enablePan={false}
            />
        </Canvas>
    );
}
