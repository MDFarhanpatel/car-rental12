export default function cars(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
      <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-8 border-2 border-blue-300">
        <h2 className="text-4xl font-extrabold text-black mb-2 text-center">
          car rental booking
        </h2>
        <p className="text-black-900 text-sm text-center">Explore our available cars!</p>
      </div>
    </div>
  );
} 