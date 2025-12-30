"use client";

import { useAnnouncements } from "@/hooks/useAnnouncements";
import AnnouncementsModal from "./AnnouncementsModal";

/**
 * Proveedor de anuncios que se integra en el layout
 * Muestra el modal de anuncios cuando hay anuncios nuevos
 */
export default function AnnouncementsProvider() {
  const { announcements, showModal, closeModal } = useAnnouncements();

  if (!showModal || announcements.length === 0) {
    return null;
  }

  return <AnnouncementsModal announcements={announcements} onClose={closeModal} />;
}
