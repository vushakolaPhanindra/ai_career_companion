/*
    3D Avatar Component
    Loads a Ready Player Me GLB model and maps logical visemes (A, E, O, etc.) to MorphTargets.
*/
import React, { useEffect, useRef, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Public URL for a professional female avatar from Ready Player Me (Demo assets)
const MODEL_URL = "https://models.readyplayer.me/63e569fb6f759e4d1df880a2.glb?morphTargets=ARKit,Oculus%20Visemes";

export default function Avatar3D({ currentViseme, speaking, ...props }) {
    const group = useRef();
    const { scene } = useGLTF(MODEL_URL);

    // Clone scene to avoid sticking issues if reused (though likely singleton here)
    const clone = useMemo(() => scene.clone(), [scene]);

    // Ref to the skinned mesh head (where morph targets live)
    const headMeshRef = useRef(null);

    // Initial Setup: Find the head mesh with morph targets
    useEffect(() => {
        clone.traverse((child) => {
            if (child.isMesh && child.morphTargetDictionary) {
                // Usually "Wolf3D_Head" or "Wolf3D_Avatar" contains the face blendshapes
                if (child.name.includes("Head") || child.name.includes("Avatar")) {
                    headMeshRef.current = child;
                }
            }
        });
    }, [clone]);

    /*
        MAPPING: Logical Viseme (Text/Phoneme) -> Model Morph Target
        RPM provides 'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U', etc.
        If using Oculus/ARKit, names might be 'viseme_aa', 'mouthOpen', etc.
    */
    const morphTargets = useMemo(() => ({
        A: "viseme_aa",
        E: "viseme_E",
        I: "viseme_I",
        O: "viseme_O",
        U: "viseme_U",
        M: "viseme_PP", // Bilabial sounds like M, B, P
        F: "viseme_FF",
        R: "viseme_RR",
        S: "viseme_SS",
        sil: "viseme_sil" // Silence
    }), []);

    // Animation Loop: Smoothly interpolate morph targets
    useFrame((state, delta) => {
        if (!headMeshRef.current) return;

        const mesh = headMeshRef.current;
        const dictionary = mesh.morphTargetDictionary;
        const influences = mesh.morphTargetInfluences;

        // 1. Reset all visemes to 0 slowly (decay)
        Object.values(morphTargets).forEach((targetName) => {
            const idx = dictionary[targetName];
            if (idx !== undefined) {
                // Damp towards 0 (decay speed 10)
                influences[idx] = THREE.MathUtils.lerp(influences[idx], 0, 10 * delta);
            }
        });

        // 2. Identify target viseme based on prop
        let targetMorphName = morphTargets.sil;

        if (speaking) {
            if (currentViseme && morphTargets[currentViseme]) {
                targetMorphName = morphTargets[currentViseme];
            } else {
                // Auto-animate if speaking but no viseme data
                const t = state.clock.getElapsedTime();

                // Syllable rhythm (~5Hz) modulated by slower wave
                const rhythm = Math.sin(t * 30) + Math.sin(t * 10) * 0.3;

                // If rhythm is "active", pick a vowel
                if (rhythm > 0.1) {
                    // Vary vowels over time
                    const vowelSelector = (Math.sin(t * 8) + 1) / 2;
                    if (vowelSelector < 0.2) targetMorphName = morphTargets.A;
                    else if (vowelSelector < 0.4) targetMorphName = morphTargets.E;
                    else if (vowelSelector < 0.6) targetMorphName = morphTargets.I;
                    else if (vowelSelector < 0.8) targetMorphName = morphTargets.O;
                    else targetMorphName = morphTargets.U;
                } else {
                    targetMorphName = morphTargets.sil;
                }
            }
        }

        // 3. Activate target viseme
        const targetIdx = dictionary[targetMorphName];
        if (targetIdx !== undefined) {
            // Lerp towards 1 fast
            influences[targetIdx] = THREE.MathUtils.lerp(influences[targetIdx], 1, 15 * delta);
        }

        // 4. Subtle Head Movement (Ref: group.current.rotation)
        // Use performance.now() to avoid THREE.Clock deprecation warnings if relevant
        const t = state.clock.getElapsedTime();

        group.current.rotation.x = Math.sin(t * 0.5) * 0.05 + 0.1; // Gentle nod + look slightly up/down
        group.current.rotation.y = Math.sin(t * 0.2) * 0.05; // Gentle sway

        // 5. Blinking (morphTarget: 'eyeBlinkLeft', 'eyeBlinkRight')
        // Simple procedural blink
        const blinkIdxL = dictionary["eyeBlinkLeft"];
        const blinkIdxR = dictionary["eyeBlinkRight"];
        if (blinkIdxL !== undefined && blinkIdxR !== undefined) {
            // Blink every ~3 seconds
            const blinkValue = Math.abs(Math.sin(t * 0.8)) > 0.98 ? 1 : 0;
            influences[blinkIdxL] = THREE.MathUtils.lerp(influences[blinkIdxL], blinkValue, 20 * delta);
            influences[blinkIdxR] = THREE.MathUtils.lerp(influences[blinkIdxR], blinkValue, 20 * delta);
        }

    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={clone} />
        </group>
    );
}
