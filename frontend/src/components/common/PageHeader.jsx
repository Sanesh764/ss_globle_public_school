import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const PageHeader = ({ title, subtitle, breadcrumb = [] }) => {
  return (
    <div className="bg-[#EBE2CC] text-[#252821] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-[0.14em] text-[#55594E] mb-4 font-medium" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#34483B] transition-colors">Home</Link>
          {breadcrumb.map((item, idx) => (
            <React.Fragment key={idx}>
              <FiChevronRight className="text-[#AD8746] text-xs" />
              {item.link ? (
                <Link to={item.link} className="hover:text-[#34483B] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#34483B] font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="brass-rule mb-4" />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-serif text-[#34483B] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-base sm:text-lg text-[#55594E] max-w-3xl leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
