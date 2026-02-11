"use client";

import { Suspense } from "react";
import EnhancedSearch from "@/components/EnhancedSearch/EnhancedSearch";
import CategoryFilters from "@/components/CategoryFilters/CategoryFilters";
import ProductBanners from "@/components/ProductBanners/ProductBanners";
import ExternalLinks from "@/components/ExternalLinks/ExternalLinks";
import styles from "./SidebarContent.module.scss";

function LoadingSkeleton({ height = "200px" }) {
  return (
    <div className={styles.skeleton} style={{ height }}>
      <div className={styles.skeletonShimmer}></div>
    </div>
  );
}

export default function SidebarContent() {
  return (
    <div className={styles.sidebarContainer}>
      {/* Buscador mejorado */}
      <Suspense fallback={<LoadingSkeleton height="60px" />}>
        <EnhancedSearch />
      </Suspense>

      {/* Categorías y filtros */}
      <Suspense fallback={<LoadingSkeleton height="400px" />}>
        <CategoryFilters />
      </Suspense>

      {/* Banners publicitarios de productos */}
      <Suspense fallback={<LoadingSkeleton height="600px" />}>
        <ProductBanners />
      </Suspense>

      {/* Enlaces externos */}
      <Suspense fallback={<LoadingSkeleton height="400px" />}>
        <ExternalLinks />
      </Suspense>
    </div>
  );
}
