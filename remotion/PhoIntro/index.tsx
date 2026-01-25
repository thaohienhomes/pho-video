import { AbsoluteFill, Sequence, staticFile, interpolate } from 'remotion';
import { Audio } from '@remotion/media';
import { InputScene } from './scenes/InputScene';
import { CookingScene } from './scenes/CookingScene';
import { ExplosionScene } from './scenes/ExplosionScene';
import { OutroScene } from './scenes/OutroScene';

/**
 * PhoIntro - "The Cyberpunk Bowl"
 * Duration: 360 frames (12 seconds @ 30fps)
 *
 * Scene breakdown:
 * - InputScene:     frames 0-60    (0-2s)   - Glitch typing
 * - CookingScene:   frames 60-150  (2-5s)   - Bowl spinning + icons
 * - ExplosionScene: frames 150-240 (5-8s)   - White flash + logo
 * - OutroScene:     frames 240-360 (8-12s)  - Slogan + CTA
 */

export const PhoIntro = () => {
    return (
        <AbsoluteFill className="bg-[#0A0A0A]">
            {/* Scene 1: Input (0-2s) */}
            <Sequence from={0} durationInFrames={60} premountFor={10}>
                <InputScene />
            </Sequence>

            {/* Scene 2: Cooking (2-5s) */}
            <Sequence from={60} durationInFrames={90} premountFor={15}>
                <CookingScene />
            </Sequence>

            {/* Scene 3: Explosion (5-8s) */}
            <Sequence from={150} durationInFrames={90} premountFor={10}>
                <ExplosionScene />
            </Sequence>

            {/* Scene 4: Outro (8-12s) */}
            <Sequence from={240} durationInFrames={120} premountFor={15}>
                <OutroScene />
            </Sequence>

            {/* Background Music - Placeholder */}
            <Sequence from={0} durationInFrames={360}>
                <Audio
                    src={staticFile('audio/cyber-beat.mp3')}
                    volume={(f) =>
                        interpolate(f, [0, 30, 300, 360], [0, 0.6, 0.6, 0], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        })
                    }
                />
            </Sequence>
        </AbsoluteFill>
    );
};
