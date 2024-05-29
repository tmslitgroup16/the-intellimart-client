import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';

const ScanItems = () => {
  return (
    <div
      style={{
        position: 'fixed',
        //bottom: '20px',
        bottom: '80px',
        right: '20px',
        zIndex: '1000',
        fontSize: '24px',
        background: 'linear-gradient(to right, #01a9ac, #01dbdf)',
        padding: '10px',
        width: '65px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Link to="/scanner" style={{ textDecoration: 'none', color: 'white' }} data-tooltip="Scan Items">
        <FontAwesomeIcon icon={faBarcode} />
      </Link>
    </div>
  );
};

export default ScanItems;
