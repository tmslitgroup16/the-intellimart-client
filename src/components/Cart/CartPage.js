import React, { useContext, useEffect, useState } from 'react';
import CartItem from './CartItem';
import { CartContext } from './CartContext';
import '../../styles/cart-styles.css';
import { useNavigate } from 'react-router-dom';
import ScanItems from '../Scanner/ScanItems';
import { auth, db, doc, getDoc } from '../../firebase.config';
import { useCredits } from './CreditsContext';
import InfoIcon from '@mui/icons-material/Info';
import { Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const cartItems = Object.values(cart);
  console.log(cartItems);
  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const { setUsedCredits, isChecked, handleCheckboxChange } = useCredits();

  const checkout = async () => {
    const uid = auth.currentUser.uid;
    const hasUnscannedItem = cartItems.some(item => !item.isScanned);
    if (subTotal === 0)
      alert('Please add some item(s) in the cart.');
    else if (hasUnscannedItem)
      alert('Please scan all the items before checkout.');
    else {
      try {
        // Fetch user data from Firestore using uid
        const userDocRef = doc(db, 'users', uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();

        // Check if email field is empty
        if (!userData || !userData.email || userData.email.trim() === '') {
          alert("Please set your email id before checkout to get the invoice.");
        } else {
          navigate('/recommendation-2');
        }
        // navigate('/recommendation-2');

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }

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

  useEffect(() => {
    if (isChecked && subTotal > 10) {
      let newSubTotal = subTotal;
      let creditsToDeduct = 0;

      newSubTotal -= credits;
      newSubTotal = Math.max(10, newSubTotal);
      creditsToDeduct = subTotal - newSubTotal;

      setUsedCredits(creditsToDeduct);
    } else {
      setUsedCredits(0);
    }
  }, [isChecked, subTotal, credits, setUsedCredits]);

  const calculateTotalAmount = () => {
    let newSubTotal = subTotal;
    let creditsToDeduct = 0;

    if (isChecked && subTotal > 10) {
      newSubTotal -= credits;
      newSubTotal = Math.max(10, newSubTotal);
      creditsToDeduct = subTotal - newSubTotal;
    }

    return {
      totalAmount: newSubTotal.toFixed(2),
      creditsToDeduct: creditsToDeduct
    };
  };

  const { totalAmount, creditsToDeduct } = calculateTotalAmount();

  const [openModal, setOpenModal] = useState(false);
  const handleModalOpen = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-10 col-11 mx-auto">
          <div className="row mt-5 gx-3">
            <div className="col-md-12 col-lg-8 col-11 mx-auto main_cart mb-lg-0 mb-5 shadow">
              <h2
                style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', textShadow: '0 0 10px gray-200' }}
                className="mb-8 text-center"
              >
                My Shopping Cart
              </h2>

              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div className=''>
                  <CartItem
                    key={item.id}
                    item={item}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                  />
                  </div>
                ))
              ) : (
                <p
                  style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 10px gray-200' }}
                  className="empty-cart text-center"
                >
                  Your cart is currently empty.
                </p>
              )}
            </div>
            <div className="col-md-12 col-lg-4 col-11 mx-auto mt-lg-0 mt-md-5 md:mb-auto mb-36">
              <div style={{ textAlign: 'center' }}>


                <h3 className="cart-font">
                  Gross Amount: ₹{subTotal.toFixed(2)}
                </h3>

                <h3 className="cart-font">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Use credit points
                  <IconButton onClick={handleModalOpen} size="small" aria-label="info">
                    <InfoIcon />
                  </IconButton>
                  <br />
                  ({creditsToDeduct} credit points used)
                </h3>

                <h3 className="cart-font">
                  Net Amount to be paid: ₹{totalAmount}
                </h3>

              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg fixed bottom-4 left-4"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
      <button
        className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg fixed bottom-4 right-4"
        onClick={checkout}
      >
        Proceed to Checkout
      </button>
      <ScanItems />

      {/* Modal */}
      <Modal open={openModal} onClose={handleModalClose}>
        <div className="bg-white rounded-lg shadow-md p-4 ml-2 mr-2 mb-2 md:ml-auto md:mr-auto md:mb-auto max-w-md mx-auto mt-56">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-center w-full">Disclaimer</h2>
            <button onClick={handleModalClose} aria-label="close" className="focus:outline-none">
              <CloseIcon />
            </button>
          </div>
          {/* <p className="text-center">
            Net Amount can't be less than ₹10 even after using credit points.
          </p> */}
          <ul className="list-disc pl-6">
            <li>
            • Minimum purchase (i.e., Gross Amount) should be of ₹11 or above to avail the use of credit points.
            </li>
            <li>
            • Bill Amount (i.e., Net Amount) can't be less than ₹10 even after using credit points.
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export default CartPage;

