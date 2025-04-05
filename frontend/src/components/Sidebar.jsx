import {FaPlus} from "react-icons/fa";
import Button from "@/components/Button";
import PlatformIcon from "@/components/PlatformIcon";
import {useAuth} from "@/context/AuthContext";
import {useState} from "react";
import api from "@/services/api";
import PropTypes from "prop-types";
import {selectAvailablePlatforms, selectConnectedPlatforms} from "@/store/platformSlice";
import {useSelector} from "react-redux";

const Sidebar = ({onOpenModal, selectedPlaylist}) => {
  const {user} = useAuth();
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);

  const connectedPlatforms = useSelector(selectConnectedPlatforms);
  const availablePlatforms = useSelector(selectAvailablePlatforms);

  const handleTransfer = async () => {
    if (!selectedPlaylist) return;

    try {
      const response = await api.post("/api/transfer/playlist", {
        spotifyUserId: user.platformsConnected.find(p => p.id === "SPOTIFY")?.platformUserId,
        youtubeUserId: user.platformsConnected.find(p => p.id === "YOUTUBE_MUSIC")?.platformUserId,
        playlistId: selectedPlaylist.id,
        playlistName: selectedPlaylist.name,
      });

      console.log(response.data.message);
      setTransferModalOpen(true);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  return (
    <div className={``}>
      <div
        className="flex flex-col justify-between h-full bg-gray-900 text-white p-4 border border-b-0 border-gray-300 bg-white rounded-t-lg">
        <ul className="flex flex-col gap-4">
          {connectedPlatforms.map((service) => (
            <li key={service.id} className="">
              <PlatformIcon
                service={service}
                isConnected={service.status === "connected"}
                isPending={service.status === "pending"}
              />
            </li>
          ))}
          {availablePlatforms.length > 0 && (
            <Button
              className="w-[98px] h-[125px] flex flex-col justify-center items-center bg-gray-50 border border-gray-500 text-white p-2 rounded-2xl cursor-pointer gap-1.5"
              onClick={onOpenModal}>
              <div className={`rounded-full bg-gray-400 p-3`}>
                <FaPlus className="text-3xl text-black"/>
              </div>
              <span className="text-sm text-center text-black font-bold">Connect Services</span>
            </Button>
          )}
        </ul>
        <div>
          <Button onClick={handleTransfer}
                  disabled={!selectedPlaylist}
                  className={`${!selectedPlaylist ? "opacity-50 cursor-not-allowed" : ""}`}
          >Transfer</Button>
        </div>

        {isTransferModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg text-black">
              <h2 className="text-lg font-bold">Transfer Successful!</h2>
              <p>{selectedPlaylist.name} has been transferred.</p>
              <button onClick={() => setTransferModalOpen(false)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
  selectedPlaylist: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default Sidebar;
