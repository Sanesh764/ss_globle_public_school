import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#55594E]">
        <FiSearch className="text-base" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-sm text-[#252821] placeholder-[#55594E]/70 focus:outline-none focus:ring-1 focus:ring-[#34483B] focus:border-[#34483B] transition-colors"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#55594E] hover:text-[#252821]"
          aria-label="Clear search"
        >
          <FiX className="text-base" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
