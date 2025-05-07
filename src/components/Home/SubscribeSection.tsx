import React from 'react';
import { motion } from 'framer-motion';

const SubscribeSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="mt-[5%] mb-[5%] relative max-sm:mt-[10%] px-4"
    >
      <motion.img
        variants={itemVariants}
        src="/assets/flesh.png"
        alt="arrow"
        className="w-12 2xl:w-12 flex m-auto mb-4"
        whileHover={{ scale: 1.1, rotate: 10 }}
      />
      
      <motion.h1 
        variants={itemVariants}
        className="text-rivezli font-light text-2xl 2xl:text-3xl text-center italic max-sm:text-base"
      >
        Abonner
      </motion.h1>
      
      <motion.h1 
        variants={itemVariants}
        className="text-center 2xl:text-4xl text-3xl font-semibold text-rivezli3 mt-2 max-sm:text-xl"
      >
        Ne jamais apprendre seul
      </motion.h1>
      
      <motion.div
        variants={itemVariants}
        className="flex justify-center mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full 
            hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 
            transform hover:-translate-y-1"
        >
          S'inscrire
        </motion.button>
      </motion.div>

      <motion.img
        variants={itemVariants}
        initial={{ rotate: 180 }}
        animate={{ rotate: 180 }}
        whileHover={{ scale: 1.1, rotate: 200 }}
        src="/assets/arl.png"
        className="w-8 h-12 absolute top-2 right-[30%] max-sm:right-[10%]"
        alt="about icon"
      />

      <motion.img
        variants={itemVariants}
        whileHover={{ scale: 1.1, rotate: -20 }}
        src="/assets/arl.png"
        className="w-8 h-12 absolute bottom-2 left-[30%] max-sm:left-[10%]"
        alt="about icon"
      />
    </motion.div>
  );
};

export default SubscribeSection;