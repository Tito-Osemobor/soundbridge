import { useState } from "react";
import { usePlatformConnection } from "@/hooks/usePlatformConnection";
import { useModalState } from "@/hooks/useModalState";

export const useHubState = () => {
  const {
    connectToPlatform,
  } = usePlatformConnection();

  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModalState();
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  return {
    selectedPlaylist,
    setSelectedPlaylist,
    isModalOpen,
    openModal,
    closeModal,
    connectToPlatform,
  };
};
