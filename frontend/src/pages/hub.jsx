import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {setConnectedPlatforms} from "@/store/platformSlice";
import {fetchPlaylistsForPlatform, selectPlaylistsByPlatform} from "@/store/playlistsSlice";
import Navbar from "@/components/Navbar";
import AvailablePlatformsModal from "@/components/modals/AvailablePlatformsModal";
import PlaylistTable from "@/components/PlaylistTable";
import Sidebar from "@/components/Sidebar";
import {useAuth} from "@/context/AuthContext";
import {useHubState} from "@/hooks/useHubState";
import withLoader from "@/hoc/withLoader";
import withAuth from "@/hoc/withAuth";

const Hub = () => {
  const {user} = useAuth();
  const dispatch = useDispatch();
  const playlistsByPlatform = useSelector(selectPlaylistsByPlatform);

  const {
    selectedPlaylist,
    setSelectedPlaylist,
    isModalOpen,
    openModal,
    closeModal,
    connectToPlatform,
  } = useHubState(user);
  const [filteredPlatformId, setFilteredPlatformId] = useState(null);

  const loadedPlatformIds = useRef(new Set());

  useEffect(() => {
    if (user?.platformsConnected?.length) {
      dispatch(setConnectedPlatforms(user.platformsConnected));

      user.platformsConnected.forEach(({id, platformUserId}) => {
        if (!loadedPlatformIds.current.has(id)) {
          dispatch(fetchPlaylistsForPlatform({platformId: id, platformUserId}));
          loadedPlatformIds.current.add(id);
        }
      });
    }
  }, [user?.platformsConnected]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen select-none cursor-default">
      <Navbar/>
      <div className=" flex flex-grow overflow-hidden relative gap-4 px-4 pt-4 max-h-[calc(100vh - 4rem)]">
        <Sidebar
          onOpenModal={openModal}
          selectedPlaylist={selectedPlaylist}
          onSelectPlatform={setFilteredPlatformId}
        />
        {isModalOpen && (
          <AvailablePlatformsModal
            onClose={closeModal}
            onPlatformClick={connectToPlatform}
          />
        )}

        <PlaylistTable
          platformId={filteredPlatformId}
          onSelect={setSelectedPlaylist}
        />
      </div>
    </div>
  );
};

export default withAuth(withLoader(Hub));
