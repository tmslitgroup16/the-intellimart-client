import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { storage } from '../../firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { CartContext } from '../Cart/CartContext';
import ScanItems from '../Scanner/ScanItems';
import CategoryCard from './CategoryCard';
import { Modal, Box, Typography, Button, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const ExtraIngredientsPage = () => {
  const { dishName } = useParams();
  const [category, setCategory] = useState([]);
  const [neededCategory, setNeededCategory] = useState([]);
  const [presentCategory, setPresentCategory] = useState([]);
  const [extraCategory, setExtraCategory] = useState([]);
  const { cart } = useContext(CartContext);

  const ProductCSV = () => {
    const cartItems = Object.values(cart);
    const productIds = cartItems.map((item) => item.id);

    fetch('/assets/product_details.csv')
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: function (results) {
            for (let i = 0; i < productIds.length; i++) {
              const productDetails = getProductDetailsFromCSV(results.data, productIds[i]);
              if (productDetails) {
                setCategory((prev) => {
                  if (!prev.some((item) => item.CategoryName === productDetails.CategoryName)) {
                    return [
                      ...prev,
                      {
                        CategoryName: productDetails.CategoryName,
                        CategoryId: productDetails.CategoryId,
                      },
                    ];
                  }
                  return prev;
                });
              } else {
                console.log('Product details not found for the Product Id');
              }
            }
          },
        });
      })
      .catch((error) => {
        console.error('Error loading Product Details CSV file:', error);
      });
  }

  const FoodCSV = () => {
    fetch('/assets/Indian_food.csv')
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: function (results) {
            const ing = getIngredientsFromCSV(results.data, dishName);
            let ingList = Object.values(ing);
            ingList = ingList.flatMap((item) => item.toLowerCase().split(', '));
            const categoryList = category.map((cat) => cat.CategoryName.toLowerCase());

            if (ingList) {
              const newExtraCategory = ingList.filter((ingredient) => !categoryList.includes(ingredient));
              setExtraCategory(() => {
                const transformedExtraCategory = newExtraCategory.map(item => ({
                  name: item,
                  id: '',
                  url: '',
                  SuperCategoryName: '',
                }));
                const uniqueExtraCategory = transformedExtraCategory.filter((item, index, self) =>
                  index === self.findIndex((t) => t.name === item.name)
                );
              
                return uniqueExtraCategory;
              });

              setNeededCategory(ingList);
              const newPresentCategory = ingList.filter((item) => !newExtraCategory.includes(item));
              setPresentCategory(newPresentCategory);
            } else {
              console.log('Ingredients not found for the Dish');
            }
          },
        });
      })
      .catch((error) => {
        console.error('Error loading Indian Dish CSV file:', error);
      });
  }

  const CategoryCSV = () => {
    fetch('/assets/category_details.csv')
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: function (results) {
            const categories = results.data.map((row) => ({
              CategoryName: row.CategoryName,
              CategoryId: row.CategoryId,
              SuperCategoryName: row.SuperCategoryName,
            }));
            
            setExtraCategory(prevExtraCategory => {
              const updatedExtraCategory = prevExtraCategory.map((item) => {
                const category1 = categories.find((cat) => cat.CategoryName.toLowerCase() === item.name.toLowerCase());
                return {
                  name: category1 ? category1.CategoryName : null,
                  id: category1 ? category1.CategoryId : null,
                  url: '',
                  SuperCategoryName: category1 ? category1.SuperCategoryName : null,
                };
              });
              return updatedExtraCategory;
            });
          },
        });
      })
      .catch((error) => {
        console.error('Error loading Categories Details CSV file:', error);
      });
  }

  const fetchData = async () => {
    try {
      const storageRef = ref(storage, 'categories');
      const items = await listAll(storageRef);
  
      const categoryNames = items.items.map(item => item.name.split('.')[0]);
      const filteredItems = extraCategory.filter(category => categoryNames.includes(category.name));
  
      const categoryData = await Promise.all(
        filteredItems.map(async (item) => {
          const id = item.id;
          const name = item.name;
          let url = null;
          try {
            const itemRef = ref(storage, `categories/${name}.jpg`);
            url = await getDownloadURL(itemRef);
          } catch (error) {
            console.error('Error fetching download URL:', error);
          }
          const SuperCategoryName = item.SuperCategoryName;
          return { name, id, url, SuperCategoryName };
        })
      );

      setExtraCategory(prev => {
        return [
          ...prev,
          ...categoryData,
        ];
      });

    } catch (error) {
      console.error('Error listing items in storage:', error);
    }
  };

  useEffect(() => {
    ProductCSV();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    FoodCSV();
    // eslint-disable-next-line
  }, [cart, category]);

  useEffect(() => {
      CategoryCSV();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const shouldFetchData = extraCategory.every(category => 
        category.id !== '' && 
        isNameCapitalized(category.name) && 
        category.SuperCategoryName !== '' &&
        category.url === ''
    );

    const uniqueIds = new Set(extraCategory.map(category => category.id));
    const noRepetitiveIds = uniqueIds.size === extraCategory.length;

    if (shouldFetchData && noRepetitiveIds) {
        fetchData();
    }
    // eslint-disable-next-line
}, [extraCategory]);
  
  const isNameCapitalized = (name) => {
    return name && name.charAt(0) === name.charAt(0).toUpperCase();
  };

  function getProductDetailsFromCSV(data, prodId) {
    const cleanedProdId = prodId ? prodId.trim().toString() : null;
    for (const row of data) {
      const csvProdId = row.ProductId ? row.ProductId.trim() : null;
      if (csvProdId === null) {
        continue;
      }
      if (cleanedProdId === csvProdId) {
        return {
          CategoryName: row.CategoryName,
          CategoryId: row.CategoryId,
        };
      }
    }
    console.log('No match found.');
    return null;
  }

  function getIngredientsFromCSV(data, dish) {
    const cleanedDish = dish ? dish.trim().toString() : null;
    for (const row of data) {
      const csvDish = row.Dishes ? row.Dishes.trim() : null;
      if (csvDish === null) {
        continue;
      }
      if (cleanedDish === csvDish) {
        return {
          Ingredients: row.Ingredients,
        };
      }
    }
    console.log('No match found.');
    return null;
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='text-center'>
        <div className='container mx-auto my-6'>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '3rem', textShadow: '0 0 10px gray-200' }} className='mb-8 flex items-center justify-center'>
              {dishName}
            </h2>
            <IconButton onClick={handleModalOpen} size="small" aria-label="show ingredients">
              <InfoIcon />
            </IconButton>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.7rem', textShadow: '0 0 10px gray-200' }} className='mb-8'>
              Ingredients recommended to purchase
            </h2>
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mx-4 md:mx-8 lg:mx-8'>
                {Array.from(
                  new Set(
                    extraCategory
                      .filter(
                        (category) =>
                          category.id !== '' &&
                          category.name.charAt(0) === category.name.charAt(0).toUpperCase() &&
                          category.SuperCategoryName.trim() !== '' &&
                          category.url.trim() !== '' &&
                          !presentCategory.map(present => present.toLowerCase()).includes(category.name.toLowerCase())
                      )
                      .map((category) => category.url)
                  )
                ).map((uniqueURL) => {
                  const category = extraCategory.find((c) => c.url === uniqueURL);
                  return (
                    <Link
                      key={category.id}
                      to={`/${encodeURIComponent(category.SuperCategoryName)}/${encodeURIComponent(category.id)}`}
                    >
                      <CategoryCard category={category} />
                    </Link>
                  );

                })}
            </div>
        </div>
        <button
        className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg fixed bottom-4 left-4"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
        <ScanItems />
        <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
          className="w-72"
        >
          {/*<Typography variant="h6" component="h2">
            Ingredients Information
        </Typography>*/}
          <Typography variant="body1" component="div" gutterBottom>
            <b>Ingredients needed for the dish:</b>
            <ul>
              {neededCategory.map((ingredient, index) => (
                <li key={index}>• {capitalizeFirstLetter(ingredient)}</li>
              ))}
            </ul>
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            <b>Ingredients present in the cart:</b>
            <ul>
              {presentCategory.map((ingredient, index) => (
                <li key={index}>• {capitalizeFirstLetter(ingredient)}</li>
              ))}
            </ul>
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button onClick={handleModalClose}>Close</Button>
          </Box>
        </Box>
      </Modal>
    </div>
);

};

export default ExtraIngredientsPage;