// src/core/private/profile-steps/VisaStep.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Calendar, FileText, ChevronDown } from 'lucide-react';

const VisaStep = ({ formData, handleChange }) => {
    const [showPreviousVisa, setShowPreviousVisa] = useState(formData.previous_visa_application || false);
    const [yearError, setYearError] = useState('');

    const countries = [
        'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
        'France', 'Japan', 'South Korea', 'New Zealand', 'Other'
    ];

    const visaTypes = [
        'Student Visa', 'Tourist Visa', 'Work Visa', 'Business Visa',
        'Permanent Residency', 'Other'
    ];

    const visaStatuses = [
        'Approved', 'Rejected', 'Expired', 'Cancelled', 'In Progress'
    ];

    const handleYearChange = (e) => {
        const year = parseInt(e.target.value, 10);
        const currentYear = new Date().getFullYear();

        if (year >= currentYear) {
            setYearError('Must be a past year (before ' + currentYear + ')');
            return;
        }

        setYearError('');
        handleChange(e);
    };

    // Update showPreviousVisa when formData changes
    useEffect(() => {
        setShowPreviousVisa(formData.previous_visa_application || false);
    }, [formData.previous_visa_application]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Visa Information</h2>
                <p className="text-sm text-gray-500">Share your visa application history</p>
            </div>

            <div className="space-y-6">
                {/* Previous Visa Application Section */}
                <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <input
                            id="previous_visa_application"
                            name="previous_visa_application"
                            type="checkbox"
                            checked={formData.previous_visa_application || false}
                            onChange={(e) => {
                                handleChange(e);
                                setShowPreviousVisa(e.target.checked);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="previous_visa_application" className="ml-2 block text-sm font-medium text-gray-700">
                            Have you previously applied for a visa?
                        </label>
                    </div>

                    {showPreviousVisa && (
                        <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Application Country */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Application Country</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Globe className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            name="application_country"
                                            value={formData?.application_country || ''}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select country</option>
                                            {countries.map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Application Year */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Application Year</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            name="application_year"
                                            value={formData?.application_year || ''}
                                            onChange={handleYearChange}
                                            max={new Date().getFullYear() - 1}
                                            className={`block w-full px-3 py-2.5 text-sm border ${yearError ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder={new Date().getFullYear().toString()}
                                            required
                                        />
                                    </div>
                                    {yearError ? (
                                        <p className="mt-1 text-xs text-red-600">{yearError}</p>
                                    ) : (
                                        <p className="mt-1 text-xs text-gray-500">Must be a past year (before {new Date().getFullYear()})</p>
                                    )}
                                </div>

                                {/* Application Date */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Application Date</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="application_date"
                                            value={formData?.application_date || ''}
                                            onChange={handleChange}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            name="status"
                                            value={formData?.status || ''}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select status</option>
                                            {visaStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Current Visa Status Section */}
                <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Current Visa Status</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Do you currently hold a valid visa?</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="currently_hold_a_visa"
                                        value={true}
                                        checked={formData?.currently_hold_a_visa === true}
                                        onChange={() => handleChange({
                                            target: {
                                                name: 'currently_hold_a_visa',
                                                value: true,
                                                type: 'radio'
                                            }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="currently_hold_a_visa"
                                        value={false}
                                        checked={formData?.currently_hold_a_visa === false || formData?.currently_hold_a_visa === undefined}
                                        onChange={() => handleChange({
                                            target: {
                                                name: 'currently_hold_a_visa',
                                                value: false,
                                                type: 'radio'
                                            }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">No</span>
                                </label>
                            </div>
                        </div>

                        {formData?.currently_hold_a_visa && (
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Visa Expiry Date</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        name="visa_expiry_date"
                                        value={formData?.visa_expiry_date || ''}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisaStep;