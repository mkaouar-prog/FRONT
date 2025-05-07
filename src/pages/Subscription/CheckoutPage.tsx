// CheckoutPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaCloudUploadAlt,
  FaCopy,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

interface LocationState {
  plan: string;
  price: string;
}

const CheckoutPage: React.FC = () => {
  const { plan, price } = useLocation().state as LocationState;
  const navigate = useNavigate();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setProofFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    const form = new FormData();
    form.append('EleveProfileId', "1");
    form.append('Plan', plan);
    form.append('Price', price);
    if (price !== '0' && proofFile) {
      form.append('Proof', proofFile);
    }

    try {
      await axios.post('http://localhost:5135/api/subscriptions/checkout', form);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la soumission, réessayez.');
    }
  };

  const paymentInfo = {
    rib: 'TN59 0000 0000 1234 5678 9012',
    d17: '12345678'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            Finaliser votre paiement ({plan})
          </h1>
          <p>Montant : {price} TND</p>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Instructions de paiement</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">RIB Bancaire</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.rib)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  {copied ? <FaCheckCircle /> : <FaCopy />}
                  <span className="ml-1 text-sm">
                    {copied ? 'Copié!' : 'Copier'}
                  </span>
                </button>
              </div>
              <p className="font-mono p-2 bg-white rounded border">
                {paymentInfo.rib}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Numéro D17</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.d17)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  {copied ? <FaCheckCircle /> : <FaCopy />}
                  <span className="ml-1 text-sm">
                    {copied ? 'Copié!' : 'Copier'}
                  </span>
                </button>
              </div>
              <p className="font-mono p-2 bg-white rounded border">
                {paymentInfo.d17}
              </p>
            </div>
          </div>

          {price !== '0' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Preuve de paiement</h2>
              <div className="border-2 border-dashed p-6 text-center">
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Proof"
                      className="max-h-64 mx-auto mb-2"
                    />
                    <button
                      onClick={() => {
                        setProofFile(null);
                        setPreview(null);
                      }}
                      className="text-red-600 text-sm"
                    >
                      Supprimer
                    </button>
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-indigo-600 hover:text-indigo-700"
                    >
                      Télécharger une capture d’écran
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-gray-500">
                      PNG, JPG jusqu’à 5 MB
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Soumettre pour vérification
          </motion.button>

          <div className="mt-4 flex items-center text-sm text-gray-500">
            <FaInfoCircle className="mr-2" />
            La vérification peut prendre jusqu’à 24 h ouvrables
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
