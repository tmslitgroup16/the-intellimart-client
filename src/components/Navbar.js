import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as LogoutIcon } from '../images/logout.svg';
import { ReactComponent as CartIcon} from '../images/cart.svg';
import { ReactComponent as BarsIcon } from '../images/bars.svg';
import { ReactComponent as ClearIcon } from '../images/clear.svg';
import { ReactComponent as MicIcon } from '../images/mic.svg';
import { ReactComponent as SearchIcon } from '../images/search_icon.svg';
import { ReactComponent as PurchaseHistoryIcon } from '../images/order_history.svg';
import { ReactComponent as StoreMapIcon } from '../images/map_location.svg';
import logo from '../images/logo.png';
import '../App.css';
import '../styles/cart-styles.css';
import '../styles/Navbar.css';
import { getAuth, signOut } from "firebase/auth";
import { useCart } from "./Cart/CartContext";
import Papa from 'papaparse';
import RecordingNotification from './RecordingNotification';
import { Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { auth, db } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import StoreMap from '../images/StoreMap.png';

export default function Navbar() {
  const navigate=useNavigate();
  const { clearCart } = useCart();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const searchRef = useRef(null);
  const location = useLocation();
  
  const isProfilePage = location.pathname === '/profile';
  const isPurchaseHistoryPage = location.pathname === '/purchase-history';
  const isPrivacyPage = location.pathname === '/privacy-policy';
  const isReturnPage = location.pathname === '/return-policy';
  const isShippingPage = location.pathname === '/shipping-policy';
  const isTermsPage = location.pathname === '/terms-and-conditions';

 const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        clearCart();
        navigate('/login');
        console.log("User signed out successfully");
      })
      .catch((error) => {
        console.log("Error signing out:", error);
      });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      (!searchRef.current ||
        !searchRef.current.contains(event.target)) &&
      !(document.activeElement === searchRef.current)
    ) {
      setDropdownOpen(false);
    }
  };

  const handleKeyDown = (event) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    const key = event.key;
    const activeIndex = searchResults.findIndex((_, index) => index === 0);

    if (key === 'ArrowDown') {
      const nextIndex = Math.min(activeIndex + 1, searchResults.length - 1);

      event.target.parentNode.children[activeIndex].classList.remove('hover:bg-gray-200');
      event.target.parentNode.children[nextIndex].classList.add('hover:bg-gray-200');
    } else if (key === 'ArrowUp') {
      const prevIndex = Math.max(activeIndex - 1, 0);

      event.target.parentNode.children[activeIndex].classList.remove('hover:bg-gray-200');
      event.target.parentNode.children[prevIndex].classList.add('hover:bg-gray-200');
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]); // Clear results when query is empty
      return;
    }

    Papa.parse('/assets/product_details.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const filteredResults = results.data.filter((row) => {
          return (
            (row.CategoryName && row.CategoryName.toLowerCase().includes(query.toLowerCase())) ||
            (row.ProductName && row.ProductName.toLowerCase().includes(query.toLowerCase()))
          );
        });

          setSearchResults(filteredResults.slice(0, 10).map((row) => `${row.CategoryName} - ${row.ProductName}`));
      },
    });
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line
  }, []);

  const handleRecommendationClick = async(recommendation) => {
    const [categoryName, productName] = recommendation.split(' - ');
    const { productId, categoryId } = await getProductDetails(productName);
    const superCategoryName = await getSuperCategoryName(categoryName);
    // setSearchQuery(recommendation);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchModal(false);
    navigate(`/${encodeURIComponent(superCategoryName)}/${encodeURIComponent(categoryId)}/${encodeURIComponent(productId)}`);
  };

  const getProductDetails = async (productName) => {
    const response = await fetch('/assets/product_details.csv');
    const csvString = await response.text();
    const { data } = Papa.parse(csvString, { header: true });
    const product = data.find(item => item.ProductName === productName);
    if (product) return { productId: product.ProductId, categoryId: product.CategoryId };
    throw new Error('Product details not found');
};

