import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SimulationResult, SimulationScenario } from '../types';

export function useSimulator() {
  return useMutation<SimulationResult, Error, SimulationScenario>({
    mutationFn: (scenario) => api.runSimulation(scenario) as Promise<SimulationResult>,
  });
}
