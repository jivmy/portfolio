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
            console.log('UnicornStudio initialized successfully');
            // Small delay then trigger scroll to ensure UnicornStudio can detect it
            setTimeout(() => {
              window.scrollTo(0, 0);
              window.dispatchEvent(new Event('scroll'));
            }, 100);
            return true;
          } catch (error) {
            console.error('Error initializing UnicornStudio:', error);
          }
        } else {
          console.log('Embed element not ready yet');
        }
      } else {
        console.log('UnicornStudio not available yet');
      }
      return false;
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="unicornStudio"]');
    if (existingScript) {
      console.log('UnicornStudio script tag already exists');
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
          clearInterval(checkInterval);
          setTimeout(() => {
            if (!initializeUnicornStudio()) {
              let attempts = 0;
              const retryInterval = setInterval(() => {
                attempts++;
                if (initializeUnicornStudio() || attempts > 30) {
                  clearInterval(retryInterval);
                }
              }, 100);
            }
          }, 300);
        }
      }, 100);
      
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    // Load the script dynamically
    console.log('Loading UnicornStudio script...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.36/dist/unicornStudio.umd.js';
    script.async = false; // Load synchronously to ensure it's ready
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('UnicornStudio script loaded');
      // Wait for React to render the embed element
      setTimeout(() => {
        if (!initializeUnicornStudio()) {
          let attempts = 0;
          const retryInterval = setInterval(() => {
            attempts++;
            if (initializeUnicornStudio() || attempts > 30) {
              clearInterval(retryInterval);
              if (attempts > 30) {
                console.error('Failed to initialize UnicornStudio after retries');
              }
            }
          }, 100);
        }
      }, 300);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load UnicornStudio script:', error);
      initAttempted.current = false; // Allow retry
    };
    
    document.head.appendChild(script);
  }, []);

  // Handle scroll to keep embed fixed until 1800px and animate text
  useEffect(() => {
    const scrollThreshold = 1800; // 1800px
    let lastScrollY = -1;
    let lastEmbedPosition = null;
    let lastTextTransform = null;
    let lastTextOpacity = null;
    let viewportHeight = window.innerHeight;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      // Skip if scroll position hasn't changed significantly
      if (Math.abs(scrollY - lastScrollY) < 0.5) return;
      lastScrollY = scrollY;
      
      // Handle embed positioning - only update if position needs to change
      if (embedRef.current) {
        const shouldBeFixed = scrollY < scrollThreshold;
        const currentPosition = shouldBeFixed ? 'fixed' : 'absolute';
        
        if (lastEmbedPosition !== currentPosition) {
          if (shouldBeFixed) {
            embedRef.current.style.cssText = 'position: fixed; top: 0; left: 50%; transform: translateX(-50%);';
          } else {
            embedRef.current.style.cssText = `position: absolute; top: ${scrollThreshold}px; left: 50%; transform: translateX(-50%);`;
          }
          lastEmbedPosition = currentPosition;
        }
      }
      
      // Handle text animation (scale down, move up, reduce opacity)
      if (bioTextRef.current) {
        // Calculate progress from 0 to 1 over the scroll threshold
        const progress = Math.min(scrollY / scrollThreshold, 1);
        
        // Scale: from 1 to 0.5
        const scale = 1 - (progress * 0.5);
        
        // Move up: from 0 to -100vh (off screen)
        const translateY = -progress * viewportHeight;
        
        // Opacity: from 1 to 0
        const opacity = 1 - progress;
        
        // Only update if values changed significantly (reduce DOM writes)
        const newTransform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
        if (lastTextTransform !== newTransform || Math.abs(opacity - (lastTextOpacity || 1)) > 0.01) {
          bioTextRef.current.style.transform = newTransform;
          bioTextRef.current.style.opacity = opacity;
          lastTextTransform = newTransform;
          lastTextOpacity = opacity;
        }
      }
    };

    const handleResize = () => {
      viewportHeight = window.innerHeight;
      handleScroll();
    };

    // Use throttled scroll handler to reduce work
    let ticking = false;
    const optimizedScrollHandler = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };

    // Initial call
    handleScroll();

    // Verify page is scrollable
    const checkScrollable = () => {
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      const viewportHeight = window.innerHeight;
      console.log('Scroll check:', { scrollHeight, viewportHeight, isScrollable: scrollHeight > viewportHeight });
    };
    checkScrollable();

    // Add scroll listeners to multiple targets for better compatibility
    const scrollOptions = { passive: true, capture: false };
    const scrollHandler = () => {
      console.log('Scroll event fired, scrollY:', window.scrollY);
      optimizedScrollHandler();
    };
    
    window.addEventListener('scroll', scrollHandler, scrollOptions);
    document.addEventListener('scroll', scrollHandler, scrollOptions);
    document.documentElement.addEventListener('scroll', scrollHandler, scrollOptions);
    document.body.addEventListener('scroll', scrollHandler, scrollOptions);
    
    window.addEventListener('resize', () => {
      handleResize();
      checkScrollable();
    }, { passive: true });

    // Also use wheel event as fallback
    const handleWheel = (e) => {
      console.log('Wheel event fired');
      optimizedScrollHandler();
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollHandler);
      document.removeEventListener('scroll', scrollHandler);
      document.documentElement.removeEventListener('scroll', scrollHandler);
      document.body.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
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

