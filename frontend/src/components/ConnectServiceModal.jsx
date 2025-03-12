import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";
import ConnectIcon from "@/components/ConnectIcon";

const ConnectServiceModal = ({ onClose, availableServices }) => {

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.closest('.modal-content')) return;
      onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <div className="absolute left-[162px]">
      <div
        className="bg-white p-6 rounded-lg shadow-lg relative modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-lg font-bold mb-4">Available Services</h2>
        <ul className="grid grid-cols-2 gap-4">
          {availableServices.map((service) => (
            <li key={service.id} className="">
              <ConnectIcon icon={service.icon} isConnected={false} name={service.name}/>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConnectServiceModal;
