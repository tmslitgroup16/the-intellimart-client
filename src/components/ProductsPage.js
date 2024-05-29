import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { storage } from '../firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { useCart } from './Cart/CartContext';
import ScanItems from './Scanner/ScanItems';

const ProductsPage = () => {
  const [Products, setProducts] = useState([]);
  const [CategoryName, setCategoryName] = useState('');
  //const { CategoryId, superCategoryName } = useParams();
  const { CategoryId } = useParams();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/assets/product_details.csv');
        const csvData = await response.text();
        const parsedData = Papa.parse(csvData, { header: true }).data;

        let categoryName = '';
        for (const product of parsedData) {
          if (product.CategoryId === CategoryId) {
            categoryName = product.CategoryName;
            break;
          }
        }
        setCategoryName(categoryName);
  
        const filteredProducts = parsedData.filter(product => product.CategoryId === CategoryId);
  
        const storageRef = ref(storage, 'products');
        const items = await listAll(storageRef);
        const productNames = items.items.map(item => item.name.split('.')[0]);
        const filteredItems = filteredProducts.filter(product => productNames.includes(product.ProductName));
        console.log(filteredItems);

        const productData = await Promise.all(
          filteredItems.map(async (item) => {
            const id = item.ProductId;
            const name = item.ProductName;
            const price = item.Price;
            const location = item.Location;
            let url = null;
            try {
              const itemRef = ref(storage, `products/${name}.jpg`);
              url = await getDownloadURL(itemRef);
            } catch (error) {
              console.error('Error fetching download URL:', error);
            }
            const quantity = cart[id]?.quantity || 0;
            return { id, name, price, location, url, quantity };
          })
        );
        setProducts(productData);

        /*setProducts((prevItems) => {
          return prevItems.map((item) => ({
            ...item,
            cartQuantity: cart[item.id]?.quantity || 0,
          }));
        });*/

        setProducts((prevItems) => {
          return prevItems.map((item) => ({
            ...item,
            isScanned: false,
          }));
        });

      } catch (error) {
        console.error('Error fetching and processing data:', error);
      }
    };
  
    fetchData();
  }, [CategoryId, cart]);

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  const handleAddToCart = (product) => {
      const productInCart = cart[product.id];
      if (!productInCart)
        addToCart(product);
      else if(productInCart && cart[product.id].isScanned)
        addToCart({ ...product, isScanned: true });
      else
        addToCart(product);
  }

  /*const handleAddToCart = async (product) => {
    await addToCart(product);
  };*/

  const handleRemoveFromCart = (product) => {
    if(product.quantity>1)
      updateQuantity(product.id, product.quantity-1);
    else
      removeFromCart(product.id);
  }

  return (
    <div className='text-center'>
      <div className='container mx-auto my-6'>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '3rem', textShadow: '0 0 10px gray-200' }} className='mb-8'>
          {CategoryName}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4 md:mx-8 lg:mx-16'>
          {Products.map((product) => (
            <div key={product.id} className='bg-white p-4 rounded-lg shadow-md hover:shadow-lg'>
              <img src={product.url} alt={product.name} className='w-full h-64 object-contain mb-4' />
              <h3 className='text-lg font-semibold'>{product.name}</h3>
              <p className='text-gray-600'>Price: {formatCurrency(product.price)}</p>
              <p className='text-gray-600'>Location: {product.location}</p>
              <div className='flex justify-center items-center mt-4'>
                {product.quantity > 0 && (
                  <>
                    <button
                      //onClick={() => removeFromCart(product.id)}
                      onClick={() => handleRemoveFromCart(product)}
                      className='bg-gray-300 text-gray-700 px-2 py-1 rounded-l'
                    >
                      -
                    </button>
                    <span className='px-2'>{product.quantity}</span>
                    <button onClick={() => handleAddToCart(product)} className='bg-gray-300 text-gray-700 px-2 py-1 rounded-r'>
                      +
                    </button>
                  </>
                )}
              </div>
              {product.quantity === 0 && (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-teal-600 hover:to-teal-800"
                >
                  Add to Cart
                </button>
              )}
              {product.quantity > 0 && (
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="mt-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-teal-600 hover:to-teal-800"
                >
                  Remove from Cart
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <button
        className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg fixed bottom-4 left-4"
        //onClick={() => navigate(`/${encodeURIComponent(superCategoryName)}`)}
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
      <ScanItems />
    </div>
  );
}

export default ProductsPage
