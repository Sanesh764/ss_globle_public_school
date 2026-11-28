import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 my-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] text-[#34483B] hover:bg-[#EBE2CC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous Page"
      >
        <FiChevronLeft className="text-base" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-sm text-sm font-semibold transition-colors ${
            currentPage === p
              ? 'bg-[#34483B] text-[#F4EFE3] border border-[#34483B]'
              : 'bg-[#F4EFE3] border border-[#CFC5B1] text-[#252821] hover:bg-[#EBE2CC]'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] text-[#34483B] hover:bg-[#EBE2CC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next Page"
      >
        <FiChevronRight className="text-base" />
      </button>
    </div>
  );
};

export default Pagination;
