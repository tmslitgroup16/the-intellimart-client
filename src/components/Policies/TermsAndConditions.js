// TermsAndConditions.js
import React from 'react';
import PolicyPage from './PolicyPage';

const TermsAndConditions = () => {
  const termsContent = `
Welcome to Intellimart! By accessing or using our application interface, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before accessing or using our services.

1. Account Registration:

Users must register an account using valid email or phone number credentials through Firebase Authentication.
Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.

2. Personalized Recommendations:

Our system utilizes machine-learning algorithms to provide personalized recommendations based on users' preferences.
While we strive to offer accurate suggestions, users acknowledge that these recommendations are curated and may not always perfectly align with their preferences.

3. Digital Cart and Checkout:

Users can add items to their digital cart either by exploring suggested dishes or manually browsing products.
The system may recommend additional items based on the contents of the user's digital cart.
At checkout, users can choose from various payment options provided by the Razorpay Payment Gateway, including debit/credit cards, Net Banking, UPI, etc.

4. Security and Privacy:

We prioritize the security of our users' information and utilize Firebase Authentication to ensure secure sign-up and login processes.
User data is stored in our Firestore database and is handled in accordance with our Privacy Policy.

5. Intuitive Features:

Our system offers intuitive search functionality and barcode scanning capabilities, powered by QuaggaJS, to facilitate easy navigation and product addition.

6. User Conduct:

Users agree to use our services responsibly and in compliance with all applicable laws and regulations.
Any misuse or unauthorized access to the system may result in the termination of the user's account.

7. Modification of Terms:

We reserve the right to modify these terms and conditions at any time without prior notice.
Users are encouraged to review these terms periodically to stay informed of any changes.

8. Disclaimer of Warranties:

Our system is provided on an "as is" and "as available" basis, without any warranties of any kind.
We do not guarantee the accuracy, completeness, or reliability of any information or recommendations provided through our services.

9. Limitation of Liability:

In no event shall we be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of our services.

10. Governing Law:

These terms and conditions shall be governed by and construed in accordance with the laws, without regard to its conflict of law provisions.
By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please refrain from using our services. If you have any questions or concerns about these terms, please contact us at tmslitgroup16@gmail.com.
  `;

  return <PolicyPage title="Terms and Conditions" content={termsContent} />;
};

export default TermsAndConditions;
