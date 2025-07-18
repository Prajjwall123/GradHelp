import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCourses } from "../../utils/coursesHelper";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import UniversityCard from "../../components/UniversityCard";
import { SlidersHorizontal, LayoutGrid, List, ChevronDown, Filter, Search } from "lucide-react";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import Chatbot from "../../components/Chatbot";

const extractUniqueValues = (data, key) => {
  const values = data.map(item => item[key] || '');
  return ['All', ...new Set(values)].filter(Boolean);
};

const extractCountries = (data) => {
  const countries = data.map(item => {
    const location = item.location || '';
    const country = location.split(',').pop().trim();
    return country || 'Unknown';
  });
  return ['All Countries', ...new Set(countries)].filter(Boolean);
};

const Dashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const sampleCards = React.useMemo(() => {
    return courses.map(course => {
      const location = course.university?.location || 'Location not specified';
      const [city, country] = location.split(',').map(s => s.trim());

      return {
        id: course._id,
        courseId: course._id,
        logo: course.university?.photo ? `http://localhost:3000${course.university.photo}` : null,
        university: course.university?.name || 'University',
        level: course.course_level ?
          course.course_level.charAt(0).toUpperCase() + course.course_level.slice(1) :
          'Program',
        program: course.course_name || 'Course',
        location: location,
        city: city || 'Unknown',
        country: country || 'Unknown',
        tuition: course.course_tuition ? `$${course.course_tuition.toLocaleString()}` : 'Contact for pricing',
        applicationFee: course.application_fee ? `$${course.application_fee}` : 'No fee',
        duration: course.course_duration || 'Duration not specified'
      };
    });
  }, [courses]);

  const [filters, setFilters] = useState({
    country: '',
    level: '',
    subject: '',
    duration: '',
    programLevels: [],
    locations: [],
    durations: []
  });

  const filterOptions = React.useMemo(() => {
    const options = {
      countries: extractCountries(sampleCards),
      levels: extractUniqueValues(sampleCards, 'level'),
      durations: extractUniqueValues(sampleCards, 'duration')
    };

    const subjects = new Set();
    sampleCards.forEach(card => {
      if (card.program) {
        const words = card.program
          .split(/\s+/)
          .map(word => word.replace(/[^a-zA-Z]/g, ''))
          .filter(word => word.length > 3);
        words.forEach(word => subjects.add(word));
      }
    });

    return {
      ...options,
      subjects: ['All', ...Array.from(subjects)].slice(0, 11)
    };
  }, [sampleCards]);

  const handleFilterChange = (filterName, value) => {
    if (['programLevels', 'locations', 'durations'].includes(filterName)) {
      setFilters(prev => ({
        ...prev,
        [filterName]: prev[filterName].includes(value)
          ? prev[filterName].filter(item => item !== value)
          : [...prev[filterName], value]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterName]: value === '' ? '' : value
      }));
    }
  };

  const filteredAndSortedCards = React.useMemo(() => {
    if (!sampleCards?.length) return [];

    let result = sampleCards.filter(card => {
      const cardCountry = card.country || '';
      const cardLevel = card.level || '';
      const cardDuration = card.duration || '';
      const cardProgram = card.program?.toLowerCase() || '';
      const cardUniversity = card.university?.toLowerCase() || '';

      const matchesSearch = !searchTerm ||
        cardProgram.includes(searchTerm.toLowerCase()) ||
        cardUniversity.includes(searchTerm.toLowerCase()) ||
        cardCountry.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = !filters.country || cardCountry === filters.country;
      const matchesLevel = !filters.level || cardLevel === filters.level;
      const matchesDuration = !filters.duration || cardDuration === filters.duration;
      const matchesSubject = !filters.subject ||
        cardProgram.includes(filters.subject.toLowerCase());

      const matchesProgramLevel = filters.programLevels.length === 0 ||
        filters.programLevels.includes(cardLevel);
      const matchesLocation = filters.locations.length === 0 ||
        filters.locations.includes(cardCountry);
      const matchesDurationFilter = filters.durations.length === 0 ||
        filters.durations.includes(cardDuration);

      return (
        matchesSearch &&
        matchesCountry &&
        matchesLevel &&
        matchesDuration &&
        matchesSubject &&
        matchesProgramLevel &&
        matchesLocation &&
        matchesDurationFilter
      );
    });

    if (sortBy === 'tuition-asc') {
      result = [...result].sort((a, b) => {
        const aTuition = parseFloat(a.tuition.replace(/[^0-9.]/g, '')) || 0;
        const bTuition = parseFloat(b.tuition.replace(/[^0-9.]/g, '')) || 0;
        return aTuition - bTuition;
      });
    } else if (sortBy === 'tuition-desc') {
      result = [...result].sort((a, b) => {
        const aTuition = parseFloat(a.tuition.replace(/[^0-9.]/g, '')) || 0;
        const bTuition = parseFloat(b.tuition.replace(/[^0-9.]/g, '')) || 0;
        return bTuition - aTuition;
      });
    } else if (sortBy === 'duration-asc') {
      result = [...result].sort((a, b) => {
        const aDuration = parseFloat(a.duration) || 0;
        const bDuration = parseFloat(b.duration) || 0;
        return aDuration - bDuration;
      });
    }

    return result;
  }, [sampleCards, filters, searchTerm, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Find Your Program</h1>
                  <p className="text-gray-500 mt-1">Browse and compare programs from top universities</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100 text-[#05213b]' : 'text-gray-400 hover:bg-gray-50'}`}
                    aria-label="List view"
                  >
                    <List size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 text-[#05213b]' : 'text-gray-400 hover:bg-gray-50'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for programs, universities, or countries"
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-base"
                  />
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <select
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  >
                    <option value="">All Countries</option>
                    {filterOptions.countries
                      ?.filter(country => country && country !== 'All Countries')
                      ?.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  >
                    <option value="">All Levels</option>
                    {filterOptions.levels
                      ?.filter(level => level && level !== 'All')
                      ?.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  >
                    <option value="">All Subjects</option>
                    {filterOptions.subjects
                      ?.filter(subject => subject && subject !== 'All')
                      ?.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  >
                    <option value="">All Durations</option>
                    {filterOptions.durations
                      ?.filter(duration => duration && duration !== 'All')
                      ?.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter size={16} />
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block lg:w-1/4`}>
              <Sidebar
                filters={{
                  programLevels: filters.programLevels,
                  locations: filters.locations,
                  durations: filters.durations
                }}
                filterOptions={{
                  programLevels: filterOptions.levels.filter(l => l !== 'All'),
                  locations: filterOptions.countries.filter(c => c !== 'All Countries'),
                  durations: filterOptions.durations.filter(d => d !== 'All')
                }}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Showing <span className="font-medium text-gray-900">{filteredAndSortedCards.length}</span> of <span className="font-medium text-gray-900">{sampleCards.length}</span> results
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#05213b]/20 focus:border-[#05213b] cursor-pointer"
                    >
                      <option value="">Select sort option</option>
                      <option value="tuition-asc">Tuition (Low to High)</option>
                      <option value="tuition-desc">Tuition (High to Low)</option>
                      <option value="duration-asc">Duration (Shortest First)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'space-y-4'} gap-6`}>
                {filteredAndSortedCards.length > 0 ? (
                  filteredAndSortedCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      <UniversityCard
                        id={card.courseId}
                        courseId={card.courseId}
                        logo={card.logo}
                        university={card.university}
                        level={card.level}
                        program={card.program}
                        location={card.location}
                        city={card.city}
                        country={card.country}
                        tuition={card.tuition}
                        applicationFee={card.applicationFee}
                        duration={card.duration}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">No programs found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                  </div>
                )}
              </div>

              <div className="mt-10 flex items-center justify-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                {[1, 2, 3, '...', 8].map((page, i) => (
                  <button
                    key={i}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${page === 1 ? 'bg-[#05213b] text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Chatbot component */}
        <Chatbot />

      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
