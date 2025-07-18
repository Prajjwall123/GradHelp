// src/core/private/profile-steps/EnglishTestStep.jsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, FileText, Upload } from 'lucide-react';

const EnglishTestStep = ({ formData, handleChange, setFormData }) => {
    const [testType, setTestType] = useState(formData.english_test?.test_type || '');
    const [fileError, setFileError] = useState('');
    const [scores, setScores] = useState({
        reading: formData.english_test?.reading || '',
        writing: formData.english_test?.writing || '',
        speaking: formData.english_test?.speaking || '',
        listening: formData.english_test?.listening || ''
    });
    const [examDate, setExamDate] = useState(
        formData.english_test?.exam_date && formData.english_test.exam_date !== 'null'
            ? formData.english_test.exam_date.split('T')[0]
            : ''
    );
    const [dateError, setDateError] = useState('');

    const testTypes = [
        { id: 'ielts', name: 'IELTS' },
        { id: 'toefl', name: 'TOEFL iBT' },
        { id: 'pte', name: 'PTE Academic' },
        { id: 'duolingo', name: 'Duolingo English Test' },
        { id: 'other', name: 'Other' }
    ];

    const scoreLimits = {
        ielts: { min: 0, max: 9, step: 0.5 },
        toefl: { min: 0, max: 120, step: 1 },
        pte: { min: 10, max: 90, step: 1 },
        duolingo: { min: 10, max: 160, step: 5 },
        other: { min: 0, max: 100, step: 1 }
    };

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

        // Update form data with the file directly at the root level
        setFormData(prev => ({
            ...prev,
            english_test: {
                ...prev.english_test,
                // Keep other english_test fields
            },
            english_transcript: file  // Add file at root level
        }));
    };

    const handleScoreChange = (section, value) => {
        if (value !== '' && isNaN(parseFloat(value))) {
            return;
        }

        const newScores = {
            ...scores,
            [section]: value
        };
        setScores(newScores);

        // Update the form data with the new score
        handleChange({
            target: {
                name: `english_test.${section}`,
                value: value === '' ? null : parseFloat(value)
            }
        });
    };

    const handleTestTypeChange = (e) => {
        const value = e.target.value;
        setTestType(value);
        handleChange({
            target: {
                name: 'english_test.test_type',
                value: value || null
            }
        });
    };

    const handleExamDateChange = (e) => {
        const selectedDate = e.target.value;
        setExamDate(selectedDate);

        if (!selectedDate) {
            setDateError('');
            return;
        }

        const today = new Date();
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(today.getFullYear() - 2);

        const selectedDateObj = new Date(selectedDate);

        if (selectedDateObj > today) {
            setDateError('Exam date cannot be in the future');
            return;
        }

        if (selectedDateObj < twoYearsAgo) {
            setDateError('Exam date cannot be more than 2 years ago');
            return;
        }

        setDateError('');

        // Update the form data
        setFormData(prev => ({
            ...prev,
            english_test: {
                ...prev.english_test,
                exam_date: selectedDateObj.toISOString()
            }
        }));
    };

    const renderScoreInputs = () => {
        if (!testType) return null;

        const sections = testType === 'other'
            ? []
            : ['reading', 'writing', 'speaking', 'listening'];

        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Test Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sections.map((section) => (
                        <div key={section} className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 capitalize">
                                {section} Score
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    value={scores[section] || ''}
                                    onChange={(e) => handleScoreChange(section, e.target.value)}
                                    min={scoreLimits[testType]?.min || 0}
                                    max={scoreLimits[testType]?.max || 100}
                                    step={scoreLimits[testType]?.step || 1}
                                    className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={`${scoreLimits[testType]?.min || 0}-${scoreLimits[testType]?.max || 100}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">English Language Test</h2>
                <p className="text-sm text-gray-500">Share your English language test results (if any)</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                    {/* Test Type */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Test Type</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                name="test_type"
                                value={testType}
                                onChange={handleTestTypeChange}
                                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select test type</option>
                                {testTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Exam Date */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="exam_date"
                                value={examDate || ''}
                                onChange={handleExamDateChange}
                                max={new Date().toISOString().split('T')[0]}
                                className={`block w-full pl-10 pr-3 py-2 text-sm border ${dateError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                            />
                        </div>
                        {dateError ? (
                            <p className="mt-1 text-xs text-red-600">{dateError}</p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500">
                                Must be within the last 2 years and not in the future
                            </p>
                        )}
                    </div>

                    {/* Test Scores */}
                    {testType && renderScoreInputs()}

                    {/* English Test Transcript Upload */}
                    <div className="space-y-1.5 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700">English Test Transcript</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label
                                        htmlFor="english_test_transcript"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                    >
                                        <div className="flex items-center">
                                            <Upload className="h-4 w-4 mr-1" />
                                            <span>Upload Transcript</span>
                                        </div>
                                        <input
                                            id="english_test_transcript"
                                            name="english_test_transcript"
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
                                {formData.english_transcript && (
                                    <p className="text-sm text-green-600">
                                        {formData.english_transcript.name || 'File selected'}
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
        </div>
    );
};

export default EnglishTestStep;