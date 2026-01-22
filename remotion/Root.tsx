import { Composition } from "remotion";
import { IntroVideo, IntroVideoProps } from "./Intro";
import "./style.css";

export const RemotionRoot = () => {
    return (
        <>
            <Composition<IntroVideoProps, any>
                id="Intro"
                component={IntroVideo}
                durationInFrames={300} // 10 seconds at 30 fps
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    title: "Phở Video",
                    subtitle: "AI Video Generation Platform",
                }}
            />
        </>
    );
};
