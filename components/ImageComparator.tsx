
import React, { useState, useRef, useEffect } from 'react';

interface ImageComparatorProps {
  originalImage: string;
  generatedImage: string;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };
  
  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

  useEffect(() => {
    const container = containerRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
    
    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
    };
    
    container?.addEventListener('mousedown', handleMouseDown);
    container?.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      container?.removeEventListener('mousedown', handleMouseDown);
      container?.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="w-full max-w-4xl mx-auto aspect-video relative" ref={containerRef}>
      <img src={originalImage} alt="Original Room" className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-xl" />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden rounded-lg shadow-xl"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={generatedImage} alt="Generated Design" className="absolute inset-0 w-full h-full object-contain" />
      </div>
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
          </svg>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label="Image comparison slider"
      />
    </div>
  );
};

export default ImageComparator;
