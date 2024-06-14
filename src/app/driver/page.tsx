'use client'
import Map, { Marker } from 'react-map-gl';

import { api } from "@goober/trpc/server";
import { CreateUser } from "../components/create-user";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import Toast from '../components/Toast';

interface Ride {
    id: string
    pickupAddress:  string
    dropoffAddress: string
    pickupLong?:     number
    pickupLat?:      number
    dropoffLong?:   number
    dropoffLat?:     number
    price:          number
    distance:       number
    estimatedTime:  number
}

export default function Driver() {
    const [viewport, setViewport] = useState({
        latitude: 37.7749,
        longitude: -122.4194,
        zoom: 5
      });
    const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null)
    const [showToast, setShowToast] = useState(false);
    const [ride, setRide] = useState<Ride | null>(null)

    // const fetchRides = async (userId: string) => {
    //     const user = await api.rides.get();
    //     setName(user?.name)
    // }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_ID, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    useEffect(() => {
        const channel = pusher.subscribe("goober"); 

        channel.bind("ride", function (data: any) {
            console.warn(data, 'data')
            const newRide = JSON.stringify(data)
            setRide(data)
            setShowToast(true)
        });
    
        return () => {
            pusher.unsubscribe("ride");
        };
    }, []);

    const initialize = async () => {
        navigator.geolocation.getCurrentPosition(async (position: any) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation([longitude, latitude]);
          setViewport({
            ...viewport,
            latitude,
            longitude
          });
        });
    }
  
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        initialize()
    }, []);

    const handleCloseToast = () => {
        setShowToast(false);
    };

    return (
        <div className="relative w-screen" style={{height: 'calc(100vh - 72px)'}}>
            <Map
                {...viewport}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                onMove={evt => setViewport(evt.viewState)}
                zoom={14}
                scrollZoom
                dragRotate={false}
            >
                {driverLocation && (
                    <>
                        <Marker
                            latitude={driverLocation[1]}
                            longitude={driverLocation[0]}
                            style={{width: '100vw'}}
                        >
                            <div className="bg-yellow-200 rounded-full w-96 h-96 opacity-10"></div>
                        </Marker>
                    </>
                )}
            </Map>
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                {showToast && (
                    <Toast
                        type="info"
                        message='New order'
                        onClose={handleCloseToast}
                    >   
                        <div className='p-4'>
                            <p>Distance: {ride?.distance.toFixed(2)} km</p>
                            <p>Pickup: {ride?.pickupAddress}</p>
                            <p>Drop off: {ride?.dropoffAddress}</p>
                            <p>Price: {ride?.price.toFixed(2)} $</p>
                            <p>Est time: {ride?.estimatedTime.toFixed(2)} minutes</p>
                        </div>
                        <div className='flex justify-around p-4'>
                            <button className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Accept</button>
                            <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Cancel</button>
                        </div>
                    </Toast>
                )}
            </div>
        </div>
    )
}