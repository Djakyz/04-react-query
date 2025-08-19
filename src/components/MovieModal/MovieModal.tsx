import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Movie } from "../../types/movie";
import { fetchMovieVideos } from "../../services/movieService";
import styles from "./MovieModal.module.css";
import { toast } from "react-hot-toast";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isTrailerLoading, setIsTrailerLoading] = useState(false);
  const [trailerNotFound, setTrailerNotFound] = useState(false);

  useEffect(() => {
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    setModalRoot(root);

    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleShowTrailer = async () => {
    setIsTrailerLoading(true);
    setTrailerNotFound(false);
    setTrailerKey(null);
    setShowTrailer(true);

    try {
      const videos = await fetchMovieVideos(movie.id);

      const trailer =
        videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
        videos.find((v) => v.site === "YouTube");

      if (trailer?.key) {
        setTrailerKey(trailer.key);
      } else {
        setTrailerNotFound(true);
        toast.error("Trailer not available for this movie.");
      }
    } catch (err) {
      console.error("Failed to load trailer:", err);
      setTrailerNotFound(true);
      toast.error("Failed to load trailer. Please try again later.");
    } finally {
      setIsTrailerLoading(false);
    }
  };

  const handleBackToInfo = () => {
    setShowTrailer(false);
    setTrailerKey(null);
    setTrailerNotFound(false);
    setIsTrailerLoading(false);
  };

  if (!modalRoot) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          aria-label="Close modal"
          onClick={onClose}
        >
          &times;
        </button>

        {!showTrailer ? (
          <>
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className={styles.image}
            />
            <div className={styles.content}>
              <h2>{movie.title}</h2>
              <p>{movie.overview}</p>
              <p>
                <strong>Release Date:</strong> {movie.release_date}
              </p>
              <p>
                <strong>Rating:</strong> {movie.vote_average}/10
              </p>
              <button onClick={handleShowTrailer} className={styles.trailerBtn}>
                🎬 Watch Trailer
              </button>
            </div>
          </>
        ) : (
          <div className={styles.trailerWrapper}>
            {isTrailerLoading && (
              <div className={styles.trailerMessage}>Loading trailer…</div>
            )}

            {!isTrailerLoading && trailerKey && (
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="YouTube trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {!isTrailerLoading && trailerNotFound && (
              <div className={styles.trailerMessage}>
                Trailer is not available for this movie.
              </div>
            )}

            <button onClick={handleBackToInfo} className={styles.backButton}>
              ⬅ Back to Info
            </button>
          </div>
        )}
      </div>
    </div>,
    modalRoot
  );
}
