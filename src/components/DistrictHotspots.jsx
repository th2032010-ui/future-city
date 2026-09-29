import { Html } from "@react-three/drei";

export default function DistrictHotspots({ onSelectDistrict, visible = true }) {
  if (!visible) return null;

  const hotspots = [
    {
      id: "tower",
      label: "Hydro-Solar Spire",
      tag: "52 GW Clean Energy",
      position: [0, 54, 0],
      icon: "⚡",
    },
    {
      id: "lake",
      label: "Central Turquoise Lake",
      tag: "100% Recycled Water",
      position: [0, 3, 14],
      icon: "🌊",
    },
    {
      id: "forest",
      label: "Vertical Forest Citadel",
      tag: "Living Bio-Facade",
      position: [-26, 38, -12],
      icon: "🌿",
    },
    {
      id: "bridges",
      label: "Arched Pedestrian Bridge",
      tag: "Zero-Carbon Walkway",
      position: [14, 4, 12],
      icon: "🌉",
    },
    {
      id: "drone",
      label: "Eco-Drone Airspace",
      tag: "Botanical Health Radar",
      position: [18, 22, 22],
      icon: "🛸",
    },
  ];

  return (
    <group>
      {hotspots.map((spot) => (
        <group key={spot.id} position={spot.position}>
          <Html center distanceFactor={72}>
            <button
              className="hotspot-badge"
              onClick={(e) => {
                e.stopPropagation();
                onSelectDistrict(spot.id);
              }}
              title={`Jump camera to ${spot.label}`}
            >
              <span className="hotspot-icon">{spot.icon}</span>
              <div className="hotspot-text">
                <span className="hotspot-title">{spot.label}</span>
                <span className="hotspot-tag">{spot.tag}</span>
              </div>
              <span className="hotspot-pulse" />
            </button>
          </Html>
        </group>
      ))}
    </group>
  );
}
