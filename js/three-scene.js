document.addEventListener('DOMContentLoaded', () => {
    const init3DElement = () => {
        const container = document.getElementById('hero-3d-container');
        if (!container) return;

        const scene = new THREE.Scene();
        // Deep fog to create an infinite ocean feel
        scene.fog = new THREE.FogExp2(0x0b0c10, 0.018);

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 8, 25); // Elevated to look at waves

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // --- 1. Abstract Interactive Wavy Landscape ---
        const waveGroup = new THREE.Group();
        scene.add(waveGroup);

        // Make geometry dense for smooth fluid waves
        const planeGeometry = new THREE.PlaneGeometry(120, 120, 100, 100);
        const posAttribute = planeGeometry.attributes.position;
        const initialZ = new Float32Array(posAttribute.count);

        for (let i = 0; i < posAttribute.count; i++) {
            // Give an organic initial noise
            initialZ[i] = (Math.random() - 0.5) * 1.5;
        }

        // We will make it a premium glossy dark floor
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0x0f1115,
            emissive: 0x07080a,
            wireframe: false,
            roughness: 0.2, // Low roughness = glossy
            metalness: 0.9, // High metalness = strong reflection
            side: THREE.FrontSide
        });

        // Add a wireframe overlay that is slightly glowing
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });

        // Add drifting points/particles on the peaks of the waves
        const pointsMaterial = new THREE.PointsMaterial({
            color: 0xff8c00, // orange accent
            size: 0.08,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        const wireMesh = new THREE.Mesh(planeGeometry, wireMaterial);
        const pointsMesh = new THREE.Points(planeGeometry, pointsMaterial);

        // Push the overlays very slightly up to avoid z-fighting
        wireMesh.position.z = 0.02;
        pointsMesh.position.z = 0.04;

        const surfaceGroup = new THREE.Group();
        surfaceGroup.add(planeMesh);
        surfaceGroup.add(wireMesh);
        surfaceGroup.add(pointsMesh);

        surfaceGroup.rotation.x = -Math.PI / 2;
        waveGroup.add(surfaceGroup);

        // Floating ambient particles/dust in the air
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 400;
        const dustPos = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount * 3; i++) {
            dustPos[i] = (Math.random() - 0.5) * 100;
        }
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.12, color: 0x5d7a67, transparent: true, opacity: 0.4
        });
        const dustMesh = new THREE.Points(dustGeometry, dustMaterial);
        scene.add(dustMesh);

        // --- 2. Lighting ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));

        // Main highlight skimming the waves
        const p1 = new THREE.PointLight(0xff8c00, 2.5, 100);
        p1.position.set(20, 10, 10);
        scene.add(p1);

        // Deep moss shadow fill
        const p2 = new THREE.PointLight(0x5d7a67, 4, 150);
        p2.position.set(-20, 15, -10);
        scene.add(p2);

        // Dynamic mouse spotlight
        const cursorLight = new THREE.PointLight(0xffffff, 2, 60);
        scene.add(cursorLight);

        // --- 3. Animation & Layout ---
        waveGroup.position.y = -4; // Sink it down

        window.addEventListener("load", () => {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.clearMatchMedia();

                // Fly the camera intensely over the waves as user scrolls (Dive effect)
                gsap.to(camera.position, {
                    y: 1.5, // dive low to the surface
                    z: -12, // fly forward deeply through the fog
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: "body",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 2
                    }
                });

                // Background container blur and opacity animation (Faded/Blurred at top, Clear at bottom)
                gsap.fromTo(container, 
                    { 
                        opacity: 0.3,
                        filter: "blur(20px)" 
                    },
                    {
                        opacity: 1,
                        filter: "blur(0px)",
                        ease: "none",
                        scrollTrigger: {
                            trigger: "body",
                            start: "top top",
                            end: "bottom bottom",
                            scrub: true
                        }
                    }
                );

                // Tilt the whole landscape slightly based on scroll
                gsap.to(waveGroup.rotation, {
                    x: Math.PI / 18,
                    ease: "none",
                    scrollTrigger: {
                        trigger: "body",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 2
                    }
                });
            }
        });

        // --- 4. Constant Render Loop & Interaction ---
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let targetX = 0, targetY = 0;
        let time = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.003;

            // Animate waves constantly (complex Perlin-like noise math)
            for (let i = 0; i < posAttribute.count; i++) {
                const x = planeGeometry.attributes.position.getX(i);
                const y = planeGeometry.attributes.position.getY(i);

                // Overlay multiple sine waves for more chaotic, deep ocean feel
                const wave1 = Math.sin(x * 0.1 + time) * Math.cos(y * 0.1 + time) * 2;
                const wave2 = Math.sin(x * 0.15 - time * 1.5) * 1.5;
                const wave3 = Math.cos(y * 0.05 + time * 0.8) * 1.5;

                const z = wave1 + wave2 + wave3 + initialZ[i];
                posAttribute.setZ(i, z);
            }
            posAttribute.needsUpdate = true;

            // Re-calc normals so physical lighting reflects dynamically off the waving geography
            planeGeometry.computeVertexNormals();

            // Dust rotation
            dustMesh.rotation.y += 0.0005;
            dustMesh.rotation.x += 0.0002;

            // Smooth mouse physics mapped to the 3D space loosely
            const screenRatioX = (mouseX / window.innerWidth) * 2 - 1;
            const screenRatioY = -(mouseY / window.innerHeight) * 2 + 1;

            // Tie interactive light to mouse position floating over the plane
            cursorLight.position.x += 0.05 * (screenRatioX * 30 - cursorLight.position.x);
            cursorLight.position.y += 0.05 * (5 + (screenRatioY * 10) - cursorLight.position.y);
            cursorLight.position.z = camera.position.z - 10;

            // Subtle camera sway with mouse
            camera.rotation.y = -screenRatioX * 0.05;
            camera.rotation.x = screenRatioY * 0.05;

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });
    };
    init3DElement();
});
