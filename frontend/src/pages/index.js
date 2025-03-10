import { loginWithYoutube, connectYoutube } from "@/services/auth/youtubeAuthService";
import {loginWithSpotify} from "@/services/auth/spotifyAuthService";

export default function Home() {
  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold">SoundBridge</h1>
      <button onClick={loginWithSpotify} className="mt-4 p-2 bg-green-500 text-white rounded">
        Login with Spotify
      </button>
      <button onClick={loginWithYoutube} className="mt-4 p-2 bg-red-500 text-white rounded">
        Login with YouTube
      </button>
      <button onClick={connectYoutube} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Connect YouTube
      </button>
    </div>
  );
}
