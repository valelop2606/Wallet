export interface ObjectiveProgress {
  target_amount: number;
  current_amount: number;
}

export interface DashboardMetrics {
  availableMoney: number;
  totalAssigned: number;
  patrimony: number;
}

export function calculateDashboardMetrics(
  totalBalance: number,
  totalSavings: number,
  totalAssignedObjectives: number,
  totalAssignedProjects: number
): DashboardMetrics {
  const totalAssigned = totalAssignedObjectives + totalAssignedProjects;

  return {
    availableMoney: totalBalance - totalAssigned,
    totalAssigned,
    patrimony: totalBalance + totalSavings,
  };
}

export function getReachableObjectives(
  objectives: ObjectiveProgress[],
  availableMoney: number
): ObjectiveProgress[] {
  return objectives.filter(
    (objective) =>
      Number(objective.target_amount) - Number(objective.current_amount) <= availableMoney
  );
}
