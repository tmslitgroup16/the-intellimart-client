// ReturnPolicy.js
import React from 'react';
import PolicyPage from './PolicyPage';

const ReturnPolicy = () => {
  const returnContent = `
At Intellimart, we prioritize customer satisfaction and aim to provide a hassle-free shopping experience. We understand that there may be occasions where you need to return a product, request a refund, or cancel an order. To ensure transparency and clarity, please review our refund and return policy outlined below:

1. Eligibility for Returns:

We accept returns for eligible products within 36 hours from the time of purchase.
To be eligible for a return, the product must be unused, undamaged, and in its original packaging.
Certain products, such as perishable goods or personalized items, may not be eligible for returns.

2. Return Process:

To initiate a return, please contact our customer support team or visit the store within the specified return period.
Our team will guide you through the return process and provide you with instructions on how to return the product.

3. Refund Process:

Upon receiving the returned product and verifying its eligibility, we will process your refund.
Refunds will be issued to the original payment method used for the purchase.
Please allow 2 working days for the refund to reflect in your account, depending on your financial institution.

4. Non-Refundable Items:

Certain items may not be eligible for refunds, including:
Products that have been used, damaged, or altered.
Gift cards or promotional items.

5. Defective or Damaged Products:

If you receive a defective or damaged product, please contact us immediately.
We may require photographic evidence of the damage to expedite the return and refund process.

6. Cancellation of Orders:

Once an order has been processed and the payment is done, it cannot be canceled, and the standard return process applies.

7. Modifications to the Refund & Return Policy:

We reserve the right to modify or update our return, refund and cancellation policy at any time without prior notice.
Any changes to the policy will be communicated on our website or through other appropriate channels.

8. Contact Us:

If you have any questions or concerns regarding our return, refund and cancellation policy, please don't hesitate to contact our customer support team at tmslitgroup16@gmail.com.
By making a purchase with us, you acknowledge that you have read, understood, and agree to abide by our return, refund and cancellation policy. If you do not agree with any part of this policy, please refrain from using our services.
  `;

  return <PolicyPage title="Return, Refund and Cancellation Policy" content={returnContent} />;
};

export default ReturnPolicy;
