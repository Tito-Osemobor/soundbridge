import { FaSpotify } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

export const PLATFORM_IDS = {
  SPOTIFY: "SPOTIFY",
  YOUTUBE_MUSIC: "YOUTUBE_MUSIC",
};

export const SUPPORTED_PLATFORMS = new Map([
  [PLATFORM_IDS.SPOTIFY, {
    id: "SPOTIFY",
    name: "Spotify",
    color: "text-white",
    backGroundColor: "bg-green-500",
    mainColor: "text-green-500",
    hoverColor: "hover:text-green-600",
    icon: (className) => <FaSpotify className={className} />,
  }],
  [PLATFORM_IDS.YOUTUBE_MUSIC, {
    id: "YOUTUBE_MUSIC",
    name: "YouTube Music",
    color: "text-red-500",
    backGroundColor: "bg-white",
    mainColor: "text-red-500",
    hoverColor: "hover:text-red-600",
    icon: (className) => <SiYoutubemusic className={className} />
  }]
]);

export const getPlatformById = (platformId) => SUPPORTED_PLATFORMS.get(platformId);
