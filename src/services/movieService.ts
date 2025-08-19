import axios from "axios";
import type { Movie } from "../types/movie";

const API_KEY = import.meta.env.VITE_TMDB_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

const tmdbAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    accept: "application/json",
  },
});

interface MovieApiResponse {
  page: number;
  results: Movie[];
  total_pages: number;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export async function fetchMovies(
  query: string,
  page: number = 1
): Promise<MovieApiResponse> {
  const response = await tmdbAxios.get<MovieApiResponse>("/search/movie", {
    params: {
      query,
      include_adult: false,
      language: "en-US",
      page,
    },
  });
  return response.data;
}

// additional - watch trailer
export async function fetchMovieVideos(movieId: number): Promise<MovieVideo[]> {
  const response = await tmdbAxios.get<{ results: MovieVideo[] }>(
    `/movie/${movieId}/videos`,
    {
      params: { language: "en-US" },
    }
  );
  return response.data.results;
}
