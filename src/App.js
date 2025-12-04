import React, { useEffect, useRef } from 'react';

function App() {
  const embedRef = useRef(null);
  const bioTextRef = useRef(null);
  const initAttempted = useRef(false);

  useEffect(() => {
    // Prevent double initialization (especially important in StrictMode)
    if (initAttempted.current) return;
    initAttempted.current = true;

    const initializeUnicornStudio = () => {
      // Check if UnicornStudio is already available
      if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
        // Ensure the embed element exists and is in the DOM before initializing
        if (embedRef.current && embedRef.current.isConnected) {
          try {
            window.UnicornStudio.init();
            // Small delay then trigger scroll to ensure UnicornStudio can detect it
            setTimeout(() => {
              window.scrollTo(0, 0);
              window.dispatchEvent(new Event('scroll'));
            }, 100);
            return true;
          } catch (error) {
            console.error('Error initializing UnicornStudio:', error);
          }
        }
      }
      return false;
    };

    // Wait for both DOM and script to be ready
    const waitAndInit = () => {
      // Check if script is loaded
      if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
        // Script is loaded, wait for React to render
        setTimeout(() => {
          if (!initializeUnicornStudio()) {
            // Retry a few times if element not ready
            let attempts = 0;
            const retryInterval = setInterval(() => {
              attempts++;
              if (initializeUnicornStudio() || attempts > 20) {
                clearInterval(retryInterval);
              }
            }, 100);
          }
        }, 200);
      } else {
        // Script not loaded yet, wait for it
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
            clearInterval(checkInterval);
            setTimeout(() => {
              if (!initializeUnicornStudio()) {
                // Retry a few times if element not ready
                let retryAttempts = 0;
                const retryInterval = setInterval(() => {
                  retryAttempts++;
                  if (initializeUnicornStudio() || retryAttempts > 20) {
                    clearInterval(retryInterval);
                  }
                }, 100);
              }
            }, 200);
          } else if (attempts > 50) {
            clearInterval(checkInterval);
            console.error('UnicornStudio script not loaded after timeout');
          }
        }, 100);
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      waitAndInit();
    } else {
      window.addEventListener('load', waitAndInit);
      document.addEventListener('DOMContentLoaded', waitAndInit);
    }
  }, []);

  // Handle scroll to keep embed fixed until 1800px and animate text
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollThreshold = 1800; // 1800px
      
      // Handle embed positioning
      if (embedRef.current) {
        if (scrollY < scrollThreshold) {
          // Keep fixed until 1800px is scrolled - embed stays in place
          embedRef.current.style.position = 'fixed';
          embedRef.current.style.top = '0';
          embedRef.current.style.left = '50%';
          embedRef.current.style.transform = 'translateX(-50%)';
        } else {
          // After 1800px, make it scroll with the page
          embedRef.current.style.position = 'absolute';
          embedRef.current.style.top = `${scrollThreshold}px`;
          embedRef.current.style.left = '50%';
          embedRef.current.style.transform = 'translateX(-50%)';
        }
      }
      
      // Handle text animation (scale down, move up, reduce opacity)
      if (bioTextRef.current) {
        // Calculate progress from 0 to 1 over the scroll threshold
        const progress = Math.min(scrollY / scrollThreshold, 1);
        
        // Scale: from 1 to 0.5
        const scale = 1 - (progress * 0.5);
        
        // Move up: from 0 to -100vh (off screen)
        const viewportHeight = window.innerHeight;
        const translateY = -progress * viewportHeight;
        
        // Opacity: from 1 to 0
        const opacity = 1 - progress;
        
        bioTextRef.current.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
        bioTextRef.current.style.opacity = opacity;
      }
    };

    // Use requestAnimationFrame for smoother scroll handling
    let ticking = false;
    const optimizedScrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial call
    handleScroll();

    // Add scroll listener with optimization
    // Use capture phase to ensure UnicornStudio can also detect scroll
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true, capture: false });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Also listen on document for better compatibility
    document.addEventListener('scroll', optimizedScrollHandler, { passive: true, capture: false });

    return () => {
      window.removeEventListener('scroll', optimizedScrollHandler);
      document.removeEventListener('scroll', optimizedScrollHandler);
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

