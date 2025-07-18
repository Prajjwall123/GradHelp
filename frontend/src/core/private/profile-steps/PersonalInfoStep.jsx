import React from 'react';
import { User, Mail, Calendar, MapPin, Home } from 'lucide-react';

const PersonalInfoStep = ({ formData, handleChange }) => {
    const [showEmailError, setShowEmailError] = React.useState(false);
    const [dateError, setDateError] = React.useState('');

    const handleEmailFocus = (e) => {
        e.preventDefault();
        toast.error('Cannot update the email you registered with', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        const minAgeDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );

        if (selectedDate > minAgeDate) {
            setDateError('You must be at least 18 years old');
        } else {
            setDateError('');
            handleChange(e);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-0.5">Personal Information</h2>
                <p className="text-xs text-gray-500">Fill in your details below to continue</p>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Full Name</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleChange}
                                className="block w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                readOnly
                                onFocus={handleEmailFocus}
                                className="block w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                                placeholder="john@example.com"
                            />
                            {showEmailError && (
                                <div className="absolute -bottom-6 left-0 text-xs text-red-500 mt-1">
                                    Cannot update the email you registered with
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Date of Birth */}
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth || ''}
                                onChange={handleDateChange}
                                className={`block w-full pl-8 pr-3 py-2 text-xs text-gray-700 border ${dateError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        {dateError && (
                            <p className="mt-1 text-xs text-red-600">{dateError}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Gender</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <select
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleChange}
                                className="appearance-none block w-full pl-8 pr-8 py-2 text-xs border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                                <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Address</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute top-2 left-2.5">
                            <Home className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <textarea
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            rows="2"
                            className="block w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your full address"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">City</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleChange}
                            className="block w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="New York"
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoStep;