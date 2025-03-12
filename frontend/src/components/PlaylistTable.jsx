import {FaSpotify} from "react-icons/fa";
import {useState} from "react";

const PlaylistTable = ({playlists, onSelect}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handleSelect = (playlist) => {
    setSelectedPlaylist(playlist);
    onSelect(playlist);
  };

  return (
    <div className={`w-full p-4`}>
      <div className="text-white border border-gray-300 bg-white rounded-lg h-full">
        <table className="w-full border border-gray-300 p-4 gap-3">
          <thead>
          <tr className="bg-gray-200 p-4 text-left">
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Service</th>
            <th className="border px-4 py-2 text-center">Tracks</th>
          </tr>
          </thead>
          <tbody>
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <tr key={playlist.id}
                  className={`border mt-2 hover:bg-gray-100 text-black p-4 cursor-pointer ${selectedPlaylist?.id === playlist.id ? "bg-blue-200" : ""}`}
                  onClick={() => handleSelect(playlist)}
              >
                <td className=" px-4 py-2 flex items-center gap-2">
                  <FaSpotify className="text-green-500 text-xl"/>
                  {playlist.name}
                </td>
                <td className=" px-4 py-2">Spotify</td>
                <td className=" px-4 py-2 text-center">{playlist.trackCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4">No playlists found.</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlaylistTable;
