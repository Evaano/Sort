import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PlayCircle, ArrowRight, Loader2, Disc } from "lucide-react";
import API_BASE_URL from "../config";

export default function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/playlists`);
        setPlaylists(response.data.playlists);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching playlists:", error);
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 ml-1">
            My Playlists
          </h1>
          <p className="text-neutral-400 ml-1">
            Select a playlist to analyze and sort
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-500" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/analyze/${playlist.id}`)}
              className="group bg-neutral-800/40 hover:bg-neutral-800 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex items-center gap-4"
            >
              <div className="relative w-20 h-20 flex-shrink-0 bg-neutral-700 rounded-lg overflow-hidden shadow-lg">
                {playlist.images && playlist.images[0] ? (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500">
                    <Disc size={24} />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle className="text-white drop-shadow-lg" size={32} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg truncate pr-2">
                  {playlist.name}
                </h3>
                <p className="text-neutral-400 text-sm">
                  {playlist.tracks.total} tracks
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400">
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
