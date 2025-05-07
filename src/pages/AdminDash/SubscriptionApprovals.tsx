import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaImage, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

interface PendingSubscription {
  id: number;
  eleveProfileId: number;
  userName: string;
  plan: number;
  price: string;
  proofUrl: string;
  createdAt: string;
}

const SubscriptionApprovals: React.FC = () => {
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const planNames = ['Basic', 'Premium', 'Pro'];
  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const fetchPendingSubscriptions = async () => {
    try {
      const response = await axios.get('http://localhost:5135/api/subscriptions/pending');
      setPendingSubscriptions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending subscriptions:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    setProcessing(id);
    try {
      await axios.put(`http://localhost:5135/api/subscriptions/${id}/status`, { status });
      setPendingSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (error) {
      console.error('Error updating subscription status:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Approbation des Abonnements</h1>
        <p className="text-gray-600">Gérez les demandes d'abonnement en attente</p>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid gap-6">
        {pendingSubscriptions.map((subscription) => (
          <motion.div
            key={subscription.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subscription.userName}</h3>
                    <p className="text-sm text-gray-500">ID: {subscription.eleveProfileId}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {planNames[subscription.plan]}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {subscription.price} TND
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {subscription.proofUrl && (
                  <button
                    onClick={() => setSelectedImage(subscription.proofUrl)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  >
                    <FaImage />
                    Voir preuve
                  </button>
                )}

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusUpdate(subscription.id, 'Approved')}
                    disabled={processing === subscription.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    {processing === subscription.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    Approuver
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusUpdate(subscription.id, 'Rejected')}
                    disabled={processing === subscription.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <FaTimes />
                    Rejeter
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {pendingSubscriptions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Aucune demande d'abonnement en attente</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <FaTimes className="text-2xl" />
            </button>
            <img
              src={selectedImage}
              alt="Payment proof"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionApprovals;