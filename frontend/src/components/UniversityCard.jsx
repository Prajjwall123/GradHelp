import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, FileText } from "lucide-react";


const UniversityCard = ({
  id,
  courseId,
  logo,
  university,
  level,
  program,
  location,
  tuition,
  applicationFee,
  duration,
  viewMode = 'grid',
  onCompare = () => { },
}) => {
  const isListView = viewMode === 'list';
  const effectiveCourseId = courseId || id;

  const handleCompareClick = (e) => {
    e.stopPropagation();
    onCompare();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      <div className={`${isListView ? 'flex flex-col md:flex-row md:items-center' : 'flex flex-col'} p-4 h-full`}>
        {/* University Header */}
        <div className={`flex items-start justify-between ${isListView ? 'md:flex-col md:items-start md:gap-2 md:min-w-[200px] md:pr-6' : 'mb-3'}`}>
          <div className="flex items-center gap-3">
            <div className={`${isListView ? 'w-12 h-12' : 'w-10 h-10'} rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}>
              <img src={logo} alt="University Logo" className={`${isListView ? 'h-7' : 'h-6'} w-auto`} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{university}</div>
              {isListView && (
                <div className="text-xs text-gray-500 mt-1">{location}</div>
              )}
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-2"
            title="Compare"
            onClick={handleCompareClick}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Program Info */}
        <div className={`${isListView ? 'md:flex-1 md:pr-6' : 'mb-4'}`}>
          <div className="flex flex-col h-full">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{level}</div>
            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-3">{program}</h3>

            {isListView && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div>
                  <div className="text-xs text-gray-500">Tuition (1st Year)</div>
                  <div className="font-medium text-gray-900">{tuition}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Application Fee</div>
                  <div className="font-medium text-gray-900">{applicationFee}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="font-medium text-gray-900">{duration}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isListView && (
          <>
            {/* Divider */}
            <div className="h-px bg-gray-100 w-full my-2"></div>

            {/* Details */}
            <div className="space-y-3 my-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm font-medium text-gray-900">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tuition (1st Year)</span>
                <span className="text-sm font-medium text-gray-900">{tuition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Application Fee</span>
                <span className="text-sm font-medium text-gray-900">{applicationFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium text-gray-900">{duration}</span>
              </div>
            </div>
          </>
        )}

        {/* View Details Button */}
        <div className={`${isListView ? 'md:w-48 flex-shrink-0' : 'w-full'}`}>
          <Link
            to={`/course/${effectiveCourseId}`}
            className="bg-[#05213b] text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-[#1a3450] transition-all flex items-center justify-center gap-3 group w-full block text-center"
          >
            <FileText size={18} className="text-white/90 group-hover:scale-110 transition-transform" />
            <span>View Details</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1 group-hover:translate-x-1 transition-transform">
              <path d="M3.33325 8H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 3.33334L12.6667 8.00001L8 12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UniversityCard;
