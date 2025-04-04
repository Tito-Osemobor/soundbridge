import {FaTimes} from "react-icons/fa";
import {useEffect} from "react";
import PlatformIcon from "@/components/PlatformIcon";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {addPendingConnection, selectAvailablePlatforms} from "@/store/platformSlice";

const AvailablePlatformsModal = ({onClose, onPlatformClick}) => {
  const dispatch = useDispatch();
  const availablePlatforms = useSelector(selectAvailablePlatforms);

  const handleClick = async (platformId) => {
    dispatch(addPendingConnection(platformId));

    try {
      const result = await onPlatformClick(platformId);

      if (!result?.success) {
        // Optional override for special messages in modal
        console.warn(`Connection to ${platformId} failed.`);
      }

      onClose(); // Now close after outcome is known
    } catch (err) {
      console.error("Platform connection failed in modal:", err);
      // Optional: show a fallback error toast here if it wasn't caught lower
      onClose(); // Still close to keep UX smooth
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.closest('.modal-content')) return;
      onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <div className="absolute left-[162px] z-10">
      <div
        className="bg-white p-6 rounded-lg shadow-lg relative modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          onClick={onClose}
        >
          <FaTimes size={20}/>
        </button>
        <h2 className="text-lg font-bold mb-4">Available Platforms</h2>
        <ul className="grid grid-cols-2 gap-4">
          {availablePlatforms.map((platform) => (
            <li key={platform.id} className="">
              <PlatformIcon
                service={platform}
                isConnected={platform.status === "connected"}
                isPending={platform.status === "pending"}
                onClick={() => handleClick(platform.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

AvailablePlatformsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPlatformClick: PropTypes.func.isRequired,
};

export default AvailablePlatformsModal;
