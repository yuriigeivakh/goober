import React from 'react';
import { AddressAutofill } from '@mapbox/search-js-react';
import { getPrice } from '../utils';

interface RouteAndAddressInfoProps {
    accessToken: string
  routeDistance: number | null;
  routeDuration: number | null;
  startAddress: string;
  dropOffAddress: string;
  handleStartLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDropoffLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRetrieveAutocompleteAddress: (res: any, isStart?: boolean) => void;
  dropOffLocationRef: any;
}

const RouteAndAddressInfo: React.FC<RouteAndAddressInfoProps> = ({
    accessToken,
  routeDistance,
  routeDuration,
  startAddress,
  dropOffAddress,
  handleStartLocationChange,
  handleDropoffLocationChange,
  handleRetrieveAutocompleteAddress,
  dropOffLocationRef,
}) => {
  return (
    <>
      {routeDistance && routeDuration && (
        <div className="mt-2 mb-2 p-2 bg-gray-100 rounded">
          <div>Distance: {routeDistance.toFixed(1)} km</div>
          <div>Approximate Time: {routeDuration.toFixed(0)} minutes</div>
          <div>Price: {getPrice(routeDistance, routeDuration).toFixed(1)}$</div>
        </div>
      )}
      <div className="flex flex-col space-y-2">
        {/* @ts-ignore */}
        <AddressAutofill accessToken={accessToken} onRetrieve={(value) => handleRetrieveAutocompleteAddress(value, true)}>
          <input
            type="text"
            placeholder="Address"
            onChange={handleStartLocationChange}
            value={startAddress}
            autoComplete="street-address"
            className="p-2 border rounded w-full"
          />
        </AddressAutofill>
        {/* @ts-ignore */}
        <AddressAutofill accessToken={accessToken} onRetrieve={handleRetrieveAutocompleteAddress}>
          <input
            type="text"
            placeholder="Where to go?"
            onChange={handleDropoffLocationChange}
            value={dropOffAddress}
            className="p-2 border rounded w-full"
            ref={dropOffLocationRef}
          />
        </AddressAutofill>
      </div>
    </>
  );
};

export default RouteAndAddressInfo;