const getSuperCategoryName = async (categoryName) => {
    const response = await fetch('/assets/category_details.csv');
    const csvString = await response.text();
    const { data } = Papa.parse(csvString, { header: true });
    const category = data.find(item => item.CategoryName === categoryName);
    if (category) return category.SuperCategoryName;
    throw new Error('Category details not found');
};

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleVoiceSearch = () => {
    setIsRecording(true); 
    const recognition = new window.webkitSpeechRecognition(); 
    recognition.interimResults = true; 

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');

      setSearchQuery(transcript); 
      handleSearch({ target: { value: transcript } }); 
    };

    recognition.onend = () => {
      setIsRecording(false); 
      recognition.stop();
    };
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
            const userCredits = userDocSnapshot.data().credits;
            setCredits(userCredits);
        }
    };

    fetchCredits();
}, []);

const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirmed = () => {
    handleLogout();
    setShowLogoutModal(false);
  };

  const handleLogoutCancelled = () => {
    setShowLogoutModal(false);
  };

  const [showSearchModal, setShowSearchModal] = useState(false);
  const handleOpenSearchModal = () => {
    setShowSearchModal(true);
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };


  return (
    <div>
  <header className="flex justify-between items-center mt-0 py-8 px-6">
    <div>
      <Link to="/" className="flex">
        <img src={logo} alt="The IntelliMart logo" style={{ height: '5rem' }} />
      </Link>
    </div>

    <div className="flex items-center gap-6 md:gap-8 px-10 py-3 -ml-10 md:ml-0">
      {/* Search bar */}
    <div className="search-container">
      {!isProfilePage && !isPrivacyPage && !isReturnPage && !isShippingPage && !isTermsPage && !isPurchaseHistoryPage && (
        <>
          {/* Mobile view */}
          <div className="z-10 flex items-center icon-container">
            <SearchIcon
              className="w-8 h-8 icon cursor-pointer -mr-2"
              onClick={handleOpenSearchModal}
            />
            <div className="icon-text">Search</div>
          </div>

          {/* Modal for mobile view */}
          <Modal open={showSearchModal} onClose={handleCloseSearchModal}>
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-75 pt-20 pl-2 pr-2 pb-2">
              <div className="bg-white rounded-lg shadow-md p-4 max-w-md w-full mx-auto mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-center w-full">Search</h2>
                  <button
                    onClick={handleCloseSearchModal}
                    className="text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search items here..."
                    className="py-1 px-3 border border-gray-300 rounded-md w-full mr-4"
                  />
                  {searchQuery ? (
                    <ClearIcon
                      className="w-4 h-4 cursor-pointer"
                      onClick={handleClearSearch}
                    />
                  ) : (
                    <MicIcon
                      className="w-4 h-4 cursor-pointer"
                      onClick={handleVoiceSearch}
                    />
                  )}
                  <RecordingNotification isRecording={isRecording} />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg py-1">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200 border-t"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRecommendationClick(result)}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>

      <div className="icons-container">
          <div className="flex items-center gap-3 xs:gap-4">
        
            <div>
            <div onClick={() => setShowLogoutModal(true)} className="z-10 py-1 icon-container" style={{ cursor: 'pointer', position: 'relative' }}>
              <LogoutIcon className="w-6 h-6 icon" />
              <div className="icon-text">Logout</div>
            </div>
              <Modal open={showLogoutModal} onClose={handleLogoutCancelled}>
                <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto mt-20 ml-2 mr-2 mb-2 md:ml-auto md:mr-auto md:mb-auto">
                  <h2 className="text-xl font-bold text-center w-full mb-4">Are you sure to Logout?</h2>
                  <div className="flex justify-center mt-4">
                    <button onClick={handleLogoutConfirmed} className="bg-red-500 text-white font-bold py-2 px-4 rounded mr-2 mx-6">Yes</button>
                    <button onClick={handleLogoutCancelled} className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded mx-6">No</button>
                  </div>
                </div>
              </Modal>
            </div>

            <Link to="/profile" className="z-10 py-1 icon-container" onClick={() => setSearchQuery('')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span className="icon-text">Profile</span>
            </Link>

          <div>
          <div className="z-10 py-1 icon-container" onClick={handleOpen} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>🪙</span>
            <span className="icon-text">Credit Points</span>
          </div>

            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="credit-points-modal-title"
              aria-describedby="credit-points-modal-description"
            >
              <div className="bg-white rounded-lg shadow-md p-4 ml-2 mr-2 mb-2 md:ml-auto md:mr-auto md:mb-auto max-w-md mx-auto mt-20">
                <div className="flex justify-between items-center mb-4">
                  <h2 id="credit-points-modal-title" className="text-xl font-bold text-center w-full">
                    Credit Points
                  </h2>
                  <IconButton aria-label="close" onClick={handleClose}>
                    <CloseIcon />
                  </IconButton>
                </div>
                <p id="credit-points-modal-description" className="text-center font-bold" >
                  You've 🪙 {credits} credit points.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                  • 🪙 1 credit point = ₹1
                  </li>
                  <li>
                  • Minimum Bill Amount (i.e., Net Amount) should be ₹200 or above to earn credit points for your next shopping.
                  </li>
                  <li>
                  • You'll earn credit points worth 4% of your Bill Amount (round-off value). They'll be added to your IntelliMart account after successful payment.
                  </li>
                </ul>
              </div>
            </Modal>
          </div>

          <Link to="/cart" className="z-10 py-1 icon-container" onClick={() => setSearchQuery('')}>
            <CartIcon className="w-6 h-6 icon" />
            <span className="icon-text">My Cart</span>
          </Link>

          <Link to="/purchase-history" className="z-10 py-1 icon-container" onClick={() => setSearchQuery('')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PurchaseHistoryIcon className="w-6 h-6 icon" />
            <span className="icon-text">Purchase History</span>
          </Link>

          <div>
          <div className="z-10 py-1 icon-container" onClick={handleOpenModal} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <StoreMapIcon className="w-6 h-6 icon" />
            <span className="icon-text">Store Map</span>
          </div>
            <Modal open={openModal} onClose={handleCloseModal}>
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                onClick={handleCloseModal}
              >
                <div
                  className="relative bg-white rounded-lg shadow-md max-w-full mx-auto ml-2 mr-2 mb-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4 p-4">
                    <h2 className="text-xl font-bold text-center w-full">"The IntelliMart" Store Map</h2>
                    <button
                      onClick={handleCloseModal}
                      aria-label="close"
                      className="focus:outline-none"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <img src={StoreMap} alt="Store Map" className="w-full max-h-screen" />
                </div>
              </div>
            </Modal>
          </div>

          <div className="relative group" ref={dropdownRef}>
            <button className="py-1" onClick={toggleDropdown}>
              <BarsIcon className="w-6 h-6" />
            </button>
            {isDropdownOpen && (
              <div className="z-10 absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-lg py-1">
                <Link
                  to="/privacy-policy"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 "
                  onClick={closeDropdown}
                  style={{ width: '200px' }}
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/return-policy"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 border-t"
                  onClick={closeDropdown}
                  style={{ width: '200px' }}
                >
                  Return, Refund and Cancellation Policy
                </Link>
                <Link
                  to="/terms-and-conditions"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 border-t"
                  onClick={closeDropdown}
                  style={{ width: '200px' }}
                >
                  Terms and Conditions
                </Link>
                <Link
                  to="/shipping-policy"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 border-t"
                  onClick={closeDropdown}
                  style={{ width: '200px' }}
                >
                  Shipping and Delivery
                </Link>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      </header>
    </div>
  );

}

