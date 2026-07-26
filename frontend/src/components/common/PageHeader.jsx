import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const PageHeader = ({ title, subtitle, breadcrumb = [] }) => {
  return (
    <div className="relative primary-gradient text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
      {/* Background Subtle Shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-lg text-blue-100 max-w-3xl font-light">
            {subtitle}
          </p>
        )}

        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-blue-200 mt-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          {breadcrumb.map((item, idx) => (
            <React.Fragment key={idx}>
              <FiChevronRight className="text-blue-300 text-xs" />
              {item.link ? (
                <Link to={item.link} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-amber-300 font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default PageHeader;
