'use client'
import Map, { Marker } from 'react-map-gl';

import { api } from "@goober/trpc/react";
import { CreateUser } from "../components/create-user";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import Toast from '../components/Toast';
import { RideStatus } from '@prisma/client';
import { useCurrentUser } from '../hooks/useUser';
import pusher from '../lib/pusher';

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
    const [channelPusher, setChannelPusher] = useState<any>(null);

    const user = useCurrentUser();

    useEffect(() => {
        const channel = pusher?.subscribe("goober"); 
        setChannelPusher(channel);

        channel.bind("ride", function (data: any) {
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

    const updatedRideStatus = api.rides.updateStatusAndDriver.useMutation({
        onSuccess: async (data) => {
            console.warn('success')
        },
        onError: (error) => {
            console.error(error)
        }
    });
  
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        initialize()
    }, []);

    const handleCloseToast = () => {
        setShowToast(false);
    };

    const handleChangeStatusRide = async (rideStatus: RideStatus = RideStatus.CANCELLED) => {
        await updatedRideStatus.mutate({
            rideId: ride?.id as string,
            driverId: user?.id,
            status: rideStatus,
        });
        if (rideStatus !== RideStatus.IN_PROGRESS) {
            setRide(null)
        }
        handleCloseToast()
    }
    console.warn(ride, 'ride', showToast)

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
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white'>
                {showToast && (
                    <Toast
                        type="info"
                        message='New order'
                        onClose={handleChangeStatusRide}
                    >   
                        <div className='p-4'>
                            <p>Distance: {ride?.distance.toFixed(2)} km</p>
                            <p>Pickup: {ride?.pickupAddress}</p>
                            <p>Drop off: {ride?.dropoffAddress}</p>
                            <p>Price: {ride?.price.toFixed(1)} $</p>
                            <p>Est time: {ride?.estimatedTime.toFixed(0)} minutes</p>
                        </div>
                        <div className='flex justify-around p-4'>
                            <button onClick={() => handleChangeStatusRide(RideStatus.IN_PROGRESS)} className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Accept</button>
                            <button onClick={handleChangeStatusRide} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Cancel</button>
                        </div>
                    </Toast>
                )}
                {!showToast && ride && (
                    <>
                        <div className='p-4'>
                            <p>Distance: {ride?.distance.toFixed(2)} km</p>
                            <p>Pickup: {ride?.pickupAddress}</p>
                            <p>Drop off: {ride?.dropoffAddress}</p>
                            <p>Price: {ride?.price.toFixed(1)} $</p>
                            <p>Est time: {ride?.estimatedTime.toFixed(0)} minutes</p>
                        </div>
                        <div className='flex justify-around p-4'>
                            <button onClick={() => handleChangeStatusRide(RideStatus.FINISHED)} className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Finish</button>
                            <button onClick={() => handleChangeStatusRide(RideStatus.CANCELLED)} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}