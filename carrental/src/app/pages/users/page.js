

"use client";
import { useState } from "react";

const carBrands = [
  { name: "BMW", img: "https://img.icons8.com/color/128/bmw.png" },
  { name: "Audi", img: "https://img.icons8.com/color/128/audi.png" },
  { name: "Mercedes", img: "https://img.icons8.com/color/128/mercedes-benz.png" },
  { name: "Toyota", img: "https://img.icons8.com/color/128/toyota.png" },
  { name: "Honda", img: "https://img.icons8.com/color/128/honda.png" },
  { name: "Ford", img: "https://img.icons8.com/color/128/ford.png" },
  { name: "Volkswagen", img: "https://img.icons8.com/color/128/volkswagen.png" },
  { name: "Kia", img: "https://img.icons8.com/color/128/kia.png" },
  { name: "Hyundai", img: "https://img.icons8.com/color/128/hyundai.png" },
  { name: "Chevrolet", img: "https://img.icons8.com/color/128/chevrolet.png" },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((current + 1) % carBrands.length);
  const prevSlide = () => setCurrent((current - 1 + carBrands.length) % carBrands.length);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
      <div className="bg-emerald-300-50/90 backdrop-blur-lg p-12 rounded-3xl mt-19.5 shadow-2xl w-full max-w-3xl flex flex-col gap-7 border-2 border-blue-300">
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://img.icons8.com/color/128/000000/car--v2.png"
            alt="Car Rental"
            className="animate-bounce mb-2"
            style={{ width: 96, height: 96 }}
          />
          <h1 className="text-5xl font-extrabold text-black text-center mb-2">
            Welcome to Car Rental
          </h1>
          <p className="text-lg text-black text-center max-w-xl">
            Discover the best cars for your journey. Flexible bookings, affordable prices, and a wide range of vehicles to choose from. Start your adventure today!
          </p>
          <a
            href="/pages/cars"
            className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            Explore Cars
          </a>
        </div>
        <div className="flex flex-col items-center gap-4 mt-2 bg-gray-500 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-black mb-2">Popular Brands</h2>
          <div className="flex items-center gap-6">
            <button
              onClick={prevSlide}
              className="bg-blue-300 text-white rounded-full p-2 shadow hover:bg-blue-400 transition"
              aria-label="Previous"
            >
              &#8592;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={carBrands[current].img}
                alt={carBrands[current].name}
                className="w-32 h-32 object-contain mb-2 transition-all duration-300"
                style={{ filter: "drop-shadow(0 2px 8px #888)" }}
              />
              <span className="text-xl font-semibold text-black">{carBrands[current].name}</span>
            </div>
            <button
              onClick={nextSlide}
              className="bg-pink-300 text-white rounded-full p-2 shadow hover:bg-pink-400 transition"
              aria-label="Next"
            >
              &#8594;
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            {carBrands.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-3 h-3 rounded-full ${idx === current ? "bg-blue-500" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}




