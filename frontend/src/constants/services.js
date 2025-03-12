import { FaSpotify } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

// 🔹 Define supported platforms in one place
export const SUPPORTED_SERVICES = [
  {
    id: "SPOTIFY",
    name: "Spotify",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    icon: (className) => <FaSpotify className={className} />,
  },
  {
    id: "YOUTUBE_MUSIC",
    name: "YouTube Music",
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    icon: (className) => <SiYoutubemusic className= {className} />,
  },
];

// 🔹 Helper function to get service details by name
export const getServiceByName = (serviceName) => {
  return SUPPORTED_SERVICES.find(service => service.name === serviceName);
};
