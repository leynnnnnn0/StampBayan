import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface Prize {
    name: string;
    probability: number;
    color: string;
    image_preview: string | null;
    image_path: string | null;
}

export default function WheelPreview({ prizes }: { prizes: Prize[] }) {
    const host = useRef<HTMLDivElement>(null);
    const [unavailable, setUnavailable] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [celebrating, setCelebrating] = useState(false);
    const spin = useRef<(() => void) | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const sound = useRef(true);
    const muteAudio = useRef<(() => void) | null>(null);
    const valid =
        prizes.every((p) => Number(p.probability) > 0) &&
        Math.abs(
            prizes.reduce((sum, p) => sum + Number(p.probability), 0) - 100,
        ) < 0.001;

    useEffect(() => {
        if (!host.current) return;
        const container = host.current;
        let audio: AudioContext | null = null;
        let volume: GainNode | null = null;
        const tone = (
            frequency: number,
            duration: number,
            delay = 0,
            level = 0.12,
        ) => {
            if (
                !sound.current ||
                !audio ||
                audio.state !== 'running' ||
                !volume
            )
                return;
            const oscillator = audio.createOscillator();
            const envelope = audio.createGain();
            const start = audio.currentTime + delay;
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(frequency, start);
            envelope.gain.setValueAtTime(0, start);
            envelope.gain.linearRampToValueAtTime(level, start + 0.003);
            envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
            oscillator.connect(envelope);
            envelope.connect(volume);
            oscillator.start(start);
            oscillator.stop(start + duration + 0.01);
            oscillator.onended = () => {
                oscillator.disconnect();
                envelope.disconnect();
            };
        };
        muteAudio.current = () => {
            if (audio && volume)
                volume.gain.setValueAtTime(
                    sound.current ? 1 : 0,
                    audio.currentTime,
                );
        };
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });
        } catch {
            const timer = window.setTimeout(() => setUnavailable(true), 0);
            return () => window.clearTimeout(timer);
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);
        renderer.domElement.setAttribute(
            'aria-label',
            'Interactive 3D prize wheel. Drag to rotate the view.',
        );
        const scene = new THREE.Scene();
        const wheel = new THREE.Group();
        scene.add(wheel);
        let wheelPart = false;
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
        camera.position.set(1.7, 0.8, 6.7);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, -0.25, 0);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minPolarAngle = Math.PI / 3;
        controls.maxPolarAngle = Math.PI * 0.65;
        controls.minAzimuthAngle = -Math.PI / 2;
        controls.maxAzimuthAngle = Math.PI / 2;
        scene.add(new THREE.HemisphereLight(0xffffff, 0x6b5540, 2.5));
        const light = new THREE.DirectionalLight(0xffffff, 4);
        light.position.set(-3, 6, 5);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        scene.add(light);
        const fill = new THREE.DirectionalLight(0xffd38a, 2);
        fill.position.set(4, 1, -2);
        scene.add(fill);
        const gold = new THREE.MeshStandardMaterial({
            color: '#eeb52e',
            metalness: 0.65,
            roughness: 0.3,
        });
        const dark = new THREE.MeshStandardMaterial({
            color: '#202630',
            metalness: 0.55,
            roughness: 0.35,
        });
        const add = (
            geometry: THREE.BufferGeometry,
            material: THREE.Material,
            x = 0,
            y = 0,
            z = 0,
        ) => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            (wheelPart ? wheel : scene).add(mesh);
            return mesh;
        };
        const disk = (
            radius: number,
            depth: number,
            material: THREE.Material,
            z: number,
        ) => {
            const mesh = add(
                new THREE.CylinderGeometry(radius, radius, depth, 96),
                material,
                0,
                0,
                z,
            );
            mesh.rotation.x = Math.PI / 2;
            return mesh;
        };
        add(new THREE.BoxGeometry(0.22, 1.6, 0.25), dark, 0, -1.5, -0.22);
        add(new THREE.BoxGeometry(1.7, 0.15, 0.9), dark, 0, -2.25, -0.1);
        wheelPart = true;
        disk(1.75, 0.24, gold, 0);
        disk(1.53, 0.04, dark, 0.14);
        add(new THREE.TorusGeometry(1.69, 0.045, 12, 96), gold, 0, 0, 0.14);
        for (let i = 0; i < 36; i++) {
            const angle = (i / 36) * Math.PI * 2;
            const peg = add(
                new THREE.CylinderGeometry(0.025, 0.035, 0.14, 12),
                gold,
                Math.sin(angle) * 1.63,
                Math.cos(angle) * 1.63,
                0.22,
            );
            peg.rotation.x = Math.PI / 2;
        }
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1536;
        const ctx = canvas.getContext('2d')!;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const images = new Map<number, HTMLImageElement>();
        let disposed = false;
        const draw = () => {
            const c = 768;
            ctx.clearRect(0, 0, 1536, 1536);
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(0, 0, 1536, 1536);
            let start = -Math.PI / 2;
            prizes.forEach((prize, index) => {
                const sweep = (Math.PI * 2) / prizes.length;
                const end = start + sweep;
                ctx.beginPath();
                ctx.moveTo(c, c);
                ctx.arc(c, c, c, start, end);
                ctx.closePath();
                ctx.fillStyle = prize.color;
                ctx.fill();
                ctx.strokeStyle = '#222222';
                ctx.lineWidth = 3;
                ctx.stroke();
                if (sweep > 0.1) {
                    ctx.save();
                    ctx.clip();
                    ctx.translate(c, c);
                    ctx.rotate(start + sweep / 2);
                    ctx.fillStyle = 'rgba(0,0,0,.65)';
                    const img = images.get(index);
                    const labelY = img ? 0 : 0;
                    ctx.fillRect(245, labelY - 42, 440, 84);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 48px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const name = prize.name || 'Prize';
                    ctx.fillText(
                        name.length > 22 ? name.slice(0, 21) + '…' : name,
                        465,
                        labelY,
                        415,
                    );
                    if (img) {
                        // Fit an aspect-preserving rectangle inside the wedge,
                        // outside the hub and inside the rim.
                        let low = 0;
                        let high =
                            1000 /
                            Math.max(img.naturalWidth, img.naturalHeight);
                        for (let step = 0; step < 28; step++) {
                            const candidate = (low + high) / 2;
                            const halfW = (img.naturalWidth * candidate) / 2;
                            const halfH = (img.naturalHeight * candidate) / 2;
                            const inner = 465 - halfW;
                            const fits =
                                inner >= 190 &&
                                Math.hypot(465 + halfW, halfH) <= 735 &&
                                (sweep >= Math.PI ||
                                    halfH <= inner * Math.tan(sweep / 2) - 12);
                            if (fits) low = candidate;
                            else high = candidate;
                        }
                        const scale = low;
                        const width = img.naturalWidth * scale;
                        const height = img.naturalHeight * scale;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(
                            465 - width / 2 - 6,
                            -height / 2 - 6,
                            width + 12,
                            height + 12,
                        );
                        ctx.drawImage(
                            img,
                            465 - width / 2,
                            -height / 2,
                            width,
                            height,
                        );
                        ctx.fillStyle = 'rgba(0,0,0,.75)';
                        ctx.fillRect(245, height / 2 - 72, 440, 72);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(name, 465, height / 2 - 36, 415);
                    }
                    ctx.restore();
                }
                start = end;
            });
            texture.needsUpdate = true;
        };
        draw();
        prizes.forEach((prize, index) => {
            const url =
                prize.image_preview ??
                (prize.image_path ? '/' + prize.image_path : null);
            if (!url) return;
            const img = new Image();
            img.onload = () => {
                if (!disposed) {
                    images.set(index, img);
                    draw();
                }
            };
            img.src = url;
        });
        add(
            new THREE.CircleGeometry(1.48, 128),
            new THREE.MeshStandardMaterial({ map: texture, roughness: 0.55 }),
            0,
            0,
            0.17,
        );
        disk(0.34, 0.18, gold, 0.25);
        disk(0.29, 0.07, dark, 0.37);
        add(new THREE.TorusGeometry(0.18, 0.018, 12, 48), gold, 0, 0, 0.415);
        wheelPart = false;
        const pointer = new THREE.Shape();
        pointer.moveTo(-0.16, 1.98);
        pointer.lineTo(0.16, 1.98);
        pointer.lineTo(0.13, 1.72);
        pointer.lineTo(0, 1.5);
        pointer.lineTo(-0.13, 1.72);
        pointer.closePath();
        add(
            new THREE.ExtrudeGeometry(pointer, {
                depth: 0.12,
                bevelEnabled: true,
                bevelSize: 0.025,
                bevelThickness: 0.025,
                bevelSegments: 2,
                steps: 1,
            }),
            dark,
            0,
            0,
            0.32,
        );
        const floor = add(
            new THREE.PlaneGeometry(200, 200),
            new THREE.ShadowMaterial({ opacity: 0.18 }),
            0,
            -2.34,
            0,
        );
        floor.rotation.x = -Math.PI / 2;
        const resize = () => {
            const width = Math.max(1, container.clientWidth);
            renderer.setSize(width, width * 1.2);
            camera.aspect = 1 / 1.2;
            camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();
        let animation: {
            start: number;
            from: number;
            to: number;
            winner: string;
        } | null = null;
        const reset = window.setTimeout(() => {
            setSpinning(false);
            setResult(null);
        }, 0);
        spin.current = () => {
            if (animation || !valid) return;
            if (sound.current) {
                try {
                    if (!audio) {
                        audio = new AudioContext();
                        volume = audio.createGain();
                        volume.connect(audio.destination);
                    }
                    volume!.gain.setValueAtTime(1, audio.currentTime);
                    void audio.resume().catch(() => {});
                } catch {
                    /* Keep the preview usable if audio is unavailable. */
                }
            }
            const roll = Math.random() * 100;
            let cumulative = 0;
            let winner = prizes[prizes.length - 1];
            let winnerIndex = prizes.length - 1;
            for (const [index, prize] of prizes.entries()) {
                cumulative += Number(prize.probability);
                if (roll < cumulative) {
                    winner = prize;
                    winnerIndex = index;
                    break;
                }
            }
            const tau = Math.PI * 2;
            // Odds choose the winner; equal-sized segments determine where it lands.
            // Keep the pointer safely inside the selected segment.
            const target =
                ((winnerIndex + 0.15 + Math.random() * 0.7) / prizes.length) *
                tau;
            const current = ((wheel.rotation.z % tau) + tau) % tau;
            animation = {
                start: performance.now(),
                from: wheel.rotation.z,
                to:
                    wheel.rotation.z +
                    tau * 5 +
                    ((target - current + tau) % tau),
                winner: winner.name || 'Prize',
            };
            setSpinning(true);
            setResult(null);
        };
        renderer.setAnimationLoop(() => {
            if (animation) {
                const progress = Math.min(
                    1,
                    (performance.now() - animation.start) / 4500,
                );
                const previousPeg = Math.floor(
                    wheel.rotation.z / ((Math.PI * 2) / 36),
                );
                wheel.rotation.z =
                    animation.from +
                    (animation.to - animation.from) *
                        (1 - Math.pow(1 - progress, 4));
                if (
                    Math.floor(wheel.rotation.z / ((Math.PI * 2) / 36)) !==
                    previousPeg
                ) {
                    tone(900, 0.025, 0, 0.08);
                }
                if (progress === 1) {
                    [523.25, 659.25, 783.99, 1046.5].forEach((note, index) =>
                        tone(note, 0.3, index * 0.12),
                    );
                    setResult(animation.winner);
                    setCelebrating(true);
                    setSpinning(false);
                    animation = null;
                }
            }
            controls.update();
            renderer.render(scene, camera);
        });
        return () => {
            disposed = true;
            muteAudio.current = null;
            if (audio) void audio.close().catch(() => {});
            window.clearTimeout(reset);
            spin.current = null;
            observer.disconnect();
            controls.dispose();
            renderer.setAnimationLoop(null);
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    const materials = Array.isArray(object.material)
                        ? object.material
                        : [object.material];
                    materials.forEach((material) => material.dispose());
                }
            });
            texture.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, [prizes, valid]);

    return (
        <div>
            <Dialog open={celebrating} onOpenChange={setCelebrating}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto border-amber-300 p-5 text-center sm:max-w-md sm:p-8">
                    <CelebrationConfetti />
                    <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-lg">
                        <Trophy className="h-10 w-10" />
                    </div>
                    <DialogTitle className="relative text-center text-3xl font-black text-amber-500">
                        Congratulations!
                    </DialogTitle>
                    <DialogDescription className="relative text-center">
                        Your test spin landed on
                    </DialogDescription>
                    <p className="relative text-2xl font-bold break-words">
                        {result}
                    </p>
                    <p className="relative text-sm text-muted-foreground">
                        Preview only — no prize is awarded.
                    </p>
                    <Button
                        type="button"
                        className="relative"
                        onClick={() => setCelebrating(false)}
                    >
                        Continue
                    </Button>
                </DialogContent>
            </Dialog>
            <div
                ref={host}
                className="w-full min-w-0 [&_canvas]:block [&_canvas]:max-w-full"
            />
            <div className="mt-3 rounded-xl bg-background p-4 text-foreground shadow-sm">
                {unavailable ? (
                    <p className="text-sm text-foreground">
                        3D preview requires WebGL. Enable browser hardware
                        acceleration to view the wheel.
                    </p>
                ) : (
                    <p className="text-center text-sm text-foreground">
                        Drag to explore the 3D wheel
                    </p>
                )}
                <Button
                    type="button"
                    className="mt-4 w-full bg-amber-400 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-70"
                    disabled={unavailable || spinning || !valid}
                    onClick={() => spin.current?.()}
                >
                    {spinning ? 'Spinning…' : 'Test spin'}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    aria-pressed={soundEnabled}
                    onClick={() => {
                        sound.current = !sound.current;
                        setSoundEnabled(sound.current);
                        muteAudio.current?.();
                    }}
                >
                    {soundEnabled ? 'Sound: On' : 'Sound: Off'}
                </Button>
                <p
                    className="mt-3 text-center text-sm text-foreground"
                    aria-live="polite"
                >
                    {result
                        ? `Test result: ${result}`
                        : !valid
                          ? 'Set winning percentages to total 100% to test.'
                          : 'Preview only — no prize is awarded.'}
                </p>
            </div>
        </div>
    );
}

