import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowRight } from 'react-icons/fa';

interface HeroSectionProps {
  bgImage: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ bgImage }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-[87.5%] mx-auto h-fit rounded-3xl mt-2 max-sm:mt-[8%] pt-[5.5%] px-[2%] relative overflow-hidden"
    >
      {/* Animated Background with Gradient Overlay */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-r from-black/50 to-purple-900/30"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      
      <div className="flex 2xl:justify-between xl:justify-between max-md:flex-col relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          className="w-[60%] 2xl:mt-12 max-sm:w-full p-8 flex flex-col"
        >
          <motion.h1 
            variants={textVariants}
            className="text-white xl:text-4xl lg:text-xl max-sm:text-lg 2xl:text-[40px] text-left leading-relaxed"
          >
            Là où l'excellence se multiplie 
            <br />
            de <motion.span 
              className="italic font-semibold text-rivezli lg:whitespace-pre"
              whileHover={{ scale: 1.05 }}
            >l'IA à l'étudiant</motion.span>
            <br />
            du <motion.span 
              className="italic font-semibold text-rivezli lg:whitespace-pre"
              whileHover={{ scale: 1.05 }}
            >Professeur à l'étudiant</motion.span>
            <br />
            du <motion.span 
              className="italic font-semibold text-rivezli lg:whitespace-pre"
              whileHover={{ scale: 1.05 }}
            >L'IA au Professeur</motion.span>
            <br />
            <motion.span 
              className="italic font-semibold text-rivezli lg:whitespace-pre"
              whileHover={{ scale: 1.05 }}
            >
              S'organiser, Apprendre et Réussir
            </motion.span>
            <br className="max-md:hidden" />
            <span className="max-md:ml-2">avec nous.</span>
          </motion.h1>

          <motion.img 
            variants={textVariants}
            src="/assets/Vector-2qVIKW1U.png" 
            alt="vector" 
            className="w-40 mt-[4%] max-sm:w-20 self-start"
            whileHover={{ scale: 1.1, rotate: 5 }}
          />

          <motion.h1 
            variants={textVariants}
            className="lg:w-[70%] 2xl:text-lg 2xl:w-full max-sm:w-full mt-[4%] text-sm text-white text-left"
          >
            EduTech redéfinit l'apprentissage en offrant une plateforme où les savoirs se transmettent 
            de l'étudiant élite à l'étudiant visant l'excellence. Chaque cours est une passerelle vers 
            le sommet, guidé par ceux qui ont déjà gravi les échelons de la réussite.
          </motion.h1>

          <motion.div 
            variants={textVariants}
            className="mt-[4%] max-sm:mt-12 flex items-center max-sm:items-start max-sm:flex-col gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full text-black bg-white px-8 py-3 2xl:w-40 xl:w-40 lg:w-40 max-sm:w-full 
                transition-all duration-300 hover:bg-gray-100 hover:shadow-lg flex items-center justify-center gap-2"
            >
              Nos Cours
              <FaArrowRight className="text-sm" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full text-white bg-indigo-600 px-8 py-3 2xl:w-40 xl:w-40 lg:w-40 max-sm:w-full 
                transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-500/30 
                flex items-center justify-center gap-2"
            >
              S'inscrire
              <FaArrowRight className="text-sm" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleScrollToTop}
        className="fixed bottom-5 right-5 p-4 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 
          focus:outline-none transition-all duration-300 hover:shadow-indigo-500/30"
      >
        <FaArrowUp className="text-white text-lg" />
      </motion.button>
    </motion.div>
  );
};

export default HeroSection;