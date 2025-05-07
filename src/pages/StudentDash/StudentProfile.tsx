import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaCalendar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaEdit,
  FaSave
} from 'react-icons/fa';

interface StudentProfile {
  id: number;
  userId: number;
  dateNaissance: string;
  gouvernorat: string;
  categorie: string;
  niveau: string;
  sousCategorie?: string;
  user: {
    fullName: string;
    email: string;
  };
}

const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
     
      const token     = localStorage.getItem('token');
      console.log('fetchProfile →', { token });
     

      try {
        const res = await fetch(
          `http://localhost:5135/api/student/profile`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!res.ok) throw new Error(`GET ${res.status}`);
        const data: StudentProfile = await res.json();
        console.log('got profile:', data);
        setProfile(data);
        setFormData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:5135/api/student/profile/${profile.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );
      if (!res.ok) throw new Error(`PUT ${res.status}`);
      // Optionally reload from server instead of trusting local formData
      setProfile(formData as StudentProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Profile Étudiant</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg"
            >
              {isEditing ? (
                <>
                  <FaSave />
                  <span>Sauvegarder</span>
                </>
              ) : (
                <>
                  <FaEdit />
                  <span>Modifier</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="p-8">
          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
       
              <FaUser className="w-16 h-16 text-gray-400" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                Informations Personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    value={profile.user.fullName}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.user.email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de Naissance
                  </label>
                  <div className="relative">
                    <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dateNaissance?.split('T')[0]}
                      onChange={(e) =>
                        setFormData({ ...formData, dateNaissance: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gouvernorat
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.gouvernorat}
                      onChange={(e) =>
                        setFormData({ ...formData, gouvernorat: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                Informations Académiques
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <div className="relative">
                    <FaGraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.categorie}
                      onChange={(e) =>
                        setFormData({ ...formData, categorie: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Faculté">Faculté</option>
                      <option value="Lycée">Lycée</option>
                      <option value="Collège">Collège</option>
                      <option value="Formation">Formation</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau
                  </label>
                  <input
                    type="text"
                    value={formData.niveau}
                    onChange={(e) =>
                      setFormData({ ...formData, niveau: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous Catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.sousCategorie || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, sousCategorie: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Mettre à jour le profil
              </motion.button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentProfile;
