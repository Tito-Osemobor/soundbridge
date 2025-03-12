import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import ConnectServiceModal from "@/components/ConnectServiceModal";
import { fetchSpotifyPlaylists } from "@/services/spotifyService";
import { FaSpotify } from "react-icons/fa";
import PlaylistTable from "@/components/PlaylistTable";
import {SUPPORTED_SERVICES} from "@/constants/services";

const Hub = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const availableServices = SUPPORTED_SERVICES.filter(
    (service) => !user?.platformsConnected?.some((s) => s.id === service.id)
  );

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user || !user.platformsConnected) return;

      const spotifyAuth = user.platformsConnected.find(p => p.id === "SPOTIFY");
      if (!spotifyAuth) return;

      const userPlaylists = await fetchSpotifyPlaylists(spotifyAuth.platformUserId);
      setPlaylists(userPlaylists);
    };
    loadPlaylists();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <div className={`flex flex-grow relative gap-4`}>
          <Sidebar onOpenModal={() => setModalOpen(true)} selectedPlaylist={selectedPlaylist}/>
          {isModalOpen && <ConnectServiceModal onClose={() => setModalOpen(false)} availableServices={availableServices}/>}

          <PlaylistTable playlists={playlists} onSelect={setSelectedPlaylist} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Hub;
