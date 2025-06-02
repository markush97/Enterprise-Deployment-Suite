import { useRef, useState } from "react";

export function UploadDropzone({ isUploading, uploadError, onUpload }: {
    isUploading: boolean;
    uploadError: string | null;
    onUpload: (file: File) => void;
}) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };
    const handleClick = () => {
        inputRef.current?.click();
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 mb-4 transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'}`}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                tabIndex={0}
                role="button"
                aria-label="Upload file by clicking or dragging"
            >
                <input
                    ref={inputRef}
                    type="file"
                    name="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    className="hidden"
                    required
                    disabled={isUploading}
                    onChange={handleFileChange}
                />
                <svg className="w-10 h-10 mb-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                    {selectedFile ? (
                        <span className="font-medium">{selectedFile.name}</span>
                    ) : (
                        <>Click or drag a <span className="font-semibold">.zip</span> file here to upload</>
                    )}
                </span>
            </div>
            {uploadError && <div className="text-red-600 mb-2">{uploadError}</div>}
            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
                disabled={isUploading || !selectedFile}
            >
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
}
