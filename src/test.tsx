import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { MdLiveTv } from "react-icons/md";
import { FaPhotoVideo } from "react-icons/fa";
import { MdOutlineQuestionAnswer } from "react-icons/md";
import { BsFiletypePdf } from "react-icons/bs";
import { TbMessageChatbot } from "react-icons/tb";
import { GiArtificialHive } from "react-icons/gi";

const RivezliComponent: React.FC = () => {
  const cards = [
    {
        icon: <MdLiveTv size={60} />,
      title: 'Séances Live Exclusives',
      description: 'Participez à des séances live interactives animées par les étudiants ayant atteint l\'excellence à l\'échelle nationale.',
    },
    {
      icon: <FaPhotoVideo size={60}/>,
      title: 'Cours Enregistrés sous forme des vidéos',
      description: 'Accédez à une sélection rigoureuse de cours enregistrés, préparés par les meilleurs.',
    },
    {
      icon: <MdOutlineQuestionAnswer size={60}/>      ,
      title: 'Séries d’exercices/ problème / concours sous forme des vidéos',
      description: 'Rivezli vous offre les matériaux qui ont façonné nos enseignants en véritables élites.',
    },
    {
      icon: <BsFiletypePdf size={60}/>      ,
      title: 'Bibliothèque des Séries en pdf',
      description: 'Notre bibliothèque contient toutes les ressources pdf des premières à l’échelle nationale.',
    },
    {
        icon: <TbMessageChatbot size={60}/>        ,
        title: 'Discuter avec un Chatbot',
        description: 'Profitez d’une plateforme interactive avec un chatbot pour discuter et perfectionner vos méthodes de révision.',
      },
      {
        icon: <GiArtificialHive size={60}/>        ,
        title: 'Quiz/Test avec Générateur AI',
        description: 'Testez et évaluez vos connaissances grâce à nos quiz et tests conçus par des experts, accompagnés d’un générateur d’IA pour personnaliser vos défis. ',
      },
  ];

  return (
    <div className="w-[87.5%] flex flex-col m-auto h-fit rounded-3xl mt-[-5%] pt-[3%] pr-[2%] pl-[2%]">
      <h1 className="text-rivezli font-light text-2xl 2xl:text-3xl text-center italic max-sm:text-base">
        Débloquez le succès
      </h1>
      <div className="relative">
        <h1 className="text-center 2xl:text-4xl text-3xl font-semibold text-rivezli3 mt-2 max-sm:text-xl">
          Avec notre{' '}
          <span className="font-semibold p-0.5 text-rivezli1 bg-rivezli1 bg-opacity-10 relative" style={{ border: '1px solid rgb(39, 199, 212)' }}>
            Plateforme
            <p className="bg-rivezli1 w-1 p-1 h-1 -bottom-1 -left-1 absolute"></p>
            <p className="bg-rivezli1 w-1 p-1 h-1 -bottom-1 -right-1 absolute"></p>
            <p className="bg-rivezli1 w-1 p-1 h-1 -top-1 -right-1 absolute"></p>
            <p className="bg-rivezli1 w-1 p-1 h-1 -top-1 -left-1 absolute"></p>
          </span>
        </h1>
        <h1 className="text-gray-500 mt-2 font-light w-[60%] m-auto flex text-center justify-center max-sm:w-full 2xl:text-lg">
          Démarquez-vous avec Rivezli : Votre Portail vers l'Excellence Académique
        </h1>
        <img src="/assets/as.png" className="w-16 absolute right-36 top-2 max-lg:hidden" alt="arrow" />
      </div>

      {/* Grille pour desktop */}
      <div className="hidden sm:grid max-w-2xl mt-10 mb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:mx-0 lg:max-w-none">
        {cards.map((item, index) => (
          <div key={index} className="flex items-center w-full">
            <div className="rounded-3xl p-8 w-full h-full border-[1.5px] border-rivezli1">
            <div className="bg-rivezli p-3 rounded-full w-fit mb-4">
                {item.icon}  {/* Icon inside the grid card */}
              </div>
              <h1 className="text-rivezli3 2xl:text-2xl font-semibold mt-2"> {item.title}</h1>
              <p className="text-gray-500 mt-2 2xl:text-xl">{item.description}</p>
              <p className="text-2xl">→</p>
            </div>
          </div>
        ))}
      </div>

      {/* Slider pour mobile */}
      <div className="sm:hidden mt-10 mb-10">
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="w-full"
        >
          {cards.map((item, index) => (
            <SwiperSlide key={index} className="p-4">
              <div className="rounded-3xl p-6 w-full h-full border-[1.5px] border-rivezli1 bg-white shadow-md">
             
                <h1 className="text-rivezli3 text-xl font-semibold">{item.title}</h1>
                <p className="text-gray-500 mt-2">{item.description}</p>
                <p className="text-2xl">→</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default RivezliComponent;
