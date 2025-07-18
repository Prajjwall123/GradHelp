import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, Calendar, ExternalLink, GraduationCap, Clock, CreditCard, X, Award } from 'lucide-react';
import { getCourseById } from '../../utils/coursesHelper';
import { getScholarshipsByUniversityId, applyForScholarship } from '../../utils/scholarshipHelper';
import { isAuthenticated, getUserInfo } from '../../utils/authHelper';
import { createApplicationAndInitiatePayment } from '../../utils/paymentHelper';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import { toast } from 'react-toastify';

const ApplicationModal = ({ course, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIntake, setSelectedIntake] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const steps = [
    { id: 'intake', title: 'Pick Intake' },
    { id: 'requirements', title: 'Entry Requirements' },
    { id: 'terms', title: 'Terms & Conditions' },
    { id: 'payment', title: 'Application Fee' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (currentStep === steps.length - 1 && !paymentCompleted) {
      toast.error('Please complete the payment first');
      return;
    }

    if (currentStep === 0 && !selectedIntake) {
      toast.error('Please select an intake');
      return;
    }

    if (currentStep === steps.length - 1) {
      onSubmit({
        intake: selectedIntake,
        course: course.course_name,
        university: course.university?.name,
        requirements: course.entry_requirements,
        terms: course.terms_and_conditions
      });
      onClose();
    } else {
      handleNext();
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError('');

      // Store course ID and intake in localStorage before redirecting
      if (!course?._id) {
        throw new Error('Course ID not found');
      }
      localStorage.setItem('application_course_id', course._id);
      localStorage.setItem('application_intake', selectedIntake);

      // Create application and initiate payment
      const paymentResponse = await createApplicationAndInitiatePayment(1000, course._id, selectedIntake);

      if (paymentResponse.success) {
        // Close the modal
        onClose();

        // Redirect to payment URL in same tab
        window.location.href = paymentResponse.data.payment_url;
      } else {
        throw new Error(paymentResponse.message || 'Failed to create application and initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Failed to create application and initiate payment');
      toast.error(paymentError);
      // Clean up localStorage on error
      localStorage.removeItem('application_course_id');
      localStorage.removeItem('application_intake');
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Select Intake</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedIntake}
              onChange={(e) => setSelectedIntake(e.target.value)}
            >
              <option value="">Select an intake</option>
              {course.intake?.map((intake, index) => (
                <option key={index} value={intake}>
                  {intake}
                </option>
              ))}
            </select>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Entry Requirements</h3>
            <ul className="space-y-2">
              {course.entry_requirements?.map((req, index) => (
                <li key={index} className="flex items-start">
                  <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Terms and Conditions</h3>
            <div className="max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-md text-sm">
              {course.terms_and_conditions?.map((term, index) => (
                <p key={index} className="mb-2">
                  {index + 1}. {term}
                </p>
              ))}
            </div>
            <div className="flex items-start mt-4">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms-checkbox" className="ml-2 block text-sm text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Application Fee Payment</h3>
            <p className="text-gray-600">Please complete the payment of your application fee to proceed.</p>
            {paymentError && (
              <div className="text-red-500 text-sm mb-2">{paymentError}</div>
            )}
            <div className="mt-4">
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${paymentLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm`}
              >
                {paymentLoading ? 'Processing...' : 'Make Payment'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">New Application</h2>
                <p className="text-sm text-gray-500">{course.course_name} - {course.university?.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper */}
            <div className="mb-6 mt-4">
              <div className="flex justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`text-xs mt-1 ${currentStep >= index ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                <div
                  className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            {renderStepContent()}
          </div>

          {/* Footer Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${currentStep === steps.length - 1
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                } text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              {currentStep === steps.length - 1 ? 'Make Payment' : 'Next'}
            </button>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScholarshipApplicationModal = ({ scholarship, course, onClose, onSuccess }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = getUserInfo();

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      setIsSubmitting(true);
      await applyForScholarship(scholarship._id, currentUser._id);
      toast.success('Scholarship application submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error applying for scholarship:', error);
      const errorMessage = error.response?.data?.message || 'Failed to apply for scholarship';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Apply for {scholarship.scholarship_name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Scholarship Details</h3>
              <p className="mt-1 text-sm text-blue-700">
                {scholarship.amount_per_year
                  ? `Amount: AUD $${scholarship.amount_per_year.toLocaleString()} per year`
                  : 'Amount: Varies'}
              </p>
              {scholarship.terms_and_conditions && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-blue-800">Requirements:</h4>
                  <p className="text-xs text-blue-700">{scholarship.terms_and_conditions}</p>
                </div>
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              <h4 className="font-medium text-gray-900">Terms and Conditions</h4>
              <div className="mt-2 text-sm text-gray-600 space-y-2">
                <p>By applying for this scholarship, you agree to the following terms:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You meet all the eligibility criteria specified for this scholarship</li>
                  <li>All information provided in your application is accurate and complete</li>
                  <li>You understand that scholarship decisions are final and at the discretion of the university</li>
                  <li>You may be required to provide additional documentation to verify your eligibility</li>
                  <li>The scholarship may be revoked if any information provided is found to be false</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to the terms and conditions
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !agreedToTerms}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </>
                ) : 'Apply for Scholarship'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scholarships, setScholarships] = useState([]);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [appliedScholarships, setAppliedScholarships] = useState([]);
  const currentUser = getUserInfo();

  // Function to handle authentication check and redirect
  const handleAuthRequired = (e, action) => {
    e?.preventDefault();
    if (!isAuthenticated()) {
      const redirectPath = `/login?redirect=${encodeURIComponent(location.pathname)}`;
      toast.info('Please login to continue');
      navigate(redirectPath);
      return false;
    }
    return true;
  };

  // Handle scholarship details click
  const handleViewDetails = (e, scholarshipName) => {
    if (handleAuthRequired(e)) {
      console.log('View details for:', scholarshipName);
    }
  };

  // Handle apply now click
  const handleApplyNow = (e) => {
    if (handleAuthRequired(e)) {
      setShowApplicationModal(true);
    }
  };

  // Handle application submission
  const handleApplicationSubmit = async (applicationData) => {
    try {
      const result = await createApplicationAndInitiatePayment(1000, course._id, applicationData.intake);
      console.log('Application created:', result);

      toast.success('Application created successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Close the modal
      setShowApplicationModal(false);

      // Redirect to my-applications page after a short delay
      setTimeout(() => {
        navigate('/my-applications');
      }, 1000);

    } catch (error) {
      console.error('Error creating application:', error);

      toast.error(error.response?.data?.message || 'Failed to create application. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const handleScholarshipApply = (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowScholarshipModal(true);
  };

  const handleScholarshipApplied = () => {
    setAppliedScholarships(prev => [...prev, selectedScholarship._id]);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const courseData = await getCourseById(id);
        setCourse(courseData);
        console.log('Course data:', courseData); // Debug log

        // Fetch scholarships for the university
        if (courseData.university?._id) {
          console.log('Fetching scholarships for university:', courseData.university._id);
          await fetchScholarships(courseData.university._id);
        } else {
          console.log('No university ID found in course data');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const fetchScholarships = async (universityId) => {
    if (!universityId) return;

    setIsLoadingScholarships(true);
    try {
      const response = await getScholarshipsByUniversityId(universityId);
      console.log('Scholarships response:', response); // Debug log

      // The response is already the scholarships array
      const scholarshipsData = Array.isArray(response) ? response : [];

      console.log('Extracted scholarships:', scholarshipsData); // Debug log
      setScholarships(scholarshipsData);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      toast.error('Failed to load scholarships');
      setScholarships([]);
    } finally {
      setIsLoadingScholarships(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mt-8"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline flex items-center justify-center mx-auto"
            >
              <ArrowLeft size={16} className="mr-1" />
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar className="fixed top-0 w-full z-50" />
      <Chatbot />
      {/* Main Content */}
      <div className="flex-1 pt-26">
        <div className="container mx-auto px-4">
          {/* Course Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                {course.university?.photo && (
                  <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                    <img
                      src={`http://localhost:3000${course.university.photo}`}
                      alt={`${course.university.name} logo`}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjcyN0UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmFkdWF0aW9uLWNhcCI+PHBhdGggZD0ibTggMTQgMiAyIDQtNCIvPjxwYXRoIGQ9Ik0yMiAxMGMwIDYtNCAxMC0xMCAxMFMyIDIxLjMgMiAxMy44VjVhMiAyIDAgMCAxIDItMmg0Ii8+PHBhdGggZD0i0xNCAyYzAgNCAyLjUgOCA0LjUgMTAgMS4zLTEuMyAyLTMuNyAyLTYiLz48cGF0aCBkPSJNMTguMjIgMTIuMjNhMyAxIDAgMSAwIC0uMjItMS45OSIvPjwvc3ZnPg==';
                      }}
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{course.course_name || 'N/A'}</h1>
                  <p className="text-gray-600 mt-1">{course.university?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleApplyNow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column */}
              <div className="lg:w-2/3">
                {/* About Course */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About this course</h2>
                  <div className="prose max-w-none text-gray-600">
                    <p>{course.about || 'N/A'}</p>
                  </div>
                </div>

                {/* Entry Requirements */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Entry Requirements</h2>
                  <ul className="space-y-3">
                    {course.entry_requirements?.length > 0 ? (
                      course.entry_requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{req}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No entry requirements available</li>
                    )}
                  </ul>
                </div>

                {/* Modules */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Modules</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.modules?.length > 0 ? (
                      course.modules.map((module, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <BookOpen size={16} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{module}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No module information available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:w-1/3 space-y-6">
                {/* Scholarships */}
                {scholarships.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Available Scholarships</h3>
                    <div className="space-y-4">
                      {scholarships.map((scholarship) => (
                        <div key={scholarship._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{scholarship.scholarship_name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {scholarship.amount_per_year
                                  ? `AUD $${scholarship.amount_per_year.toLocaleString()} per year`
                                  : 'Amount varies'}
                              </p>
                              {scholarship.terms_and_conditions && (
                                <p className="text-xs text-gray-500 mt-2">
                                  <span className="font-medium">Requirements:</span> {scholarship.terms_and_conditions}
                                </p>
                              )}
                            </div>
                            {appliedScholarships.includes(scholarship._id) ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => handleScholarshipApply(scholarship)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Facts */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-800 p-4">
                    <h3 className="text-lg font-semibold text-white">Course Details</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <GraduationCap size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="text-gray-900 font-medium capitalize">{course.course_level || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <Clock size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-gray-900 font-medium">{course.course_duration || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <Calendar size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Intake</p>
                        <p className="text-gray-900 font-medium">
                          {Array.isArray(course.intake) && course.intake.length > 0
                            ? course.intake.join(', ')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <CreditCard size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tuition Fee</p>
                        <p className="text-gray-900 font-medium">{formatCurrency(course.course_tuition)} per year</p>
                        <p className="text-xs text-gray-500">
                          {course.application_fee ? `Application fee: ${formatCurrency(course.application_fee)}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* University Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="font-medium text-gray-900 mb-3">Offered by</h3>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                      {course.university?.photo ? (
                        <img
                          src={`http://localhost:3000${course.university.photo}`}
                          alt={`${course.university.name} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjcyN0UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmFkdWF0aW9uLWNhcCI+PHBhdGggZD0ibTggMTQgMiAyIDQtNCIvPjxwYXRoIGQ9Ik0yMiAxMGMwIDYtNCAxMC0xMCAxMFMyIDIxLjMgMiAxMy44VjVhMiAyIDAgMCAxIDItMmg0Ii8+PHBhdGggZD0i0xNCAyYzAgNCAyLjUgOCA0LjUgMTAgMS4zLTEuMyAyLTMuNyAyLTYiLz48cGF0aCBkPSJNMTguMjIgMTIuMjNhMyAxIDAgMSAwIC0uMjItMS45OSIvPjwvc3ZnPg==';
                          }}
                        />
                      ) : (
                        <GraduationCap size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{course.university?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{course.university?.location || 'N/A'}</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (course.university?._id) {
                            window.open(`/university/${course.university._id}`, '_blank', 'noopener,noreferrer');
                          } else {
                            // toast.error('University information not available');
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm mt-1 inline-flex items-center transition-colors"
                        aria-label={`View ${course.university?.name || 'university'} details`}
                      >
                        View university <ExternalLink size={14} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer className="mt-auto" />

      {/* Application Modal */}
      {showApplicationModal && course && (
        <ApplicationModal
          course={course}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}

      {/* Scholarship Application Modal */}
      {showScholarshipModal && selectedScholarship && (
        <ScholarshipApplicationModal
          scholarship={selectedScholarship}
          course={course}
          onClose={() => setShowScholarshipModal(false)}
          onSuccess={handleScholarshipApplied}
        />
      )}
    </div>
  );
};

export default CourseDetail;
