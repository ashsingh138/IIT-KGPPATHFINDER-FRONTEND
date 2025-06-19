import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import './PathMap.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
}

const PathMap = () => {
  const [source, setSource] = useState(null);
  const [target, setTarget] = useState(null);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [clickMode, setClickMode] = useState('source');
  const [directions, setDirections] = useState([]);
  const [highlightedSegment, setHighlightedSegment] = useState(null);

  const campusBounds = [[22.30, 87.30], [22.33, 87.32]];

  const handleMapClick = (latlng) => {
    const newLocation = { lat: latlng.lat, lon: latlng.lng, name: "Loading name..." };
    const fetchName = (locationSetter) => {
      axios.get(`${API_BASE}/reverse-geocode`, { params: { lat: latlng.lat, lon: latlng.lng } })
        .then(res => locationSetter({ lat: latlng.lat, lon: latlng.lng, name: res.data.name }))
        .catch(error => {
          console.error("Reverse geocoding failed:", error);
          locationSetter({ lat: latlng.lat, lon: latlng.lng, name: "Unknown Location" });
        });
    };
    if (clickMode === 'source') {
      setSource(newLocation);
      fetchName(setSource);
      setClickMode('destination');
    } else if (clickMode === 'destination') {
      setTarget(newLocation);
      fetchName(setTarget);
      setClickMode('done');
    }
  };
  
  const getPath = async () => {
    if (!source || !target) return;
    setIsLoading(true);
    setPath([]);
    setDistance(0);
    setDirections([]);
    try {
      const res = await axios.post(`${API_BASE}/shortest-path`, { source, target });
      setPath(res.data.path);
      setDistance(res.data.distance);
      setDirections(res.data.directions);
    } catch (error) {
      console.error("Error fetching the shortest path:", error);
      alert("Could not calculate the path.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSource(null);
    setTarget(null);
    setPath([]);
    setDistance(0);
    setDirections([]);
    setClickMode('source');
  };

  let instructionText = clickMode === 'source' ? 'Click on the map to set your Starting Point.' :
                        clickMode === 'destination' ? 'Click on the map to set your Destination.' :
                        'Points selected. Click "Find Path" or "Reset".';

  return (
    <div className="pathfinder-container">
      <div className="instructions-panel"><h3>{instructionText}</h3></div>
      
      {(source || target) && (
        <div className="locations-display">
          <p><strong>Source:</strong> {source ? source.name.split(',')[0] : 'Not set'}</p>
          <p><strong>Destination:</strong> {target ? target.name.split(',')[0] : 'Not set'}</p>
        </div>
      )}

      {directions.length > 0 && !isLoading && (
        <div className="path-details">
          <h4>Route Details:</h4>
          <ol>
            {directions.map((step, index) => (
              <li 
                key={index}
                dangerouslySetInnerHTML={{ __html: `${step.instruction} and continue for ${step.distance} meters` }}
              />
            ))}
            <li>Arrive at your destination.</li>
          </ol>
        </div>
      )}

      <div className="controls-panel">
        <button onClick={getPath} disabled={!source || !target || isLoading}>
          {isLoading ? 'Finding Path...' : 'Find Path'}
        </button>
        <button onClick={handleReset} className="reset-button">Reset</button>
        <div className="info-display">
          {isLoading && <p className="loading-indicator">Calculating...</p>}
          {distance > 0 && !isLoading && <p className="distance-info">Distance: {distance} meters</p>}
        </div>
      </div>

      <MapContainer center={[22.3167, 87.3100]} zoom={15} minZoom={14} maxZoom={19} maxBounds={campusBounds}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        <MapClickHandler onMapClick={handleMapClick} />
        {source && (<Marker position={[source.lat, source.lon]}><Popup><b>Source:</b><br/>{source.name}</Popup></Marker>)}
        {target && (<Marker position={[target.lat, target.lon]}><Popup><b>Destination:</b><br/>{target.name}</Popup></Marker>)}
        {path.length > 0 && (<Polyline positions={path} color="blue" weight={5} />)}
      </MapContainer>
    </div>
  );
};

export default PathMap;