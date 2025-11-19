import React from 'react';
import { File as FileIcon, Download, ExternalLink } from 'lucide-react';

interface FilePreviewProps {
  fileName?: string;
  fileSize?: number;
  url?: string;
  mimeType?: string;
}

export default function FilePreview({ fileName, fileSize, url, mimeType }: FilePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileIcon = () => {
    if (!mimeType) return <FileIcon className="w-8 h-8 text-gray-400" />;
    
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    
    return <FileIcon className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 my-2">
      <div className="flex-shrink-0">
        {typeof getFileIcon() === 'string' ? (
          <span className="text-3xl">{getFileIcon()}</span>
        ) : (
          getFileIcon()
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {fileName || 'Unknown file'}
        </p>
        {fileSize && (
          <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
        )}
      </div>

      {url && (
        <div className="flex gap-1">
          <a
            href={url}
            download={fileName}
            className="p-2 hover:bg-gray-200 rounded-full transition"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-200 rounded-full transition"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </a>
        </div>
      )}
    </div>
  );
}
