
import React from 'react';

interface ImageUploaderProps {
  label: string;
  images: string[];
  onUpload: (files: string[]) => void;
  onClear: () => void;
  maxFiles?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, images, onUpload, onClear, maxFiles = 3 }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Explicitly cast the Array.from result to File[] to ensure type safety with FileReader
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(dataUrls => {
      onUpload([...images, ...dataUrls].slice(0, maxFiles));
    });
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-400">{label}</h3>
        {images.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors underline"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-video rounded overflow-hidden bg-slate-900 border border-slate-700">
            <img src={img} className="w-full h-full object-cover" alt={`Preview ${i}`} />
          </div>
        ))}
        {images.length < maxFiles && (
          <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-600 rounded cursor-pointer hover:bg-slate-700/50 transition-colors">
            <svg className="w-8 h-8 text-slate-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] text-slate-500 font-medium">Add Image</span>
            <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
      </div>
      <p className="text-[10px] text-slate-500">
        Upload up to {maxFiles} screenshots showing {label.toLowerCase()}.
      </p>
    </div>
  );
};

export default ImageUploader;
