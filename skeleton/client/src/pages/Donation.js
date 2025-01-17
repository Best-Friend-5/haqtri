import React, { useState } from 'react';
import './Donation.css'; // Ensure CSS is properly imported

const Donation = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // Default to 'card'
  const [customAmount, setCustomAmount] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleCustomAmountChange = (event) => {
    setCustomAmount(event.target.value);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amount && !customAmount) {
      setError('Please select or enter a donation amount.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Prepare donation data
    const donationData = {
      amount: customAmount ? customAmount : amount,
      email: email,
      paymentMethod: paymentMethod,
      paymentMethodId: 'mock-payment-method-id', // Replace with actual payment method ID from frontend SDK
    };

    try {
      const response = await fetch('/api/donations/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      const result = await response.json();
      if (response.ok) {
        setDonationSuccess(true);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to process donation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="donation-page">
      <h1 className="donation-heading">Donation Page</h1>
      <p className="donation-description">Your contribution helps us make a difference!</p>
      
      {donationSuccess ? (
        <div className="success-message">
          <h2>Thank you for your donation!</h2>
          <p>Your support means a lot to us.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="amount-selection">
            <h3>Choose Donation Amount</h3>
            <div className="amount-buttons">
              <button type="button" onClick={() => { setAmount(10); setCustomAmount(''); }}>$10</button>
              <button type="button" onClick={() => { setAmount(25); setCustomAmount(''); }}>$25</button>
              <button type="button" onClick={() => { setAmount(50); setCustomAmount(''); }}>$50</button>
            </div>

            <div className="custom-amount">
              <input
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>
          </div>

          <div className="payment-method-selection">
            <h3>Select Payment Method</h3>
            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={handlePaymentMethodChange}
              />
              Credit/Debit Card
            </label>
            <label>
              <input
                type="radio"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={handlePaymentMethodChange}
              />
              Bank Transfer
            </label>

            {/* Conditionally render the payment options */}
            {paymentMethod === 'card' && (
              <div className="card-payment-options">
                <p>Enter credit card details</p>
                {/* Additional card payment fields can go here */}
              </div>
            )}
            {paymentMethod === 'transfer' && (
              <div className="transfer-payment-options">
                <p>Provide transfer details</p>
                {/* Additional bank transfer details can go here */}
              </div>
            )}
          </div>

          <div className="email-input">
            <h3>Enter Your Email Address</h3>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="donate-button" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Donate Now'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Donation;
