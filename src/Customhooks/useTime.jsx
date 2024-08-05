import { useState, useEffect } from 'react';

function useTime() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date());
        };

        updateTime();

        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const formattedTime = currentTime.toISOString();

    return formattedTime;
}

export default useTime;
