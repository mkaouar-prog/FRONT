import React, { useState, useEffect } from 'react';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaSearch, 
  FaFilter,
  FaEllipsisV,
  FaTrash,
  FaEdit,
  FaUserLock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: number;
  fullName: string;
  email: string;
  // now a string after mapping
  role: 'Admin' | 'Enseignant' | 'Eleve' | 'Unknown';
  createdAt: string;
  eleveProfile?: {
    dateNaissance: string;
    gouvernorat: string;
    categorie: string;
    niveau: string;
    sousCategorie?: string;
  };
  enseignantProfile?: {
    dateNaissance: string;
    gouvernorat: string;
    categorie: string;
    niveau: string;
    sousCategorie?: string;
    yearsOfExperience: number;
  };
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<'all' | 'Admin' | 'Enseignant' | 'Eleve'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5135/api/Admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data: Array<any> = await response.json();

        // Map numeric roles → strings
        const mapped: User[] = data.map(u => ({
          ...u,
          role:
            u.role === 1 ? 'Enseignant' :
            u.role === 2 ? 'Eleve' :
            u.role === 3 ? 'Admin' :
            'Unknown'
        }));

        setUsers(mapped);
        setFilteredUsers(mapped);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filterUsers = () => {
    let filtered = users;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    filterUsers();
  }, [selectedRole, searchTerm]);

  if (isLoading) {
    return <p className="p-6">Chargement des utilisateurs…</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        <p className="text-gray-600">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {(['all','Admin','Enseignant','Eleve'] as const).map(roleKey => (
              <button
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedRole === roleKey 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter />
                {roleKey === 'all' ? 'Tous' : roleKey === 'Enseignant' ? 'Enseignants' : roleKey === 'Eleve' ? 'Élèves' : 'Admins'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredUsers.map(user => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.role === 'Enseignant' ? <FaChalkboardTeacher /> : <FaUserGraduate />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'Enseignant'
                        ? 'bg-green-100 text-green-800'
                        : user.role === 'Eleve'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.eleveProfile?.categorie || user.enseignantProfile?.categorie || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.eleveProfile?.niveau || user.enseignantProfile?.niveau || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                      <button className="text-red-600 hover:text-red-900"><FaTrash /></button>
                      <button className="text-gray-600 hover:text-gray-900"><FaUserLock /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;
