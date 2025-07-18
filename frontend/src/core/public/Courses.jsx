import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, BookOpen, Clock, GraduationCap, Award } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import { getCourses } from '../../utils/coursesHelper';
import cover from '../../assets/cover2.jpg';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Contact University';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000${imagePath}`;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Extract unique countries from courses
  const getAvailableCountries = () => {
    const countrySet = new Set();
    courses.forEach(course => {
      if (course.university?.location) {
        const country = course.university.location.split(',').pop()?.trim();
        if (country) countrySet.add(country);
      }
    });
    return ['All Countries', ...Array.from(countrySet).sort()];
  };

  // Get available course levels
  const getAvailableLevels = () => {
    const levelMap = {
      'undergraduate': 'Undergraduate',
      'graduate': 'Graduate',
      'postgraduate': 'Postgraduate'
    };

    const levels = new Set();
    courses.forEach(course => {
      if (course.course_level) {
        levels.add(course.course_level);
      }
    });

    return [
      { value: 'all', label: 'All Levels' },
      ...Array.from(levels).map(level => ({
        value: level,
        label: levelMap[level] || level.charAt(0).toUpperCase() + level.slice(1)
      }))
    ];
  };

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setFiltersApplied(true);
  };

  // Handle clearing all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
    setSelectedLevel('all');
    setFiltersApplied(false);
  };

  // Filter courses based on search term, country, and level
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      searchTerm === '' ||
      (course.course_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.university?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCountry =
      selectedCountry === 'all' ||
      (course.university?.location?.includes(selectedCountry));

    const matchesLevel =
      selectedLevel === 'all' ||
      course.course_level === selectedLevel;

    return matchesSearch && matchesCountry && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar className="fixed top-0 w-full z-50" />

      <div className="flex-1 pt-16">
        {/* Hero Section */}
        <div
          className="relative py-24 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Find Your Perfect Course</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-6">
              Discover and compare courses from top universities around the world.
            </p>
            <form
              onSubmit={handleSearch}
              className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-1 flex flex-wrap md:flex-nowrap"
            >
              <div className="relative flex-1 w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="block w-full pl-12 pr-4 py-3 border-0 focus:ring-0 focus:outline-none text-gray-800 rounded-l-lg md:rounded-r-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>

              <div className="relative w-full md:w-48 border-t md:border-t-0 md:border-l border-gray-200">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-3 bg-white text-gray-700 border-0 focus:ring-0 focus:outline-none"
                >
                  {getAvailableCountries().map(country => (
                    <option key={country} value={country === 'All Countries' ? 'all' : country}>
                      {country}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="relative w-full md:w-48 border-t md:border-t-0 md:border-l border-gray-200">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-3 bg-white text-gray-700 border-0 focus:ring-0 focus:outline-none"
                >
                  {getAvailableLevels().map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg font-medium transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Found
              {(searchTerm || selectedCountry !== 'all' || selectedLevel !== 'all') && ' (Filtered)'}
            </h2>

            {(searchTerm || selectedCountry !== 'all' || selectedLevel !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 flex-shrink-0">
                        <img
                          src={getImageUrl(course.university?.photo)}
                          alt={`${course.university?.name} logo`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100';
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.course_name}</h3>
                        <p className="text-sm text-gray-600">{course.university?.name}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {course.university?.location || 'Location not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Level</p>
                          <p className="font-medium text-gray-900 flex items-center">
                            <GraduationCap className="h-4 w-4 mr-1 text-blue-600" />
                            {course.course_level ? course.course_level.charAt(0).toUpperCase() + course.course_level.slice(1) : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="font-medium text-gray-900 flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-blue-600" />
                            {course.course_duration || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {course.about && (
                        <div className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {course.about}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Tuition</p>
                          <p className="font-medium text-gray-900">
                            {course.course_tuition ? formatCurrency(course.course_tuition) : 'Contact University'}
                          </p>
                        </div>
                        <Link
                          to={`/course/${course._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Chatbot />
      <Footer />
    </div>
  );
};

export default Courses;
