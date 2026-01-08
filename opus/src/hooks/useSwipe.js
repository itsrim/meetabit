import { useState, useEffect } from 'react';

const useSwipe = (initialDate) => {
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());
    const [isWeekly, setWeekly] = useState(true);
    const [direction, setDirection] = useState(0);

    // Swipe State
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Reset current date if initialDate changes significantly? No, let's keep navigation independent.

    const next = () => {
        setDirection(1);
        const newDate = new Date(currentDate);
        if (isWeekly) {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const prev = () => {
        setDirection(-1);
        const newDate = new Date(currentDate);
        if (isWeekly) {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    // Swipe Handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            next();
        }
        if (isRightSwipe) {
            prev();
        }
    };

    const handlers = {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };

    return {
        isWeekly,
        setWeekly,
        currentDate,
        next,
        prev,
        direction,
        handlers // Return swipe handlers to attach to div
    };
};

export default useSwipe;
