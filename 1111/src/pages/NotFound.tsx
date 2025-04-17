import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.error(
    "404 Error: User attempted to access non-existent route:",
    location.pathname
  );
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md bg-gradient-to-b from-[rgba(14,7,38,0.5)] to-[rgba(44,15,74,0.5)] backdrop-blur-md p-8 rounded-lg border-l-4 border-[#a64aff]">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-violet-500 text-transparent bg-clip-text mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-300 mb-6">
          The page you're looking for seems to have vanished like a wizard disapparating!
        </p>
        <div className="not-found-animation mb-8">
          <div className="wand">
            <div className="wand-tip"></div>
          </div>
          <div className="magic-poof"></div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-[#a64aff] to-[#fc6c8f] text-white font-medium rounded-md hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
        >
          Return to Hogwarts
        </button>
      </div>
    </div>
  );
}
