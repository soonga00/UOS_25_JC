import React from 'react';

const Tabs = ({ selectedCategory, onCategoryChange, categories }) => {
  return (
    <div className="flex bg-gray-200 rounded-t-lg">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`p-2 flex-1 hover:bg-uosBlueSoft ${
            selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
