import { East } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';

interface DiscoveryCard {
  title: string;
  image: string;
}

export default function DiscoverySection() {
  const cards: DiscoveryCard[] = [
    {
      title: 'Mathématiques',
      image: 'https://rivezli-v2.b-cdn.net/categories/prÃ©pa (1).png',
    },
    {
      title: 'Economie et gestion',
      image: 'https://rivezli-v2.b-cdn.net/categories/eco.png',
    },
    {
      title: 'Langues',
      image: 'https://img.freepik.com/vecteurs-libre/illustration-concept-abstrait-camp-apprentissage-langues_335657-3920.jpg',
    },
    {
        title: 'Droit',
        image: 'https://rivezli-v2.b-cdn.net/categories/droit.png',
      },
  ];

  return (
    <div className="w-[87.5%] flex flex-col mx-auto h-fit rounded-3xl mt-[2%] max-sm:mt-[8%] p-4">
      {/* Headings */}
      <h1 className="text-rivezli font-light text-2xl 2xl:text-3xl text-center italic max-sm:text-base">
        Découvrir
      </h1>
      <h1 className="text-center 2xl:text-4xl text-3xl font-semibold text-rivezli3 mt-2 max-sm:text-xl">
        Votre{' '}
        <span className="font-semibold p-0.5 text-rivezli1 bg-opacity-10 relative border border-[rgb(79,70,229)]">
          {/* Corner squares */}
          <div className="bg-rivezli1 w-1 p-1 h-1 -bottom-1 -left-1 absolute" />
          <div className="bg-rivezli1 w-1 p-1 h-1 -bottom-1 -right-1 absolute" />
          <div className="bg-rivezli1 w-1 p-1 h-1 -top-1 -right-1 absolute" />
          <div className="bg-rivezli1 w-1 p-1 h-1 -top-1 -left-1 absolute" />
          Chemin
        </span>{' '}
        Créatif
      </h1>
      <p className="text-gray-500 mt-2 font-light w-[60%] mx-auto text-center max-sm:w-full 2xl:text-lg">
        Explorez les différentes sections sur Rivezli pour une expérience unique. Votre prochaine
        découverte est à un clic.
      </p>

      {/* Swiper Section */}
      <div className="mt-10 mb-10">
        <Swiper
          spaceBetween={90}
          slidesPerView={1.2}
         
          breakpoints={{
            640: {
              slidesPerView: 1.5,
            },
            768: {
              slidesPerView: 2.5,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="swiper-container"
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <div
                className="rounded-3xl mb-12 cursor-pointer border border-[rgb(79,70,229)]"
              >
                <div className="relative">
                  <img
                    alt={card.title}
                    src={card.image}
                    loading="lazy"
                    className="cursor-pointer w-full h-48 2xl:h-56 object-cover object-center max-md:h-40 rounded-t-3xl border-t border-l border-r border-[rgb(79,70,229)]"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center p-1 justify-between">
                    <p className="text-rivezli3 font-semibold text-xl">{card.title}</p>
                    <East className="!text-rivezli3 hover:!text-rivezli !font-semibold !text-xl" />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}