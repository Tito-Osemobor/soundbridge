import Navbar from "@/components/Navbar";
import {useAuth} from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import {useEffect, useMemo, useState} from "react";
import ConnectServiceModal from "@/components/modals/ConnectServiceModal";
import PlaylistTable from "@/components/PlaylistTable";
import {getPlatformById, SUPPORTED_PLATFORMS} from "@/constants/services";
import {loadUserPlaylists} from "@/services/utils/playlists";
import withLoader from "@/hoc/withLoader";
import withAuth from "@/hoc/withAuth";

const Hub = () => {
  const {user} = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [pendingConnections, setPendingConnections] = useState([]);

  const connectedPlatforms = useMemo(() => {
    const realConnections = user?.platformsConnected?.map(platform => ({
      ...getPlatformById(platform.id),
      status: "connected"
    })) || [];

    const pendingMapped = pendingConnections.map(platformId => ({
      ...getPlatformById(platformId),
      status: "pending"
    }));

    return [...realConnections, ...pendingMapped];
  }, [user?.platformsConnected, pendingConnections]);

  const availablePlatforms = useMemo(() => {
    return Array.from(SUPPORTED_PLATFORMS.keys())
      .filter(id => !connectedPlatforms.some(p => p.id === id)) // 🔄 use `connectedPlatforms` directly
      .map(getPlatformById)
      .filter(Boolean);
  }, [connectedPlatforms]);

  const handlePlatformConnectClick = (platformId) => {
    console.log("Pending connections before:", pendingConnections);
    setPendingConnections(prev => {
      const updated = [...prev, platformId];
      console.log("Pending connections after:", updated);
      return updated;
    });
  };

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user || !user.platformsConnected?.length) return;

      const curPlatform = user.platformsConnected[0];
      console.log("curPlatform:", curPlatform);
      if (!curPlatform) return;

      const curPlatformPlaylists = await loadUserPlaylists(curPlatform.id, curPlatform.platformUserId);
      setPlaylists(curPlatformPlaylists);
    };
    loadPlaylists();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <div className="flex flex-grow">
        <div className={`flex flex-grow relative gap-4`}>
          <Sidebar onOpenModal={() => setModalOpen(true)} selectedPlaylist={selectedPlaylist}
                   connectedPlatforms={connectedPlatforms} availablePlatforms={availablePlatforms}/>
          {isModalOpen &&
            <ConnectServiceModal
              onClose={() => setModalOpen(false)}
              availableServices={availablePlatforms}
              onPlatformClick={handlePlatformConnectClick}
            />}

          <PlaylistTable playlists={playlists} onSelect={setSelectedPlaylist}/>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default withAuth(withLoader(Hub));
