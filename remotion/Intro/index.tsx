import { AbsoluteFill, Sequence, staticFile, interpolate } from 'remotion';
import { Audio } from '@remotion/media';
import { Background } from './Background';
import { Title } from './Title';
import { TerminalWindow } from './TerminalWindow';
import { VideoReveal } from './VideoReveal';

interface IntroVideoProps {
    title: string;
    subtitle: string;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ title, subtitle }) => {
    return (
        <AbsoluteFill>
            <Background />

            <Sequence from={0} durationInFrames={45}>
                <Title title={title} subtitle={subtitle} />
            </Sequence>

            <Sequence from={30}>
                <TerminalWindow />
            </Sequence>

            <Sequence from={150}>
                <VideoReveal />
            </Sequence>

            {/* Audio Layers */}
            <Audio
                src={staticFile('remotion/typing.mp3')}
                trimAfter={120} // Stop when typing ends (4 seconds)
                volume={0.4}
            />

            <Sequence from={150}>
                <Audio src={staticFile('remotion/render-done.mp3')} volume={0.8} />
            </Sequence>

            <Sequence from={0} durationInFrames={300}>
                <Audio
                    src={staticFile('remotion/cinematic-bgm.mp3')}
                    volume={(f) => interpolate(f, [0, 60, 240, 300], [0, 0.3, 0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                />
            </Sequence>
        </AbsoluteFill>
    );
};
