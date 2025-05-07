import React, { useState } from 'react';
import { Select, message } from 'antd';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaGraduationCap, 
  FaLock,
  FaArrowLeft 
} from 'react-icons/fa';
import 'antd/dist/reset.css';
import { useRegisterEleve } from '../../hooks/useRegisterEleve';
import { useNavigate, Link } from 'react-router-dom';

const { Option } = Select;

const RegisterElevePage: React.FC = () => {
  // Form state variables
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(''); // Date de naissance (optionnel)
  const [stateTunisia, setStateTunisia] = useState('');
  const [categorie, setCategorie] = useState('');
  const [niveau, setNiveau] = useState('');
  const [sousCategorie, setSousCategorie] = useState(''); // For Prépa details
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Custom hook to call the registration API
  const { registerEleve, loading, apiError } = useRegisterEleve();
  
  // React Router's navigation hook
  const navigate = useNavigate();

  // Mapping for "Niveau" options based on selected "Catégorie"
  const niveauOptions: { [key: string]: string[] } = {
    Faculté: ["Informatique", "Économie", "Mathématique", "Prépa"],
    Lycée: [
      "1er", "2ème SC", "2ème Info", "2ème Éco", "3ème",
      "BAC ECO", "BAC Math", "BAC Lettres", "BAC Technique"
    ],
    Collège: ["7ème", "8ème", "9ème"],
    Formation: ["Informatique", "Mathématique"],
  };

  // Options for "Sous Catégorie" when "Prépa" is selected under Faculté
  const prepaSousOptions = ["MP", "PT", "PC", "BG"];

  // Array of 24 Tunisian governorates
  const tunisiaStates = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
    "Jendouba", "Kairouan", "Kasserine", "Kebili", "Kef", "Mahdia",
    "Manouba", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
    "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
  ];

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const data = {
      fullName,
      email,
      phone,
      dob,
      stateTunisia,
      categorie,
      niveau,
      sousCategorie,
      password,
    };

    const result = await registerEleve(data);
    if (result) {
      message.success('Compte créé avec succès');
      navigate('/login');
    }
  };

  // Form sections configuration for new design
  const formSections = [
    {
      title: "Informations Personnelles",
      icon: <FaUser className="text-purple-600" />,
      fields: ["fullName", "email", "phone", "dob"]
    },
    {
      title: "Informations Académiques",
      icon: <FaGraduationCap className="text-purple-600" />,
      fields: ["stateTunisia", "categorie", "niveau", "sousCategorie"]
    },
    {
      title: "Sécurité",
      icon: <FaLock className="text-purple-600" />,
      fields: ["password", "confirmPassword"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                <h2 className="text-4xl font-bold mb-4">Bienvenue à Bord!</h2>
                <p className="text-lg opacity-90 mb-6">
                  Rejoignez notre communauté d'apprenants et commencez votre voyage éducatif dès aujourd'hui.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <FaGraduationCap className="h-6 w-6" />
                    </div>
                    <span>Accès à des cours de qualité</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <FaUser className="h-6 w-6" />
                    </div>
                    <span>Professeurs expérimentés</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="p-8 lg:p-12">
            <div className="flex justify-between items-center mb-8">
              <Link to="/" className="flex items-center text-gray-600 hover:text-purple-600 transition-colors">
                <FaArrowLeft className="mr-2" />
                Retour
              </Link>
              <img src="/assets/s.png" alt="Logo" className="h-12" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Créer un compte Élève</h1>
              <p className="text-gray-600 mt-2">
                Commencez votre parcours d'apprentissage
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {formSections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                    {section.icon}
                    <h3 className="text-xl font-semibold text-gray-800">
                      {section.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.includes("fullName") && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Nom complet
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <FaUser />
                          </span>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Entrez votre nom complet"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {section.fields.includes("email") && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Adresse e-mail
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <FaEnvelope />
                          </span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="exemple@email.com"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {section.fields.includes("phone") && (
                      <div className="md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Numéro de téléphone
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <FaPhone />
                          </span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="+216..."
                            required
                          />
                        </div>
                      </div>
                    )}

                    {section.fields.includes("dob") && (
                      <div className="md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Date de naissance
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <FaCalendar />
                          </span>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}

                    {section.fields.includes("stateTunisia") && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Gouvernorat
                        </label>
                        <Select
                          value={stateTunisia || undefined}
                          onChange={(value: string) => setStateTunisia(value)}
                          className="w-full !rounded-lg"
                          placeholder="Sélectionnez votre gouvernorat"
                          suffixIcon={<FaMapMarkerAlt className="text-gray-400" />}
                        >
                          {tunisiaStates.map((state) => (
                            <Option key={state} value={state}>{state}</Option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {section.fields.includes("categorie") && (
                      <div className="md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Catégorie
                        </label>
                        <Select
                          value={categorie || undefined}
                          onChange={(value: string) => {
                            setCategorie(value);
                            setNiveau('');
                            setSousCategorie('');
                          }}
                          className="w-full !rounded-lg"
                          placeholder="Sélectionnez votre catégorie"
                        >
                          <Option value="Faculté">Faculté</Option>
                          <Option value="Lycée">Lycée</Option>
                          <Option value="Collège">Collège</Option>
                          <Option value="Formation">Formation</Option>
                        </Select>
                      </div>
                    )}

                    {section.fields.includes("niveau") && (
                      <div className="md:col-span-1">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Niveau
                        </label>
                        <Select
                          value={niveau || undefined}
                          onChange={(value: string) => {
                            setNiveau(value);
                            if (value !== "Prépa") setSousCategorie('');
                          }}
                          className="w-full !rounded-lg"
                          placeholder="Sélectionnez votre niveau"
                          disabled={!categorie}
                        >
                          {categorie && niveauOptions[categorie]?.map((niveauOption) => (
                            <Option key={niveauOption} value={niveauOption}>
                              {niveauOption}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {section.fields.includes("sousCategorie") && categorie === "Faculté" && niveau === "Prépa" && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Sous Catégorie (Prépa)
                        </label>
                        <Select
                          value={sousCategorie || undefined}
                          onChange={(value: string) => setSousCategorie(value)}
                          className="w-full !rounded-lg"
                          placeholder="Sélectionnez votre sous catégorie"
                        >
                          {prepaSousOptions.map((option) => (
                            <Option key={option} value={option}>{option}</Option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {section.fields.includes("password") && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Mot de passe
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <FaLock />
                          </span>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {section.fields.includes("confirmPassword") && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <FaLock />
                          </span>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {(error || apiError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm">{error || apiError}</p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Création en cours...
                  </div>
                ) : (
                  'Créer le compte'
                )}
              </motion.button>

              <p className="text-center text-gray-600 mt-6">
                Déjà inscrit?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Connectez-vous
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterElevePage;
