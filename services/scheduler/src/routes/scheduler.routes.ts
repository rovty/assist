import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import {
  createJobSchema,
  updateJobSchema,
  jobParamsSchema,
  listJobsSchema,
  businessHoursSchema,
  createSLASchema,
  updateSLASchema,
  slaParamsSchema,
} from '../schemas/scheduler.schema.js';
import {
  createJob,
  getJob,
  listJobs,
  updateJob,
  deleteJob,
  pauseJob,
  resumeJob,
  setBusinessHours,
  getBusinessHours,
  isWithinBusinessHours,
  createSLA,
  getSLA,
  listSLAs,
  updateSLA,
  deleteSLA,
} from '../services/scheduler.service.js';

export async function schedulerRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ─── Jobs ───────────────────────────────────────────────── */

  app.post('/jobs', {
    handler: async (request, reply) => {
      const { body } = createJobSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const job = await createJob(tenantId, userId, body);
      return reply.status(201).send(job);
    },
  });

  app.get('/jobs', {
    handler: async (request, reply) => {
      const { querystring } = listJobsSchema.parse({ querystring: request.query });
      const { tenantId } = request.tenantContext!;

      const result = await listJobs(tenantId, querystring);
      return reply.send(result);
    },
  });

  app.get('/jobs/:jobId', {
    handler: async (request, reply) => {
      const { params } = jobParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const job = await getJob(tenantId, params.jobId);
      if (!job) return reply.status(404).send({ error: 'Job not found' });
      return reply.send(job);
    },
  });

  app.patch('/jobs/:jobId', {
    handler: async (request, reply) => {
      const { params, body } = updateJobSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const updated = await updateJob(tenantId, params.jobId, body);
      if (!updated) return reply.status(404).send({ error: 'Job not found' });
      return reply.send(updated);
    },
  });

  app.delete('/jobs/:jobId', {
    handler: async (request, reply) => {
      const { params } = jobParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await deleteJob(tenantId, params.jobId);
      return reply.status(204).send();
    },
  });

  app.post('/jobs/:jobId/pause', {
    handler: async (request, reply) => {
      const { params } = jobParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const job = await pauseJob(tenantId, params.jobId);
      if (!job) return reply.status(404).send({ error: 'Job not found or not active' });
      return reply.send(job);
    },
  });

  app.post('/jobs/:jobId/resume', {
    handler: async (request, reply) => {
      const { params } = jobParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const job = await resumeJob(tenantId, params.jobId);
      if (!job) return reply.status(404).send({ error: 'Job not found or not paused' });
      return reply.send(job);
    },
  });

  /* ─── Business Hours ─────────────────────────────────────── */

  app.post('/business-hours', {
    handler: async (request, reply) => {
      const { body } = businessHoursSchema.parse({ body: request.body });
      const { tenantId } = request.tenantContext!;

      const hours = await setBusinessHours(tenantId, body);
      return reply.send(hours);
    },
  });

  app.get('/business-hours', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;

      const hours = await getBusinessHours(tenantId);
      if (!hours) return reply.send({ configured: false });
      return reply.send({ configured: true, ...hours });
    },
  });

  app.get('/business-hours/status', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;

      const hours = await getBusinessHours(tenantId);
      if (!hours) return reply.send({ open: true, configured: false });

      const open = isWithinBusinessHours(hours);
      return reply.send({ open, configured: true });
    },
  });

  /* ─── SLA Policies ──────────────────────────────────────── */

  app.post('/sla', {
    handler: async (request, reply) => {
      const { body } = createSLASchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const sla = await createSLA(tenantId, userId, body);
      return reply.status(201).send(sla);
    },
  });

  app.get('/sla', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const slas = await listSLAs(tenantId);
      return reply.send(slas);
    },
  });

  app.get('/sla/:slaId', {
    handler: async (request, reply) => {
      const { params } = slaParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const sla = await getSLA(tenantId, params.slaId);
      if (!sla) return reply.status(404).send({ error: 'SLA policy not found' });
      return reply.send(sla);
    },
  });

  app.patch('/sla/:slaId', {
    handler: async (request, reply) => {
      const { params, body } = updateSLASchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const updated = await updateSLA(tenantId, params.slaId, body);
      if (!updated) return reply.status(404).send({ error: 'SLA policy not found' });
      return reply.send(updated);
    },
  });

  app.delete('/sla/:slaId', {
    handler: async (request, reply) => {
      const { params } = slaParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await deleteSLA(tenantId, params.slaId);
      return reply.status(204).send();
    },
  });
}
