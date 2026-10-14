import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateDashboardMetrics,
  getReachableObjectives,
} from '../src/utils/dashboard.utils';

test('calcula el dinero disponible descontando objetivos y proyectos', () => {
  const metrics = calculateDashboardMetrics(1000, 200, 300, 150);

  assert.equal(metrics.availableMoney, 550);
});

test('calcula el total asignado', () => {
  const metrics = calculateDashboardMetrics(1000, 200, 300, 150);

  assert.equal(metrics.totalAssigned, 450);
});

test('calcula el patrimonio sumando saldo y ahorros', () => {
  const metrics = calculateDashboardMetrics(1000, 200, 300, 150);

  assert.equal(metrics.patrimony, 1200);
});

test('identifica objetivos cuyo faltante cabe en el dinero disponible', () => {
  const objectives = [
    { target_amount: 500, current_amount: 200 },
    { target_amount: 900, current_amount: 100 },
  ];

  assert.deepEqual(getReachableObjectives(objectives, 300), [objectives[0]]);
});

test('calcula el dinero disponible con objetivos y proyectos asignados', () => {
  const metrics = calculateDashboardMetrics(1000, 200, 300, 150);

  assert.equal(metrics.availableMoney, 550);
});
