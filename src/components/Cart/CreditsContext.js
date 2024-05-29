import React, { createContext, useContext, useState } from 'react';

const CreditsContext = createContext();

export const CreditsProvider = ({ children }) => {
  const [usedCredits, setUsedCredits] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setIsChecked(isChecked);
  };

  return (
    <CreditsContext.Provider value={{ usedCredits, setUsedCredits, isChecked, setIsChecked, handleCheckboxChange }}>
      {children}
    </CreditsContext.Provider>
  );
};


export const useCredits = () => useContext(CreditsContext);
