import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2, Music2, BarChart3, Disc } from "lucide-react";
import API_BASE_URL from "../config";

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/analyze/${id}`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error analyzing playlist:", error);
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const getGenreColor = (index) => {
    const colors = [
      "bg-green-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
        <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
        <p className="text-xl font-light animate-pulse">Analyzing "vibes"...</p>
        <p className="text-sm text-neutral-500 mt-2">
          Fetching artists & genres (this might take a moment)
        </p>
      </div>
    );
  }

  if (!data)
    return <div className="text-white p-8">Failed to load analysis.</div>;

  return (
    <div className="h-screen bg-neutral-900 text-white p-6 max-w-7xl mx-auto flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex-shrink-0">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row gap-8 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">Playlist Analysis</h1>
            <div className="flex gap-4 text-neutral-400 mt-4">
              <div className="bg-neutral-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <Music2 size={18} />
                <span className="text-white font-bold">
                  {data.metrics.total_tracks}
                </span>{" "}
                Tracks
              </div>
              <div className="bg-neutral-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <Disc size={18} />
                <span className="text-white font-bold">
                  {data.metrics.unique_artists}
                </span>{" "}
                Artists
              </div>
              <div className="bg-neutral-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <BarChart3 size={18} />
                <span className="text-white font-bold">
                  {data.metrics.total_genres}
                </span>{" "}
                Genres
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Genre list and Track list side-by-side */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scrollable List of Top Genres */}
        <div className="bg-neutral-800/50 rounded-2xl p-6 border border-white/5 overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold mb-6 sticky top-0 backdrop-blur pb-2 z-10">
            Top Genres
          </h2>
          <div className="space-y-4">
            {Object.entries(data.genre_counts)
              .slice(0, 15)
              .map(([genre, count], index) => {
                const percentage = (
                  (count / data.metrics.total_tracks) *
                  100
                ).toFixed(1);
                return (
                  <div key={genre} className="group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{genre}</span>
                      <span className="text-neutral-400">
                        {count} tracks ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getGenreColor(
                          index
                        )} transform origin-left transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Col: Track List */}
        <div className="lg:col-span-2 bg-neutral-800/50 rounded-2xl p-6 border border-white/5 flex flex-col overflow-hidden">
          <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Tracks</h2>
          <div className="overflow-y-auto pr-2 space-y-2 custom-scrollbar flex-1">
            {data.tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 bg-neutral-700 rounded overflow-hidden flex-shrink-0">
                  {track.image && (
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{track.name}</div>
                  <div className="text-sm text-neutral-400 truncate">
                    {track.artists.join(", ")}
                  </div>
                </div>
                <div className="flex gap-2 justify-end flex-wrap max-w-[40%]">
                  {track.genres.slice(0, 3).map((g, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white/10 px-2 py-1 rounded-full text-neutral-300 capitalize truncate max-w-[100px]"
                    >
                      {g}
                    </span>
                  ))}
                  {track.genres.length === 0 && (
                    <span className="text-xs text-neutral-600 italic">
                      Unknown Genre
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
