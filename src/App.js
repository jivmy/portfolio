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
    const scrollThreshold = 1800;
    let ticking = false;

    const updateScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const progress = Math.min(scrollY / scrollThreshold, 1);
      
      // Embed positioning
      if (embedRef.current) {
        if (scrollY < scrollThreshold) {
          embedRef.current.style.cssText = 'position: fixed; top: 0; left: 50%; transform: translateX(-50%);';
        } else {
          embedRef.current.style.cssText = `position: absolute; top: ${scrollThreshold}px; left: 50%; transform: translateX(-50%);`;
        }
      }
      
      // Text animation
      if (bioTextRef.current) {
        const scale = 1 - progress * 0.5;
        const translateY = -progress * window.innerHeight;
        const opacity = 1 - progress;
        bioTextRef.current.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
        bioTextRef.current.style.opacity = opacity;
      }
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateScroll();
        ticking = false;
      });
    };

    // Also handle touchmove for Instagram/in-app browsers
    const handleTouch = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateScroll();
        ticking = false;
      });
    };

    updateScroll();
    
    // Multiple event listeners for better compatibility
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('resize', updateScroll);
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

