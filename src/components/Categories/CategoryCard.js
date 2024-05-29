import React from 'react';

const CategoryCard = ({ category }) => {
  return (
    <div className='mb-8'>
      <div className="bg-white flex flex-col items-center p-10 rounded-lg shadow-md" style={{ height: '300px' }}>
        {category.url && <img src={category.url} alt={category.name} className="mb-4 rounded-lg" style={{ width: '100%', height: '60%', objectFit: 'contain' }} />}
        <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
      </div>
    </div>
  );
};

export default CategoryCard;
