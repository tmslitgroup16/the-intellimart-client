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
    <div className='text-center'>
        <div className='container mx-auto my-6'>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '3rem', textShadow: '0 0 10px gray-200' }} className='mb-8'>
                Categories
            </h2>
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mx-4 md:mx-8 lg:mx-8'>
                {categories.map((category) => (
                    <Link key={category.name} to={`/${encodeURIComponent(category.name)}`}>
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