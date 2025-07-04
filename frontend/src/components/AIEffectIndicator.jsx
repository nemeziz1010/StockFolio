import { useState, useEffect, useRef } from 'react';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, MinusCircleIcon } from '@heroicons/react/24/solid';

// A mapping object to easily get styles and icons
const indicatorMap = {
  Positive: {
    Icon: ArrowUpCircleIcon,
    color: 'text-green-500',
  },
  Negative: {
    Icon: ArrowDownCircleIcon,
    color: 'text-red-500',
  },
  Neutral: {
    Icon: MinusCircleIcon,
    color: 'text-gray-500',
  },
};

export const AIEffectIndicator = ({ analysis }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const wrapperRef = useRef(null);

  if (!analysis) {
    return <div className="h-8 w-8"></div>; 
  }

  // Effect to handle clicks outside of the component to close the tooltip
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setTooltipVisible(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  const { impact, reasoning } = analysis;
  const display = indicatorMap[impact] || indicatorMap['Neutral'];

  return (
    // The main container now has a ref and an onClick handler
    <div ref={wrapperRef} className="relative flex items-center justify-center w-8 h-8 rounded-full">
      <button 
        onClick={() => setTooltipVisible(!isTooltipVisible)} 
        className="p-0 border-none bg-transparent cursor-pointer"
        aria-label="Show analysis"
      >
        <display.Icon className={`h-8 w-8 ${display.color}`} />
      </button>
      
      <div className={`absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 w-64 rounded-lg bg-gray-800 p-3 text-sm text-white shadow-lg transition-opacity duration-300 ${isTooltipVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="space-y-2">
            <p>
                <strong className="font-semibold">Impact:</strong> {impact}
            </p>
            <p className="whitespace-normal">
                <strong className="font-semibold">Reasoning:</strong> {reasoning}
            </p>
        </div>
        <div className="absolute bottom-[-4px] left-1/2 -z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800"></div>
      </div>
    </div>
  );
};