function CelebrationConfetti() {
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        const animations = Array.from(container.current?.children ?? []).map(
            (piece, index) => {
                const drift = Math.sin(index * 2.4) * 160;
                return piece.animate(
                    [
                        {
                            transform: 'translateY(-40px) rotate(0deg)',
                            opacity: 0,
                        },
                        { opacity: 1, offset: 0.1 },
                        {
                            transform: `translate(${drift}px, 480px) rotate(${360 + index * 31}deg)`,
                            opacity: 0,
                        },
                    ],
                    {
                        duration: 2200 + (index % 7) * 180,
                        delay: (index % 9) * 70,
                        easing: 'cubic-bezier(.15,.6,.5,1)',
                        fill: 'both',
                    },
                );
            },
        );
        return () => animations.forEach((animation) => animation.cancel());
    }, []);
    return (
        <div
            ref={container}
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
        >
            {Array.from({ length: 65 }, (_, index) => (
                <span
                    key={index}
                    className="absolute top-0 h-3 w-2 rounded-sm motion-reduce:hidden"
                    style={{
                        left: `${(index * 37) % 100}%`,
                        backgroundColor: [
                            '#fbbf24',
                            '#fb7185',
                            '#38bdf8',
                            '#a78bfa',
                            '#34d399',
                        ][index % 5],
                    }}
                />
            ))}
        </div>
    );
}
