/**
 * VotingButtons Component
 * Displays voting buttons for comparing translations
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaHandshake } from 'react-icons/fa';
import { AiOutlineStop } from 'react-icons/ai';
import type{ VotingButtonsProps } from './types';

const VotingButtons: React.FC<VotingButtonsProps> = ({
  isAuthenticated,
  selectedOption,
  isVoting,
  onVote,
  onNewTranslation,
  onHoverChange,
  t,
}) => {
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center bg-amber-100 dark:bg-amber-500/10 border border-amber-400 dark:border-amber-500/30 rounded-xl p-6 text-center max-w-lg mx-auto backdrop-blur-sm">
        <span className="mb-2 text-amber-800 dark:text-amber-300 font-semibold flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
          Login required
        </span>
        <p className="text-sm text-amber-700 dark:text-amber-200 mb-4">
          You need to <a href="/login" className="text-primary-600 dark:text-primary-400 underline font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">log in</a> to vote and compare model translations.
        </p>
        <a
          href="/login"
          className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Log in to Vote
        </a>
      </div>
    );
  }

  const getButtonClass = (option: 'left' | 'right' | 'both' | 'none') => {
    const isSelected = selectedOption === option;
    const isOtherSelected = selectedOption !== null && selectedOption !== option;
    
    const baseClass = "text-neutral-800 dark:text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed hover:shadow-xl flex items-center justify-center gap-2";
    
    if (isSelected) {
      return `${baseClass} bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/50`;
    }
    
    if (isOtherSelected) {
      return `${baseClass} bg-neutral-200 dark:bg-white/5 border border-neutral-300 dark:border-white/10 opacity-50`;
    }
    
    return `${baseClass} bg-neutral-300 dark:bg-white/10 hover:bg-neutral-400 dark:hover:bg-white/20 border border-neutral-400 dark:border-white/20`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Left/Top is Better */}
      <button
        onClick={selectedOption === 'left' ? onNewTranslation : () => onVote('left')}
        disabled={isVoting || (selectedOption !== null && selectedOption !== 'left')}
        onMouseEnter={() => !selectedOption && onHoverChange('left')}
        onMouseLeave={() => !selectedOption && onHoverChange(null)}
        className={`order-1 ${getButtonClass('left')}`}
      >
        <ChevronLeft size={18} className="hidden lg:block" />
        {selectedOption === 'left' ? t('arena.newTranslation') : (
          <>
            <span className="lg:hidden">Top</span>
            <span className="hidden lg:inline">{t('arena.leftBetter')}</span>
          </>
        )}
      </button>
      
      {/* Right/Bottom is Better */}
      <button
        onClick={selectedOption === 'right' ? onNewTranslation : () => onVote('right')}
        disabled={isVoting || (selectedOption !== null && selectedOption !== 'right')}
        onMouseEnter={() => !selectedOption && onHoverChange('right')}
        onMouseLeave={() => !selectedOption && onHoverChange(null)}
        className={`order-2 lg:order-4 ${getButtonClass('right')}`}
      >
        {selectedOption === 'right' ? t('arena.newTranslation') : (
          <>
            <span className="lg:hidden">Bottom</span>
            <span className="hidden lg:inline">{t('arena.rightBetter')}</span>
          </>
        )}
        <ChevronRight size={18} className="hidden lg:block" />
      </button>
      
      {/* Both are Good (Tie) */}
      <button
        onClick={selectedOption === 'both' ? onNewTranslation : () => onVote('both')}
        disabled={isVoting || (selectedOption !== null && selectedOption !== 'both')}
        onMouseEnter={() => !selectedOption && onHoverChange('both')}
        onMouseLeave={() => !selectedOption && onHoverChange(null)}
        className={`order-3 lg:order-2 ${getButtonClass('both')}`}
      >
        <FaHandshake size={18} />
        {selectedOption === 'both' ? t('arena.newTranslation') : t('arena.itsTie')}
      </button>
      
      {/* Both are Bad */}
      <button
        onClick={selectedOption === 'none' ? onNewTranslation : () => onVote('none')}
        disabled={isVoting || (selectedOption !== null && selectedOption !== 'none')}
        onMouseEnter={() => !selectedOption && onHoverChange('none')}
        onMouseLeave={() => !selectedOption && onHoverChange(null)}
        className={`order-4 lg:order-3 ${getButtonClass('none')}`}
      >
        <AiOutlineStop size={18} />
        {selectedOption === 'none' ? t('arena.newTranslation') : t('arena.bothBad')}
      </button>
    </div>
  );
};

export default VotingButtons;

