import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase.config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import QRCode from 'qrcode.react';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const PurchaseHistoryPage = () => {
  const navigate = useNavigate(); 
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');

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

  const fetchPurchases = async () => {
    const user = auth.currentUser;
    if (user) {
      const purchaseHistoryRef = collection(db, 'purchaseHistory', user.uid, 'purchases');
      const q = query(purchaseHistoryRef, orderBy('purchaseDate', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);

      const purchaseData = [];
      querySnapshot.forEach((doc) => {
        purchaseData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setPurchases(purchaseData);
    } else {
      setPurchases([]);
    }
  };

  const getInvoiceUrl = async (purchaseId) => {
    const storageRef = ref(storage, `invoices/invoice_${purchaseId}.pdf`);
    const url = await getDownloadURL(storageRef);
    setInvoiceUrl(url);
    setShowModal(true);
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div className="container mx-auto p-4 mb-14">
      <h2
                style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', textShadow: '0 0 10px gray-200' }}
                className="mb-8 text-center"
              >
                Purchase History
              </h2>
      {purchases.length === 0 ? (
        <p 
                  style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 10px gray-200' }}
                  className="empty-cart text-center"
                >
                  You have no purchase history.
                </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="bg-white rounded-lg shadow-md p-4 relative">
          <p className="text-gray-600 text-xl font-bold">Date & T ime: {purchase.purchaseDate.toDate().toLocaleString('en-US', options).replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3')}</p>
          <p className="text-gray-600 text-xl font-bold">Purchase ID: {purchase.id}</p>
          <p className="text-gray-600 text-xl font-bold">Total Price: ₹{purchase.totalPrice}</p>

            <div className="mt-10">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 absolute bottom-4 left-1/2 transform -translate-x-1/2"
                onClick={() => getInvoiceUrl(purchase.id)}
              >
                Invoice
              </button>
            </div>
          </div>
        ))}

        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="invoice-modal-title"
        aria-describedby="invoice-modal-description"
      >
        <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto mt-20">
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

      <button
        className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-3 text-lg fixed bottom-4 left-4"
        onClick={() => navigate("/")}
      >
        Go Back
      </button>
    </div>
  );
};

export default PurchaseHistoryPage;
