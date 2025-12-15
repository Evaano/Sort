import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

# Load env vars from parent directory if needed, or local .env
load_dotenv(dotenv_path="../.env") 

app = FastAPI()

# Allow CORS for React frontend (default Port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIPY_REDIRECT_URI")
SCOPE = "playlist-read-private playlist-modify-public playlist-modify-private"

# Global Auth Manager (for local single-user use)
sp_oauth = SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE,
    cache_path=".cache"
)

def get_spotify_client():
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return None
    return spotipy.Spotify(auth=token_info['access_token'])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Spotify Sorter Backend is Running"}

@app.get("/login")
def login():
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

@app.get("/callback")
def callback(code: str):
    sp_oauth.get_access_token(code)
    # After auth, redirect to frontend dashboard
    return RedirectResponse("http://localhost:5173/dashboard")

@app.get("/api/playlists")
def get_playlists():
    sp = get_spotify_client()
    if not sp:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    results = sp.current_user_playlists(limit=50)
    playlists = results['items']
    while results['next']:
        results = sp.next(results)
        playlists.extend(results['items'])
        
    return {"playlists": playlists}

@app.get("/api/status")
def get_status():
    sp = get_spotify_client()
    if sp:
        return {"authenticated": True, "user": sp.current_user()['display_name']}
    return {"authenticated": False}

@app.get("/api/analyze/{playlist_id}")
def analyze_playlist(playlist_id: str):
    sp = get_spotify_client()
    if not sp:
        raise HTTPException(status_code=401, detail="Not authenticated")

    print(f"Analyzing playlist: {playlist_id}")
    
    # Fetch all tracks from the playlist, handling pagination to ensure we get the full list.
    tracks = []
    results = sp.playlist_items(playlist_id, additional_types=['track'])
    tracks.extend(results['items'])
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    # Extract Artists to fetch their genres.
    # Spotify stores genres at the Artist level, not the Track level, so we must bridge this gap.
    artist_ids = set()
    track_data = [] 
    
    for item in tracks:
        if not item or not item.get('track'):
            continue
        track = item['track']
        if track.get('artists'):
            current_track_artist_names = []
            current_track_artist_ids = []
            
            for artist in track['artists']:
                if artist.get('id'):
                    artist_ids.add(artist['id'])
                    current_track_artist_ids.append(artist['id'])
                current_track_artist_names.append(artist['name'])
            
            track_model = {
                "id": track['id'],
                "name": track['name'],
                "artists": current_track_artist_names,
                "artist_ids": current_track_artist_ids,
                "image": track['album']['images'][0]['url'] if track['album']['images'] else None,
                "genres": [] # Populated later
            }
            track_data.append(track_model)

    # Batch fetch artist details (limit 50 per request) to minimize API calls.
    artist_ids_list = list(artist_ids)
    artist_genres = {}
    
    for i in range(0, len(artist_ids_list), 50):
        batch = artist_ids_list[i:i+50]
        if not batch: continue
        artists_info = sp.artists(batch)
        for artist in artists_info['artists']:
            if artist:
                artist_genres[artist['id']] = artist['genres']

    # Map artist genres back to tracks.
    # A track is assigned the union of all its artists' genres.
    genre_counts = {}
    
    for track in track_data:
        t_genres = set()
        for aid in track['artist_ids']:
            if aid in artist_genres:
                t_genres.update(artist_genres[aid])
        
        track['genres'] = list(t_genres)
        
        for g in t_genres:
            genre_counts[g] = genre_counts.get(g, 0) + 1

    # Sort genres by frequency to show top genres first.
    sorted_genres = dict(sorted(genre_counts.items(), key=lambda item: item[1], reverse=True))

    return {
        "metrics": {
            "total_tracks": len(track_data),
            "unique_artists": len(artist_ids),
            "total_genres": len(sorted_genres)
        },
        "genre_counts": sorted_genres,
        "tracks": track_data
    }
