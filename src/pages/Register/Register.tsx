import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Image and Welcome Text */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-purple-800/80 z-10" />
            <img
              src="/assets/xa.png"
              alt="Education Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-20 p-12 flex flex-col justify-center h-full text-white">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl font-bold mb-4">Bienvenue sur notre plateforme!</h2>
                <p className="text-lg opacity-90 mb-8">
                  Choisissez votre type de compte et commencez votre voyage éducatif dès aujourd'hui.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <FaGraduationCap className="h-6 w-6" />
                    </div>
                    <span>Apprentissage personnalisé</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <FaChalkboardTeacher className="h-6 w-6" />
                    </div>
                    <span>Enseignants qualifiés</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Registration Options */}
          <div className="p-8 lg:p-12">
            <div className="flex justify-between items-center mb-8">
              <Link to="/" className="flex items-center text-gray-600 hover:text-purple-600 transition-colors">
                <FaArrowLeft className="mr-2" />
                Retour
              </Link>
              <img src="/assets/aze.png" alt="Logo" className="h-12" />
            </div>

            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Choisissez votre profil
              </h1>
              <p className="text-gray-600">
                Sélectionnez le type de compte qui correspond à vos besoins
              </p>
            </div>

            <div className="space-y-6">
              {/* Student Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <img src="/assets/s.png" alt="Élève" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Compte Élève</h3>
                    <p className="text-gray-600">
                      Accédez à des cours interactifs, des vidéos explicatives et suivez votre progression en temps réel.
                    </p>
                    <Link
                      to="/register/student"
                      className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      S'inscrire comme élève
                      <FaArrowRight className="ml-2 text-sm" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Teacher Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <img src="/assets/p.png" alt="Enseignant" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Compte Enseignant</h3>
                    <p className="text-gray-600">
                      Créez des cours, suivez les progrès de vos élèves et partagez votre expertise pédagogique.
                    </p>
                    <Link
                      to="/register/teacher"
                      className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      S'inscrire comme enseignant
                      <FaArrowRight className="ml-2 text-sm" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            <p className="text-center text-gray-600 mt-8">
              Déjà inscrit?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;