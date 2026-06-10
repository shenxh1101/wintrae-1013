import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
  onDownloadTemplate: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  uploadedFile,
  onRemoveFile,
  onDownloadTemplate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return validTypes.includes(ext);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 min-h-[240px]',
          isDragging
            ? 'border-navy-500 bg-navy-50 shadow-lg shadow-navy-200/50 ring-4 ring-navy-200'
            : uploadedFile
            ? 'border-success-300 bg-success-50/50'
            : 'border-slatebg-200 bg-slatebg-50/50 hover:border-navy-300 hover:bg-navy-50/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {uploadedFile ? (
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="w-14 h-14 rounded-xl bg-success-100 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-7 h-7 text-success-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy-800 truncate">{uploadedFile.name}</p>
              <p className="text-sm text-navy-500">{formatSize(uploadedFile.size)}</p>
              <div className="flex items-center gap-1 mt-1">
                <Check className="w-3.5 h-3.5 text-success-500" />
                <span className="text-xs text-success-600">文件已就绪，可开始导入</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile();
              }}
              className="p-2 rounded-lg text-navy-400 hover:text-danger-500 hover:bg-danger-50 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
                isDragging
                  ? 'bg-navy-100 scale-110'
                  : 'bg-gradient-to-br from-navy-50 to-copper-50'
              )}
            >
              <Upload
                className={cn(
                  'w-10 h-10 transition-colors duration-300',
                  isDragging ? 'text-navy-600' : 'text-navy-500'
                )}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-navy-800 mb-1">
                {isDragging ? '松开鼠标上传文件' : '拖拽文件到此处'}
              </p>
              <p className="text-sm text-navy-500 mb-3">
                或 <span className="text-navy-700 font-medium underline">点击选择文件</span>
              </p>
              <p className="text-xs text-navy-400">
                支持格式：.xlsx / .xls / .csv，最大 20MB
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-navy-500">
          <div className="flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>首行为表头，按列依次填写员工信息</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={(e) => {
            e.stopPropagation();
            onDownloadTemplate();
          }}
        >
          下载Excel模板
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
