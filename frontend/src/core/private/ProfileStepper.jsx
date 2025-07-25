import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, User, Book, Globe, FileText, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PersonalInfoStep from './profile-steps/PersonalInfoStep';
import EducationStep from './profile-steps/EducationStep';
import VisaStep from './profile-steps/VisaStep';
import EnglishTestStep from './profile-steps/EnglishTestStep';
import { updateProfile, getProfile } from '../../utils/profileHelper';
import { isAuthenticated } from '../../utils/authHelper';
import sanitizeInput from '../../utils/sanitizeInput';

// Profile image
import profileImage from '../../assets/profile-side-image.jpg';

const steps = [
    { id: 'Personal', icon: User, component: PersonalInfoStep, name: 'Personal' },
    { id: 'Education', icon: Book, component: EducationStep, name: 'Education' },
    { id: 'Visa', icon: Globe, component: VisaStep, name: 'Visa' },
    { id: 'English', icon: FileText, component: EnglishTestStep, name: 'English' },
];

const ProfileStepper = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const hasShownWelcome = useRef(false);
    const [formData, setFormData] = useState({
        // Personal info
        gender: '',
        address: '',
        city: '',
        date_of_birth: '',
        first_language: '',
        full_name: '',
        email: '',
        date_of_birth: '',

        // Education
        institution_name: '',
        field_of_study: '',
        highest_education_level: '',
        graduation_year: '',
        final_grade: '',
        currently_enrolled: false,
        graduation_status: false,

        // Visa
        visa_application_country: '',
        visa_type: '',
        currently_hold_a_visa: false,
        previous_visa_application: false,
        visa_refusal: false,
        visa_refusal_details: '',
        visa_history: [],

        // English Test
        english_test_type: '',
        english_test_scores: {
            listening: '',
            reading: '',
            writing: '',
            speaking: ''
        },
        test_date: '',
        has_taken_test: false,
        no_test_planned: false,

        // File paths
        education_transcript: '',
        english_transcript: ''
    });

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated()) {
                navigate('/login');
                return false;
            }
            return true;
        };

        const fetchProfile = async () => {
            if (!(await checkAuth())) return;

            try {
                const response = await getProfile();
                if (response && response.success && response.profile) {
                    const { profile } = response;

                    // Map the profile data to match the form structure
                    const mappedData = {
                        // Personal info
                        gender: profile.gender || '',
                        address: profile.address || '',
                        city: profile.city || '',
                        date_of_birth: profile.date_of_birth || '',
                        first_language: profile.first_language || '',
                        full_name: profile.full_name || '',
                        email: profile.email || '',
                        date_of_birth: profile.date_of_birth || '',

                        // Education
                        institution_name: profile.institution_name || '',
                        field_of_study: profile.field_of_study || '',
                        highest_education_level: profile.highest_education_level || '',
                        graduation_year: profile.graduation_year || '',
                        final_grade: profile.final_grade || '',
                        currently_enrolled: profile.currently_enrolled || false,
                        graduation_status: profile.graduation_status || false,

                        // Visa
                        visa_application_country: profile.visa_application_country || '',
                        visa_type: profile.visa_type || '',
                        currently_hold_a_visa: profile.currently_hold_a_visa || false,
                        previous_visa_application: profile.previous_visa_application || false,
                        visa_refusal: profile.visa_refusal || false,
                        visa_refusal_details: profile.visa_refusal_details || '',
                        visa_history: profile.visa_history || [],

                        // English Test
                        english_test_type: profile.english_test?.test_type || '',
                        english_test_scores: {
                            listening: profile.english_test?.listening || '',
                            reading: profile.english_test?.reading || '',
                            writing: profile.english_test?.writing || '',
                            speaking: profile.english_test?.speaking || ''
                        },
                        test_date: profile.english_test?.exam_date || '',
                        has_taken_test: !!(profile.english_test?.test_type),
                        no_test_planned: false, // Default value

                        // File paths
                        education_transcript: profile.education_transcript || '',
                        english_transcript: profile.english_test?.transcript || ''
                    };

                    setFormData(mappedData);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // Save form data to API
    const saveFormData = async (data) => {
        try {
            setIsSubmitting(true);
            await updateProfile(data);
            return true;
        } catch (error) {
            console.error('Error saving form data:', error);
            toast.error(error.message || 'Failed to save data');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async (e) => {
        if (e) e.preventDefault();

        // Save form data
        const success = await saveFormData(formData);
        if (success) {
            if (activeStep < steps.length - 1) {
                setActiveStep(prev => prev + 1);
            } else {
                // Show success toast
                toast.success('Profile updated successfully!');
                console.log('Profile update complete');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500); // Navigate to dashboard after 1.5 seconds
            }
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const success = await saveFormData(formData);
        if (success) {
            toast.success('Profile updated successfully!');
            console.log('Profile update complete');
            // Navigate to dashboard after 1.5 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        }
    };

    const handleChange = (e) => {
        // Check if the event has a target and name property
        if (!e || !e.target) {
            console.warn('Event or event target is undefined');
            return;
        }

        const { name, value, type, checked } = e.target;

        // Log a warning if name is missing but don't block the event
        if (!name) {
            console.warn('Input element is missing name attribute:', e.target);
            return;
        }

        // For text inputs, sanitize the value before updating state
        const sanitizedValue = (type === 'text' || type === 'textarea')
            ? sanitizeInput(value, { allowBasicFormatting: false, stripHtml: true })
            : value;

        setFormData(prev => {
            // Handle nested objects (e.g., english_test.reading)
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...(prev[parent] || {}),
                        [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(sanitizedValue) : sanitizedValue)
                    }
                };
            }

            // Handle date fields
            if (name === 'date_of_birth' || name === 'application_date' || name === 'exam_date') {
                return {
                    ...prev,
                    [name]: sanitizedValue ? new Date(sanitizedValue).toISOString().split('T')[0] : ''
                };
            }

            // Handle checkboxes
            if (type === 'checkbox') {
                return {
                    ...prev,
                    [name]: checked
                };
            }

            // Handle number inputs
            if (type === 'number') {
                return {
                    ...prev,
                    [name]: sanitizedValue === '' ? '' : Number(sanitizedValue)
                };
            }

            // Default case for text inputs
            return {
                ...prev,
                [name]: sanitizedValue
            };
        });
    };

    const renderStepContent = (step) => {
        const StepComponent = steps[step].component;
        return (
            <StepComponent
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
            />
        );
    };

    if (activeStep >= steps.length) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-lg shadow overflow-hidden p-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="mt-3 text-2xl font-medium text-gray-900">Application Submitted!</h2>
                        <p className="mt-2 text-gray-600">Thank you for submitting your application. We'll review your information and get back to you soon.</p>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setActiveStep(0)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Start New Application
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar className="fixed top-0 left-0 right-0 z-50" />

            {/* Main Content - Increased top padding to pt-24 */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {/* Top border highlight */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600"></div>

                    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-14rem)]">
                        {/* Left Side - Image - Slightly wider */}
                        <div className="lg:w-6/12 bg-gray-100">
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                                }}
                            />
                        </div>

                        {/* Right Side - Form with Stepper - Slightly narrower */}
                        <div className="lg:w-6/12 p-6 md:p-8 flex flex-col">
                            {/* Reduced top padding for stepper */}
                            <div className="pt-8">
                                {/* Centered Stepper */}
                                <div className="mb-8">
                                    <nav aria-label="Progress" className="flex justify-center">
                                        <ol role="list" className="flex items-center">
                                            {steps.map((step, stepIdx) => (
                                                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-16' : ''}`}>
                                                    {stepIdx < activeStep ? (
                                                        <>
                                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                                <div className="h-0.5 w-full bg-blue-600" />
                                                            </div>
                                                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-900">
                                                                {step.icon ? (
                                                                    <step.icon className="h-4 w-4 text-white" aria-hidden="true" />
                                                                ) : (
                                                                    <span className="text-sm font-medium text-white">{step.id}</span>
                                                                )}
                                                            </div>
                                                            <span className="mt-2 block text-xs font-medium text-gray-900">{step.name}</span>
                                                        </>
                                                    ) : stepIdx === activeStep ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                                    <div className="h-0.5 w-full bg-gray-200" />
                                                                </div>
                                                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                                                                    {step.icon ? (
                                                                        <step.icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                                                                    ) : (
                                                                        <span className="text-sm font-medium text-blue-600">{step.id}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="mt-2 text-xs font-medium text-blue-600">{step.name}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                                    <div className="h-0.5 w-full bg-gray-200" />
                                                                </div>
                                                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
                                                                    {step.icon ? (
                                                                        <step.icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                                                    ) : (
                                                                        <span className="text-sm font-medium text-gray-400">{step.id}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="mt-2 text-xs font-medium text-gray-500">{step.name}</span>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ol>
                                    </nav>
                                </div>

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    await handleNext();
                                }} className="flex-1 flex flex-col">
                                    <div className="flex-1">
                                        {renderStepContent(activeStep)}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100">
                                        <div className="flex justify-between">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                disabled={activeStep === 0}
                                                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${activeStep === 0 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'} transition-colors`}
                                            >
                                                <ChevronLeft className={`h-3.5 w-3.5 mr-1 ${activeStep === 0 ? 'text-gray-400' : 'text-gray-700'}`} />
                                                Back
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                                        Saving...
                                                    </>
                                                ) : activeStep === steps.length - 1 ? (
                                                    'Submit'
                                                ) : (
                                                    'Save & Continue'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProfileStepper;