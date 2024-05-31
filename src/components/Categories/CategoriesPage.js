import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { storage } from '../../firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import CategoryCard from './CategoryCard';
import ScanItems from '../Scanner/ScanItems';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [newCategories, setNewCategories] = useState([]);
  const { superCategoryName } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/assets/category_details.csv');
        const csvData = await response.text();
        const parsedData = Papa.parse(csvData, { header: true }).data;

        const filteredCategories = parsedData.filter(category => category.SuperCategoryName === superCategoryName);

        const storageRef = ref(storage, 'categories');
        const items = await listAll(storageRef);
        const categoryNames = items.items.map(item => item.name.split('.')[0]);
        const filteredItems = filteredCategories.filter(category => categoryNames.includes(category.CategoryName));

        const categoryData = await Promise.all(
          filteredItems.map(async (item) => {
            const id = item.CategoryId;
            const name = item.CategoryName;
            let url = null;
            try {
              const itemRef = ref(storage, `categories/${name}.jpg`);
              url = await getDownloadURL(itemRef);
            } catch (error) {
              console.error('Error fetching download URL:', error);
            }
            return { id, name, url };
          })
        );

        setNewCategories(categoryData);
      } catch (error) {
        console.error('Error fetching and processing data:', error);
      }
    };

    // Call fetchData function
    fetchData();
  }, [superCategoryName]);


  return (
    <div className='text-center'>
      <div className='container mx-auto my-6'>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '3rem', textShadow: '0 0 10px gray-200' }} className='mb-8'>
          {superCategoryName}
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mx-4 md:mx-8 lg:mx-8'>
          {newCategories.map((category) => (
            <Link key={category.id} to={`/${encodeURIComponent(superCategoryName)}/${encodeURIComponent(category.id)}`}>
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
      </div>
      <button
        className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg fixed bottom-4 left-4"
        onClick={() => navigate('/')}
      >
        Go Back
      </button>
      <ScanItems />
    </div>
  );
}

export default CategoriesPage