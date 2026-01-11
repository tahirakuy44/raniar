import React, { useState } from 'react';
import { Camera, Wand2, Info, FileText, Globe } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { ImageFile, AnalysisStatus, GenerationStatus } from './types';
import { generateAutoPrompt, generateProductImage } from './services/geminiService';

const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<ImageFile | null>(null);
  const [productDescription, setProductDescription] = useState<string>("");
  const [language, setLanguage] = useState<string>("English");
  
  // Text Analysis State
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Image Generation State
  const [genStatus, setGenStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const handleImageSelect = (image: ImageFile | null) => {
    setCurrentImage(image);
    // Reset all states
    setResult(null);
    setScript(null);
    setError(null);
    setStatus(AnalysisStatus.IDLE);
    setGeneratedImageUrl(null);
    setGenStatus(GenerationStatus.IDLE);
    setGenError(null);
  };

  const handleGeneratePrompt = async () => {
    if (!currentImage) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);
    setScript(null);

    try {
      const fullResponse = await generateAutoPrompt(
        currentImage.base64, 
        currentImage.mimeType,
        productDescription,
        language
      );

      // Split the response into Prompt and Script
      const separator = "---VOICE_OVER_SCRIPT---";
      const parts = fullResponse.split(separator);

      if (parts.length > 1) {
        setResult(parts[0].trim());
        setScript(parts[1].trim());
      } else {
        setResult(fullResponse);
      }
      
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleGenerateImage = async (promptOverride?: string) => {
    // Use the override prompt if provided (for single panel), otherwise use the full result (for grid)
    const promptToUse = promptOverride || result;
    
    if (!currentImage || !promptToUse) return;

    setGenStatus(GenerationStatus.GENERATING);
    setGenError(null);
    // Clear previous image when starting new generation to avoid confusion
    setGeneratedImageUrl(null);

    try {
      const imgUrl = await generateProductImage(currentImage.base64, currentImage.mimeType, promptToUse);
      setGeneratedImageUrl(imgUrl);
      setGenStatus(GenerationStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || "Failed to generate image.");
      setGenStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-studio-900 text-studio-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-studio-800 bg-studio-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-accent-600 p-2 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              AutoPrompt <span className="text-studio-500 font-normal">Studio</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex text-xs text-studio-500 border border-studio-800 rounded-full px-3 py-1 items-center">
               <Info className="w-3 h-3 mr-1.5" />
               Powered by Gemini 3.0
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Reference Image</h2>
              <p className="text-studio-400 text-sm leading-relaxed">
                Upload your product photo. The AI will detect the background, model, and outfit to generate a consistent 9-panel photography grid prompt.
              </p>
            </div>
            
            <ImageUploader 
              image={currentImage} 
              onImageSelected={handleImageSelect}
              isLoading={status === AnalysisStatus.ANALYZING}
            />

            {/* Language & Description Inputs */}
            <div className="space-y-4">
               {/* Language Selector */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-studio-300 flex items-center">
                   <Globe className="w-4 h-4 mr-2" />
                   Voice Over Language
                 </label>
                 <div className="relative">
                   <select 
                     value={language}
                     onChange={(e) => setLanguage(e.target.value)}
                     disabled={status === AnalysisStatus.ANALYZING}
                     className="w-full bg-studio-800/50 border border-studio-700 rounded-xl p-3 text-sm text-studio-200 appearance-none focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all cursor-pointer hover:bg-studio-800"
                   >
                     <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                     <option value="English">English</option>
                     <option value="Bahasa Melayu">Bahasa Melayu</option>
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-studio-400">
                     <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                       <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                     </svg>
                   </div>
                 </div>
               </div>

               {/* Description */}
               <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-studio-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Product Context <span className="ml-2 text-[10px] text-studio-500 bg-studio-800 px-2 py-0.5 rounded-full">Optional</span>
                  </label>
                </div>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="E.g., This is a luxury perfume for evening wear. The mood should be mysterious and elegant."
                  disabled={status === AnalysisStatus.ANALYZING}
                  className="w-full bg-studio-800/50 border border-studio-700 rounded-xl p-4 text-sm text-studio-200 placeholder-studio-600 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all resize-none h-24"
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePrompt}
              disabled={!currentImage || status === AnalysisStatus.ANALYZING}
              className={`
                w-full py-4 rounded-xl font-semibold text-white shadow-lg shadow-accent-600/20
                flex items-center justify-center transition-all duration-300 transform
                ${!currentImage || status === AnalysisStatus.ANALYZING 
                  ? 'bg-studio-700 text-studio-400 cursor-not-allowed' 
                  : 'bg-accent-600 hover:bg-accent-500 hover:scale-[1.02] hover:shadow-accent-600/30'}
              `}
            >
              {status === AnalysisStatus.ANALYZING ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Analyze & Generate
                </>
              )}
            </button>

            {/* Steps Guide */}
            <div className="bg-studio-800/20 border border-studio-800 rounded-xl p-5 mt-4">
              <h4 className="text-xs font-bold text-studio-400 uppercase tracking-widest mb-3">Workflow</h4>
              <ul className="space-y-3">
                {[
                  "Upload product image & select language.",
                  "Generate grid prompt & VO script.",
                  "Visualize generated prompt with AI.",
                  "Download high-res result."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-center text-sm text-studio-300">
                    <span className="w-5 h-5 rounded-full bg-studio-800 text-studio-500 text-xs flex items-center justify-center mr-3 font-mono">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[600px]">
             <ResultDisplay 
               result={result}
               script={script}
               isLoading={status === AnalysisStatus.ANALYZING}
               error={error || genError}
               onGenerateImage={handleGenerateImage}
               generationStatus={genStatus}
               generatedImageUrl={generatedImageUrl}
             />
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-studio-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-studio-600 text-sm">
            &copy; {new Date().getFullYear()} AutoPrompt Studio. Designed for Professional AI Photography Workflows.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;