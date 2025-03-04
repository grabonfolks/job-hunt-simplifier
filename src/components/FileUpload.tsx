
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Upload, X, FilePlus, FileIcon, Download } from 'lucide-react';

interface FileUploadProps {
  onChange: (file: File | null) => void;
  value?: string;
  label: string;
  accept?: string;
  className?: string;
  maxSize?: number; // in MB
}

const FileUpload = ({
  onChange,
  value,
  label,
  accept = '.pdf,.doc,.docx',
  className,
  maxSize = 5, // Default max file size: 5MB
}: FileUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSetFile(file);
  };

  // Validate file and set it
  const validateAndSetFile = (file: File | null) => {
    setError(null);

    if (!file) {
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Check file type
    const acceptArray = accept.split(',');
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!acceptArray.some(type => type === fileExtension || type === file.type)) {
      setError(`Only ${accept} files are allowed`);
      return;
    }

    onChange(file);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    validateAndSetFile(file);
  };

  // Handle removing the file
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get file name from data URL or path
  const getFileName = () => {
    if (!value) return null;
    
    // For data URLs, try to extract the filename from the file info
    if (value.startsWith('data:')) {
      const fileNameMatch = value.match(/name=(.*?)(;|$)/);
      if (fileNameMatch && fileNameMatch[1]) {
        return decodeURIComponent(fileNameMatch[1]);
      }
      return 'Uploaded file';
    }
    
    // For regular paths, extract the filename
    const pathParts = value.split('/');
    return pathParts[pathParts.length - 1];
  };
  
  // Handle download for data URLs
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!value) return;
    
    const fileName = getFileName() || 'download';
    
    // Create a temporary anchor and trigger download
    const link = document.createElement('a');
    link.href = value;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragging ? 'border-primary/70 bg-primary/5' : 'border-muted-foreground/20 hover:border-muted-foreground/40',
          error && 'border-destructive/40 bg-destructive/5'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
        />

        {!value ? (
          // Empty state - no file selected
          <div className="flex flex-col items-center space-y-3 py-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to select a file <br />
                Max size: {maxSize}MB
              </p>
            </div>
          </div>
        ) : (
          // File selected state
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{getFileName()}</p>
                <p className="text-xs text-muted-foreground">
                  {label} uploaded
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDownload} 
                className="rounded-full h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRemoveFile} 
                className="rounded-full h-8 w-8 text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
