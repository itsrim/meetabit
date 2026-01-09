import { useState } from 'react';

const useSwipe = (initialDate) => {
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());
    const [isWeekly, setWeekly] = useState(true);
    const [direction, setDirection] = useState(0);

    // Swipe State
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);
    const [touchEndY, setTouchEndY] = useState(null);

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
        setTouchEndX(null);
        setTouchEndY(null);
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
        setTouchEndY(e.targetTouches[0].clientY);
    };

    const onTouchEnd = () => {
        if (!touchStartX || !touchStartY) return;

        const distanceX = touchStartX - (touchEndX || touchStartX);
        const distanceY = touchStartY - (touchEndY || touchStartY);

        // Determine if horizontal or vertical swipe
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
            // Horizontal swipe - navigation
            if (distanceX > minSwipeDistance) {
                next();
            } else if (distanceX < -minSwipeDistance) {
                prev();
            }
        } else {
            // Vertical swipe - toggle view
            if (distanceY > minSwipeDistance && !isWeekly) {
                // Swipe up -> collapse to week
                setWeekly(true);
            } else if (distanceY < -minSwipeDistance && isWeekly) {
                // Swipe down -> expand to month
                setWeekly(false);
            }
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
        handlers
    };
};

export default useSwipe;
