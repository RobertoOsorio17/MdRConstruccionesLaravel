import { useEffect } from 'react';

const LCPMonitor = ({ onLCP }) => {
    useEffect(() => {
        // Only run in development or when explicitly enabled
        if (process.env.NODE_ENV !== 'development' && !window.enableLCPMonitoring) {
            return;
        }

        let lcpValue = 0;

        // Create a PerformanceObserver to monitor LCP
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry) {
                lcpValue = lastEntry.startTime;
                
                // Log LCP value for debugging
                console.log(`🚀 LCP: ${Math.round(lcpValue)}ms`);
                
                // Call callback if provided
                if (onLCP) {
                    onLCP(lcpValue);
                }
                
                // Color-coded performance feedback
                if (lcpValue <= 2500) {
                    console.log(`✅ LCP is GOOD (${Math.round(lcpValue)}ms ≤ 2500ms)`);
                } else if (lcpValue <= 4000) {
                    console.log(`⚠️ LCP needs improvement (${Math.round(lcpValue)}ms)`);
                } else {
                    console.log(`❌ LCP is POOR (${Math.round(lcpValue)}ms > 4000ms)`);
                }
            }
        });

        // Start observing LCP
        try {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('LCP monitoring not supported in this browser');
        }

        // Cleanup
        return () => {
            observer.disconnect();
        };
    }, [onLCP]);

    return null; // This component doesn't render anything
};

export default LCPMonitor;
