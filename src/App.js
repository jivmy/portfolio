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

    const getScrollThreshold = () => {
      // 50% of viewport height (50vh)
      return window.innerHeight * 0.5;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const scrollThreshold = getScrollThreshold();
        const progress = Math.min(scrollY / scrollThreshold, 1);
        
        // Text animation with easing
        if (bioTextRef.current) {
          // Easing function for momentum (ease-out cubic)
          const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
          const easedProgress = easeOutCubic(progress);
          
          // Scale from 1 to near 0 (0.1)
          const scale = 1 - easedProgress * 0.9;
          
          // Translate up with momentum
          const translateY = -easedProgress * window.innerHeight;
          
          // Opacity from 1 to 0 (at 50% scroll = 50% opacity)
          const opacity = 1 - progress;
          
          bioTextRef.current.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
          bioTextRef.current.style.opacity = opacity;
        }
        
        ticking = false;
      });
    };

    handleScroll();
    
    // Scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    // Touch events for mobile
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = () => {
      handleScroll();
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Resize handler
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleScroll);
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

