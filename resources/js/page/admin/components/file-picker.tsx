import { useDropzone } from 'react-dropzone';
import { FaFile } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

import { useAdminDashboardContext } from '../bloc/useAdminContext';

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
        <div className="flex w-full flex-col items-center">
            <div {...getRootProps()} className="flex w-full flex-col">
                <div className="flex transform justify-center rounded-2xl border-2 border-dashed border-green-700 bg-gray-100 transition-all duration-300 dark:bg-zinc-800">
                    <label
                        htmlFor="file-upload"
                        className="mx-10 my-5 flex w-full cursor-pointer flex-col items-center justify-center border-0 p-2"
                    >
                        <FaFile className="m-10 flex text-7xl text-green-700" />
                        <p className="py-5 text-center text-lg">
                            {' '}
                            {isDragActive
                                ? 'Deposer votre fichier'
                                : 'Glisser et deposer votre fichier ou cliquer ici'}{' '}
                        </p>
                    </label>
                </div>
                <input
                    {...getInputProps()}
                    className="hidden"
                    type="file"
                    id="file-upload"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                {selectedFile && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
                        Fichier selectionne :{' '}
                        <p className="font-bold">{selectedFile.name}</p> (
                        {fileSize} Mo)
                        {selectedFile && (
                            <button
                                className="cursor-pointer rounded-sm border-0 bg-red-600 hover:bg-red-900"
                                onClick={handleCancel}
                            >
                                <p className="px-4 py-2 font-bold text-white">
                                    {' '}
                                    <MdDelete />
                                </p>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilePicker;
