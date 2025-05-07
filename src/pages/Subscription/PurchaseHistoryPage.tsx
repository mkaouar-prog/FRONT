// PurchaseHistoryPage.tsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Purchase {
  id: number;
  plan: number;            
  status: 'Pending' | 'Approved' | 'Expired';
  proofUrl?: string;
  expiresAt: string | null;
  createdAt: string;
}

const planNames = ['Basic', 'Premium', 'Pro'];
const badgeStyles = [
  '',
  'bg-gray-100 text-gray-800',
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800'
];

const PurchaseHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<Purchase[]>([]);
  const navigate = useNavigate();
 
  const token     = localStorage.getItem('token');
  useEffect(() => {
    axios
      .get<Purchase[] | any>(`http://localhost:5135/api/subscriptions/history`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        // ensure we have an array before mapping
        if (Array.isArray(res.data)) {
          setHistory(res.data);
        } else {
          console.error('Expected history array, got:', res.data);
          setHistory([]); // fallback to empty
        }
      })
      .catch(err => {
        console.error(err);
        setHistory([]);
      });
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Historique des achats</h1>
      </motion.div>

      {history.length === 0 ? (
        <p className="text-gray-600">Aucun achat pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          
          {
          
          history.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl bg-white shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {planNames[item.plan]}
                  </h2>
                  <span className={`px-3 py-1 text-sm rounded-full ${badgeStyles[item.plan]}`}>
                    {planNames[item.plan]}
                  </span>
                </div>

                <p className="text-gray-600 mb-2">
                  Date&nbsp;: {new Date(item.createdAt).toLocaleDateString('fr-FR')}{' '}
                  à {new Date(item.createdAt).toLocaleTimeString('fr-FR')}
                </p>

                {item.expiresAt && (
                  <p className="text-gray-600 mb-2">
                    Expire le&nbsp;: {new Date(item.expiresAt).toLocaleDateString('fr-FR')}
                  </p>
                )}

                <p
                  className={`font-medium mb-4 ${
                    item.status === 'Approved'
                      ? 'text-green-600'
                      : item.status === 'Pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {item.status === 'Approved'
                    ? 'Approuvé'
                    : item.status === 'Pending'
                    ? 'En attente'
                    : 'Expiré'}
                </p>

                {item.proofUrl && (
                  <a
                    href={item.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium underline text-indigo-600"
                  >
                    Voir la preuve
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryPage;
