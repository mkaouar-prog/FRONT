import React from "react";

const ExcellenceSection: React.FC = () => {
  return (
    <div className="w-[85.5%] flex m-auto h-fit rounded-3xl mt-[2%] max-sm:mt-[8%] bg-[#e4e3ff]">
      <div className="grid p-10 mt-10 mb-10 max-md:grid-cols-1 gap-x-12 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-2 max-lg:grid-cols-2 2xl:grid-cols-2">
        <div className="lg:mt-[2%] grid grid-cols-1">
          <img src="/assets/flesh.png" alt="arrow" className="w-16 2xl:w-24" />
          <h1 className="text-rivezli3 text-3xl font-bold mt-4 2xl:text-4xl">
            Libérer l’excellence : votre voyage commence ici
          </h1>
          <p className="mt-4 2xl:text-2xl">
            On vous fournit tout ce dont vous avez besoin pour atteindre vos objectifs. Nous vous accompagnons main dans la main pour transformer vos rêves en réalité.
          </p>
          <button
  type="button"
  className="ant-btn css-fefq5f ant-btn-round ant-btn-default ant-btn-lg w-fit mt-4 rounded-full"
  style={{
    border: "1px solid black",
    color: "black",
    padding: "0px 30px 0px 30px", // Adjust the padding for more space
  }}
>
  <p className="font-bold text-xl">A propos</p>
</button>

        </div>
        <div className="grid max-md:grid-cols-2 gap-x-2 gap-y-6 lg:grid-cols-2 max-lg:grid-cols-2 2xl:grid-cols-2">
          <img src="/assets/l.png" alt="objectif" className="w-full lg:w-11/12" />
          <img src="/assets/pro.png" alt="parcours" className="w-full lg:w-11/12" />
          <img src="/assets/sat.png" alt="communication" className="w-full lg:w-11/12" />
          <img src="/assets/suc.png" alt="assure" className="w-full lg:w-11/12" />
        </div>
      </div>
    </div>
  );
};

export default ExcellenceSection;
