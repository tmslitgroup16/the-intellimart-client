import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import CategoryCard from './CategoryCard';
import ScanItems from '../Scanner/ScanItems';

const SuperCategoriesPage = () => {

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const storageRef = ref(storage, 'super_categories');
        const items = await listAll(storageRef);

        const categoryData = await Promise.all(
          items.items.map(async (item) => {
            const name = item.name.split('.')[0];
            const url = await getDownloadURL(item);
            return { name, url };
          })
        );

        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className='text-center flex justify-center'>
      <div className='container mx-auto  '>
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '3rem',
            textShadow: '0 0 10px gray-200',
          }}
          className='mb-8'
        >
          Categories
        </h2>
        <div
          className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4 md:px-8 lg:px-8 sm:justify-center'
        >
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/${encodeURIComponent(category.name)}`}
              className='mx-auto'
            >
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
      </div>

      <ScanItems />
    </div>
  );
}

export default SuperCategoriesPage