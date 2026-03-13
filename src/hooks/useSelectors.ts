import { useMemo } from 'react';
import useStore from '../store/useStore';

export function useTotalStress(): number {
  const projects = useStore((s) => s.projects);
  return useMemo(() => {
    const active = projects.filter((p) => p.status !== 'completed');
    if (active.length === 0) return 0;
    const total = active.reduce((sum, p) => sum + p.stressWeight, 0);
    return Math.round((total / (active.length * 10)) * 100);
  }, [projects]);
}

export function useCompletionPercentage(): number {
  const projects = useStore((s) => s.projects);
  return useMemo(() => {
    if (projects.length === 0) return 0;
    const completed = projects.filter((p) => p.status === 'completed').length;
    return Math.round((completed / projects.length) * 100);
  }, [projects]);
}

export function useNetFinancialPosition(): number {
  const finances = useStore((s) => s.finances);
  return useMemo(() => {
    return finances.reduce((net, f) => {
      if (f.type === 'income' || f.type === 'projected-income') return net + f.amount;
      return net - f.amount;
    }, 0);
  }, [finances]);
}

export function useBlockedProjects() {
  const projects = useStore((s) => s.projects);
  return useMemo(() => projects.filter((p) => p.status === 'blocked'), [projects]);
}

export function useProjectsByProperty(propertyId: string) {
  const projects = useStore((s) => s.projects);
  return useMemo(() => projects.filter((p) => p.propertyId === propertyId), [projects, propertyId]);
}

export function useProjectsByStatus(status: string) {
  const projects = useStore((s) => s.projects);
  return useMemo(() => projects.filter((p) => p.status === status), [projects, status]);
}
