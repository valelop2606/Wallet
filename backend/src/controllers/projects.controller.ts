import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
  assignMoneyToProject,
  getProjectWithProgress,
} from '../models/project.model';
import { getObjectivesByProject } from '../models/objective.model';
import { createAchievement } from '../models/achievement.model';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const projects = await getProjectsByUser(req.userId!);
  // Enrich with progress
  const enriched = await Promise.all(
    projects.map(async (p) => {
      const objectives = await getObjectivesByProject(p.id, req.userId!);
      const total = objectives.reduce((sum, o) => sum + Number(o.target_amount), 0);
      const current = objectives.reduce((sum, o) => sum + Number(o.current_amount), 0);
      return { ...p, objectives_count: objectives.length, progress_total: total, progress_current: current };
    })
  );
  res.json({ projects: enriched });
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  const project = await getProjectWithProgress(Number(req.params.id), req.userId!);
  if (!project) throw new AppError('Project not found', 404);
  const objectives = await getObjectivesByProject(project.id, req.userId!);
  res.json({ ...project, objectives });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { name, description } = req.body;

  if (!name) throw new AppError('Name is required', 400);

  const project = await createProject(req.userId!, { name, description });
  res.status(201).json(project);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, status } = req.body;
  const project = await updateProject(Number(req.params.id), req.userId!, { name, description, status });
  if (!project) throw new AppError('Project not found', 404);
  res.json(project);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const deleted = await deleteProject(Number(req.params.id), req.userId!);
  if (!deleted) throw new AppError('Project not found', 404);
  res.json({ message: 'Project deleted' });
}

export async function assignMoney(req: AuthRequest, res: Response): Promise<void> {
  const { amount } = req.body;

  if (!amount || amount <= 0) throw new AppError('Amount must be positive', 400);

  const project = await assignMoneyToProject(Number(req.params.id), req.userId!, amount);
  if (!project) throw new AppError('Project not found or invalid amount', 400);
  res.json(project);
}

export async function markCompleted(req: AuthRequest, res: Response): Promise<void> {
  const project = await getProjectById(Number(req.params.id), req.userId!);
  if (!project) throw new AppError('Project not found', 404);

  const updated = await updateProject(Number(req.params.id), req.userId!, { status: 'completed' });

  await createAchievement(
    req.userId!,
    'project',
    project.id,
    project.name,
    project.description || undefined,
    Number(project.assigned_amount)
  );

  res.json(updated);
}

export async function markPurchased(req: AuthRequest, res: Response): Promise<void> {
  const project = await getProjectById(Number(req.params.id), req.userId!);
  if (!project) throw new AppError('Project not found', 404);
  if (project.status !== 'completed') throw new AppError('Project must be completed before marking as purchased', 400);

  const updated = await updateProject(Number(req.params.id), req.userId!, { status: 'purchased' });
  res.json(updated);
}
