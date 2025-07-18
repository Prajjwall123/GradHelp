import React, { useState, useEffect, useRef } from 'react';

const Typewriter = ({ text, speed = 10, onComplete, className = '' }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (currentIndex < text.length) {
            timeoutRef.current = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
        } else if (onComplete) {
            onComplete();
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [text, currentIndex, speed, onComplete]);

    // Reset animation when text changes
    useEffect(() => {
        setDisplayedText('');
        setCurrentIndex(0);
    }, [text]);

    return <span className={className}>{displayedText}</span>;
};

export default Typewriter;
