// Context para manejar estado global de anuncios
// contexts/AnunciosContext.js
import React, { createContext, useContext, useReducer } from "react";

const AnunciosContext = createContext();

const initialState = {
  anuncios: [],
  loading: false,
  error: null,
  filters: {
    category: "all",
    featured: false,
    search: "",
  },
  pagination: {
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false,
  },
};

function anunciosReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_ANUNCIOS":
      return {
        ...state,
        anuncios: action.payload,
        loading: false,
        error: null,
      };

    case "ADD_ANUNCIO":
      return {
        ...state,
        anuncios: [action.payload, ...state.anuncios],
      };

    case "UPDATE_ANUNCIO":
      return {
        ...state,
        anuncios: state.anuncios.map((anuncio) =>
          anuncio.id === action.payload.id ? action.payload : anuncio,
        ),
      };

    case "DELETE_ANUNCIO":
      return {
        ...state,
        anuncios: state.anuncios.filter(
          (anuncio) => anuncio.id !== action.payload,
        ),
      };

    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case "SET_PAGINATION":
      return { ...state, pagination: action.payload };

    case "APPEND_ANUNCIOS":
      return {
        ...state,
        anuncios: [...state.anuncios, ...action.payload],
        loading: false,
      };

    default:
      return state;
  }
}

export const AnunciosProvider = ({ children }) => {
  const [state, dispatch] = useReducer(anunciosReducer, initialState);

  return (
    <AnunciosContext.Provider value={{ state, dispatch }}>
      {children}
    </AnunciosContext.Provider>
  );
};

export const useAnunciosContext = () => {
  const context = useContext(AnunciosContext);
  if (!context) {
    throw new Error(
      "useAnunciosContext debe ser usado dentro de AnunciosProvider",
    );
  }
  return context;
};
