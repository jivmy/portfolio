import { useEffect, useRef } from 'react';

function App() {
  const embedRef = useRef(null);
  const bioTextRef = useRef(null);
  const glassPanelsContainerRef = useRef(null);
  const glassPanel1Ref = useRef(null);
  const glassPanel2Ref = useRef(null);
  const glassPanel3Ref = useRef(null);
  const glassPanel4Ref = useRef(null);
  
  const anchorMode = 'closest';

  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    let lastHeight = window.innerHeight;
    const checkHeight = () => {
      if (window.innerHeight !== lastHeight) {
        setViewportHeight();
        lastHeight = window.innerHeight;
      }
    };
    const heightCheckInterval = setInterval(checkHeight, 100);
    
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      clearInterval(heightCheckInterval);
    };
  }, []);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile && embedRef.current) {
      const updateHeight = () => {
        if (embedRef.current) {
          embedRef.current.style.setProperty('height', '135vh', 'important');
        }
      };
      
      updateHeight();
      const heightInterval = setInterval(updateHeight, 100);
      
      return () => clearInterval(heightInterval);
    }
  }, []);

  useEffect(() => {
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js';
      script.onload = () => {
        if (!window.UnicornStudio.isInitialized) {
          UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(script);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    let viewportHeight = window.innerHeight;

    const getScrollThreshold = () => {
      return Math.max(window.innerHeight, document.documentElement.clientHeight) * 1.5;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || 
                       window.scrollY || 
                       document.documentElement.scrollTop || 
                       document.body.scrollTop || 
                       0;
        
        viewportHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
        const scrollThreshold = getScrollThreshold();
        const progress = Math.min(scrollY / scrollThreshold, 1);
        
        if (bioTextRef.current) {
          const heavySpring = (t) => {
            const damping = 0.8;
            const frequency = 0.3;
            const omega = frequency * 2 * Math.PI;
            const zeta = damping;
            
            if (zeta < 1) {
              const alpha = omega * zeta;
              const beta = omega * Math.sqrt(1 - zeta * zeta);
              return 1 - Math.exp(-alpha * t) * (Math.cos(beta * t) + (alpha / beta) * Math.sin(beta * t));
            } else {
              const alpha1 = omega * (zeta - Math.sqrt(zeta * zeta - 1));
              const alpha2 = omega * (zeta + Math.sqrt(zeta * zeta - 1));
              const c1 = alpha2 / (alpha2 - alpha1);
              const c2 = -alpha1 / (alpha2 - alpha1);
              return 1 - (c1 * Math.exp(-alpha1 * t) + c2 * Math.exp(-alpha2 * t));
            }
          };
          
          const springProgress = heavySpring(progress);
          const scale = 1 - springProgress * 0.9;
          const translateY = -springProgress * viewportHeight;
          const opacity = 1 - progress;
          
          bioTextRef.current.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
          bioTextRef.current.style.opacity = opacity;
        }
        
        const scrollHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        const maxScroll = scrollHeight - viewportHeight;
        const distanceFromBottom = maxScroll - scrollY;
        
        const animationEndDistance = 800;
        const panelProgress = Math.max(0, Math.min(1, (animationEndDistance - distanceFromBottom) / animationEndDistance));
        
        const panels = [
          glassPanel1Ref.current,
          glassPanel2Ref.current,
          glassPanel3Ref.current,
          glassPanel4Ref.current
        ];
        
        const transformOrigins = {
          closest: ['100% 100%', '0% 100%', '100% 0%', '0% 0%'],
          farthest: ['0% 0%', '100% 0%', '0% 100%', '100% 100%'],
          farthestX: ['0% 50%', '100% 50%', '0% 50%', '100% 50%'],
          farthestY: ['50% 0%', '50% 0%', '50% 100%', '50% 100%']
        };
        
        panels.forEach((panel, index) => {
          if (panel) {
            panel.style.opacity = panelProgress;
            if (panel.dataset.animating !== 'true' && !panel.classList.contains('pressed')) {
              panel.style.transform = `scale(${panelProgress})`;
            }
            panel.style.transformOrigin = transformOrigins[anchorMode][index];
            panel.style.transitionDelay = panelProgress > 0 ? `${index * 0.075}s` : '0s';
            panel.style.pointerEvents = panelProgress > 0 ? 'auto' : 'none';
          }
        });
        
        if (glassPanelsContainerRef.current) {
          glassPanelsContainerRef.current.style.opacity = panelProgress;
          glassPanelsContainerRef.current.style.transform = `translate(-50%, -50%) scale(${panelProgress})`;
        }
        
        ticking = false;
      });
    };

    handleScroll();
    
    const scrollOptions = { passive: true, capture: false };
    window.addEventListener('scroll', handleScroll, scrollOptions);
    document.addEventListener('scroll', handleScroll, scrollOptions);
    
    const handleResize = () => {
      viewportHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
      handleScroll();
    };
    window.addEventListener('resize', handleResize, { passive: true });
    
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

  const handlePanelPress = (panelRef) => {
    if (panelRef.current) {
      panelRef.current.classList.add('pressed');
    }
  };

  const handlePanelLeave = (panelRef) => {
    if (panelRef.current) {
      panelRef.current.classList.remove('pressed');
    }
  };

  const handlePanelRelease = (panelRef) => {
    if (panelRef.current) {
      panelRef.current.classList.remove('pressed');
      panelRef.current.dataset.animating = 'true';
      panelRef.current.classList.add('release');
      setTimeout(() => {
        panelRef.current.classList.remove('release');
        panelRef.current.dataset.animating = 'false';
      }, 500);
    }
  };

  return (
    <div className="container">
      <div 
        ref={embedRef}
        data-us-project="lHYBB7eHby32vZtR9jsO"
        className="unicorn-embed"
      />
      
      <p ref={bioTextRef} className="bio-text">
        I am a design lead working on consumer Copilot at <a href="https://microsoft.ai/news/towards-humanist-superintelligence/" target="_blank" rel="noopener noreferrer" className="link">Microsoft AI</a>. Before, I was at Figma directing its inaugural <a href="https://www.firstround.com/ai/figma" target="_blank" rel="noopener noreferrer" className="link">AI model training</a> team, and before that I spent years <a href="https://www.youtube.com/watch?v=PG3tQYlZ6JQ" target="_blank" rel="noopener noreferrer" className="link">prototyping the metaverse</a> at Spatial.
      </p>
      
      <div ref={glassPanelsContainerRef} className="glass-panels-container">
        <div 
          ref={glassPanel1Ref} 
          className="glass-panel" 
          onMouseDown={() => handlePanelPress(glassPanel1Ref)}
          onMouseUp={() => handlePanelRelease(glassPanel1Ref)}
          onMouseLeave={() => handlePanelLeave(glassPanel1Ref)}
          onTouchStart={() => handlePanelPress(glassPanel1Ref)}
          onTouchEnd={() => handlePanelRelease(glassPanel1Ref)}
        />
        <div 
          ref={glassPanel2Ref} 
          className="glass-panel" 
          onMouseDown={() => handlePanelPress(glassPanel2Ref)}
          onMouseUp={() => handlePanelRelease(glassPanel2Ref)}
          onMouseLeave={() => handlePanelLeave(glassPanel2Ref)}
          onTouchStart={() => handlePanelPress(glassPanel2Ref)}
          onTouchEnd={() => handlePanelRelease(glassPanel2Ref)}
        />
        <div 
          ref={glassPanel3Ref} 
          className="glass-panel" 
          onMouseDown={() => handlePanelPress(glassPanel3Ref)}
          onMouseUp={() => handlePanelRelease(glassPanel3Ref)}
          onMouseLeave={() => handlePanelLeave(glassPanel3Ref)}
          onTouchStart={() => handlePanelPress(glassPanel3Ref)}
          onTouchEnd={() => handlePanelRelease(glassPanel3Ref)}
        />
        <div 
          ref={glassPanel4Ref} 
          className="glass-panel" 
          onMouseDown={() => handlePanelPress(glassPanel4Ref)}
          onMouseUp={() => handlePanelRelease(glassPanel4Ref)}
          onMouseLeave={() => handlePanelLeave(glassPanel4Ref)}
          onTouchStart={() => handlePanelPress(glassPanel4Ref)}
          onTouchEnd={() => handlePanelRelease(glassPanel4Ref)}
        />
      </div>
    </div>
  );
}

export default App;

