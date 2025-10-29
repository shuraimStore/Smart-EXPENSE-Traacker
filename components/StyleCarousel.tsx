
import React from 'react';
import { STYLES } from '../constants';
import { Style } from '../types';

interface StyleCarouselProps {
  onStyleSelect: (style: Style) => void;
  selectedStyle: Style | null;
  generatingStyles: string[];
}

const StyleCarousel: React.FC<StyleCarouselProps> = ({ onStyleSelect, selectedStyle, generatingStyles }) => {
  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">Choose a Style</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {STYLES.map((style) => (
          <button
            key={style.name}
            onClick={() => onStyleSelect(style)}
            disabled={generatingStyles.includes(style.name)}
            className={`flex-shrink-0 w-40 h-24 p-4 rounded-xl shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center ${
              selectedStyle?.name === style.name
                ? 'bg-indigo-600 text-white scale-105'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            } ${generatingStyles.includes(style.name) ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {generatingStyles.includes(style.name) ? (
              <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-3xl">{style.icon}</span>
                <span className="text-sm font-semibold mt-1">{style.name}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleCarousel;
