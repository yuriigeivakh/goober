// pages/map.tsx
'use client'
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import { AddressAutofill } from '@mapbox/search-js-react'
import { number, any } from 'zod';
import autoAnimate from '@formkit/auto-animate'
import { api } from '@goober/trpc/react';

import 'mapbox-gl/dist/mapbox-gl.css';
import { MarkerSvg, TargetLocationSvg } from '../assets';
import RouteAndAddressInfo from './RouteAndAddressInfo';
import CarRouteLayer from './CarRouteLayer';
import { getPrice } from '../utils';
import pusher from '../lib/pusher';
import { RideStatus } from '@prisma/client';
// import { Button } from '@chakra-ui/react';

interface RideInformation {
  id: string
  status: RideStatus
  driverName: string
}

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? 'fallback_token_here';

const MapPage = ({ userId }: { userId?: string }) => {
    const [viewport, setViewport] = useState({
      latitude: 37.7749,
      longitude: -122.4194,
      zoom: 5
    });
  
    const dropOffLocationRef = useRef()
    const mapRef = useRef()
    const [userAddress, setUserAddress] = useState<string>('');
    const [startAddress, setStartAddress] = useState<string>('');
    const [isStartAddressValidated, setIsStartAddressValidated] = useState<boolean>(false);
    const [dropOffAddress, setDropOffAddress] = useState<string>('');
    const [isDropOffAddressValidated, setIsDropOffAddressValidated] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [startLocation, setStartLocation] = useState<[number, number] | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState<[number, number] | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
    const [carRoute, setCarRoute] = useState<[number, number][] | null>(null);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);
    const [routeDuration, setRouteDuration] = useState<number | null>(null);
    const [channelPusher, setChannelPusher] = useState<any>(null);
    const [rideCreated, setRideCreated] = useState<boolean>(false);
    const [rideInformation, setRideInformation] = useState<RideInformation | null>(null);
    const buttonSubmit = useRef(null)
    const distanceRef = useRef(null)

    const initialize = async () => {
      navigator.geolocation.getCurrentPosition(async (position: any) => {
        const { latitude, longitude } = position.coords;
        const address = await fetchAddress(latitude, longitude);

        setStartAddress(address);
        setUserLocation([longitude, latitude]);
        setViewport({
          ...viewport,
          latitude,
          longitude
        });
        setStartLocation([longitude, latitude]);
      });
    }

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      initialize()

      const pusherChannel = pusher?.subscribe('goober');
      setChannelPusher(pusherChannel);

      return () => {
        pusher.unsubscribe('goober');
      };
    }, []);

    useEffect(() => {
      if (startLocation && dropoffLocation) {
        fetchCarRoute(startLocation, dropoffLocation)
          .then((coordinates) => setCarRoute(coordinates))
          .catch((error) => console.error('Error setting car route:', error));
      }
    }, [startLocation, dropoffLocation]);

    useEffect(() => {
      distanceRef.current && autoAnimate(distanceRef.current)
      dropOffLocationRef.current && autoAnimate(dropOffLocationRef.current)
    }, [dropOffLocationRef, distanceRef])

    const fetchCarRoute = async (startLocation: [number, number], dropoffLocation: [number, number]): Promise<[number, number][]> => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startLocation[0]},${startLocation[1]};${dropoffLocation[0]},${dropoffLocation[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}&annotations=distance%2Cspeed`
        );
  
        if (!response.ok) {
          throw new Error('Failed to fetch car route');
        }
  
        const data = await response.json();
        const route = data.routes[0];

        if (route?.geometry?.coordinates) {
          setRouteDistance(route.distance / 1000); // distance in kilometers
          setRouteDuration(route.duration / 60); // duration in minutes
          return route.geometry.coordinates;
        } else {
          return []; // Route not found or missing coordinates
        }
      } catch (error) {
        console.error('Error fetching car route:', error);
        return []; // Handle fetch error
      }
    };

    const fetchAddress = async (latitude: number, longitude: number) => {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`);
      const data = await response.json();
      const address = data?.features[0]?.place_name;
      return address
    };

    const reverseGeocode = async (address: string): Promise<[number, number] | null> => {
      try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`);
        const data = await response.json();
        const coordinates = data?.features[0]?.geometry?.coordinates;
        if (coordinates && coordinates.length >= 2) {
          const [longitude, latitude] = coordinates;
          return [longitude, latitude]; // Return latitude and longitude in the reverse order
        } else {
          return null; // Address not found or missing coordinates
        }
      } catch (error) {
        console.error("Error fetching geocode:", error);
        return null; // Handle fetch error
      }
    };

    const handleRetrieveAutocompleteAddress = async (res: any, isStart?: boolean) => {
      console.warn(res, 'address')
      const address = res

      if (isStart) {
        setStartAddress(res)
        setIsStartAddressValidated(true)
      } else {
        setDropOffAddress(res)
        setIsDropOffAddressValidated(true)
        await handleDropOffLocationUpdate(res)
      }
    }
  
    const handleStartLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setStartAddress(e.target.value)
      setIsStartAddressValidated(false)
    };
  
    const handleDropoffLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDropOffAddress(e.target.value)
      console.warn(e.target.value)
      setIsDropOffAddressValidated(false)
    };

    const handleDropOffLocationUpdate = async (address: string) => {
      const coordinates = await reverseGeocode(address)
      setDropoffLocation(coordinates)
    }
  
    const handleMarkerDragEnd = async (lngLat: any, isStart?: boolean) => {
      const address = await fetchAddress(lngLat.lat, lngLat.lng)

      if (isStart) {
        setStartAddress(address)
        setStartLocation([lngLat.lng, lngLat.lat]);
        setIsStartAddressValidated(true)
        // @ts-ignore
        dropOffLocationRef?.current?.focus()
      } else {
        setDropOffAddress(address)
        setIsDropOffAddressValidated(true)
        await handleDropOffLocationUpdate(address)
      }
    };

    const handleMapClick = async ({ lngLat }: {lngLat: any}) => {
      if (!userId) return

      const address = await fetchAddress(lngLat.lat, lngLat.lng)
      setDropOffAddress(address)
      await handleDropOffLocationUpdate(address)
    }

    const createRide = api.rides.create.useMutation({
      onSuccess: async (data) => {
        setRideCreated(true)
        channelPusher.bind(`ride-${data?.id}`, function (data: any) {
          setRideInformation(data)
        });
        return data
      },
      onError: (error) => {
        console.error(error)
      },
    });

    const handleCreateRide = () => {
      try {
        createRide.mutate({
          userId: userId as string,
          price: getPrice(routeDistance as number, routeDuration as number),
          distance: routeDistance as number,
          estimatedTime: routeDuration as number,
          pickupAddress: startAddress,
          pickupLong: startLocation?.[0] as number,
          pickupLat: startLocation?.[1] as number,
          dropoffAddress: dropOffAddress,
          dropoffLat: dropoffLocation?.[1] as number,
          dropoffLong: dropoffLocation?.[0] as number,
        });
      } catch (error) {
        console.error('Error creating ride:', error);
        alert('Error creating ride. Please try again.');
      }
    };
    
    const updatedRideStatus = api.rides.updateStatusAndDriver.useMutation({
      onSuccess: async (data) => {
          console.warn('success')
      },
      onError: (error) => {
          console.error(error)
      }
    });

    const handleChangeStatusRide = () => {
      updatedRideStatus.mutate({
        rideId: rideInformation?.id as string,
        status: RideStatus.CANCELLED,
      });
      resetState()
    }

    const resetState = () => {
      setRideInformation(null)
      setCarRoute(null)
      setRouteDistance(null)
      setRouteDuration(null)
      setDropoffLocation(null)
      setDropOffAddress('')
      setRideCreated(false)
    }
  
    return (
      <>
        <Map
          {...viewport}
          mapboxAccessToken={mapboxgl.accessToken}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          onMove={evt => setViewport(evt.viewState)}
          onClick={handleMapClick}
          zoom={15}
          scrollZoom
          dragRotate={false}
        >
          {userLocation && (
            <Marker
              latitude={userLocation[1]}
              longitude={userLocation[0]}
            >
              <div className="bg-blue-500 rounded-full w-4 h-4"></div>
            </Marker>
          )}
          {userId && startLocation && (
            <Marker
              latitude={startLocation[1]}
              longitude={startLocation[0]}
              draggable={true}
              onDragEnd={evt => handleMarkerDragEnd(evt.lngLat, true)}
            >
              <div className='transform translate-y-[-16px]'>
                <MarkerSvg />
              </div>
            </Marker>
          )}
          {userId && dropoffLocation && (
            <Marker
              latitude={dropoffLocation[1]}
              longitude={dropoffLocation[0]}
              draggable={true}
              onDragEnd={evt => handleMarkerDragEnd(evt.lngLat)}
            >
              <div className='transform translate-y-[-16px]'>
                <MarkerSvg fill='yellow'/>
              </div>
            </Marker>
          )}
          <CarRouteLayer carRoute={carRoute}/>
        </Map>
        <div onClick={initialize} className='absolute right-4 top-4 cursor-pointer flex flex-col p-4 rounded-full bg-white'>
          <TargetLocationSvg/>
        </div>
        <div className="absolute bottom-0 left-0 p-4 bg-white shadow-lg z-10 w-full">
          {userId && (
            <>
              <div>
                {rideInformation?.status === RideStatus.FINISHED && (
                  <>
                    <div>Your ride was finished! we hope you enjoyed your ride, see you soon</div>
                    <button onClick={resetState} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Order new ride</button>
                  </>
                )}
                {rideInformation?.status === RideStatus.CANCELLED && (
                  <>
                    <div>Your ride was cancelled for some reason</div>
                    <button onClick={resetState} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Order new ride</button>
                  </>
                )}
                {!rideInformation?.status && rideCreated && (
                  <div>Your ride was created! Please wait until driver confirm</div>
                )}
                {rideInformation?.status === RideStatus.IN_PROGRESS && (
                  <>
                    <div>Your ride just confirmed, your driver - {rideInformation.driverName} should be soon!</div>
                    <button onClick={handleChangeStatusRide} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Cancel ride</button>
                  </>
                )}
              </div>
              <div ref={distanceRef}>
                <RouteAndAddressInfo
                  accessToken={mapboxgl.accessToken}
                  routeDistance={routeDistance}
                  routeDuration={routeDuration}
                  startAddress={startAddress}
                  dropOffAddress={dropOffAddress}
                  handleStartLocationChange={handleStartLocationChange}
                  handleDropoffLocationChange={handleDropoffLocationChange}
                  handleRetrieveAutocompleteAddress={handleRetrieveAutocompleteAddress}
                  dropOffLocationRef={dropOffLocationRef}
                />
              </div>
              {startAddress && dropOffAddress && (
                <button ref={buttonSubmit} className="text-white mt-2 w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700" onClick={handleCreateRide}>Confirm</button>
              )} 
            </>
          )}
        </div>
      </>
    );
  };
  
  export default MapPage;