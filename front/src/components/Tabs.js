import React from 'react';

const Tabs = ({ selectedCategory, onCategoryChange }) => {
  const categories = ['과자', '음료', '빙과류'];

  return (
    <div className="flex bg-gray-100 rounded-tl-lg rounded-tr-lg">
      {categories.map((category, index) => (
        <button
          key={category}
          className={`py-2 px-4 focus:outline-none rounded-tl-lg rounded-tr-lg ${
            selectedCategory === category
              ? 'bg-white text-gray-700'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
