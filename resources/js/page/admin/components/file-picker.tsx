import { FileUp, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { useAdminDashboardContext } from '../bloc/useAdminContext';

/** Dépôt de document : cadre pointillé neutre, aucune icône colorée. */
const FilePicker: React.FC = () => {
    const {
        handleCancel,
        onDrop,
        handleFileChange,
        fileInputRef,
        selectedFile,
        fileSize,
    } = useAdminDashboardContext();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                [],
        },
    });

    return (
        <div className="w-full space-y-3">
            <div {...getRootProps()}>
                <label
                    htmlFor="file-upload"
                    className={`border-input hover:border-muted-foreground flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 text-center ${
                        isDragActive ? 'border-foreground bg-muted' : ''
                    }`}
                >
                    <FileUp
                        className="text-muted-foreground size-6"
                        aria-hidden="true"
                    />
                    <p className="text-muted-foreground text-sm">
                        {isDragActive
                            ? 'Déposez votre fichier'
                            : 'Glissez un fichier ici, ou cliquez pour parcourir'}
                    </p>
                    <p className="admin-meta">PDF, DOC ou DOCX</p>
                </label>

                <input
                    {...getInputProps()}
                    className="hidden"
                    type="file"
                    id="file-upload"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>

            {selectedFile && (
                <div className="border-border flex items-center justify-between gap-3 border px-3 py-2">
                    <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                            {selectedFile.name}
                        </p>
                        <p className="admin-mono text-muted-foreground">
                            {fileSize} Mo
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        aria-label="Retirer le fichier"
                        className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center"
                    >
                        <X className="size-4" aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilePicker;
