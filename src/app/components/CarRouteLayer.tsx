import React from 'react';
import { Source, Layer } from 'react-map-gl';

interface CarRouteLayerProps {
  carRoute: [number, number][] | null;
}

const CarRouteLayer: React.FC<CarRouteLayerProps> = ({ carRoute }) => {
  if (!carRoute) return null;

  return (
    <Source
      id="car-route"
      type="geojson"
      data={{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: carRoute,
        },
      }}
    >
      <Layer
        id="car-route-layer"
        type="line"
        source="car-route"
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
        paint={{
          'line-color': '#fff',
          'line-width': 2,
        }}
      />
    </Source>
  );
};

export default CarRouteLayer;
