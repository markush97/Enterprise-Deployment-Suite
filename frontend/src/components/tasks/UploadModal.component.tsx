import { useRef, useState } from "react";

export function UploadDropzone({ isUploading, uploadError, onUpload }: {
    isUploading: boolean;
    uploadError: string | null;
    onUpload: (file: File, onSuccess?: () => void) => void;
}) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.zip')) {
                setSelectedFile(file);
                // Manually set the file input's files for form validity
                if (inputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    inputRef.current.files = dataTransfer.files;
                }
            } else {
                setSelectedFile(null);
                alert('Only .zip files are allowed.');
            }
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
            const file = e.target.files[0];
            if (file.name.endsWith('.zip')) {
                setSelectedFile(file);
            } else {
                setSelectedFile(null);
                alert('Only .zip files are allowed.');
            }
        }
    };
    const handleClick = () => {
        inputRef.current?.click();
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            setUploading(true);
            await onUpload(selectedFile, () => {
                setSelectedFile(null);
            });
            setUploading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 mb-4 transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'}`}
                onClick={e => {
                    // Only trigger file dialog if not disabled
                    if (!(isUploading || uploading)) handleClick();
                }}
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
                    disabled={isUploading || uploading}
                    onChange={handleFileChange}
                    tabIndex={-1} // Prevent browser from trying to focus hidden input
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60 flex items-center justify-center"
                disabled={isUploading || uploading || !selectedFile}
            >
                {(isUploading || uploading) && (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {isUploading || uploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
}
