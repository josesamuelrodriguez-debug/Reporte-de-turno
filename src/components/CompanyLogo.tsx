import React, { useState, useEffect } from 'react';
import { getSavedSupabaseConfig } from '../db';

interface CompanyLogoProps {
  className?: string;
  fallbackBadgeText?: string;
}

export default function CompanyLogo({ className = 'h-8 sm:h-10 w-auto object-contain shrink-0', fallbackBadgeText = 'SE' }: CompanyLogoProps) {
  const [candidates, setCandidates] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    const list: string[] = [];
    
    // Check Supabase config
    const config = getSavedSupabaseConfig();
    if (config && config.url) {
      const cleanUrl = config.url.replace(/\/$/, '');
      // Try Supabase files
      list.push(`${cleanUrl}/storage/v1/object/public/logos/logo.png`);
      list.push(`${cleanUrl}/storage/v1/object/public/logos/logo.jpg`);
      list.push(`${cleanUrl}/storage/v1/object/public/logos/logo.jpeg`);
      list.push(`${cleanUrl}/storage/v1/object/public/logos/logo.svg`);
    }
    
    // Try local files
    list.push('/logo.png');
    list.push('/logo.jpg');
    list.push('/logo.jpeg');
    list.push('/logo.svg');
    
    setCandidates(list);
    setCurrentIndex(0);
    setShowImage(true);
  }, []);

  const handleError = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowImage(false);
    }
  };

  if (!showImage || candidates.length === 0) {
    return null;
  }

  return (
    <img 
      src={candidates[currentIndex]} 
      alt="Logo" 
      className={className} 
      onError={handleError} 
    />
  );
}
