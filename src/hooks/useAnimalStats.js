import { useMemo } from 'react';

/**
 * Computes animal statistics (KPIs) from an array of animals.
 *
 * Returns:
 * - **total** — total number of animals
 * - **enTratamiento** — animals whose estado contains "tratamiento"
 * - **activos** — animals with estado "Activo" or "Saludable"
 *
 * @param {Array} animales - Array of animal objects with optional `estado` field
 * @returns {{ total: number, enTratamiento: number, activos: number }}
 */
export function useAnimalStats(animales) {
  return useMemo(() => {
    const list = animales || [];
    const total = list.length;
    const enTratamiento = list.filter(a =>
      a.estado && a.estado.toLowerCase().includes('tratamiento')
    ).length;
    const activos = list.filter(a =>
      a.estado && ['Activo', 'Saludable'].includes(a.estado)
    ).length;

    return { total, enTratamiento, activos };
  }, [animales]);
}
