import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  image: ImageFile | null;
  onImageSelected: (image: ImageFile | null) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Content = result.split(',')[1];
      const mimeType = file.type;

      onImageSelected({
        file,
        previewUrl: result,
        base64: base64Content,
        mimeType: mimeType
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!image ? (
        <div 
          onClick={!isLoading ? triggerUpload : undefined}
          className={`
            border-2 border-dashed border-studio-700 rounded-xl 
            flex flex-col items-center justify-center 
            h-80 transition-all duration-300
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-accent-500 hover:bg-studio-800'}
          `}
        >
          <div className="bg-studio-800 p-4 rounded-full mb-4">
            <Upload className="w-8 h-8 text-studio-300" />
          </div>
          <h3 className="text-lg font-medium text-studio-200 mb-2">Upload Reference Product</h3>
          <p className="text-studio-500 text-sm max-w-xs text-center">
            Click to select a high-quality product image (JPG, PNG).
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-studio-700 bg-studio-900 group">
          <img 
            src={image.previewUrl} 
            alt="Reference Product" 
            className="w-full h-80 object-contain bg-black/40"
          />
          
          <div className="absolute top-0 left-0 w-full h-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={triggerUpload}
              disabled={isLoading}
              className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 mr-2"
            >
              Change Image
            </button>
          </div>

          {!isLoading && (
            <button 
              onClick={handleClear}
              className="absolute top-3 right-3 bg-studio-900/80 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-studio-900 to-transparent p-4">
            <div className="flex items-center text-studio-300 text-sm">
              <ImageIcon className="w-4 h-4 mr-2" />
              <span className="truncate">{image.file.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;