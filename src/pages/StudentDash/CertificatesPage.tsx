import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaDownload, FaRegFilePdf } from 'react-icons/fa';
import axiosInstance from 'utils/AxiosInstance';

// Define the API response types
interface ApiCertificate {
  id: number;
  enrollmentId: number;
  filePath: string;
  generatedAt: string;
  enrollment: {
    course: {
      id: number;
      title: string;
      description: string;
      imageUrl: string;
      // other course fields...
    };
    eleveProfile: {
      // profile fields...
    };
  };
}

// Use our own Certificate type that extracts the information we need
interface Certificate {
  id: number;
  filePath: string;
  generatedAt: string;
  courseTitle: string;
  courseDescription: string;
  courseImageUrl: string;
  enrollmentId: number;
}

const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axiosInstance.get<ApiCertificate[]>('/certificate/all');
        // Transform the API response into the Certificate type
        const certs: Certificate[] = response.data.map((item) => ({
          id: item.id,
          filePath: item.filePath, // Ideally, you might convert this to a URL for download if needed.
          generatedAt: item.generatedAt,
          courseTitle: item.enrollment.course.title,
          courseDescription: item.enrollment.course.description,
          courseImageUrl: item.enrollment.course.imageUrl,
          enrollmentId : item.enrollmentId
        }));
        setCertificates(certs);
      } catch (err: any) {
        setError(err.message || 'Error fetching certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [token]);

  if (loading) return <div>Loading certificates...</div>;
  if (error) return <div>{error}</div>;
  const handleViewCertificate = async (certificateId: number) => {
    try {
      const response = await axios.get(`http://localhost:5135/api/certificate/${certificateId}`, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // Create an object URL for the returned PDF blob.
      const fileURL = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      // Open the certificate PDF in a new tab.
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };
  






  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Certificats Obtenus</h1>
      {certificates.length === 0 ? (
        <p>Aucun certificat disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="relative">
                {cert.courseImageUrl && (
                  <img
                    src={cert.courseImageUrl}
                    alt={cert.courseTitle}
                    className="w-full h-40 object-cover"
                  />
                )}
                {/* Overlay with a semi-transparent layer and an icon */}
                <div className="absolute inset-0 bg-black opacity-25"></div>
                <div className="absolute top-2 left-2 bg-white rounded-full p-2">
                  <FaRegFilePdf className="text-red-600" size={24} />
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{cert.courseTitle}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {cert.courseDescription.length > 100
                    ? cert.courseDescription.substring(0, 100) + '...'
                    : cert.courseDescription}
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  Obtenu le: {new Date(cert.generatedAt).toLocaleDateString()}
                </p>
                <button
        onClick={() => handleViewCertificate(cert.enrollmentId)}
        className="flex items-center text-blue-500 hover:underline focus:outline-none"
      >
        <FaDownload className="mr-1" /> Voir / Télécharger
      </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
