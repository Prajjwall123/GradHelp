// src/core/private/profile-steps/DocumentsStep.jsx
import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const DOCUMENT_TYPES = {
    passport: {
        name: 'Passport',
        description: 'A clear copy of your passport information page',
        required: true,
        accept: 'image/*,.pdf',
        maxSize: 5 * 1024 * 1024, // 5MB
    },
    academicTranscripts: {
        name: 'Academic Transcripts',
        description: 'Official transcripts from all institutions attended',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        maxSize: 10 * 1024 * 1024, // 10MB
    },
    recommendationLetters: {
        name: 'Recommendation Letters',
        description: 'At least two academic or professional references',
        required: false,
        accept: '.pdf,.doc,.docx',
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true,
    },
    resume: {
        name: 'Resume/CV',
        description: 'Your updated resume or curriculum vitae',
        required: false,
        accept: '.pdf,.doc,.docx',
        maxSize: 5 * 1024 * 1024, // 5MB
    },
    personalStatement: {
        name: 'Personal Statement',
        description: 'A statement of purpose or letter of motivation',
        required: true,
        accept: '.pdf,.doc,.docx',
        maxSize: 5 * 1024 * 1024, // 5MB
    },
};

const DocumentsStep = ({ formData, handleChange }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState({});

    const handleFileChange = useCallback((field, files) => {
        const file = files[0];
        const config = DOCUMENT_TYPES[field];

        if (!file) return;

        // Validate file type
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const acceptedTypes = config.accept.split(',').map(ext => ext.replace('.', ''));

        if (!acceptedTypes.some(type => file.type.includes(type) || fileExtension === type)) {
            setErrors(prev => ({
                ...prev,
                [field]: `Invalid file type. Accepted formats: ${config.accept}`
            }));
            return;
        }

        // Validate file size
        if (file.size > config.maxSize) {
            const maxSizeMB = config.maxSize / (1024 * 1024);
            setErrors(prev => ({
                ...prev,
                [field]: `File too large. Maximum size: ${maxSizeMB}MB`
            }));
            return;
        }

        // Clear any previous errors
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });

        // Simulate upload progress
        setUploading(true);
        setUploadProgress(prev => ({ ...prev, [field]: 0 }));

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                newProgress[field] = Math.min(prev[field] + 10, 90);
                return newProgress;
            });
        }, 100);

        // Simulate API call
        setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(prev => {
                const newProgress = { ...prev, [field]: 100 };
                return newProgress;
            });

            setTimeout(() => {
                handleChange({
                    target: {
                        name: `documents.${field}`,
                        value: config.multiple
                            ? [...(formData.documents?.[field] || []), file]
                            : file
                    }
                });
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[field];
                    return newProgress;
                });
                setUploading(false);
            }, 500);
        }, 2000);
    }, [formData.documents, handleChange]);

    const removeFile = (field, index) => {
        if (DOCUMENT_TYPES[field].multiple) {
            const updatedFiles = [...(formData.documents?.[field] || [])];
            updatedFiles.splice(index, 1);
            handleChange({
                target: {
                    name: `documents.${field}`,
                    value: updatedFiles
                }
            });
        } else {
            handleChange({
                target: {
                    name: `documents.${field}`,
                    value: null
                }
            });
        }
    };

    const renderFilePreview = (field, file, index) => {
        const isImage = file.type.startsWith('image/');
        const progress = uploadProgress[field];
        const isUploading = progress !== undefined;

        return (
            <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
                <div className="flex items-center space-x-3">
                    {isImage ? (
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="h-10 w-10 object-cover rounded"
                        />
                    ) : (
                        <FileText className="h-10 w-10 text-gray-400" />
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isUploading ? (
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <button
                        type="button"
                        onClick={() => removeFile(field, index)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={isUploading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    };

    const renderUploadArea = (field, config) => {
        const files = formData.documents?.[field] || [];
        const multiple = config.multiple;
        const hasFiles = multiple ? files.length > 0 : files;
        const isUploading = uploadProgress[field] !== undefined;

        return (
            <div
                key={field}
                className={`p-4 rounded-lg border-2 border-dashed ${errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    } transition-colors`}
            >
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-blue-50">
                            <Upload className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">
                            {config.name} {config.required && <span className="text-red-500">*</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {multiple
                                ? 'Multiple files accepted'
                                : 'Single file only'}
                        </p>
                        <div className="mt-4">
                            <label
                                htmlFor={`file-upload-${field}`}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Choose File'
                                )}
                            </label>
                            <input
                                id={`file-upload-${field}`}
                                name={field}
                                type="file"
                                className="sr-only"
                                accept={config.accept}
                                multiple={config.multiple}
                                onChange={(e) => handleFileChange(field, Array.from(e.target.files))}
                                disabled={isUploading || (!multiple && hasFiles)}
                            />
                        </div>
                    </div>
                </div>

                {errors[field] && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[field]}
                    </div>
                )}

                {hasFiles && (
                    <div className="mt-4 space-y-2">
                        {multiple ? (
                            files.map((file, index) => renderFilePreview(field, file, index))
                        ) : (
                            renderFilePreview(field, files, 0)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Required Documents</h2>
                <p className="text-gray-600">
                    Please upload the following documents to complete your application
                </p>
            </div>

            <div className="space-y-6">
                {Object.entries(DOCUMENT_TYPES).map(([field, config]) => (
                    renderUploadArea(field, config)
                ))}

                <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Uploading...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentsStep;