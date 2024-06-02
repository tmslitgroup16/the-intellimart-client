import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { auth, db, storage } from "../firebase.config";
import { useCart } from "./Cart/CartContext";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { collection, doc, getDoc, setDoc, query, orderBy, limit, getDocs, updateDoc, increment } from 'firebase/firestore';
import Papa from 'papaparse';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import QRCode from 'qrcode.react';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import '../styles/PaymentPage.css';
import logo from '../images/logo.png';
//import * as jsPDF from 'jspdf';
//import 'jspdf-autotable';
//import jsPDF from '/node_modules/jspdf/dist/jspdf.umd.min.js'
import { applyPlugin } from 'jspdf-autotable'
import { useCredits } from "./Cart/CreditsContext";
applyPlugin(jsPDF)

const PaymentPage = () => {
  const navigate = useNavigate()
  const [isPaid, setIsPaid] = useState(false);
  const [isInvoice, setIsInvoice] = useState(false);
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [purchaseDetails, setPurchaseDetails] = useState({
    ProductName: [],
    Price: [],
    CategoryName: [],
    CategoryId: [],
    ProductId: [],
    Quantity: [],
  });



  const [PurchaseId, setPurchaseId] = useState('');
  const [PurchaseDate, setPurchaseDate] = useState('');

  const [purchase, setPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const uid = auth.currentUser.uid;
  const { subTotal, clearCart, cart } = useCart();

  const { usedCredits, setUsedCredits, setIsChecked } = useCredits();
  const netAmount = subTotal - usedCredits;

  let earnedCredits = 0;

  if (netAmount >= 200) {
    earnedCredits = Math.round(0.04 * netAmount);
  }

  const updatePurchaseDetails = async (cartItems) => {
    const productIds = cartItems.map(item => item.id);
    const productNames = cartItems.map(item => item.name);
    const prices = cartItems.map(item => item.price);
    const quantities = cartItems.map(item => item.quantity);

    const categoryDetailsFile = await fetch('/assets/product_details.csv').then(r => r.text());
    const categoryDetails = Papa.parse(categoryDetailsFile, { header: true }).data;

    const categoryData = productIds.map(productId => {
      const categoryDetail = categoryDetails.find(detail => detail.ProductId === productId);
      return categoryDetail
        ? {
          categoryName: categoryDetail.CategoryName,
          categoryId: categoryDetail.CategoryId,
        }
        : { categoryName: '', categoryId: '' };
    });

    console.log(categoryData);

    setPurchaseDetails(prevState => ({
      ...prevState,
      ProductId: productIds,
      ProductName: productNames,
      Price: prices,
      Quantity: quantities,
      CategoryName: categoryData.map(data => data.categoryName),
      CategoryId: categoryData.map(data => data.categoryId),
    }));
  };

  const storePurchasedItems = async () => {
    try {
      const purchaseDate = new Date();
      const hashedUid = uid.split("").reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "");
      const purchaseId = hashedUid.substring(0, 5).toUpperCase() + purchaseDate.toISOString().replace(/\D/g, "").substr(-5);

      const docRef = collection(db, "purchaseHistory");
      const userDocRef = doc(db, 'users', uid);
      const userDocSnapshot = await getDoc(userDocRef);

      await setDoc(doc(docRef, uid), {
        uid: uid,
        name: userDocSnapshot.data().fullName,
      });

      const purchasesRef = collection(doc(db, 'purchaseHistory', uid), 'purchases');

      await setDoc(doc(purchasesRef, purchaseId), {
        categoryId: purchaseDetails.CategoryId,
        categoryName: purchaseDetails.CategoryName,
        discount: usedCredits,
        netAmount: netAmount,
        price: purchaseDetails.Price,
        productId: purchaseDetails.ProductId,
        productName: purchaseDetails.ProductName,
        purchaseDate: purchaseDate,
        purchaseId: purchaseId,
        quantity: purchaseDetails.Quantity,
        totalPrice: subTotal,
      });

      setPurchaseId(purchaseId);

      const options = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };

      setPurchaseDate(purchaseDate.toLocaleString('en-US', options).replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3'));
      console.log(purchaseDate.toLocaleString('en-US', options).replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3'));

      console.log('Purchased items stored successfully.');

    } catch (error) {
      console.error('Error storing purchased items:', error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserDetails(userData);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (isPaid) {
      const cartItems = Object.values(cart);
      updatePurchaseDetails(cartItems);
    }
    // eslint-disable-next-line  
  }, [isPaid, cart])

  useEffect(() => {
    if (purchaseDetails.ProductId.length > 0) {
      storePurchasedItems();
    }
    // eslint-disable-next-line
  }, [purchaseDetails]);

  useEffect(() => {
    if (PurchaseId !== '') {
      generatePDF();
    }
    // eslint-disable-next-line
  }, [PurchaseId]);


  // const [isWideScreen, setIsWideScreen] = useState(false);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsWideScreen(window.innerWidth > 600);
  //   };

  //   handleResize(); // Check on initial render
  //   window.addEventListener('resize', handleResize); // Listen for window resize
  //   return () => window.removeEventListener('resize', handleResize); // Cleanup
  // }, []);

  const handlePayment = async () => {
    try {
      const createOrderResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.ceil(netAmount),
          currency: 'INR',
          customer_email: userDetails.email,
          customer_phone: userDetails.phoneNumber,
        })
      });
      const createOrderData = await createOrderResponse.json();
      console.log(createOrderData.id);
      const options = {
        key: `${process.env.REACT_APP_RAZORPAY_KEY_ID}`,
        amount: Math.ceil(createOrderData.amount),
        name: 'The Intellimart',
        description: 'Product/Service Purchase',
        order_id: createOrderData.id,
        handler: async (response) => {
          try {
            const verificationResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/verify_payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id,
                amount: Math.ceil(netAmount),
                customer_email: userDetails.email,
                customer_phone: userDetails.phoneNumber
              })
            });
            const verificationData = await verificationResponse.json();
            if (verificationData.success) {
              console.log('Payment successful!');
              console.log(verificationData.payment_id);
              setIsPaid(true);
            } else {
              console.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const logoWidth = 25; // Adjust the width of the logo as needed
    const logoHeight = 25; // Adjust the height of the logo as needed
    const logoX = 10; // X-coordinate of the logo
    const logoY = 10; // Y-coordinate of the logo
    const spacing = 11; // Adjust the spacing between lines as needed

    // Add the Intellimart logo
    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Add the "Invoice" heading aligned with the logo
    const invoiceHeadingWidth = doc.getTextWidth('INVOICE');
    const invoiceHeadingX = (doc.internal.pageSize.getWidth() - invoiceHeadingWidth) / 2; // Center the heading
    const invoiceHeadingY = logoY + logoHeight / 2; // Adjust the vertical alignment of the heading
    doc.setFontSize(20); // Adjust the font size of the heading as needed
    doc.text('INVOICE', invoiceHeadingX, invoiceHeadingY, { align: 'left' });

    const originalTextX = invoiceHeadingX; // Align with the Invoice heading
    const originalTextY = invoiceHeadingY + spacing; // Below the Invoice heading
    doc.setFontSize(12); // Adjust the font size as needed
    doc.setFont('bold'); // Set font type to bold
    doc.text('Original for Recipient', originalTextX, originalTextY, { align: 'left' });

    // Set the initial Y-coordinate for the details below the logo and heading
    let detailY = logoY + logoHeight + spacing;

    // Add the details (name, user ID, phone, email, etc.)
    doc.setFontSize(12); // Set the font size for details
    doc.text(`Name: ${userDetails.fullName}`, 20, detailY);
    doc.text(`User ID: ${uid}`, 20, detailY += spacing);
    doc.text(`Phone: ${userDetails.phoneNumber}`, 20, detailY += spacing);
    doc.text(`Email: ${userDetails.email}`, 20, detailY += spacing);
    doc.text(`Date & Time: ${PurchaseDate}`, 20, detailY += spacing);
    doc.text(`Purchase ID: ${PurchaseId}`, 20, detailY += spacing);

    // Table of Items
    doc.autoTable({
      startY: detailY + spacing, // Start the table below the details
      head: [['Product', 'Category', 'Unit Price', 'Quantity', 'Total']],
      body: purchaseDetails.ProductId.map((productId, index) => [
        purchaseDetails.ProductName[index],
        purchaseDetails.CategoryName[index],
        purchaseDetails.Price[index],
        purchaseDetails.Quantity[index],
        purchaseDetails.Price[index] * purchaseDetails.Quantity[index]
      ]),
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      },
    });

    // Net Amount and other details
    const finalYAfterTable = doc.autoTable.previous.finalY;
    doc.text(`Gross Amount: Rs. ${subTotal}`, 20, finalYAfterTable + spacing);
    doc.text(`Discount: Rs. ${usedCredits}`, 20, finalYAfterTable + spacing * 2);
    doc.text(`Net Amount paid: Rs. ${netAmount}`, 20, finalYAfterTable + spacing * 3);
    doc.text(`Credit points earned: ${earnedCredits}`, 20, finalYAfterTable + spacing * 4);
    // doc.text('Thank You for Shopping with us!', 20, finalYAfterTable + spacing * 5);
    // doc.text('This is a computer-generated invoice', 20, finalYAfterTable + spacing * 6);
    doc.text('Thank You for Shopping with us!', (doc.internal.pageSize.getWidth() / 2) - ((doc.getStringUnitWidth('Thank You for Shopping with us!') * doc.internal.getFontSize() / doc.internal.scaleFactor) / 2), finalYAfterTable + (spacing * 5));


    // Watermark of Intellimart Logo (Lighter)
    // const watermarkDimensions = 200; // Adjust size of watermark
    // const xPosition = (doc.internal.pageSize.getWidth() - watermarkDimensions) / 2;
    // const yPosition = (doc.internal.pageSize.getHeight() - watermarkDimensions) / 2;
    // const opacity = 0.5;
    // doc.addImage(logo, 'PNG', xPosition, yPosition, watermarkDimensions, watermarkDimensions, undefined, 'FAST', opacity); // Adjust dimensions and position

    // Save or download the PDF
    const fileName = `invoices/invoice_${PurchaseId}.pdf`;
    const blob = doc.output('blob');
    const metadata = {
      contentType: 'application/pdf'
    };
    const invoiceRef = ref(storage, fileName);
    // let flag=false;
    uploadBytes(invoiceRef, blob, metadata).then((snapshot) => {
      console.log('Uploaded the pdf to Cloud Storage!');
      // flag=true;
    });

    // let url = "";
    // if (flag) { 
    //   url = getDownloadURL(invoiceRef);
    //   flag=false;
    // }

    // console.log(userDetails.email)
    // console.log(userDetails.phoneNumber)
    // console.log(url)
    

    // Send the invoice via POST request
    const formData = new FormData();
    formData.append('pdfFile', blob);
    formData.append('userEmail', userDetails.email);
    formData.append('PurchaseId', PurchaseId);
    // formData.append('userPhone', userDetails.phoneNumber);
    // formData.append('invoiceUrl', url);
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/send_invoice`, {
      method: 'POST',
      // mode: 'no-cors', //This line is creating problems; find a different solution for removing cors error
      body: formData
    });
    if (response.ok) {
      console.log('Invoice sent successfully!');
      alert("Payment Successful!");
      setIsInvoice(true);
    } else {
      console.error('Failed to send invoice!');
    }
  };




  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        clearCart();
        setIsChecked(false);
        setUsedCredits(0);
        navigate('/login');
        console.log("User signed out successfully");
      })
      .catch((error) => {
        console.log("Error signing out:", error);
      });
  };

  const handleShopAgain = () => {
    clearCart();
    setIsChecked(false);
    setUsedCredits(0);
    navigate('/');
  }

  const fetchLastPurchase = async () => {
    const user = auth.currentUser;
    if (user) {
      const purchaseHistoryRef = collection(db, 'purchaseHistory', user.uid, 'purchases');
      const q = query(purchaseHistoryRef, orderBy('purchaseDate', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const purchaseData = querySnapshot.docs[0].data();
        setPurchase({
          id: querySnapshot.docs[0].id,
          ...purchaseData,
        });
      } else {
        setPurchase(null);
      }
    } else {
      setPurchase(null);
    }
  };

  const getInvoiceUrl = async () => {
    if (purchase) {
      const storageRef = ref(storage, `invoices/invoice_${purchase.id}.pdf`);
      const url = await getDownloadURL(storageRef);
      setInvoiceUrl(url);
      setShowModal(true);
    }
  };

  const updateCredits = async () => {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        credits: increment(earnedCredits - usedCredits),
      })
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  }

  useEffect(() => {
    if (isInvoice) {
      fetchLastPurchase();
      updateCredits();
    }
    // eslint-disable-next-line
  }, [isInvoice]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirmed = () => {
    handleLogout();
    setShowLogoutModal(false);
  };

  const handleLogoutCancelled = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {!isPaid && !isInvoice ? (
        <div>
          <div style={{ marginTop: '70px' }}>
            <div style={{ marginLeft: '32px' }}>
              <Link className="flex">
                <img src={logo} alt="The IntelliMart logo" style={{ height: '4.2rem' }} />
              </Link>
            </div>
            <h2
              style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', textShadow: '0 0 10px rgba(0, 0, 0, 0.2)', marginBottom: '40px' }}
              className="mb-8 text-center"
            >
              Summary
            </h2>
            <div className="text-center mb-8">
              <table style={{ margin: '0 auto', borderSpacing: '20px', borderCollapse: 'separate' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', fontFamily: "'Cinzel', serif", fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', color: '#333' }}>Gross Amount:</td>
                    <td style={{ padding: '10px', fontFamily: "'Cinzel', serif", fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', color: '#333' }}>₹{subTotal}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', fontFamily: "'Cinzel', serif", fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', color: '#333' }}>Discount:</td>
                    <td style={{ padding: '10px', fontFamily: "'Cinzel', serif", fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', color: '#333' }}>₹{usedCredits}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ padding: '10px', fontFamily: "'Cinzel', serif", fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', color: '#333', borderTop: '1px solid rgba(0, 0, 0, 0.5)', marginBottom: '10px' }}>
                      Net Amount to be paid: ₹{netAmount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ position: 'fixed', bottom: '20px', left: '20px' }}>
            <button
              className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg"
              onClick={() => navigate('/cart')}
            >
              Go Back
            </button>
          </div>
          <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
            <button
              className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg"
              onClick={handlePayment}
            >
              Pay
            </button>
          </div>

        </div>
      ) : (
        <div style={{ marginTop: '70px' }}>
          <div style={{ marginLeft: '32px' }}>
              <Link className="flex">
                <img src={logo} alt="The IntelliMart logo" style={{ height: '4.2rem' }} />
              </Link>
            </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-center mb-4">
              <p className="font-bold"
                style={{
                  fontFamily: "'Cinzel', serif",
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                }}>
                Thank You for shopping with us!
              </p>
            </div>
            <div className="text-center mb-4">
              <p className="font-bold"
                style={{
                  fontFamily: "'Cinzel', serif",
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                }}>
                Invoice has been sent to your Email.
              </p>
            </div>
            <div className="text-center mb-4">
              {earnedCredits > 0 &&
                <p className="font-bold"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    textShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                  }}>
                  You've earned {earnedCredits} credit points.
                </p>
              }
              {earnedCredits === 0 &&
                <p className="font-bold"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    textShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                  }}>
                  No credit points earned.
                </p>
              }
            </div>
            <div className="text-center">
              <button
                  className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg"
                  onClick={getInvoiceUrl}
                >
                  QR code for Invoice
                </button>
              </div>
          </div>


          <div className="flex justify-center items-center mt-6 space-x-4 payment-buttons">
            <button
              className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg"
              onClick={handleShopAgain}
              style={{ position: 'fixed', bottom: '20px', left: '20px' }}
            >
              Shop Again
            </button>

            <button
              className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg"
              onClick={() => setShowLogoutModal(true)}
              style={{ position: 'fixed', bottom: '20px', right: '20px' }}
            >
              Logout
            </button>
          </div>

          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            aria-labelledby="invoice-modal-title"
            aria-describedby="invoice-modal-description"
          >
            <div className="bg-white rounded-lg shadow-md p-4 ml-2 mr-2 mb-2 md:ml-auto md:mr-auto md:mb-auto max-w-md mx-auto mt-20">
              <div className="flex justify-between items-center mb-4">
                <h2 id="invoice-modal-title" className="text-xl font-bold text-center w-full">
                  Scan the QR code for invoice
                </h2>
                <IconButton aria-label="close" onClick={() => setShowModal(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <div className="flex justify-center">
                <QRCode value={invoiceUrl} size={256} />
              </div>
            </div>
          </Modal>

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
      )}
    </>
  )
}

export default PaymentPage