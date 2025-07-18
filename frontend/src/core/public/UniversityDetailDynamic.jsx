import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Award, Users, Globe, BookOpen, Check, Calendar, ExternalLink, DollarSign, Percent } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import { getUniversityById } from '../../utils/universityHelper';
import { getCourseById } from '../../utils/coursesHelper';
import { getScholarshipsByUniversityId } from '../../utils/scholarshipHelper';
import API from '../../utils/api';

const UniversityDetailDynamic = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [programs, setPrograms] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

    // Fetch university data
    const { data: university, isLoading, error } = useQuery({
        queryKey: ['university', id],
        queryFn: () => getUniversityById(id),
        onError: (error) => {
            console.error('Error fetching university:', error);
            toast.error('Failed to load university details. Please try again later.');
        },
        retry: 2,
    });

    // Fetch courses and scholarships when university data is loaded
    useEffect(() => {
        if (university) {
            // Fetch courses
            if (university.courses?.length) {
                setIsLoadingPrograms(true);
                Promise.all(university.courses.map(courseId => getCourseById(courseId)))
                    .then(fetchedCourses => {
                        setPrograms(fetchedCourses.filter(course => course !== null));
                        setIsLoadingPrograms(false);
                    })
                    .catch(error => {
                        console.error('Error fetching courses:', error);
                        setIsLoadingPrograms(false);
                    });
            }

            // Fetch scholarships
            getScholarshipsByUniversityId(university._id)
                .then(fetchedScholarships => {
                    setScholarships(fetchedScholarships);
                })
                .catch(error => {
                    console.error('Error fetching scholarships:', error);
                    toast.error('Failed to load scholarships');
                });
        }
    }, [university]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="animate-pulse space-y-4 w-full max-w-4xl">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-64 bg-gray-200 rounded mt-6"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !university) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading University</h2>
                    <p className="text-gray-600 mb-6">We couldn't load the university details. Please try again later.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const filteredPrograms = programs.filter(program => program.course_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <Chatbot />
            <div className="pt-16">
                {/* University Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                                    {university.university_photo ? (
                                        <img
                                            src={`${API.defaults.baseURL}images/${university.university_photo}`}
                                            alt={`${university.university_name} logo`}
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/64?text=Logo';
                                            }}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-xs text-center">No Logo</div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{university.university_name}</h1>
                                    <div className="flex items-center text-gray-600 text-sm mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {university.location || `${university.city}, ${university.country}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Left Column - Main Content */}
                            <div className="lg:w-2/3 w-full space-y-6">
                                {/* Tabs Navigation */}
                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="border-b border-gray-200">
                                        <nav className="flex -mb-px">
                                            <button
                                                onClick={() => setActiveTab('overview')}
                                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'overview'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                            >
                                                Overview
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('programs')}
                                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'programs'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                            >
                                                Programs
                                            </button>
                                        </nav>
                                    </div>
                                    <div className="p-6">
                                        {activeTab === 'overview' ? (
                                            <div className="space-y-6">
                                                {/* About Widget */}
                                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                    <h2 className="text-xl font-semibold mb-4">About {university.university_name}</h2>
                                                    <p className="text-gray-700">{university.about_us || 'No description available.'}</p>
                                                </div>

                                                {/* Key Information Widget */}
                                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                    <h2 className="text-xl font-semibold mb-4">Key Information</h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center">
                                                            <Award className="w-5 h-5 text-blue-600 mr-2" />
                                                            <span>Established: {university.founded || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="w-5 h-5 text-blue-600 mr-2" />
                                                            <span>Institution Type: {university.institution_type || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                                                            <span>Location: {university.location || `${university.city}, ${university.country}`}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                                                            <span>Programs: {programs.length}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contact Information Widget */}
                                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                                                    <div className="space-y-4">
                                                        <div className="flex items-start">
                                                            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                                            </svg>
                                                            <div>
                                                                <p className="font-medium text-gray-900">Email</p>
                                                                <a href={`mailto:${university.email}`} className="text-blue-600 hover:underline">
                                                                    {university.email || 'N/A'}
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                                            </svg>
                                                            <div>
                                                                <p className="font-medium text-gray-900">Phone</p>
                                                                <a href={`tel:${university.phone}`} className="text-blue-600 hover:underline">
                                                                    {university.phone || 'N/A'}
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <Globe className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-medium text-gray-900">Website</p>
                                                                <a href={university.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                                                    {university.website?.replace(/^https?:\/\//, '') || 'N/A'}
                                                                    <ExternalLink className="ml-1 w-4 h-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                            </svg>
                                                            <div>
                                                                <p className="font-medium text-gray-900">Address</p>
                                                                <p className="text-gray-600">
                                                                    {university.address || `${university.city}, ${university.country}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : programs.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                    <h3 className="text-xl font-semibold">Available Programs ({filteredPrograms.length})</h3>
                                                    <div className="w-full sm:w-64">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                placeholder="Search programs..."
                                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                aria-label="Search programs"
                                                            />
                                                            {searchQuery && (
                                                                <button
                                                                    onClick={() => setSearchQuery('')}
                                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                                    aria-label="Clear search"
                                                                >
                                                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isLoadingPrograms ? (
                                                    <div className="animate-pulse space-y-4">
                                                        <div className="h-20 bg-gray-100 rounded-lg"></div>
                                                        <div className="h-20 bg-gray-100 rounded-lg"></div>
                                                    </div>
                                                ) : filteredPrograms.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {filteredPrograms.map((program) => (
                                                            <ProgramCard
                                                                key={program._id}
                                                                program={program}
                                                                university={university}
                                                                navigate={navigate}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                                        <h3 className="mt-2 text-lg font-medium text-gray-900">No programs found</h3>
                                                        <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-lg font-medium text-gray-900">No programs available</h3>
                                                <p className="mt-1 text-gray-500">This university hasn't listed any programs yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Quick Facts and Scholarships */}
                            <div className="lg:w-1/3 w-full space-y-6">
                                {/* Scholarships Widget */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold mb-4">Available Scholarships</h2>
                                    {scholarships.length > 0 ? (
                                        <div className="space-y-4">
                                            {scholarships.map((scholarship) => (
                                                <div key={scholarship._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="text-lg font-medium text-gray-900">{scholarship.scholarship_name}</h3>
                                                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                            ${scholarship.amount_per_year?.toLocaleString()}/year
                                                        </div>
                                                    </div>

                                                    {scholarship.terms_and_conditions && (
                                                        <div className="mt-3">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Eligibility:</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {scholarship.terms_and_conditions}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <button
                                                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                                        onClick={() => setActiveTab('scholarships')}
                                                    >
                                                        Learn more
                                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No scholarships</h3>
                                            <p className="mt-1 text-sm text-gray-500">There are currently no scholarships available for this university.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Facts Widget */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Institution Type</span>
                                            <span className="font-medium capitalize">{university.institution_type || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Established</span>
                                            <span className="font-medium">{university.founded || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-medium text-right">
                                                {university.location || `${university.city}, ${university.country}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Average Tuition</span>
                                            <span className="font-medium">
                                                {university.average_gross_tuition ? `£${university.average_gross_tuition}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cost of Living</span>
                                            <span className="font-medium">
                                                {university.average_cost_of_living ? `£${university.average_cost_of_living}/year` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

const ProgramCard = ({ program, university, navigate }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h4 className="text-lg font-semibold text-gray-900">{program.course_name}</h4>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1.5 text-blue-600" />
                        {program.course_level ? program.course_level.charAt(0).toUpperCase() + program.course_level.slice(1) : 'N/A'}
                    </span>
                    <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                        {program.course_duration || 'N/A'}
                    </span>
                    {program.intake && (
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {program.intake}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-lg font-semibold text-blue-600">
                    {program.course_tuition ? `$${program.course_tuition.toLocaleString()}` : 'Contact for pricing'}
                </span>
                <span className="text-sm text-gray-500">
                    {program.application_fee ? `+ $${program.application_fee} application fee` : 'No application fee'}
                </span>
            </div>
        </div>

        {program.entry_requirements?.length > 0 && (
            <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Entry Requirements:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {program.entry_requirements.map((req, idx) => (
                        <li key={`req-${idx}`} className="ml-4">{req}</li>
                    ))}
                </ul>
            </div>
        )}

        {program.modules?.length > 0 && (
            <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Key Modules:</h5>
                <div className="flex flex-wrap gap-2">
                    {program.modules.slice(0, 5).map((module, idx) => (
                        <span key={`module-${idx}`} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {module}
                        </span>
                    ))}
                    {program.modules.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{program.modules.length - 5} more
                        </span>
                    )}
                </div>
            </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <a
                onClick={() => navigate(`/course/${program._id}`)}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={`View details for ${program.course_name}`}
            >
                View Details
                <ExternalLink size={16} className="ml-2" aria-hidden="true" />
            </a>
        </div>
    </div>
);

export default UniversityDetailDynamic;
