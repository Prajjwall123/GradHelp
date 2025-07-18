import React, { useState, useEffect } from 'react';
import { Filter, Star, Bookmark, ChevronDown, Award } from 'lucide-react';

// Sample data for demonstration - in a real app, this would come from props or context
const sampleCards = [];

const Sidebar = ({
  filters = { programLevels: [], locations: [], durations: [] },
  filterOptions = { programLevels: [], locations: [], durations: [] },
  onFilterChange = () => { }
}) => {
  const [expandedSections, setExpandedSections] = useState({
    programLevel: true,
    location: true,
    duration: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  // Safely get filter arrays with fallback to empty arrays
  const safeFilter = (filterType) => Array.isArray(filters[filterType]) ? filters[filterType] : [];
  const safeOptions = (optionType) => Array.isArray(filterOptions[optionType]) ? filterOptions[optionType] : [];

  return (
    <div className="w-72 bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-800 h-fit">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Filter size={20} className="text-blue-400" />
        Filters
      </h2>

      <div className="space-y-6">
        {/* Program Level */}
        <div className="border-b border-gray-800 pb-4">
          <button
            onClick={() => toggleSection('programLevel')}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white mb-3"
          >
            <span>PROGRAM LEVEL</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${expandedSections.programLevel ? 'transform rotate-180' : ''}`}
            />
          </button>
          {expandedSections.programLevel && (
            <div className="space-y-2 pl-1">
              {safeOptions('programLevels').map(level => (
                <label key={level} className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-400 bg-gray-800"
                    checked={safeFilter('programLevels').includes(level)}
                    onChange={() => handleFilterChange('programLevels', level)}
                  />
                  <span className="flex-1">{level}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="border-b border-gray-800 pb-4">
          <button
            onClick={() => toggleSection('location')}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white mb-3"
          >
            <span>LOCATION</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${expandedSections.location ? 'transform rotate-180' : ''}`}
            />
          </button>
          {expandedSections.location && (
            <div className="space-y-2 pl-1">
              {safeOptions('locations').map(location => (
                <label key={location} className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-400 bg-gray-800"
                    checked={safeFilter('locations').includes(location)}
                    onChange={() => handleFilterChange('locations', location)}
                  />
                  <span className="flex-1">{location}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="border-b border-gray-800 pb-4">
          <button
            onClick={() => toggleSection('duration')}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white mb-3"
          >
            <span>DURATION</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${expandedSections.duration ? 'transform rotate-180' : ''}`}
            />
          </button>
          {expandedSections.duration && (
            <div className="space-y-2 pl-1">
              {safeOptions('durations').map(duration => (
                <label key={duration} className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-400 bg-gray-800"
                    checked={safeFilter('durations').includes(duration)}
                    onChange={() => handleFilterChange('durations', duration)}
                  />
                  <span className="flex-1">{duration}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Saved Items Section */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bookmark size={16} className="text-blue-400" />
          SAVED ITEMS
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 text-sm text-gray-300 hover:bg-gray-800 p-3 rounded-lg transition-colors border border-gray-800 hover:border-gray-700">
            <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center">
              <Star size={16} className="text-blue-400" />
            </div>
            <span>My Favorites</span>
          </button>
          <button className="w-full flex items-center gap-3 text-sm text-gray-300 hover:bg-gray-800 p-3 rounded-lg transition-colors border border-gray-800 hover:border-gray-700">
            <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center">
              <Award size={16} className="text-purple-400" />
            </div>
            <span>Top Picks</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
