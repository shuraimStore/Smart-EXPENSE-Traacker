
import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        onImageUpload(base64, file.type);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file (PNG, JPG, etc.).');
    }
  }, [onImageUpload]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">AI Interior Design Consultant</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Upload a photo of your room to get started.</p>
        
        <div 
          onDragEnter={handleDrag} 
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative p-8 border-4 border-dashed rounded-2xl transition-colors duration-300 ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-600'}`}
        >
          <input ref={inputRef} type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleChange} disabled={isLoading} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={onButtonClick}>Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}
        {isLoading && (
           <div className="mt-8 flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
             <p className="mt-4 text-gray-600 dark:text-gray-300">Getting your space ready...</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
