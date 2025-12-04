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

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
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
        
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
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

