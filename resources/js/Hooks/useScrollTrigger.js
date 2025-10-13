import { useState, useEffect } from 'react';

export default function useScrollTrigger(threshold = 50) {
    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > threshold;
            if (scrolled !== trigger) {
                setTrigger(scrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [threshold, trigger]);

    return trigger;
}
