// PolicyPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PolicyPage.css'; // Import the CSS file

const PolicyPage = ({ title, content }) => {
  const navigate = useNavigate();
  return (
    <section className="policy-page">
      <h2 className="policy-title">{title}</h2>
      <div className="policy-content !pb-7">
        <pre>{content}</pre>
      </div>
      <button className="back-button" onClick={() => navigate('/')}>
        Go Back
      </button>
    </section>
  );
};

export default PolicyPage;
