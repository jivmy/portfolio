import { useEffect, useRef, useState } from 'react';

function App() {
  const embedRef = useRef(null);
  const bioTextRef = useRef(null);
  const glassPanelsContainerRef = useRef(null);
  const glassPanel1Ref = useRef(null);
  const glassPanel2Ref = useRef(null);
  const glassPanel3Ref = useRef(null);
  const glassPanel4Ref = useRef(null);
  
  const [anchorMode, setAnchorMode] = useState('closest'); // 'closest', 'farthest', 'farthestX', 'farthestY'

  useEffect(() => {
    // Fix viewport height for Instagram mobile browser
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Also handle scroll events that might affect viewport on mobile
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
    // On mobile, check viewport height as fast as possible and update unicorn-embed height
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (!isMobile || !embedRef.current) return;
    
    let lastVh = window.innerHeight;
    let animationFrameId;
    
    const updateEmbedHeight = () => {
      const currentVh = window.innerHeight;
      if (currentVh !== lastVh && embedRef.current) {
        embedRef.current.style.height = '100vh';
        lastVh = currentVh;
      }
      // Continue checking on next frame
      animationFrameId = requestAnimationFrame(updateEmbedHeight);
    };
    
    // Start checking immediately and continuously
    animationFrameId = requestAnimationFrame(updateEmbedHeight);
    
    // Also check on resize and orientation change
    window.addEventListener('resize', updateEmbedHeight);
    window.addEventListener('orientationchange', updateEmbedHeight);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateEmbedHeight);
      window.removeEventListener('orientationchange', updateEmbedHeight);
    };
  }, []);

  useEffect(() => {
    // Initialize UnicornStudio
    if (window.UnicornStudio) {
      const init = () => {
        if (window.UnicornStudio?.init) {
          window.UnicornStudio.init();
        }
      };
      setTimeout(init, 100);
      return;
    }

    // Load UnicornStudio script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js';
    script.onload = () => {
      setTimeout(() => {
        if (window.UnicornStudio?.init) {
          window.UnicornStudio.init();
        }
      }, 100);
    };
    (document.head || document.body).appendChild(script);
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
        
        // Show glass panels when scrolled to bottom
        const scrollHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        const maxScroll = scrollHeight - viewportHeight;
        const distanceFromBottom = maxScroll - scrollY;
        
        // Start animation at 0px from bottom (at bottom, progress = 1)
        const animationStartDistance = 0;
        const animationEndDistance = 800;
        const animationRange = animationEndDistance - animationStartDistance;
        // Animation progresses from 1 (at bottom, 0px) to 0 (800px from bottom)
        const panelProgress = Math.max(0, Math.min(1, (animationEndDistance - distanceFromBottom) / animationRange));
        
        const panelOpacity = panelProgress;
        const panelScale = panelProgress;
        
        const panels = [
          glassPanel1Ref.current,
          glassPanel2Ref.current,
          glassPanel3Ref.current,
          glassPanel4Ref.current
        ];
        
        // Define transform-origin for each panel based on anchor mode
        const transformOrigins = {
          closest: ['100% 100%', '0% 100%', '100% 0%', '0% 0%'], // Panel 1, 2, 3, 4
          farthest: ['0% 0%', '100% 0%', '0% 100%', '100% 100%'],
          farthestX: ['0% 50%', '100% 50%', '0% 50%', '100% 50%'],
          farthestY: ['50% 0%', '50% 0%', '50% 100%', '50% 100%']
        };
        
        panels.forEach((panel, index) => {
          if (panel) {
            panel.style.opacity = panelOpacity;
            // Don't override transform if animation is in progress
            if (panel.dataset.animating !== 'true' && !panel.classList.contains('pressed')) {
              panel.style.transform = `scale(${panelScale})`;
            }
            panel.style.transformOrigin = transformOrigins[anchorMode][index];
            // Stagger the animation
            panel.style.transitionDelay = panelProgress > 0 ? `${index * 0.075}s` : '0s';
            // Make panels clickable when visible
            panel.style.pointerEvents = panelOpacity > 0 ? 'auto' : 'none';
          }
        });
        
        if (glassPanelsContainerRef.current) {
          glassPanelsContainerRef.current.style.opacity = panelOpacity;
          glassPanelsContainerRef.current.style.transform = `translate(-50%, -50%) scale(${panelScale})`;
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
  }, [anchorMode]);

  const handlePanelPress = (panelRef) => {
    if (panelRef.current) {
      panelRef.current.classList.add('pressed');
    }
  };

  const handlePanelLeave = (panelRef) => {
    if (panelRef.current) {
      // Only cancel press state, don't trigger release animation
      panelRef.current.classList.remove('pressed');
    }
  };

  const handlePanelRelease = (panelRef) => {
    if (panelRef.current) {
      panelRef.current.classList.remove('pressed');
      // Store that animation is in progress to prevent scroll handler from interfering
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
        data-us-production="true"
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

