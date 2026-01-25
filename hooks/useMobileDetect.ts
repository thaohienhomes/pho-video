'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useMobileDetect() {
    const [isMobile, setIsMobile] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const checkDevice = () => {
            const mobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsMobile(mobile);
            setIsDesktop(!mobile);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);

        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return { isMobile, isDesktop, isClient };
}
