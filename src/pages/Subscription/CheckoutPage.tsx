// src/pages/Subscription/CheckoutPage.tsx
import React, { useState } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  // ── Hooks must always be at the top level ───────────────────────────────
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Extract and guard your location.state ───────────────────────────────
  const state = location.state as LocationState | undefined;
  if (!state) {
    // if someone lands here manually, kick them back to your plans page
    return <Navigate to="/dashboard/history" replace />;
  }
  const { plan, price } = state;

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProofFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (price !== '0' && !proofFile) {
      alert('Veuillez télécharger la preuve de paiement.');
      return;
    }

    const formData = new FormData();
    formData.append('Plan', plan);
    formData.append('Price', price);
    if (proofFile) formData.append('Proof', proofFile);

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5135/api/subscriptions/checkout',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      navigate('/dashboard/history');
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Erreur lors de la soumission, réessayez.');
      setLoading(false);
    }
  };

  // ── Static payment info ────────────────────────────────────────────────
  const paymentInfo = {
    rib: 'TN59 0000 0000 1234 5678 9012',
    d17: '12345678',
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            Finaliser votre paiement ({plan})
          </h1>
          <p>Montant : {price} TND</p>
        </div>

        <div className="p-8">
          {/* Payment instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Instructions de paiement</h2>

            {/* RIB */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">RIB Bancaire</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.rib)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  {copied ? <FaCheckCircle /> : <FaCopy />}
                  <span className="ml-1 text-sm">{copied ? 'Copié!' : 'Copier'}</span>
                </button>
              </div>
              <p className="font-mono p-2 bg-white rounded border">{paymentInfo.rib}</p>
            </div>

            {/* D17 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Numéro D17</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.d17)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  {copied ? <FaCheckCircle /> : <FaCopy />}
                  <span className="ml-1 text-sm">{copied ? 'Copié!' : 'Copier'}</span>
                </button>
              </div>
              <p className="font-mono p-2 bg-white rounded border">{paymentInfo.d17}</p>
            </div>
          </div>

          {/* Proof upload */}
          {price !== '0' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Preuve de paiement</h2>
              <div className="border-2 border-dashed p-6 text-center">
                {preview ? (
                  <>
                    <img src={preview} alt="Proof" className="max-h-64 mx-auto mb-2" />
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
                    <label htmlFor="file-upload" className="cursor-pointer text-indigo-600 hover:text-indigo-700">
                      Télécharger une capture d’écran
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-gray-500">PNG, JPG jusqu’à 5 MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? 'Envoi en cours...' : 'Soumettre pour vérification'}
          </motion.button>

          <div className="mt-4 flex items-center text-sm text-gray-500">
            <FaInfoCircle className="mr-2" />
            La vérification peut prendre jusqu’à 24 h ouvrables
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
