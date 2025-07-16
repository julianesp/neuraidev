// hooks/useStats.js - Hook para estadísticas
import { useState, useEffect } from "react";
import anunciosApi from "../services/anunciosApi";

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await anunciosApi.getStats();
      setStats(response.stats);
    } catch (err) {
      setError(err.message);
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
};
