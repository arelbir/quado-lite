"use client";

/**
 * IMAGE UPLOAD - MINIO VERSION
 * Replaces UploadThing with MinIO
 */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/shared/icons";
import ProgressBar from "./progress-bar";
import { LoadingButton } from "../button";

interface FileUploadProgress {
  progress: number;
  File: File;
}

enum FileTypes {
  Image = "image",
  Pdf = "pdf",
  Audio = "audio",
  Video = "video",
  Other = "other",
}

const ImageColor = {
  bgColor: "bg-purple-600",
  fillColor: "fill-purple-600",
};

const PdfColor = {
  bgColor: "bg-blue-400",
  fillColor: "fill-blue-400",
};

const AudioColor = {
  bgColor: "bg-yellow-400",
  fillColor: "fill-yellow-400",
};

const VideoColor = {
  bgColor: "bg-green-400",
  fillColor: "fill-green-400",
};

const OtherColor = {
  bgColor: "bg-gray-400",
  fillColor: "fill-gray-400",
};

type ImageUploadProps = {
  onChange: (url: string) => void;
}

export function ImageUploadMinio({ onChange }: ImageUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data;
  };

  const handleUpload = async () => {
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const item of filesToUpload) {
        const result = await uploadFile(item.File);
        onChange(result.url);
      }
      
      setUploadedFiles([]);
      setFilesToUpload([]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIconAndColor = (file: File) => {
    if (file.type.includes(FileTypes.Image)) {
      return {
        icon: <Icons.FileImage size={40} className={ImageColor.fillColor} />,
        color: ImageColor.bgColor,
      };
    }

    if (file.type.includes(FileTypes.Pdf)) {
      return {
        icon: <Icons.File size={40} className={PdfColor.fillColor} />,
        color: PdfColor.bgColor,
      };
    }

    if (file.type.includes(FileTypes.Audio)) {
      return {
        icon: <Icons.AudioWaveform size={40} className={AudioColor.fillColor} />,
        color: AudioColor.bgColor,
      };
    }

    if (file.type.includes(FileTypes.Video)) {
      return {
        icon: <Icons.Video size={40} className={VideoColor.fillColor} />,
        color: VideoColor.bgColor,
      };
    }

    return {
      icon: <Icons.FolderArchive size={40} className={OtherColor.fillColor} />,
      color: OtherColor.bgColor,
    };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    const fileProgresses = acceptedFiles.map((file) => ({
      progress: 0,
      File: file,
    }));
    setFilesToUpload(fileProgresses);
  }, []);

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = filesToUpload.filter((item) => item.File !== fileToRemove);
    setFilesToUpload(updatedFiles);
    setUploadedFiles(updatedFiles.map((item) => item.File));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
  });

  return (
    <div>
      <div>
        <label
          {...getRootProps()}
          className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="text-center">
            <div className="border p-2 rounded-md max-w-min mx-auto">
              <Icons.Upload size={20} />
            </div>

            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Drag files</span>
            </p>
            <p className="text-xs text-gray-500">
              Click to upload files (max 10MB)
            </p>
          </div>
        </label>

        <input {...getInputProps()} />
      </div>

      {filesToUpload.length > 0 && (
        <div>
          <ScrollArea className="h-40">
            <p className="font-medium my-2 mt-6 text-muted-foreground text-sm">
              Files to upload
            </p>
            <div className="space-y-2 pr-3">
              {filesToUpload.map((item) => {
                const { icon, color } = getFileIconAndColor(item.File);
                return (
                  <div
                    key={item.File.name}
                    className="flex justify-between gap-2 rounded-lg overflow-hidden border border-slate-100 group hover:pr-0 pr-2"
                  >
                    <div className="flex items-center flex-1 p-2">
                      <div className="text-white">{icon}</div>

                      <div className="w-full ml-2 space-y-1">
                        <div className="text-sm flex justify-between">
                          <p className="text-muted-foreground">
                            {item.File.name.slice(0, 25)}
                          </p>
                          <span className="text-xs">
                            {(item.File.size / 1024).toFixed(2)}KB
                          </span>
                        </div>
                        <ProgressBar progress={item.progress} className={color} />
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(item.File)}
                      className="bg-red-500 text-white transition-all items-center justify-center cursor-pointer px-2 hidden group-hover:flex"
                    >
                      <Icons.X size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <LoadingButton
            onClick={handleUpload}
            disabled={isUploading}
            loading={isUploading}
            className="w-full mt-4"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </LoadingButton>
        </div>
      )}
    </div>
  );
}
