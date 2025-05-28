import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as request from 'supertest';

import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from '@mikro-orm/core';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import { getValidJwt, testEndpointAuth } from './testutils/auth.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

// Mock repositories
let mockTaskRepository: Record<string, jest.Mock>;
let mockTaskBundleRepository: Record<string, jest.Mock>;
let mockTaskOrderRepository: Record<string, jest.Mock>;
let mockPersistAndFlush: jest.SpyInstance;
let mockPersist: jest.SpyInstance;

describe('TasksController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    setupTestConfig();

    mockTaskRepository = {
      findOneOrFail: jest.fn(),
      findOne: jest.fn(),
    };
    mockTaskBundleRepository = {
      findOneOrFail: jest.fn(),
    };
    mockTaskOrderRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('TasksEntityRepository')
      .useValue(mockTaskRepository)
      .overrideProvider('TaskBundleEntityRepository')
      .useValue(mockTaskBundleRepository)
      .overrideProvider('TaskOrderEntityRepository')
      .useValue(mockTaskOrderRepository)
      .compile();

    app = moduleRef.createNestApplication();
    await setupApp(app);
    await app.init();

    const em = app.get(EntityManager);
    mockPersistAndFlush = jest.spyOn(em, 'persistAndFlush').mockResolvedValue(undefined);
    mockPersist = jest.spyOn(em, 'persist').mockReturnValue(undefined);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('/tasks (GET)', () => {
    testEndpointAuth('/tasks', 'GET', () => app);
  });

  describe('/tasks (POST)', () => {
    testEndpointAuth('/tasks', 'POST', () => app);
  });

  describe('/tasks/:id/content (POST)', () => {
    testEndpointAuth('/tasks/task-1/content', 'POST', () => app);

    it('should upload content to a task', async () => {
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/valid.zip', { contentType: 'application/zip' })
        .expect(201);

      expect(mockPersistAndFlush).toHaveBeenCalled();
    });

    it('should fail if task is not found', async () => {
      const taskId = 'task-404';
      mockTaskRepository.findOne.mockResolvedValue(undefined);
      // Create a temp file for upload
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-upload-test-'));
      const tempFilePath = path.join(tempDir, 'testfile.txt');
      fs.writeFileSync(tempFilePath, 'test content');
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/valid.zip', { contentType: 'application/zip' })
        .expect(404);
      fs.unlinkSync(tempFilePath);
      fs.rmdirSync(tempDir);
    });

    it('should return 413 if uploaded file is too large', async () => {
      const taskId = 'task-1';
      // Simulate a file larger than the allowed limit (1KB for test)
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      try {
        await request(app.getHttpServer())
          .post(`/tasks/${taskId}/content`)
          .attach('file', 'test/fixtures/tooBig.zip', { contentType: 'application/zip' });
        fail('Should not succeed');
      } catch (err) {
        // Accept both 413 and abort (case-insensitive)
        const statusOrMessage = err.status || err.message;
        expect([413, 'aborted', 'Aborted']).toContain(statusOrMessage);
      }
    });

    it('should reject a file with .zip extension that is not a real zip (magic number check)', async () => {
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOneOrFail.mockResolvedValue(mockTask);
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/invalid.zip', { contentType: 'application/zip' })
        .expect(415);
    });

    it('should reject a file with .txt extension (not an archive)', async () => {
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOneOrFail.mockResolvedValue(mockTask);
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/invalid.txt', { contentType: 'text/plain' })
        .expect(415);
    });
  });

  describe('/tasks/:taskId/bundle/:bundleId (POST)', () => {
    testEndpointAuth('/tasks/task-1/bundle/bundle-1', 'POST', () => app);

    it('should assign a task to a bundle', async () => {
      const bundleId = 'bundle-1';
      const taskId = 'task-1';
      const order = 0;
      const mockTask = {
        id: taskId,
        name: 'Test Task',
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      const mockBundle = {
        id: bundleId,
        name: 'TestBundle',
        customers: { getItems: jest.fn().mockReturnValue([]) },
        global: false,
        taskList: {
          contains: jest.fn().mockReturnValue(false),
          count: jest.fn().mockReturnValue(0),
        },
      };
      mockTaskRepository.findOneOrFail.mockResolvedValue(mockTask);
      mockTaskBundleRepository.findOneOrFail.mockResolvedValue(mockBundle);
      mockTaskOrderRepository.create.mockReturnValue({});
      mockTaskOrderRepository.findOne.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/bundle/${bundleId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ order })
        .expect(201);

      expect(mockPersistAndFlush).toHaveBeenCalled();
    });

    it('should fail if the task is already in the bundle', async () => {
      const bundleId = 'bundle-1';
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        global: false,
        customers: {
          contains: jest.fn().mockReturnValue(true),
        },
      };
      const mockBundle = {
        id: bundleId,
        customers: {
          getItems: jest.fn().mockReturnValue([]),
          contains: jest.fn().mockReturnValue(true),
        },
        taskList: {
          contains: jest.fn().mockReturnValue(true),
          count: jest.fn().mockReturnValue(1),
        },
      };
      mockTaskRepository.findOneOrFail.mockResolvedValue(mockTask);
      mockTaskBundleRepository.findOneOrFail.mockResolvedValue(mockBundle);

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/bundle/${bundleId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ order: 0 })
        .expect(400);
    });

    it('should fail if the task cannot be assigned due to customer mismatch', async () => {
      const bundleId = 'bundle-1';
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(false) },
      };
      const mockBundle = {
        id: bundleId,
        customers: { getItems: jest.fn().mockReturnValue(['customer-1']) },
        taskList: {
          contains: jest.fn().mockReturnValue(false),
          count: jest.fn().mockReturnValue(0),
        },
      };
      mockTaskRepository.findOneOrFail.mockResolvedValue(mockTask);
      mockTaskBundleRepository.findOneOrFail.mockResolvedValue(mockBundle);

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/bundle/${bundleId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ order: 0 })
        .expect(400);
    });

    it('should fail if the task is not found', async () => {
      const bundleId = 'bundle-1';
      const taskId = 'task-404';
      mockTaskRepository.findOneOrFail.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/bundle/${bundleId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ order: 0 })
        .expect(404);
    });

    it('should fail if the bundle is not found', async () => {
      const bundleId = 'bundle-404';
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOneOrFail.mockResolvedValue(mockTask);
      mockTaskBundleRepository.findOneOrFail.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/bundle/${bundleId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ order: 0 })
        .expect(404);
    });
  });

  describe('/tasks/bundle/:bundleId/tasks (POST)', () => {
    testEndpointAuth('/tasks/bundle/bundle-3/tasks', 'POST', () => app);

    it('should bulk assign tasks to a bundle', async () => {
      const bundleId = 'bundle-3';
      const taskIds = ['task-4', 'task-5', 'task-6'];
      const mockBundle = {
        id: bundleId,
        customers: { getItems: jest.fn().mockReturnValue([]) },
        taskList: { getItems: jest.fn().mockReturnValue([]), remove: jest.fn() },
      };
      mockTaskBundleRepository.findOneOrFail.mockResolvedValue(mockBundle);
      mockTaskRepository.findOneOrFail.mockResolvedValue({
        id: expect.any(String),
        global: true,
        customers: { contains: jest.fn().mockReturnValue(true) },
      });
      mockTaskOrderRepository.findOne.mockResolvedValue(undefined);
      mockTaskOrderRepository.create.mockReturnValue({});

      await request(app.getHttpServer())
        .post(`/tasks/bundle/${bundleId}/tasks`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ taskIds })
        .expect(201);

      expect(mockPersist).toHaveBeenCalled();
    });

    it('should fail if a task in the list cannot be assigned due to customer mismatch', async () => {
      const bundleId = 'bundle-3';
      const taskIds = ['task-4', 'task-7'];
      const mockBundle = {
        id: bundleId,
        customers: { getItems: jest.fn().mockReturnValue(['customer-1']) },
        taskList: { getItems: jest.fn().mockReturnValue([]), remove: jest.fn() },
      };
      mockTaskBundleRepository.findOneOrFail.mockResolvedValue(mockBundle);
      mockTaskRepository.findOneOrFail.mockImplementation((id: string) => {
        if (id === 'task-7') {
          return Promise.resolve({
            id,
            global: false,
            customers: { contains: jest.fn().mockReturnValue(false) },
          });
        }
        return Promise.resolve({
          id,
          global: true,
          customers: { contains: jest.fn().mockReturnValue(true) },
        });
      });
      mockTaskOrderRepository.findOne.mockResolvedValue(undefined);
      mockTaskOrderRepository.create.mockReturnValue({});

      await request(app.getHttpServer())
        .post(`/tasks/bundle/${bundleId}/tasks`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ taskIds })
        .expect(400);
    });

    it('should fail if the bundle is not found', async () => {
      const bundleId = 'bundle-404';
      const taskIds = ['task-4', 'task-5'];
      mockTaskBundleRepository.findOneOrFail.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .post(`/tasks/bundle/${bundleId}/tasks`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ taskIds })
        .expect(404);
    });

    it('should fail if a task is not found', async () => {
      const bundleId = 'bundle-3';
      const taskIds = ['task-4', 'task-404'];
      const mockBundle = {
        id: bundleId,
        customers: {
          getItems: jest.fn().mockReturnValue([]),
          contains: jest.fn().mockReturnValue(true),
        },
        taskList: { getItems: jest.fn().mockReturnValue([]), remove: jest.fn() },
      };
      mockTaskBundleRepository.findOneOrFail.mockResolvedValue(mockBundle);
      mockTaskRepository.findOneOrFail.mockImplementation((id: string) => {
        if (id === 'task-404') {
          return Promise.reject(new NotFoundException());
        }
        return Promise.resolve({
          id,
          global: true,
          customers: { contains: jest.fn().mockReturnValue(true) },
        });
      });
      await request(app.getHttpServer())
        .post(`/tasks/bundle/${bundleId}/tasks`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ taskIds })
        .expect(404);
    });

    it('should reorder, remove, and insert tasks correctly', async () => {
      const bundleId = 'bundle-3';
      // Existing tasks in bundle: task-1, task-2, task-3
      const currentTasks = [
        { id: 'task-1', global: true, customers: { contains: jest.fn().mockReturnValue(true) } },
        { id: 'task-2', global: true, customers: { contains: jest.fn().mockReturnValue(true) } },
        { id: 'task-3', global: true, customers: { contains: jest.fn().mockReturnValue(true) } },
      ];
      // New desired order: task-2 (reordered), task-4 (inserted), task-3 (kept, reordered), task-1 (removed)
      const newTaskIds = ['task-2', 'task-4', 'task-3'];
      const mockBundle = {
        id: bundleId,
        customers: { getItems: jest.fn().mockReturnValue([]) },
        taskList: {
          getItems: jest.fn().mockReturnValue(currentTasks),
          remove: jest.fn(),
        },
      };
      mockTaskBundleRepository.findOneOrFail.mockResolvedValue(mockBundle);
      // task-2 and task-3 are already in bundle, task-4 is new
      mockTaskRepository.findOneOrFail.mockImplementation((id: string) => {
        if (id === 'task-4') {
          return Promise.resolve({
            id,
            global: true,
            customers: { contains: jest.fn().mockReturnValue(true) },
          });
        }
        // Return the existing task object for task-2 and task-3
        return currentTasks.find(t => t.id === id);
      });
      mockTaskOrderRepository.findOne.mockResolvedValue(undefined);
      mockTaskOrderRepository.create.mockReturnValue({});

      await request(app.getHttpServer())
        .post(`/tasks/bundle/${bundleId}/tasks`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ taskIds: newTaskIds })
        .expect(201);
      //.expect(res => {
      //  expect(res.body.taskList).toEqual(newTaskIds);
      //});

      // Check that remove was called for task-1
      expect(mockBundle.taskList.remove).toHaveBeenCalledWith([
        currentTasks[0], // task-1 should be removed
      ]);
      // Check that findOneOrFail was called for the new task
      expect(mockTaskRepository.findOneOrFail).toHaveBeenCalledWith('task-4', {
        populate: ['customers'],
      });
    });
  });
});
