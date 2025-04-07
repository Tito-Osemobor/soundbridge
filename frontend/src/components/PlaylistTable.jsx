import {useMemo, useState} from "react";
import PropTypes from "prop-types";
import {getPlatformById} from "@/constants/services";
import {useSelector} from "react-redux";
import {selectPlaylistsByPlatform} from "@/store/playlistsSlice";

const PlaylistTable = ({platformIds = [], searchQuery = "", onSelect}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const playlistsByPlatform = useSelector(selectPlaylistsByPlatform);

  const filteredPlaylistsByPlatform = useMemo(() => {
    const selected = platformIds.length
      ? platformIds.reduce((acc, id) => {
        if (playlistsByPlatform[id]) {
          acc[id] = playlistsByPlatform[id];
        }
        return acc;
      }, {})
      : playlistsByPlatform;

    const query = searchQuery.trim().toLowerCase();

    if (!query) return selected;

    return Object.entries(selected).reduce((acc, [platformId, playlists]) => {
      const filtered = playlists.filter(p =>
        p.name.toLowerCase().includes(query)
      );
      if (filtered.length) acc[platformId] = filtered;
      return acc;
    }, {});
  }, [platformIds, searchQuery, playlistsByPlatform]);

  const handleSelect = (playlist) => {
    setSelectedPlaylist(playlist);
    onSelect(playlist);
  };

  return (
    <div className="w-full h-full flex flex-grow border border-gray-300 rounded-t-lg">
      <div className={"flex-grow overflow-y-auto bg-white rounded-t-lg"}>
        <table className="w-full table-auto">
          <thead className="bg-gray-200 sticky top-0">
          <tr className="">
            <th className="w-10 px-4 py-2"></th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Service</th>
            <th className="px-4 py-2 text-center">Tracks</th>
          </tr>
          </thead>
          <tbody className={``}>
          {Object.entries(filteredPlaylistsByPlatform).length > 0 ? (
            Object.entries(filteredPlaylistsByPlatform).map(([platformId, playlists]) =>
              playlists.map((playlist) => {
                const platform = getPlatformById(platformId);
                return (
                  <tr
                    key={playlist.id}
                    className={`hover:bg-gray-100 text-black border-b ${selectedPlaylist?.id === playlist.id ? "bg-gray-100" : ""}`}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPlaylist?.id === playlist.id}
                          onChange={() => handleSelect(playlist)}
                          className="form-checkbox h-4 w-4 cursor-pointer rounded"
                        />
                        <div className={`${platform.backGroundColor} rounded-lg p-1`}>
                          {platform.icon(`text-lg ${platform.color}`)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">{playlist.name}</td>
                    <td className="px-4 py-2">
                      <div className={`${platform.backGroundColor} rounded-lg px-3 py-1.5 text-center w-fit`}>
                        {platform.name}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {playlist.trackCount} {playlist.trackCount <= 1 ? "track" : "tracks"}
                    </td>
                  </tr>
                );
              })
            )
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-black">No playlists found.</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

PlaylistTable.propTypes = {
  platformId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default PlaylistTable;
