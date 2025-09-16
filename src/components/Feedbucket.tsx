import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { MdFeedback } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

declare global {
  interface Window {
    feedbucketConfig?: {
      reporter?: {
        name?: string;
        email?: string;
      };
    };
  }
}

const FeedbucketId = import.meta.env.VITE_FEEDBUCKET_ID;
const feedBucketAccess = import.meta.env.VITE_FEEDBUCKET_ACCESS;

function FeedBucket() {
  const { user } = useAuth0();
  const [show, setShow] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Initialize script once
  useEffect(() => {
    if (!FeedbucketId || scriptLoaded ||!show) return;

    const existingScript = document.querySelector(`script[data-feedbucket="${FeedbucketId}"]`);
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://cdn.feedbucket.app/assets/feedbucket.js";
    script.dataset.feedbucket = FeedbucketId;
    
    script.onload = () => {
      setScriptLoaded(true);
    };
    
    document.head.appendChild(script);
  }, [scriptLoaded, show]);

  const toggleFeedBucket = () => {
    const feedbucket = document.querySelector("feedbucket-app");
    
    if (!show) {
      setShow(true);
      feedbucket?.classList.remove("hidden");
      
      // Set user config if script is loaded
      if (scriptLoaded && user) {
        window.feedbucketConfig = {
          reporter: {
            name: user.name,
            email: user.email,
          },
        };
      }
    } else {
      setShow(false);
      feedbucket?.classList.add("hidden");
    }
  };

  // Check if user has access
  const hasAccess = (() => {
    if (!user?.email) return false;
    
    const isDharmadutaUser = user.email.includes("@dharmaduta.in");
    const isInAccessList = feedBucketAccess ? 
      JSON.parse(feedBucketAccess).includes(user.email) : false;
    
    return isDharmadutaUser || isInAccessList;
  })();

  if (!hasAccess) return null;

  return (
    <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50">
      <button
        onClick={toggleFeedBucket}
        className={`
          group relative overflow-hidden
          w-14 h-14 md:w-16 md:h-16
          rounded-full shadow-lg hover:shadow-xl
          transform transition-all duration-300 ease-in-out
          ${show 
            ? 'bg-red-500 hover:bg-red-600 rotate-180' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-110'
          }
          text-white
          focus:outline-none focus:ring-4 focus:ring-blue-300/50
          active:scale-95
        `}
        aria-label={show ? "Close feedback" : "Open feedback"}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
        
        <div className="flex items-center justify-center transition-transform duration-300 ease-in-out">
          {show ? (
            <RxCross2 size={24} className="md:w-7 md:h-7" />
          ) : (
            <MdFeedback size={24} className="md:w-7 md:h-7" />
          )}
        </div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-active:scale-100 transition-transform duration-150"></div>
      </button>
      
      {/* Tooltip */}
      <div className={`
        absolute right-full mr-3 top-1/2 -translate-y-1/2
        px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
        opacity-0 pointer-events-none
        transition-opacity duration-200
        whitespace-nowrap
        group-hover:opacity-100
        before:content-[''] before:absolute before:left-full before:top-1/2 before:-translate-y-1/2
        before:border-4 before:border-l-gray-900 before:border-y-transparent before:border-r-transparent
      `}>
        {show ? 'Close feedback' : 'Give feedback'}
      </div>
    </div>
  );
}

export default FeedBucket;