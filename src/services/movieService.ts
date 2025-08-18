import axios from "axios";
import type { MovieApiResponse } from "../types/movie";

const API_KEY = import.meta.env.VITE_TMDB_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

const tmdbAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    accept: "application/json",
  },
});

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
