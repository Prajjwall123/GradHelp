// src/core/private/profile-steps/CompletionStep.jsx
import React from 'react';
import { CheckCircle, Clock, Mail, Phone, MapPin, BookOpen, Globe, FileText, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompletionStep = ({ formData }) => {
    const navigate = useNavigate();

    // Calculate completion percentage
    const calculateCompletion = () => {
        let completedFields = 0;
        const totalFields = 20; // Adjust based on your form fields

        // Basic personal info
        if (formData.fullName) completedFields += 1;
        if (formData.email) completedFields += 1;
        if (formData.phone) completedFields += 1;
        if (formData.address) completedFields += 1;

        // Education
        if (formData.educationLevel) completedFields += 1;
        if (formData.institution) completedFields += 1;

        // Visa
        if (formData.visaStatus) completedFields += 1;

        // English test
        if (formData.englishTest?.testType) completedFields += 1;

        // Documents
        if (formData.documents?.passport) completedFields += 1;
        if (formData.documents?.academicTranscripts) completedFields += 1;

        // Add more fields as needed

        return Math.round((completedFields / totalFields) * 100);
    };

    const completionPercentage = calculateCompletion();

    const getCompletionStatus = () => {
        if (completionPercentage < 50) return 'Basic Profile';
        if (completionPercentage < 80) return 'Almost Complete';
        return 'Complete';
    };

    const getNextSteps = () => {
        const steps = [];

        if (!formData.englishTest?.testType) {
            steps.push({
                title: 'Add English Test Scores',
                description: 'Required for university applications',
                icon: <BookOpen className="h-5 w-5 text-blue-500" />,
                action: () => navigate('/profile?step=4')
            });
        }

        if (!formData.documents?.passport) {
            steps.push({
                title: 'Upload Passport',
                description: 'Required for application processing',
                icon: <FileText className="h-5 w-5 text-blue-500" />,
                action: () => navigate('/profile?step=5')
            });
        }

        if (!formData.visaStatus) {
            steps.push({
                title: 'Complete Visa Information',
                description: 'Help us understand your visa requirements',
                icon: <Globe className="h-5 w-5 text-blue-500" />,
                action: () => navigate('/profile?step=3')
            });
        }

        if (steps.length === 0) {
            steps.push({
                title: 'Start University Applications',
                description: 'Your profile is ready for university applications',
                icon: <UserCheck className="h-5 w-5 text-green-500" />,
                action: () => navigate('/applications')
            });
        }

        return steps;
    };

    const nextSteps = getNextSteps();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
                <div className="relative inline-block">
                    <div className="relative">
                        <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
                            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-bold text-green-600">
                                    {completionPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Profile {getCompletionStatus()}
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                    {completionPercentage === 100
                        ? "Congratulations! Your profile is complete and ready for university applications."
                        : "You're making great progress! Complete the next steps to finish your profile."}
                </p>

                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Profile Summary
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Overview of your profile information
                        </p>
                    </div>

                    <div className="border-t border-gray-200">
                        <dl>
                            {/* Personal Information */}
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
                                    Personal Information
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <span className="font-medium">{formData.fullName || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Mail className="h-4 w-4 mr-1" />
                                            {formData.email || 'No email provided'}
                                        </div>
                                        {formData.phone && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Phone className="h-4 w-4 mr-1" />
                                                {formData.phone}
                                            </div>
                                        )}
                                        {formData.address && (
                                            <div className="flex items-start text-sm text-gray-500">
                                                <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                                <span>{formData.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </dd>
                            </div>

                            {/* Education */}
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                                    Education
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {formData.educationLevel || formData.institution ? (
                                        <div className="space-y-1">
                                            {formData.educationLevel && (
                                                <div>
                                                    <span className="font-medium">Level: </span>
                                                    {formData.educationLevel}
                                                </div>
                                            )}
                                            {formData.institution && (
                                                <div>
                                                    <span className="font-medium">Institution: </span>
                                                    {formData.institution}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Not provided</span>
                                    )}
                                </dd>
                            </div>

                            {/* English Test */}
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Globe className="h-5 w-5 mr-2 text-blue-500" />
                                    English Proficiency
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {formData.englishTest?.testType ? (
                                        <div>
                                            <div>
                                                <span className="font-medium">Test: </span>
                                                {formData.englishTest.testType}
                                            </div>
                                            {formData.englishTest.overallScore && (
                                                <div>
                                                    <span className="font-medium">Score: </span>
                                                    {formData.englishTest.overallScore}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-yellow-600">Not provided (may be required for applications)</span>
                                    )}
                                </dd>
                            </div>

                            {/* Documents */}
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                                    Documents
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <CheckCircle
                                                className={`h-5 w-5 mr-2 ${formData.documents?.passport ? 'text-green-500' : 'text-gray-300'
                                                    }`}
                                            />
                                            <span>Passport</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle
                                                className={`h-5 w-5 mr-2 ${formData.documents?.academicTranscripts ? 'text-green-500' : 'text-gray-300'
                                                    }`}
                                            />
                                            <span>Academic Transcripts</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle
                                                className={`h-5 w-5 mr-2 ${formData.documents?.recommendationLetters ? 'text-green-500' : 'text-gray-300'
                                                    }`}
                                            />
                                            <span>Recommendation Letters</span>
                                        </div>
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Next Steps */}
                {nextSteps.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {nextSteps.map((step, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={step.action}
                                            className="block hover:bg-gray-50 w-full text-left"
                                        >
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center">
                                                    <div className="min-w-0 flex-1 flex items-center">
                                                        <div className="flex-shrink-0">
                                                            {step.icon}
                                                        </div>
                                                        <div className="min-w-0 flex-1 px-4">
                                                            <div>
                                                                <p className="text-sm font-medium text-blue-600 truncate">
                                                                    {step.title}
                                                                </p>
                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    {step.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <svg
                                                            className="h-5 w-5 text-gray-400"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompletionStep;