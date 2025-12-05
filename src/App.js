import { useEffect, useRef } from 'react';

function App() {
  const embedRef = useRef(null);
  const bioTextRef = useRef(null);

  useEffect(() => {
    if (window.UnicornStudio) {
      const init = () => {
        if (embedRef.current && window.UnicornStudio?.init) {
          window.UnicornStudio.init();
        }
      };
      setTimeout(init, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.36/dist/unicornStudio.umd.js';
    script.onload = () => {
      setTimeout(() => {
        if (embedRef.current && window.UnicornStudio?.init) {
          window.UnicornStudio.init();
        }
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    let ticking = false;
    let viewportHeight = window.innerHeight;

    const getScrollThreshold = () => {
      // Use the most reliable viewport height for mobile
      return Math.max(window.innerHeight, document.documentElement.clientHeight) * 0.5;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        // Get scroll position with multiple fallbacks for mobile
        const scrollY = window.pageYOffset || 
                       window.scrollY || 
                       document.documentElement.scrollTop || 
                       document.body.scrollTop || 
                       0;
        
        // Update viewport height on scroll (for mobile address bar changes)
        viewportHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
        const scrollThreshold = getScrollThreshold();
        const progress = Math.min(scrollY / scrollThreshold, 1);
        
        // Text animation with heavy spring curve for weight and momentum
        if (bioTextRef.current) {
          // Heavy spring easing - simulates a heavy object with damping
          // High damping (0.8), low frequency (0.3) for heavy, weighted feel
          const heavySpring = (t) => {
            const damping = 0.8; // High damping = heavy resistance
            const frequency = 0.3; // Low frequency = slower, heavier movement
            const omega = frequency * 2 * Math.PI;
            const zeta = damping;
            
            if (zeta < 1) {
              // Underdamped spring
              const alpha = omega * zeta;
              const beta = omega * Math.sqrt(1 - zeta * zeta);
              return 1 - Math.exp(-alpha * t) * (Math.cos(beta * t) + (alpha / beta) * Math.sin(beta * t));
            } else {
              // Overdamped (heavy) - no oscillation, just heavy resistance
              const alpha1 = omega * (zeta - Math.sqrt(zeta * zeta - 1));
              const alpha2 = omega * (zeta + Math.sqrt(zeta * zeta - 1));
              const c1 = alpha2 / (alpha2 - alpha1);
              const c2 = -alpha1 / (alpha2 - alpha1);
              return 1 - (c1 * Math.exp(-alpha1 * t) + c2 * Math.exp(-alpha2 * t));
            }
          };
          
          // Apply heavy spring with additional weight factor
          const springProgress = heavySpring(progress);
          const easedProgress = springProgress;
          
          // Scale from 1 to near 0 (0.1) with heavy spring feel
          const scale = 1 - easedProgress * 0.9;
          
          // Translate up with heavy spring momentum
          const translateY = -easedProgress * viewportHeight;
          
          // Opacity from 1 to 0 (at 50% scroll = 50% opacity)
          const opacity = 1 - progress;
          
          bioTextRef.current.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
          bioTextRef.current.style.opacity = opacity;
        }
        
        ticking = false;
      });
    };

    // Initial call
    handleScroll();
    
    // Scroll events - use capture phase for better mobile support
    const scrollOptions = { passive: true, capture: false };
    window.addEventListener('scroll', handleScroll, scrollOptions);
    document.addEventListener('scroll', handleScroll, scrollOptions);
    
    // Resize handler - update viewport height
    const handleResize = () => {
      viewportHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
      handleScroll();
    };
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Orientation change for mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        viewportHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
        handleScroll();
      }, 100);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div className="container">
      <div 
        ref={embedRef}
        data-us-project="lHYBB7eHby32vZtR9jsO"
        data-us-production="true"
        className="unicorn-embed"
      />
      
      <p ref={bioTextRef} className="bio-text">
        I am a design lead working on consumer Copilot at <a href="https://microsoft.ai/news/towards-humanist-superintelligence/" target="_blank" rel="noopener noreferrer" className="link">Microsoft AI</a>. Before, I was at Figma directing its inaugural <a href="https://www.firstround.com/ai/figma" target="_blank" rel="noopener noreferrer" className="link">AI model training</a> team, and before that I spent years <a href="https://www.youtube.com/watch?v=PG3tQYlZ6JQ" target="_blank" rel="noopener noreferrer" className="link">prototyping the metaverse</a> at Spatial.
      </p>
    </div>
  );
}

export default App;

