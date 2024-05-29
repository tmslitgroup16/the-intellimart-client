import React, { useEffect, useState} from 'react';
import Quagga from 'quagga';
import Papa from 'papaparse';
import { useNavigate } from "react-router-dom";
import { useBarcodeContext, BarcodeProvider } from './BarcodeContext';
import logo from '../../images/intellimart.jpeg';
import '../../styles/BarcodeScanner.css';
import { storage } from '../../firebase.config';
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { useCart } from '../Cart/CartContext';

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const { addScannedProduct } = useBarcodeContext();
  const [scannedProducts, setScannedProducts] = useState([]);
  const { cart, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: document.querySelector('#scanner-container'),
          constraints: {
            width: 800,
            height: 600,
          },
        },
        decoder: {
          readers: ['code_128_reader', 'ean_reader', 'upc_reader', 'code_39_reader', 'codabar_reader'],
        },
      },
      function (err) {
        if (err) {
          console.error('Error initializing scanner:', err);
          return;
        }
        console.log('Scanner initialized successfully');
  
        // Start scanning
        Quagga.start();
  
        Quagga.onDetected(function (result) {
          const barcode = result.codeResult.code;
          console.log('Scanned barcode:', barcode);
  
          // Load the CSV file
          fetch('/assets/product_details.csv')
            .then((response) => response.text())
            .then((csv) => {
              Papa.parse(csv, {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                  const productDetails = getProductDetailsFromCSV(results.data, barcode);
  
                  if (productDetails) {
                    setScannedProducts((prevProducts) => {
                      /*if (!prevProducts.includes(productDetails.ProductName)) {
                        return [...prevProducts, productDetails.ProductName];
                      }*/
                      if (!prevProducts.some((p) => p.ProductId === productDetails.ProductId)) {
                        return [...prevProducts, productDetails];
                      }
                      return prevProducts;
                    });
                    addScannedProduct(productDetails.ProductId);
                  } else {
                    console.log('Product details not found for barcode: ' + barcode);
                  }
                },
              });
            })
            .catch((error) => {
              console.error('Error loading CSV file:', error);
            });
        });
      }
    );

    return () => {
      Quagga.stop();
    };
  }, [addScannedProduct, scannedProducts, cart, addToCart]);
  
  console.log(scannedProducts)

  function getProductDetailsFromCSV(data, barcode) {
    const cleanedBarcode = barcode ? barcode.trim().toString() : null;
    for (const row of data) {
      const csvBarcode = row.Barcode ? row.Barcode.trim().replace(/"/g, '') : null;
      if (csvBarcode === null) {
        continue;
      }
      if (cleanedBarcode === csvBarcode) {
        return {
          ProductId: row.ProductId,
          ProductName: row.ProductName,
          Price: row.Price,
          Location: row.Location
        };
      }
    }
    console.log('No match found.');
    return null;
  }

  const saveToCart = async () => {
    const storageRef = ref(storage, 'products');
    const items = await listAll(storageRef);
    const productNames = items.items.map(item => item.name.split('.')[0]);
    const filteredItems = scannedProducts.filter(product => productNames.includes(product.ProductName));

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
        };
        const isScanned = true;
        //const cartQuantity = cart[item.id]?.quantity || 0;
        return { id, name, price, location, url, isScanned };
      })
    );
    
    /*Object.keys(productData).forEach((key) => {
      const productDetails = productData[key];
      addToCart(productDetails);
    });*/

    productData.forEach((product) => {
      const productInCart = cart[product.id];
      if (!productInCart) {
          addToCart(product);
      }
      else{
        /*const updatedQuantity = productInCart.quantity - 1;
        addToCart({ ...product, quantity: updatedQuantity });*/
        /*addToCart(product);
        removeFromCart(product.id);*/
        addToCart(product);
        updateQuantity(product.id, productInCart.quantity);
      }
  });
  };

  const closeScanner = () => {
    window.history.back();
    saveToCart();
  }

  const goToHome = () => {
    navigate('/');
    saveToCart();
  }

  return (
    <>
      <div className="outer-border">
      <div onClick={goToHome} className="cursor-pointer">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="left-section">
          <div id="scanner-instructions">Scan your products in the scanner below</div>
          <div id="scanner-container"></div>
          <button
            onClick={closeScanner}
            className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 mt-15 text-sm py-2 rounded-md self-end"
          >
            Close scanner
          </button>

        </div>
        <div className="right-section">
          <div id="scanned-products">Scanned Products:</div>
          <div class="scrollable-products">
            {scannedProducts.map((product, index) => (
              <p key={index}>
                &#8226; {product.ProductName} - ₹{product.Price} [{product.Location}]
              </p>
            ))}
          </div>
          
        </div>
      </div>
    </>
  );
};

const BarcodeScannerPage = () => (
    <BarcodeProvider>
      <BarcodeScanner />
    </BarcodeProvider>
  );

export default BarcodeScannerPage;