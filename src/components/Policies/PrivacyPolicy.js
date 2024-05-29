// PrivacyPolicy.js
import React from 'react';
import PolicyPage from './PolicyPage';

const PrivacyPolicy = () => {
  const privacyContent = `
Protecting your privacy is important to us. This privacy policy outlines how we collect, use, and safeguard your personal information when you use our services. By accessing or using our services, you consent to the terms outlined in this privacy policy.

1. Information We Collect:

Personal Information: When you sign up for an account, we may collect personal information such as your name, email address, phone number, and billing information.
Usage Data: We may collect information about how you interact with our services, including browsing history, search queries, and preferences.

2. How We Use Your Information:

To Provide Services: We use the information collected to deliver the services you request, including processing orders, personalizing recommendations, and improving our platform.
To Communicate: We may use your contact information to send you updates, newsletters, promotional offers, or important notifications related to your account.
To Improve User Experience: We analyze usage data to enhance and optimize our services, including website performance, user interface, and content relevancy.

3. Information Sharing:

We do not sell, trade, or rent your personal information to third parties without your consent.
We may share your information with trusted third-party service providers who assist us in operating our platform, processing payments, or delivering services on our behalf.

4. Data Security:

We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure.
Despite our efforts to safeguard your data, no method of transmission over the internet or electronic storage is 100% secure. Therefore, we cannot guarantee absolute security.

5. Data Retention:

We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy or as required by the law.

6. Your Rights:

You have the right to access, correct, or delete your personal information. You may also request to restrict or object to the processing of your data.
You may opt-out of receiving promotional communications from us by following the unsubscribe instructions provided in the communication.

7. Children's Privacy:

Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13 years of age. If you believe we have collected information from a child under 13, please contact us immediately.

8. Changes to Privacy Policy:

We reserve the right to modify or update this privacy policy at any time. Any changes will be effective immediately upon posting on our website.
We encourage you to review this privacy policy periodically for any updates.

9. Contact Us:

If you have any questions or concerns about our privacy policy or data practices, please contact us at tmslitgroup16@gmail.com.
By using our services, you acknowledge that you have read, understood, and agree to abide by our privacy policy. If you do not agree with any part of this policy, please refrain from using our services.
  `;

  return <PolicyPage title="Privacy Policy" content={privacyContent} />;
};

export default PrivacyPolicy;
