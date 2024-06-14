'use client'
import Map, { Marker } from 'react-map-gl';

import { api } from "@goober/trpc/server";
import { CreateUser } from "../components/create-user";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';


export default function Driver() {
    const [viewport, setViewport] = useState({
        latitude: 37.7749,
        longitude: -122.4194,
        zoom: 5
      });
    const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null)

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
          alert(`pickupAddress: ${data.pickupAddress}`)
        });
    
        return () => {
            pusher.unsubscribe("ride");
        };
    }, []);

    const initialize = async () => {
        navigator.geolocation.getCurrentPosition(async (position: any) => {
          const { latitude, longitude } = position.coords;
          console.warn(latitude, longitude, 'driver')
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
                        {/* <Marker
                            latitude={driverLocation[1]}
                            longitude={driverLocation[0]}
                        >
                            <div className="bg-green-500 rounded-full w-4 h-4"></div>
                        </Marker> */}
                        <Marker
                            latitude={driverLocation[1]}
                            longitude={driverLocation[0]}
                            style={{width: '100vw'}}
                        >
                            <div className="bg-yellow-200 rounded-full w-24 h-24"></div>
                        </Marker>
                    </>
                )}
            </Map>
        </div>
    )
}