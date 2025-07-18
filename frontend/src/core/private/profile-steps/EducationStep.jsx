// src/core/private/profile-steps/EducationStep.jsx
import React, { useState } from 'react';
import { GraduationCap, BookOpen, Award, FileText, Upload } from 'lucide-react';

const EducationStep = ({ formData, handleChange, setFormData }) => {
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const fileType = file.type;

        if (!validTypes.includes(fileType)) {
            setFileError('Please upload a PDF, DOC, or DOCX file');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setFileError('File size should not exceed 10MB');
            return;
        }

        setFileError('');

        // Update form data with the file
        setFormData(prev => ({
            ...prev,
            education_transcript: file
        }));
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Education Information</h2>
                <p className="text-sm text-gray-500">Provide your academic details</p>
            </div>

            <div className="space-y-4">
                {/* Highest Education Level */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Highest Education Level</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            name="highest_education_level"
                            value={formData.highest_education_level || ''}
                            onChange={handleChange}
                            className="appearance-none block w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select highest education level</option>
                            <option value="High School">High School</option>
                            <option value="Bachelors">Bachelor's Degree</option>
                            <option value="Masters">Master's Degree</option>
                            <option value="PhD">PhD/Doctorate</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Institution Name */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="institution_name"
                            value={formData.institution_name || ''}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter institution name"
                            required
                        />
                    </div>
                </div>

                {/* Field of Study */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Award className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="field_of_study"
                            value={formData.field_of_study || ''}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter field of study"
                            required
                        />
                    </div>
                </div>

                {/* Graduation Year and Currently Enrolled */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                        <div className="relative rounded-md shadow-sm">
                            <input
                                type="number"
                                name="graduation_year"
                                value={formData.graduation_year || ''}
                                onChange={handleChange}
                                min="1900"
                                max={new Date().getFullYear() + 5}
                                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 2023"
                                required={!formData.currently_enrolled}
                                disabled={formData.currently_enrolled}
                            />
                        </div>
                    </div>
                    <div className="flex items-end space-x-2">
                        <div className="flex items-center h-5">
                            <input
                                id="currently_enrolled"
                                name="currently_enrolled"
                                type="checkbox"
                                checked={formData.currently_enrolled || false}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>
                        <label htmlFor="currently_enrolled" className="text-sm font-medium text-gray-700">
                            Currently Enrolled
                        </label>
                    </div>
                </div>

                {/* Final Grade */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Final Grade</label>
                    <div className="relative rounded-md shadow-sm">
                        <select
                            name="final_grade"
                            value={formData.final_grade || ''}
                            onChange={handleChange}
                            className="appearance-none block w-full pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            required={!formData.currently_enrolled}
                            disabled={formData.currently_enrolled}
                        >
                            <option value="">Select final grade</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="D+">D+</option>
                            <option value="D">D</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Education Transcript Upload */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Education Transcript</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-600 justify-center">
                                <label
                                    htmlFor="education_transcript"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                    <div className="flex items-center">
                                        <Upload className="h-4 w-4 mr-1" />
                                        <span>Upload a file</span>
                                    </div>
                                    <input
                                        id="education_transcript"
                                        name="education_transcript"
                                        type="file"
                                        className="sr-only"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX up to 10MB
                            </p>
                            {formData.education_transcript && (
                                <p className="text-sm text-green-600">
                                    {formData.education_transcript.name || 'File selected'}
                                </p>
                            )}
                            {fileError && (
                                <p className="text-sm text-red-600">{fileError}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationStep;