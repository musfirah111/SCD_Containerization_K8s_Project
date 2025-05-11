import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Clock } from 'lucide-react';
import { formatDate } from '../utils/date';
import { Layout } from '../components/Layout';
import axios from 'axios';

interface Doctor {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    phone_number: string;
    role: string;
    profile_picture: string;
    date_created: string;
  };
  description: string;
  specialization: string;
  qualification: string[];
  department_id: any;
  shift: string;
  working_hours: string;
  availability_status: boolean;
  rating: number;
  experience: number;
  consultation_fee: number;
  date_of_joining: string;
}

// interface PaymentResponse {
//   success: boolean;
//   message: string;
//   data: {
//     invoice: {
//       _id: string;
//       stripe_invoice_id: string;
//       payment_status: string;
//     };
//     paymentIntent: {
//       id: string;
//       status: string;
//       amount: number;
//     };
//     testMode: boolean;
//   };
// }

// const TEST_CARDS = {
//   visa: '4242424242424242',
//   mastercard: '5555555555554444',
//   declined: '4000000000000002'
// };

export default function PaymentPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [invoice, setInvoice] = useState<{ _id: string; stripe_invoice_id: string } | null>(null);
  
  const appointmentDate = searchParams.get('date');
  const appointmentTime = searchParams.get('slot');

  // Add validation state
  const [cardError, setCardError] = useState('');

  // Add new state for payment success
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Add useEffect to handle secure context
  useEffect(() => {
    // Check if running in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (window.location.protocol !== 'https:' && !isDevelopment) {
      console.warn('Warning: Payment form should be served over HTTPS in production');
    }
  }, []);

  // Card number validation function
  const validateCardNumber = (number: string) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if empty
    if (!cleanNumber) {
      setCardError('Card number is required');
      return false;
    }

    // Check length (most cards are 16 digits)
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      setCardError('Card number must be between 13 and 19 digits');
      return false;
    }

    // Luhn Algorithm validation
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const isValid = (sum % 10) === 0;
    if (!isValid) {
      setCardError('Invalid card number');
    } else {
      setCardError('');
    }
    return isValid;
  };

  // Format card number as user types
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < cleanValue.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += cleanValue[i];
    }
    
    return formattedValue;
  };

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setPaymentDetails({
      ...paymentDetails,
      cardNumber: formattedValue
    });
    validateCardNumber(formattedValue);
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.get<Doctor>(`http://localhost:5000/api/doctors/${id}`, config);
        setDoctor(response.data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (!doctor || !appointmentDate || !appointmentTime) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Invalid booking details</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#097a93] transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const appointmentId = localStorage.getItem('appointmentId');

      if (!token || !userId || !appointmentId) {
        throw new Error('Missing required information');
      }

      // First get the patient ID for the logged-in user
      const patientResponse = await axios.get(
        `http://localhost:5000/api/patients/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const patientId = patientResponse.data.id;

      // Generate invoice with proper data
      const invoiceResponse = await axios.post(
        'http://localhost:5000/api/billing/invoice/generate',
        {
          patientId,
          totalAmount: doctor.consultation_fee,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentId,
          paymentDetails: {
            cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
            expiryMonth: parseInt(paymentDetails.expiryDate.split('/')[0]),
            expiryYear: parseInt('20' + paymentDetails.expiryDate.split('/')[1]),
            cvv: paymentDetails.cvv
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!invoiceResponse.data.success) {
        throw new Error(invoiceResponse.data.message);
      }

      setInvoice(invoiceResponse.data.data.invoice);

      // Process payment with the generated invoice
      const paymentResponse = await axios.post(
        'http://localhost:5000/api/billing/pay',
        {
          invoiceId: invoiceResponse.data.data.invoice._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (paymentResponse.data.success) {
        setPaymentSuccess(true);
        setInvoice(invoiceResponse.data.data.invoice);
      } else {
        throw new Error(paymentResponse.data.message);
      }

    } catch (error: any) {
      console.error('Error processing payment:', error);
      let errorMessage = 'Payment failed. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Add form validation
  const validateForm = () => {
    // Card number validation
    if (!validateCardNumber(paymentDetails.cardNumber)) {
      return false;
    }

    // Expiry date validation
    const [month, year] = paymentDetails.expiryDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (!month || !year || 
        parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      alert('Please enter a valid expiry date');
      return false;
    }

    // CVV validation
    if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
      alert('Please enter a valid CVV');
      return false;
    }

    // Cardholder name validation
    if (!paymentDetails.name.trim()) {
      alert('Please enter the cardholder name');
      return false;
    }

    return true;
  };

  const handleDownloadInvoice = async () => {
    if (!invoice) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/billing/download/${invoice._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Open the invoice URL in a new tab
      window.open(response.data.data.invoiceUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  // const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Appointment Summary</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={doctor.user_id.profile_picture}
                  alt={doctor.user_id.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold">{doctor.user_id.name}</h3>
                  <p className="text-[#0B8FAC]">{doctor.specialization}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(appointmentDate)}</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{appointmentTime}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="text-xl font-bold text-[#0B8FAC]">
                    PKR {doctor.consultation_fee}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-gray-700 mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none ${
                      cardError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={paymentDetails.cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>
                {cardError && (
                  <p className="mt-1 text-sm text-red-500">{cardError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        const formattedValue = value.length > 2 
                          ? value.slice(0, 2) + '/' + value.slice(2) 
                          : value;
                        setPaymentDetails({
                          ...paymentDetails,
                          expiryDate: formattedValue
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none"
                    value={paymentDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setPaymentDetails({
                          ...paymentDetails,
                          cvv: value
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none"
                  value={paymentDetails.name}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    name: e.target.value
                  })}
                  required
                />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className={`w-full py-3 ${
                    paymentSuccess 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#0B8FAC] hover:bg-[#097a93]'
                  } text-white rounded-lg transition-colors`}
                  disabled={isLoading || paymentSuccess}
                >
                  {isLoading ? 'Processing...' : paymentSuccess ? 'Paid' : `Pay $${doctor.consultation_fee}`}
                </button>

                {invoice && (
                  <button
                    onClick={handleDownloadInvoice}
                    className={`w-full py-3 ${
                      paymentSuccess 
                        ? 'bg-[#0B8FAC] hover:bg-[#097a93] text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } rounded-lg transition-colors`}
                  >
                    Download Invoice
                  </button>
                )}
              </div>

              {paymentSuccess && (
                <div className="mt-4 text-center text-green-600 font-semibold">
                  Payment successful!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}


