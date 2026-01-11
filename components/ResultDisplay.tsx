import React, { useState } from 'react';
import { Copy, Check, Sparkles, AlertCircle, ImageIcon, Download, Maximize2, ArrowRight, Grid3x3, RefreshCw, Mic } from 'lucide-react';
import { GenerationStatus } from '../types';

interface ResultDisplayProps {
  result: string | null;
  script: string | null;
  isLoading: boolean;
  error: string | null;
  onGenerateImage: (promptOverride?: string) => void;
  generationStatus: GenerationStatus;
  generatedImageUrl: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, 
  script,
  isLoading, 
  error,
  onGenerateImage,
  generationStatus,
  generatedImageUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'prompt' | 'script' | 'preview'>('prompt');

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyScript = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (err) {
      console.error('Failed to copy script', err);
    }
  };

  const extractPanelText = (panelNum: number): string | null => {
    if (!result) return null;
    const regex = new RegExp(`Panel\\s*${panelNum}\\s*:\\s*([\\s\\S]*?)(?=(?:Panel\\s*${panelNum + 1}\\s*:|Lighting must|Technical Specifications|$))`, 'i');
    const match = result.match(regex);
    return match && match[1] ? match[1].trim() : null;
  };

  const handlePanelSelection = (panelNum: number) => {
    // Toggle selection: if clicking already selected, deselect
    if (selectedPanel === panelNum) {
      setSelectedPanel(null);
    } else {
      setSelectedPanel(panelNum);
    }
  };

  const handleCopyPanel = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy panel', err);
    }
  };

  const handleGenerateClick = () => {
    handleTabChange('preview');
    
    if (selectedPanel) {
      const panelText = extractPanelText(selectedPanel);
      if (panelText) {
        // Include minimal context
        const contextPrompt = `Based on the reference image, generate a high quality photography shot. ${panelText}`;
        onGenerateImage(contextPrompt);
      }
    } else {
      onGenerateImage(); 
    }
  };

  const handleTabChange = (tab: 'prompt' | 'script' | 'preview') => {
    setActiveTab(tab);
  };

  // Switch to preview tab automatically when generation completes
  React.useEffect(() => {
    if (generatedImageUrl) {
      setActiveTab('preview');
    }
  }, [generatedImageUrl]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-red-900/50 bg-red-900/10 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-400 mb-2">Generation Failed</h3>
        <p className="text-red-300/70">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center border border-studio-700 bg-studio-800/30 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-studio-700/10 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full"></div>
        <Sparkles className="w-12 h-12 text-accent-500 animate-pulse mb-6" />
        <h3 className="text-xl font-medium text-studio-200 mb-2">Analyzing Product Details...</h3>
        <p className="text-studio-500 max-w-md">
          Detecting background, lighting, outfit, and product features to construct the 9-panel prompt grid.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center border border-studio-800 bg-studio-900 rounded-xl border-dashed">
        <div className="w-16 h-16 rounded-2xl bg-studio-800 rotate-12 mb-6 flex items-center justify-center opacity-50">
           <span className="text-3xl font-serif text-studio-600">Aa</span>
        </div>
        <h3 className="text-lg font-medium text-studio-400 mb-2">Ready to Generate</h3>
        <p className="text-studio-600 text-sm max-w-xs">
          Upload an image on the left to generate the specialized 3x3 grid prompt.
        </p>
      </div>
    );
  }

  const selectedPanelText = selectedPanel ? extractPanelText(selectedPanel) : null;

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-studio-700 bg-studio-900 shadow-xl">
      {/* Tab Header */}
      <div className="flex border-b border-studio-700 bg-studio-800/50">
        <button
          onClick={() => handleTabChange('prompt')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${
            activeTab === 'prompt' 
              ? 'border-accent-500 text-white bg-studio-800' 
              : 'border-transparent text-studio-400 hover:text-studio-200'
          }`}
        >
          Prompt Text
        </button>
        <button
           onClick={() => handleTabChange('script')}
           className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${
             activeTab === 'script' 
               ? 'border-accent-500 text-white bg-studio-800' 
               : 'border-transparent text-studio-400 hover:text-studio-200'
           }`}
        >
          Voice Over
        </button>
        <button
          onClick={() => handleTabChange('preview')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${
            activeTab === 'preview' 
              ? 'border-accent-500 text-white bg-studio-800' 
              : 'border-transparent text-studio-400 hover:text-studio-200'
          }`}
        >
          Visual Preview
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* PROMPT TAB */}
        {activeTab === 'prompt' && (
          <div className="absolute inset-0 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-studio-700/50 shrink-0">
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 text-accent-500 mr-2" />
                <span className="text-xs font-semibold text-studio-300 uppercase tracking-wider">Analysis Result</span>
              </div>
              <button
                onClick={handleCopy}
                className={`
                  flex items-center text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200
                  ${copied && !selectedPanel
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-studio-700 text-studio-300 hover:bg-studio-600 border border-studio-600'}
                `}
              >
                {copied && !selectedPanel ? <><Check className="w-3 h-3 mr-1.5" /> Copied</> : <><Copy className="w-3 h-3 mr-1.5" /> Copy Full Text</>}
              </button>
            </div>
            
            {/* Text Content */}
            <div className="flex-1 p-6 overflow-auto custom-scrollbar">
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-studio-300">
                {result}
              </pre>
            </div>

            {/* Footer Control Bar */}
            <div className="bg-studio-800 border-t border-studio-700 z-10 shrink-0 flex flex-col shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
              
              {/* Panel Selectors */}
              <div className="px-6 py-3 border-b border-studio-700/50 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center text-studio-400">
                     <Grid3x3 className="w-3 h-3 mr-2" />
                     <span className="text-[10px] uppercase tracking-wider font-semibold">Select Panel to Generate or Copy</span>
                   </div>
                   {selectedPanel && (
                      <button 
                        onClick={() => setSelectedPanel(null)}
                        className="text-[10px] text-studio-500 hover:text-studio-300 flex items-center transition-colors"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Reset Selection
                      </button>
                   )}
                </div>
                
                {/* 1-9 Grid Buttons */}
                <div className="flex gap-1 justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePanelSelection(num)}
                      className={`
                        flex-1 h-9 rounded text-xs font-mono font-medium transition-all duration-200 relative
                        ${selectedPanel === num 
                          ? 'bg-accent-600 text-white shadow-lg shadow-accent-900/50 scale-105 z-10 ring-2 ring-accent-400/50' 
                          : 'bg-studio-700/50 text-studio-400 hover:bg-studio-600 hover:text-white border border-transparent'}
                      `}
                      title={`Select Panel ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Selected Panel Preview */}
                {selectedPanel && selectedPanelText && (
                  <div className="bg-studio-900/50 rounded-lg p-3 border border-studio-700 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] text-accent-400 font-bold uppercase">Panel {selectedPanel} Prompt</span>
                      <button 
                        onClick={() => handleCopyPanel(selectedPanelText)}
                        className="text-[10px] text-studio-400 hover:text-white flex items-center"
                      >
                         {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} Copy
                      </button>
                    </div>
                    <p className="text-xs text-studio-300 line-clamp-2 italic opacity-90">{selectedPanelText}</p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="p-4">
                <button
                  onClick={handleGenerateClick}
                  className={`
                    group w-full font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg transform hover:-translate-y-0.5
                    ${selectedPanel 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-900/20 text-white' 
                      : 'bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 shadow-accent-900/20 text-white'}
                  `}
                >
                  <div className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-3" />
                    <span className="flex flex-col items-start leading-none text-left">
                       <span className="text-sm font-bold">
                         {selectedPanel ? `Generate Panel ${selectedPanel} Image` : 'Generate 3x3 Grid Image'}
                       </span>
                       <span className="text-[10px] font-normal opacity-80 mt-1">
                         {selectedPanel ? 'Uses Specific Panel Prompt + Reference' : 'Uses Full 3x3 Grid Prompt + Reference'}
                       </span>
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VOICE OVER SCRIPT TAB */}
        {activeTab === 'script' && (
          <div className="absolute inset-0 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-studio-700/50 shrink-0">
              <div className="flex items-center">
                <Mic className="w-4 h-4 text-accent-500 mr-2" />
                <span className="text-xs font-semibold text-studio-300 uppercase tracking-wider">Voice Over Script</span>
              </div>
              <button
                onClick={handleCopyScript}
                className={`
                  flex items-center text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200
                  ${copiedScript 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-studio-700 text-studio-300 hover:bg-studio-600 border border-studio-600'}
                `}
              >
                {copiedScript ? <><Check className="w-3 h-3 mr-1.5" /> Copied</> : <><Copy className="w-3 h-3 mr-1.5" /> Copy Script</>}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-studio-900/50">
               {script ? (
                 <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-studio-300 bg-transparent border-none p-0">
                      {script}
                    </pre>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-studio-500 opacity-60">
                    <Mic className="w-12 h-12 mb-4" />
                    <p>No script generated yet.</p>
                 </div>
               )}
            </div>
            
             {/* Simple Footer for Script Tab */}
             <div className="bg-studio-800 border-t border-studio-700 z-10 shrink-0 p-4 text-center">
                <p className="text-[10px] text-studio-400">
                  This script is AI-generated based on the visual prompt and your product description.
                </p>
             </div>
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="absolute inset-0 flex flex-col bg-studio-950">
            {generationStatus === GenerationStatus.IDLE && !generatedImageUrl && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-studio-800 mb-6 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-studio-500" />
                </div>
                <h3 className="text-lg font-medium text-studio-200 mb-2">Generate Visual Preview</h3>
                <p className="text-studio-500 text-sm max-w-xs mb-6">
                   Select a specific panel number in the "Prompt Text" tab to generate a single shot, or generate the full grid here.
                </p>
                <button
                  onClick={() => onGenerateImage()}
                  className="bg-accent-600 hover:bg-accent-500 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Full Grid
                </button>
              </div>
            )}

            {generationStatus === GenerationStatus.GENERATING && (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                 <div className="w-16 h-16 border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mb-6"></div>
                 <h3 className="text-lg font-medium text-studio-200 mb-2">Generating Image...</h3>
                 <p className="text-studio-500 text-sm">Synthesizing visual details based on your product and prompt.</p>
               </div>
            )}

            {generationStatus === GenerationStatus.ERROR && (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                 <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                 <h3 className="text-lg font-medium text-red-400 mb-2">Image Generation Failed</h3>
                 <p className="text-studio-500 text-sm max-w-xs mb-6">Could not generate the image. Please try again.</p>
                 <button
                   onClick={() => onGenerateImage()} // Retry last action (approx) - simpler to just reset to full grid retry in this view
                   className="bg-studio-800 hover:bg-studio-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                 >
                   Retry
                 </button>
               </div>
            )}

            {generatedImageUrl && (
              <div className="flex-1 flex flex-col h-full relative">
                <div className="flex-1 p-6 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-10 overflow-hidden">
                   {/* Portrait Card Container - Enforcing 9:16 Aspect Ratio */}
                   <div className="relative h-full w-auto aspect-[9/16] bg-studio-900 rounded-lg shadow-2xl overflow-hidden border border-studio-800 ring-1 ring-white/5 transition-transform hover:scale-[1.01] duration-500">
                     <img 
                       src={generatedImageUrl} 
                       alt="Generated Result" 
                       className="w-full h-full object-cover"
                     />
                     <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none"></div>
                   </div>
                </div>
                
                <div className="p-4 bg-studio-900 border-t border-studio-800 flex justify-between items-center z-10">
                   <div className="flex flex-col">
                     <span className="text-xs font-semibold text-studio-300">Generated Result</span>
                     <span className="text-[10px] text-studio-500">9:16 Portrait</span>
                   </div>
                   <div className="flex space-x-3">
                     <button 
                       onClick={() => window.open(generatedImageUrl, '_blank')}
                       className="p-2 text-studio-400 hover:text-white bg-studio-800 rounded-lg hover:bg-studio-700 transition-colors"
                       title="Open full size"
                     >
                       <Maximize2 className="w-5 h-5" />
                     </button>
                     <a 
                       href={generatedImageUrl} 
                       download="autoprompt-result.png"
                       className="flex items-center bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-lg shadow-accent-900/20"
                     >
                       <Download className="w-4 h-4 mr-2" />
                       Download
                     </a>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;