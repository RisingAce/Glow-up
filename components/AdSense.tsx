'use client';

import { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    try {
      // Create the script element
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7602339756703410';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Append the script to the document
      document.head.appendChild(script);
      
      return () => {
        // Cleanup function to remove the script if the component unmounts
        document.head.removeChild(script);
      };
    } catch (error) {
      console.error('Error loading AdSense script:', error);
    }
  }, []);

  return null;
}
