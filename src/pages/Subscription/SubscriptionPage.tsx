// SubscriptionPage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaCrown, FaRocket } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Plan {
  name: string;
  price: string;
  icon: React.ComponentType<any> | null;
  features: string[];
  color: string;
  popular?: boolean;
}

interface SubStatus {
  id: number;
  plan: number;            // 1 = Basic, 2 = Premium, 3 = Pro
  status: 'Pending' | 'Approved' | 'Expired';
  proofUrl?: string;
  expiresAt: string | null;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: '0',
    icon: null,
    features: [
      'Accès aux cours gratuits',
      'Forum communautaire',
      'Ressources de base',
      'Support par email'
    ],
    color: 'gray'
  },
  {
    name: 'Premium',
    price: '29.99',
    icon: FaCrown,
    features: [
      'Tous les avantages Basic',
      'Cours premium illimités',
      'Certificats vérifiés',
      'Support prioritaire',
      'Sessions de mentorat mensuelles'
    ],
    color: 'indigo',
    popular: true
  },
  {
    name: 'Pro',
    price: '49.99',
    icon: FaRocket,
    features: [
      'Tous les avantages Premium',
      'Sessions one-on-one',
      'Projets pratiques guidés',
      'Support 24/7',
      'Accès anticipé aux nouveaux cours',
      'Ressources exclusives'
    ],
    color: 'purple'
  }
];

const SubscriptionPage: React.FC = () => {
  const [sub, setSub] = useState<SubStatus | null>(null);
  const navigate = useNavigate();
  const token     = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get<SubStatus>(`http://localhost:5135/api/subscriptions/status`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => setSub(res.data))
      .catch(err => {
        if (err.response?.status === 404) {
          // Pas d'abonnement → Basic par défaut
          setSub({ id: 0, plan: 0, status: 'Approved', expiresAt: null });
        }
      });
  }, [token]);

  const choosePlan = (planName: string, price: string) => {
    navigate('/dashboard/check', { state: { plan: planName, price } });
  };

  const currentPlan = sub?.plan ?? 0;
  const isPending = sub?.status === 'Pending';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choisissez votre plan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Investissez dans votre éducation avec un plan qui correspond à vos besoins
        </p>
      </motion.div>

      {sub && (
        <div className="text-center mb-8">
          {isPending && <p className="text-yellow-600">En attente de validation…</p>}
          {!isPending && sub.status === 'Approved' && sub.expiresAt && (
            <p className="text-green-600">
              Actif jusqu’au {new Date(sub.expiresAt).toLocaleDateString('fr-FR')}
            </p>
          )}
          {!isPending && sub.status === 'Approved' && !sub.expiresAt && (
            <p className="text-green-600">Plan Basic actif</p>
          )}
          {sub.status === 'Expired' && (
            <p className="text-red-600">Votre abonnement est expiré</p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {plans.map((plan, idx) => {
          const planId = idx ;
          const isCurrent = planId === currentPlan;
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl bg-white shadow-xl ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  {Icon && <Icon className={`text-${plan.color}-600 text-2xl`} />}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price} TND
                  </span>
                  <span className="text-gray-600">/mois</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + i * 0.05 }}
                      className="flex items-center space-x-3 text-gray-600"
                    >
                      <FaCheck className={`text-${plan.color}-600 flex-shrink-0`} />
                      <span>{feat}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isPending || isCurrent}
                  onClick={() => choosePlan(plan.name, plan.price)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } ${isPending || isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCurrent
                    ? 'Plan actuel'
                    : plan.price === '0'
                    ? 'Commencer gratuitement'
                    : 'Choisir ce plan'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/history')}
          className="inline-block py-3 px-6 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 transition"
        >
          Voir l'historique des achats
        </motion.button>
      </div>
    </div>
  );
};

export default SubscriptionPage;
