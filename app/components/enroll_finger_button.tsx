'use client'

import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => {return res.json()});
export default function EnrrolButton() {

    const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1000 });
    // console.log(stateData)
    let currentStage =  "Start enroll" 
    if (stateData?.state?.event == "register finger" && isTimeValid(stateData?.state?.time)) {
        currentStage = stateData.state.data
    }
    const handleRequestFingerprint = async () => {
        console.log('1')
        currentStage = "Place hand to sensor"
        try {
            await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'enroll_fingerprint' }),
            });
        } catch (error) {
            console.error('Error requesting fingerprint:', error);
        }
    };

    function isTimeValid (timeToCheck: string) {
        const now =  Date.now()
        const  checkTime = new Date(timeToCheck)
        const time = checkTime.getTime()

        if (now - time > 60 * 1000) {
            return false
        }
        else {
            return true;
        }
    }


    return (
        <button
            disabled={!currentStage} onClick={handleRequestFingerprint}
            className="px-4 py-2 bg-blue-500  rounded hover:bg-blue-600"
        >
            <span className="text-sm font-medium text-white">{currentStage}</span>
        </button>
    )
}