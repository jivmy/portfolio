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
        
        // Text animation with heavier easing for more weight
        if (bioTextRef.current) {
          // Stronger easing for more weight/momentum (ease-out quint - heavier deceleration)
          const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
          const easedProgress = easeOutQuint(progress);
          
          // Scale from 1 to near 0 (0.1) with heavier feel
          const scale = 1 - easedProgress * 0.9;
          
          // Translate up with more weight - stronger movement
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

