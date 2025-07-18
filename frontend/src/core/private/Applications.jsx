import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, FileText, Loader2, Calendar, BookOpen, Building2, Clock, Search, X, Award, Download } from 'lucide-react';
import { getUserApplications, cancelApplication } from '../../utils/applicationHelper';
import { getUserScholarshipApplications } from '../../utils/scholarshipHelper';
import { toast } from 'react-toastify';
import { getUserInfo } from '../../utils/authHelper';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
    pending: 'Pending',
    submitted: 'Submitted',
    under_review: 'Under Review',
    accepted: 'Accepted',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
};

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [scholarshipApps, setScholarshipApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('courses');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [applicationToCancel, setApplicationToCancel] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const navigate = useNavigate();
    const currentUser = getUserInfo();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [courseApps, scholarshipData] = await Promise.all([
                    getUserApplications(),
                    currentUser?._id ? getUserScholarshipApplications(currentUser._id) : []
                ]);

                setApplications(courseApps);
                setScholarshipApps(scholarshipData);
            } catch (error) {
                console.error('Error fetching applications:', error);
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser?._id]);

    const handleCancelApplication = (applicationId) => {
        setApplicationToCancel(applicationId);
        setShowCancelModal(true);
    };

    const confirmCancelApplication = async () => {
        if (!applicationToCancel) return;

        setIsCancelling(true);
        try {
            await cancelApplication(applicationToCancel);
            setApplications(applications.filter(app => app._id !== applicationToCancel));
            toast.success('Application cancelled successfully');
            setShowCancelModal(false);
        } catch (error) {
            console.error('Error cancelling application:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel application');
        } finally {
            setIsCancelling(false);
            setApplicationToCancel(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleUpdateSOP = (application) => {
        navigate('/sop-writer', {
            state: {
                applicationId: application._id,
                course: application.course,
                university: {
                    ...application.course.university,
                    university_photo: application.course.university.university_photo || null
                },
                intake: application.intake,
                currentSOP: application.sop || ''
            }
        });
    };

    const filteredApplications = applications.filter(app => {
        if (!app || !app.course) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
            (app.course.course_name?.toLowerCase() || '').includes(searchLower) ||
            (app.course.university?.university_name?.toLowerCase() || '').includes(searchLower) ||
            (app.status?.toLowerCase() || '').includes(searchLower)
        );
    });

    const filteredScholarshipApps = scholarshipApps.filter(app => {
        if (!app || !app.scholarship) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
            (app.scholarship.scholarship_name?.toLowerCase() || '').includes(searchLower) ||
            (app.status?.toLowerCase() || '').includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 mt-16">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Track the status of your university and scholarship applications
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`${activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Course Applications
                            </button>
                            <button
                                onClick={() => setActiveTab('scholarships')}
                                className={`${activeTab === 'scholarships' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Scholarship Applications
                            </button>
                        </nav>
                    </div>

                    {/* Search */}
                    <div className="mt-4 sm:mt-0">
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                                placeholder={`Search ${activeTab === 'courses' ? 'course' : 'scholarship'} applications...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                {activeTab === 'courses' ? (
                    <div>
                        {filteredApplications.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm ? 'No applications match your search.' : 'You haven\'t applied to any courses yet.'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => navigate('/programs')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Browse Courses
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                                {filteredApplications.map((application) => (
                                    <div key={application._id} className="bg-white overflow-hidden shadow rounded-xl hover:shadow-md transition-shadow duration-200">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {application.course.course_name}
                                                        </h3>
                                                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                                                            {statusLabels[application.status] || application.status}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {application.course.university.university_name}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {!application.acceptanceLetter && !application.rejectionLetter && (
                                                        <>
                                                            {application.status !== 'cancelled' && application.status !== 'rejected' && (
                                                                <button
                                                                    onClick={() => handleCancelApplication(application._id)}
                                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                                    disabled={application.status === 'cancelled'}
                                                                >
                                                                    <X className="h-4 w-4 mr-1.5" />
                                                                    Cancel
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleUpdateSOP(application)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                            >
                                                                <Edit className="h-4 w-4 mr-1.5" />
                                                                Update SOP
                                                            </button>
                                                        </>
                                                    )}
                                                    {application.acceptanceLetter && (
                                                        <a
                                                            href={`http://localhost:3000/uploads/letters/${application.acceptanceLetter.split('/').pop()}`}
                                                            download={`acceptance_letter_${application.course.university.university_name.replace(/\s+/g, '_')}.pdf`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                        >
                                                            <Download className="h-4 w-4 mr-1.5" />
                                                            Download Acceptance Letter
                                                        </a>
                                                    )}
                                                    {application.rejectionLetter && (
                                                        <a
                                                            href={`http://localhost:3000/uploads/letters/${application.rejectionLetter.split('/').pop()}`}
                                                            download={`rejection_letter_${application.course.university.university_name.replace(/\s+/g, '_')}.pdf`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        >
                                                            <Download className="h-4 w-4 mr-1.5" />
                                                            Download Rejection Letter
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                                <div className="flex items-start">
                                                    <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-500">Intake</p>
                                                        <p className="text-sm text-gray-900 capitalize">
                                                            {application.intake || 'Not specified'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <Clock className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-500">Applied on</p>
                                                        <p className="text-sm text-gray-900">
                                                            {application.appliedAt ? formatDate(application.appliedAt) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <Clock className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-500">Last updated on</p>
                                                        <p className="text-sm text-gray-900">
                                                            {application.updatedAt ? formatDate(application.updatedAt) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    onClick={() => navigate(`/course/${application.course._id}`)}
                                                >
                                                    View Course
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        {filteredScholarshipApps.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {filteredScholarshipApps.map((app) => (
                                    <li key={app._id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <Award className="flex-shrink-0 h-5 w-5 text-yellow-500" />
                                                    <div className="ml-4">
                                                        <p className="text-sm font-medium text-blue-600 truncate">
                                                            Scholarship Application
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            Status: {app.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {statusLabels[app.status] || app.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            Applied on {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">
                                                Application ID: {app.application?._id || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Status: {app.application?.status || 'N/A'}
                                            </p>
                                        </div>
                                        {(app.acceptanceLetter || app.rejectionLetter) && (
                                            <div className="mt-3 flex space-x-2">
                                                {app.acceptanceLetter && (
                                                    <a
                                                        href={`http://localhost:3000/${app.acceptanceLetter.split('/').pop()}`}
                                                        download={`acceptance_letter_${app._id}.pdf`}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Acceptance Letter
                                                    </a>
                                                )}
                                                {app.rejectionLetter && (
                                                    <a
                                                        href={`http://localhost:3000/${app.rejectionLetter.split('/').pop()}`}
                                                        download={`rejection_letter_${app._id}.pdf`}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Rejection Letter
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12">
                                <Award className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No scholarship applications</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? 'No scholarship applications match your search.' : 'You haven\'t applied for any scholarships yet.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">Cancel Application</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to cancel this application? This action cannot be undone.
                                </p>
                            </div>
                            <div className="mt-5 flex justify-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={isCancelling}
                                >
                                    No, keep it
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmCancelApplication}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 inline" />
                                            Cancelling...
                                        </>
                                    ) : 'Yes, cancel it'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            <Chatbot />
        </div>
    );
};

export default Applications;
