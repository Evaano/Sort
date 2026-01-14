import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Music2,
  BarChart3,
  Disc,
  X,
  Check,
  AlertCircle,
  Info,
  Zap,
  Smile,
  Activity,
  Flame,
  CloudRain,
  PartyPopper,
  Timer,
  Guitar,
  Mic,
  Volume2,
  Music,
} from "lucide-react";
import api from "../config";

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  // Modal State for confirmations and feedback
  const [modal, setModal] = useState({
    isOpen: false,
    type: "confirm", // 'confirm', 'success', 'error', 'loading'
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get(`/api/analyze?playlist_ids=${id}`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error analyzing playlist:", error);
        if (error.response?.status === 401) {
          navigate("/");
          return;
        }
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, navigate]);

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

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCreatePlaylist = (genre) => {
    const tracksToAdd = data.tracks.filter((t) => t.genres.includes(genre)).map((t) => t.uri);

    if (tracksToAdd.length === 0) return;

    const genreName = genre.charAt(0).toUpperCase() + genre.slice(1);

    setModal({
      isOpen: true,
      type: "confirm",
      title: `Create ${genreName} Mix?`,
      message: `This will create a new playlist with ${tracksToAdd.length} tracks. Duplicate checks will be performed automatically.`,
      onConfirm: () => performCreate(genreName, tracksToAdd),
    });
  };

  const handleCreateVibePlaylist = (vibe) => {
    const vibeTitles = {
      depressy: "Depressy / Sad",
      chill: "Chill / Relaxed",
      party: "Party / Hype",
      intense: "Intense / High Energy",
    };

    setModal({
      isOpen: true,
      type: "confirm",
      title: `Generate ${vibeTitles[vibe] || vibe} Playlist?`,
      message: `We will analyze your selected playlists and extract tracks matching this vibe.`,
      onConfirm: () => performVibeCreate(vibe),
    });
  };

  const performVibeCreate = async (vibe) => {
    try {
      setModal({
        isOpen: true,
        type: "loading",
        title: "Analyzing Vibes...",
        message: "Scanning audio features and compiling your mix...",
        onConfirm: null,
      });

      // We need to pass the source playlist IDs.
      // In this component, 'id' param contains comma-separated IDs.
      const response = await api.post("/api/create_vibe_playlist", {
        name: `${vibe.charAt(0).toUpperCase() + vibe.slice(1)} Mix`,
        source_playlist_ids: id,
        vibe: vibe,
      });

      setModal({
        isOpen: true,
        type: "success",
        title: "Vibe playlist Created!",
        message: response.data.message,
        onConfirm: null,
      });
    } catch (error) {
      console.error("Failed to create vibe playlist", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Generation Failed",
        message: error.response?.data?.detail || "Could not generate playlist for this vibe.",
        onConfirm: null,
      });
    }
  };

  const performCreate = async (genre, tracksToAdd) => {
    try {
      // Show Loading Modal
      setModal({
        isOpen: true,
        type: "loading",
        title: "Creating Playlist",
        message: "Talking to Spotify...",
        onConfirm: null,
      });

      const response = await api.post("/api/create_playlist", {
        name: `${genre} Mix`,
        track_uris: tracksToAdd,
      });

      // Show Success Modal
      setModal({
        isOpen: true,
        type: "success",
        title: "Playlist Created!",
        message: response.data.message,
        onConfirm: null,
      });
    } catch (error) {
      console.error("Failed to create playlist", error);
      // Show Error Modal
      setModal({
        isOpen: true,
        type: "error",
        title: "Creation Failed",
        message: "Something went wrong while creating the playlist. Please try again.",
        onConfirm: null,
      });
    }
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

  if (!data) return <div className="text-white p-8">Failed to load analysis.</div>;

  // Filter tracks matches the selected genre if one is active
  const visibleTracks = selectedGenre
    ? data.tracks.filter((t) => t.genres.includes(selectedGenre))
    : data.tracks;

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-3 sm:p-6 max-w-7xl mx-auto flex flex-col overflow-hidden relative">
      {/* Modal Overlay */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              {modal.type === "confirm" && <Disc size={48} className="text-blue-500" />}
              {modal.type === "loading" && (
                <Loader2 size={48} className="text-green-500 animate-spin" />
              )}
              {modal.type === "success" && <Check size={48} className="text-green-500" />}
              {modal.type === "error" && <AlertCircle size={48} className="text-red-500" />}
            </div>

            <h3 className="text-2xl font-bold text-center mb-2">{modal.title}</h3>
            <p className="text-neutral-400 text-center mb-8">{modal.message}</p>

            <div className="flex gap-3 justify-center">
              {modal.type === "confirm" && (
                <>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 rounded-full font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modal.onConfirm}
                    className="px-6 py-2 rounded-full font-bold bg-green-500 text-black hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25"
                  >
                    Create It via Magic
                  </button>
                </>
              )}
              {(modal.type === "success" || modal.type === "error") && (
                <button
                  onClick={closeModal}
                  className="px-8 py-2 rounded-full font-bold bg-white text-black hover:bg-neutral-200 transition-colors"
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="shrink-0">
        <div className="flex justify-between items-start mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
          </button>

          {showGuide && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200 flex items-start gap-3 max-w-md animate-in slide-in-from-top-4">
              <Info size={20} className="shrink-0 mt-0.5 text-blue-400" />
              <div>
                <p className="font-semibold mb-1">How it works:</p>
                <p>
                  1. Use <strong>Vibe Generator</strong> buttons to create mood-based playlists
                  automatically.
                </p>
                <p>
                  2. Or click a <strong>Genre</strong> to filter tracks, then{" "}
                  <strong>Create Playlist</strong>.
                </p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-blue-400 hover:text-white ml-2"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:gap-8 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">Playlist Analysis</h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-neutral-400 mt-4 text-sm sm:text-base">
              <div className="bg-neutral-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <Music2 size={18} />
                <span className="text-white font-bold">{data.metrics.total_tracks}</span> Tracks
              </div>
              <div className="bg-neutral-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <Disc size={18} />
                <span className="text-white font-bold">{data.metrics.unique_artists}</span> Artists
              </div>
              <div className="bg-neutral-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <BarChart3 size={18} />
                <span className="text-white font-bold">{data.metrics.total_genres}</span> Genres
              </div>
            </div>
            {(data.metrics.tracks_with_features > 0 || selectedTrack) && (
              <>
                {/* Stats Header - shows what we're viewing */}
                <div className="flex items-center justify-between mt-4 mb-2">
                  <h3 className="text-sm font-medium text-neutral-300">
                    {selectedTrack ? (
                      <span className="flex items-center gap-2">
                        <span className="text-green-400">♪</span>
                        {selectedTrack.name}
                        <span className="text-neutral-500">
                          by {selectedTrack.artists.join(", ")}
                        </span>
                      </span>
                    ) : (
                      "Playlist Averages"
                    )}
                  </h3>
                  {selectedTrack && (
                    <button
                      onClick={() => setSelectedTrack(null)}
                      className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                    >
                      ← Back to averages
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-neutral-400 text-xs sm:text-sm">
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title="Average Energy (0-1)"
                  >
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-white font-bold">
                      {selectedTrack?.audio_features?.energy?.toFixed(2) ?? data.metrics.avg_energy}
                    </span>
                    Energy
                  </div>
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title="Valence/Mood (0-1)"
                  >
                    <Smile size={16} className="text-blue-400" />
                    <span className="text-white font-bold">
                      {selectedTrack?.audio_features?.valence?.toFixed(2) ??
                        data.metrics.avg_valence}
                    </span>
                    Mood
                  </div>
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title="Average Danceability (0-1)"
                  >
                    <Activity size={16} className="text-pink-400" />
                    <span className="text-white font-bold">
                      {selectedTrack?.audio_features?.danceability?.toFixed(2) ??
                        data.metrics.avg_danceability}
                    </span>
                    Dance
                  </div>
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title="Tempo (BPM)"
                  >
                    <Timer size={16} className="text-orange-400" />
                    <span className="text-white font-bold">
                      {selectedTrack?.audio_features?.tempo?.toFixed(0) ?? data.metrics.avg_tempo}
                    </span>
                    BPM
                  </div>
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title="Average Acousticness (0-1)"
                  >
                    <Guitar size={16} className="text-amber-400" />
                    <span className="text-white font-bold">
                      {selectedTrack?.audio_features?.acousticness?.toFixed(2) ??
                        data.metrics.avg_acousticness}
                    </span>
                    Acoustic
                  </div>
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title="Instrumentalness (0-1)"
                  >
                    <Mic size={16} className="text-purple-400" />
                    <span className="text-white font-bold">
                      {selectedTrack?.audio_features?.instrumentalness?.toFixed(2) ??
                        data.metrics.avg_instrumentalness}
                    </span>
                    Instrumental
                  </div>
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title={selectedTrack ? "Track key mode" : "Percentage of tracks in minor key"}
                  >
                    <Music size={16} className="text-indigo-400" />
                    <span className="text-white font-bold">
                      {selectedTrack
                        ? selectedTrack.audio_features?.mode === 0
                          ? "Minor"
                          : "Major"
                        : `${data.metrics.pct_minor_key ?? 0}%`}
                    </span>
                    {selectedTrack ? "Key" : "Minor Key"}
                  </div>
                  <div
                    className="bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                    title="Loudness (dB) - Closer to 0 = Louder"
                  >
                    <Volume2 size={16} className="text-red-400" />
                    <span className="text-white font-bold">
                      {selectedTrack?.audio_features?.loudness?.toFixed(1) ??
                        data.metrics.avg_loudness ??
                        -10}
                      dB
                    </span>
                    Loud
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Audio features from {data.metrics.tracks_with_features} of{" "}
                  {data.metrics.total_tracks} tracks
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Genre list and Track list side-by-side */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Col: Interactive Genre List */}
        <div className="bg-neutral-800/50 rounded-2xl p-4 sm:p-6 border border-white/5 flex flex-col overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 shrink-0">
            {selectedGenre ? `Genre: ${selectedGenre}` : "Vibe Generator"}
          </h2>

          {!selectedGenre && (
            <div className="mb-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCreateVibePlaylist("depressy")}
                className="bg-indigo-900/50 hover:bg-indigo-800/80 border border-indigo-500/30 p-3 rounded-xl text-left transition-all hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40">
                  <CloudRain size={24} />
                </div>
                <div className="font-bold text-indigo-200">Depressy</div>
                <div className="text-xs text-indigo-400">Sad & Moody</div>
              </button>
              <button
                onClick={() => handleCreateVibePlaylist("chill")}
                className="bg-teal-900/50 hover:bg-teal-800/80 border border-teal-500/30 p-3 rounded-xl text-left transition-all hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40">
                  <Smile size={24} />
                </div>
                <div className="font-bold text-teal-200">Chill</div>
                <div className="text-xs text-teal-400">Relaxed Vibes</div>
              </button>
              <button
                onClick={() => handleCreateVibePlaylist("party")}
                className="bg-pink-900/50 hover:bg-pink-800/80 border border-pink-500/30 p-3 rounded-xl text-left transition-all hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40">
                  <PartyPopper size={24} />
                </div>
                <div className="font-bold text-pink-200">Party</div>
                <div className="text-xs text-pink-400">High Energy</div>
              </button>
              <button
                onClick={() => handleCreateVibePlaylist("intense")}
                className="bg-red-900/50 hover:bg-red-800/80 border border-red-500/30 p-3 rounded-xl text-left transition-all hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40">
                  <Flame size={24} />
                </div>
                <div className="font-bold text-red-200">Intense</div>
                <div className="text-xs text-red-400">Aggressive</div>
              </button>
            </div>
          )}

          {selectedGenre && (
            <button
              onClick={() => setSelectedGenre(null)}
              className="mb-4 text-sm text-neutral-400 hover:text-white flex items-center"
            >
              <ArrowLeft size={14} className="mr-1" /> Back to all genres
            </button>
          )}

          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {Object.entries(data.genre_counts)
              .slice(0, 50)
              .map(([genre, count], index) => {
                const percentage = ((count / data.metrics.total_tracks) * 100).toFixed(1);
                const isSelected = selectedGenre === genre;

                return (
                  <div
                    key={genre}
                    onClick={() => setSelectedGenre(isSelected ? null : genre)}
                    className={`group p-3 rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-neutral-800 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                        : "hover:bg-white/5 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`capitalize font-medium ${isSelected ? "text-green-500" : ""}`}
                      >
                        {genre}
                      </span>
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatePlaylist(genre);
                          }}
                          className="text-xs bg-green-500 text-black font-bold px-3 py-1 rounded-full hover:scale-105 transition-transform"
                        >
                          Create Playlist
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>{count} tracks</span>
                      <span>{percentage}%</span>
                    </div>

                    <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
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

        {/* Right Col: Track List (Dynamic) */}
        <div className="lg:col-span-2 bg-neutral-800/50 rounded-2xl p-6 border border-white/5 flex flex-col overflow-hidden">
          <h2 className="text-2xl font-bold mb-4 shrink-0">
            Tracks{" "}
            {selectedGenre && (
              <span className="text-neutral-400 text-lg font-normal">({visibleTracks.length})</span>
            )}
          </h2>
          <div className="overflow-y-auto pr-2 space-y-2 custom-scrollbar flex-1">
            {visibleTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(selectedTrack?.id === track.id ? null : track)}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer group ${
                  selectedTrack?.id === track.id
                    ? "bg-green-500/10 border border-green-500/30"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="w-12 h-12 bg-neutral-700 rounded overflow-hidden shrink-0">
                  {track.image && (
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium truncate ${selectedTrack?.id === track.id ? "text-green-400" : ""}`}
                  >
                    {track.name}
                  </div>
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
                    <span className="text-xs text-neutral-600 italic">Unknown Genre</span>
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
