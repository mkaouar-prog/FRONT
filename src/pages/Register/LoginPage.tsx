import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { FaLock, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { useLogin, LoginData } from '../../hooks/useLogin';
import { JwtPayload } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, loading, apiError } = useLogin();
  const navigate = useNavigate();

  // Check for an existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode<JwtPayload>(token);
        if (decoded.role === 'Enseignant') {
          navigate('/i');
        } 
         if (decoded.role === 'Eleve') {
          navigate('/dashboard');
        }
        if (decoded.role === 'Admin'){
          navigate('/admin');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: LoginData = { email, password };
    const result = await login(data);
    if (result) {
      message.success('Connexion réussie');
      const token = result.Token || result.token;
      if (!token || typeof token !== 'string') {
        console.error("Token is invalid or missing:", token);
        return;
      }
      localStorage.setItem('token', token);
      try {
        const decoded = jwt_decode<any>(token);
        const userInfo = {
          id: decoded.id,
          name: decoded.name,
          role: decoded.role,
          exp: decoded.exp,
        };
        if (userInfo.role === 'Enseignant') {
          navigate('/i');
        } else if (userInfo.role === 'Eleve') {
          navigate('/dashboard');
        } else {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error decoding token', error);
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Welcome Content */}
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
              
                <h2 className="text-4xl font-bold mb-4">Ravi de vous revoir!</h2>
                <p className="text-lg opacity-90">
                  Connectez-vous pour accéder à votre espace personnel et continuer votre apprentissage.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 lg:p-12">
  <div className="sm:mx-auto sm:w-full sm:max-w-md">
    <div className="center items-center mb-2">
      <center><img src="/assets/aze.png" alt="Logo" className="h-16 mr-4" /></center>
      <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
    </div>
    <p className="text-gray-600 mb-8">
      Pas encore de compte?{' '}
      <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
        Inscrivez-vous
      </Link>
    </p>
  </div>


  



            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                  Mot de passe oublié?
                </Link>
              </div>

              {/* API Error */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm">{apiError}</p>
                </motion.div>
              )}

              {/* Sign In Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-white font-medium transition-all duration-200
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              {/* Google Login Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                Continuer avec Google
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
