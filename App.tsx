
import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import StyleCarousel from './components/StyleCarousel';
import ImageComparator from './components/ImageComparator';
import ChatInterface from './components/ChatInterface';
import { generateStyledImage, refineImage, getShoppingLinks } from './services/geminiService';
import { Style, ChatMessage } from './types';
import { STYLES } from './constants';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [currentGeneratedImage, setCurrentGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatingStyles, setGeneratingStyles] = useState<string[]>([]);
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (base64: string, fileMimeType: string) => {
    setIsLoading(true);
    setOriginalImage(`data:${fileMimeType};base64,${base64}`);
    setMimeType(fileMimeType);
    setChatHistory([{
      author: 'ai',
      text: "Great! I've got your image. Now, pick a style from above to see a redesign."
    }]);
    
    // Kick off generation for all styles
    setGeneratingStyles(STYLES.map(s => s.name));
    STYLES.forEach(style => {
      generateStyledImage(base64, fileMimeType, style.prompt)
        .then(newImage => {
          setGeneratedImages(prev => ({ ...prev, [style.name]: `data:${fileMimeType};base64,${newImage}` }));
        })
        .catch(err => {
          console.error(`Failed to generate image for ${style.name}:`, err);
          // Optionally show an error state for this specific style
        })
        .finally(() => {
          setGeneratingStyles(prev => prev.filter(s => s !== style.name));
        });
    });
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedStyle && generatedImages[selectedStyle.name]) {
      setCurrentGeneratedImage(generatedImages[selectedStyle.name]);
    } else if (!selectedStyle && Object.keys(generatedImages).length > 0) {
      // Default to the first generated style if none is selected yet
      const firstStyle = STYLES[0];
      if (generatedImages[firstStyle.name]) {
        setSelectedStyle(firstStyle);
        setCurrentGeneratedImage(generatedImages[firstStyle.name]);
      }
    }
  }, [selectedStyle, generatedImages]);


  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    if (generatedImages[style.name]) {
      setCurrentGeneratedImage(generatedImages[style.name]);
       setChatHistory(prev => [...prev, {
        author: 'ai',
        text: `Switched to ${style.name} style. How can I help you refine it?`
       }]);
    } else {
       setChatHistory(prev => [...prev, {
        author: 'ai',
        text: `I'm still working on the ${style.name} design. It should be ready shortly!`
       }]);
    }
  };

  const isShoppingLinksRequest = (text: string): boolean => {
    const keywords = ['shop', 'buy', 'link', 'find', 'item', 'purchase', 'product'];
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  };
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!currentGeneratedImage || !mimeType || isChatting) return;
    
    const newUserMessage: ChatMessage = { author: 'user', text: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsChatting(true);
    setError(null);

    try {
      if (isShoppingLinksRequest(message)) {
        const base64 = currentGeneratedImage.split(',')[1];
        const { text, shoppingLinks } = await getShoppingLinks(base64, mimeType, message);
        const aiMessage: ChatMessage = { author: 'ai', text, shoppingLinks };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        const base64 = currentGeneratedImage.split(',')[1];
        const refinedImageBase64 = await refineImage(base64, mimeType, message);
        const newImageUrl = `data:${mimeType};base64,${refinedImageBase64}`;
        setCurrentGeneratedImage(newImageUrl);

        // Update the generated image for the current style
        if(selectedStyle) {
          setGeneratedImages(prev => ({...prev, [selectedStyle.name]: newImageUrl}));
        }
        
        const aiMessage: ChatMessage = { author: 'ai', text: "Here's the updated design. What do you think?" };
        setChatHistory(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      const aiErrorMessage: ChatMessage = { author: 'ai', text: `I'm sorry, I couldn't process that. ${errorMessage}` };
      setChatHistory(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsChatting(false);
    }
  }, [currentGeneratedImage, mimeType, isChatting, selectedStyle]);


  if (!originalImage) {
    return <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Design Dashboard</h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">Select a style, compare, and chat to refine your perfect room.</p>
      </header>
      
      <main className="flex flex-col items-center">
        <StyleCarousel onStyleSelect={handleStyleSelect} selectedStyle={selectedStyle} generatingStyles={generatingStyles} />
        
        {currentGeneratedImage ? (
          <>
            <ImageComparator originalImage={originalImage} generatedImage={currentGeneratedImage} />
            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-md">{error}</div>}
            <ChatInterface chatHistory={chatHistory} onSendMessage={handleSendMessage} isChatting={isChatting} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center mt-10 p-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl aspect-video w-full max-w-4xl">
             <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
             <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Generating initial designs... Please wait.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
