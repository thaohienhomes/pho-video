import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Explosion } from '../Explosion';
import { FilmGrain } from '../effects/FilmGrain';

export const ExplosionScene: React.FC = () => {
    return (
        <AbsoluteFill>
            <Explosion logoText="Phở Video" />
            <FilmGrain intensity={0.05} showVignette={true} vignetteIntensity={0.4} />
        </AbsoluteFill>
    );
};
