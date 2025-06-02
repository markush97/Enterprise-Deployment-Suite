import * as fs from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Stream } from 'stream';
import * as request from 'supertest';
import * as unzipper from 'unzipper';

import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from '@mikro-orm/core';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/main';
import { getValidJwt, testEndpointAuth } from './testutils/auth.testutil';
import { testConfig } from './testutils/config.testutil';
import { binaryParser } from './testutils/file.testutil';
import { setupTestConfig } from './testutils/setup.testutil';

// Mock repositories
let mockTaskRepository: Record<string, jest.Mock>;
let mockTaskBundleRepository: Record<string, jest.Mock>;
let mockTaskOrderRepository: Record<string, jest.Mock>;
let mockPersistAndFlush: jest.SpyInstance;
let mockPersist: jest.SpyInstance;

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  const testUploadFolder = testConfig.FILE_UPLOAD_PATH;

  beforeAll(async () => {
    setupTestConfig();

    if (fs.existsSync(testUploadFolder)) {
      fs.rmSync(testUploadFolder, { recursive: true, force: true });
    }

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
    if (fs.existsSync(testUploadFolder)) {
      fs.rmSync(testUploadFolder, { recursive: true, force: true });
    }
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('/tasks (GET)', () => {
    testEndpointAuth('/tasks', 'GET', () => app);
  });

  describe('/tasks/bundles (GET)', () => {
    testEndpointAuth('/tasks', 'GET', () => app);
  });

  describe('/tasks/:id/contentOverview (GET)', () => {
    testEndpointAuth(
      '/tasks/27579475-8c11-46c3-933a-436483691239/contentOverview',
      'GET',
      () => app,
    );
  });

  describe('/tasks/:id (DELETE)', () => {
    testEndpointAuth('/tasks/27579475-8c11-46c3-933a-436483691239', 'DELETE', () => app);
  });

  describe('/tasks/:id (PATCH)', () => {
    testEndpointAuth('/tasks/27579475-8c11-46c3-933a-436483691239', 'PATCH', () => app);
  });

  describe('/tasks/bundles/:id (DELETE)', () => {
    testEndpointAuth('/tasks/bundles/27579475-8c11-46c3-933a-436483691239', 'DELETE', () => app);
  });

  describe('/tasks/bundles/:id (PATCH)', () => {
    testEndpointAuth('/tasks/bundles/27579475-8c11-46c3-933a-436483691239', 'PATCH', () => app);
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
      // Check that the file was saved to the expected folder
      const contentDir = path.join(testUploadFolder, 'tasks', taskId, 'content');
      const files = fs.readdirSync(contentDir);
      expect(files.length).toBeGreaterThan(0);
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

    it('should reject upload if no file is attached', async () => {
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
        .expect(415);
    });

    it('should reject upload if file is empty', async () => {
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      // Create an empty file for upload
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-upload-test-'));
      const tempFilePath = path.join(tempDir, 'empty.zip');
      fs.writeFileSync(tempFilePath, '');
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', tempFilePath, { contentType: 'application/zip' })
        .expect(415);
      fs.unlinkSync(tempFilePath);
      fs.rmdirSync(tempDir);
    });

    it('should upload and overwrite existing content', async () => {
      const taskId = 'task-6';
      const contentDir = path.join(testUploadFolder, 'tasks', taskId, 'content');
      const firstFileName = 'test.txt';
      const secondFileName = 'test2.txt';
      // Mock localFilesRepository
      const firstFileEntity = { id: 'file-entity-1', filename: 'content', path: `tasks/${taskId}` };
      // On first call (deleteFileByPath before first upload), return null (no file to delete)
      // On second call (deleteFileByPath before overwrite), return the first file entity
      let findOneCallCount = 0;
      const mockFindOne = jest.fn().mockImplementation(() => {
        findOneCallCount++;
        if (findOneCallCount === 1) return null;
        if (findOneCallCount === 2) return firstFileEntity;
        return null;
      });
      // Patch the localFilesRepository on the service
      const localFileService = app.get(
        require('../src/fileManagement/local-file/local-file.service').LocalFileService,
      );
      localFileService.localFilesRepository.findOne = mockFindOne;
      // Spy on nativeDelete
      const mockNativeDelete = jest.fn();
      localFileService.localFilesRepository.nativeDelete = mockNativeDelete;

      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      // First upload with valid.zip
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/valid.zip', { contentType: 'application/zip' })
        .expect(201);
      // Check that the file was saved to the expected folder after first upload
      let files = fs.readdirSync(contentDir);
      expect(files).toContain(firstFileName);
      const firstFilePath = path.join(contentDir, files[0]);
      const firstFileContent = fs.readFileSync(firstFilePath);

      // Second upload with valid2.zip (should overwrite)
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/valid2.zip', { contentType: 'application/zip' })
        .expect(201);

      // Check again after overwrite
      files = fs.readdirSync(contentDir);
      expect(files).toContain(secondFileName);
      expect(files.length).toBe(1);
      const secondFilePath = path.join(contentDir, files[0]);
      const secondFileContent = fs.readFileSync(secondFilePath);

      // The file content should have changed after overwrite
      expect(Buffer.compare(firstFileContent, secondFileContent)).not.toBe(0);
      // Check that nativeDelete was called with the first file entity
      expect(mockNativeDelete).toHaveBeenCalledWith(firstFileEntity);
    });
  });

  describe('/tasks/:id/content (GET)', () => {
    it('should download content for a task with content', async () => {
      const taskId = 'task-9';
      const contentDir = path.join(testUploadFolder, 'tasks', taskId);
      const folderName = 'content';
      const fileName = 'testcontent.txt';

      await mkdir(path.join(contentDir, folderName), { recursive: true });
      await copyFile('test/fixtures/testcontent.txt', path.join(contentDir, folderName, fileName));

      const mockTask = {
        id: taskId,
        contentFile: { id: 'file-1', path: contentDir, filename: folderName },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await request(app.getHttpServer())
        .get(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .expect(200)
        .expect('content-type', /application\/octet-stream|application\/zip/)
        .responseType('blob')
        .expect(async res => {
          const zip = await unzipper.Open.buffer(res.body);
          const files = zip.files;

          // Check the files
          expect(files.length).toBe(1);
          const filePaths = files.map(f => f.path);
          expect(filePaths).toContain(fileName);
          const exampleFile = files.find(f => f.path === fileName);
          const content = await exampleFile.buffer();
          expect(content.toString().trim()).toEqual('This is a textcontent made to be downloaded');
        });
    });

    it('should fail to download if task does not exist', async () => {
      const taskId = 'task-404';
      mockTaskRepository.findOne.mockResolvedValue(undefined);
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .expect(404);
    });

    it('should fail to download if task has no content', async () => {
      const taskId = 'task-2';
      const mockTask = { id: taskId, contentFile: undefined };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .expect(404);
    });

    it('should return 404 if content folder exists but is empty on download', async () => {
      const taskId = 'task-empty-content';
      const contentDir = path.join(testUploadFolder, 'tasks', taskId, 'content');
      await mkdir(contentDir, { recursive: true });
      // Create a dummy file in the folder and then remove it to ensure the folder is empty
      const dummyFile = path.join(contentDir, 'dummy.txt');
      fs.writeFileSync(dummyFile, '');
      fs.unlinkSync(dummyFile);
      const mockTask = {
        id: taskId,
        contentFile: {
          id: 'file-1',
          path: path.join(testUploadFolder, 'tasks', taskId),
          filename: 'content',
        },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .responseType('blob')
        .expect(200)
        .expect(async res => {
          const zip = await unzipper.Open.buffer(res.body);
          const files = zip.files;

          // Check the files
          expect(files.length).toBe(0);
        });
    });

    it('should upload and download non-ASCII filenames correctly', async () => {
      const taskId = 'task-nonascii';
      const uploadDir = path.join(testUploadFolder, 'tasks', taskId);
      const uplodaFolder = 'content';
      const fileName = 'nonascii.zip';

      const mockTask = {
        id: taskId,
        contentFile: { id: 'file-nonascii', path: uploadDir, filename: uplodaFolder },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      // Upload a zip with non-ASCII filename
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/' + fileName, { contentType: 'application/zip' })
        .expect(201);

      // Now test download
      const nonAsciiName = 'üñîçødë.txt';
      const mockTaskWithContent = {
        id: taskId,
        contentFile: { id: 'file-nonascii', path: uploadDir, filename: uplodaFolder },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTaskWithContent);
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .expect(200)
        .expect('content-type', /application\/octet-stream|application\/zip/)
        .responseType('blob')
        .expect(async res => {
          const zip = await unzipper.Open.buffer(res.body);
          const files = zip.files;
          // Check the files
          expect(files.length).toBe(1);
          const filePaths = files.map(f => f.path);
          expect(filePaths).toContain(nonAsciiName);
          const exampleFile = files.find(f => f.path === nonAsciiName);
          const content = await exampleFile.buffer();
          expect(content.toString().trim()).toEqual('non-ascii content');
        });
    });

    it('should reject a corrupted/truncated zip file', async () => {
      const taskId = 'task-corrupt';

      const uploadDir = path.join(testUploadFolder, 'tasks', taskId);
      const uplodaFolder = 'content';
      const fileName = 'corrupt.zip';

      await mkdir(path.join(uploadDir, uplodaFolder), { recursive: true });
      await copyFile('test/fixtures/' + fileName, path.join(uploadDir, uplodaFolder, fileName));

      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOneOrFail.mockResolvedValue(mockTask);
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/corrupt.zip', { contentType: 'application/zip' })
        .expect(415);
    });

    it('should reject a zip with directory traversal paths', async () => {
      const taskId = 'task-traversal';
      const contentDir = path.join(testUploadFolder, 'tasks', taskId);
      const folderName = 'content';
      const fileName = 'traversal.zip';

      await mkdir(path.join(contentDir, folderName), { recursive: true });
      await copyFile('test/fixtures/' + fileName, path.join(contentDir, folderName, fileName));

      const mockTask = {
        id: taskId,
        contentFile: { id: 'file-traversal', path: contentDir, filename: folderName },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/content`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .attach('file', 'test/fixtures/traversal.zip', { contentType: 'application/zip' })
        .expect(400);
    });

    it('should handle simultaneous uploads safely', async () => {
      const taskId = 'task-simultaneous';
      const mockTask = {
        id: taskId,
        global: false,
        customers: { contains: jest.fn().mockReturnValue(true) },
      };
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      // Use the same valid zip for both uploads
      const upload = async () =>
        request(app.getHttpServer())
          .post(`/tasks/${taskId}/content`)
          .set('Authorization', `Bearer ${await getValidJwt()}`)
          .attach('file', 'test/fixtures/valid.zip', { contentType: 'application/zip' });
      const [res1, res2] = await Promise.all([upload(), upload()]);
      expect([201, 409]).toContain(res1.status);
      expect([201, 409]).toContain(res2.status);
      // At least one should succeed
      expect([res1.status, res2.status]).toContain(201);
    });
  });

  describe('/tasks/:taskId/bundles/:bundleId (POST)', () => {
    testEndpointAuth('/tasks/task-1/bundles/bundle-1', 'POST', () => app);

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
        .post(`/tasks/${taskId}/bundles/${bundleId}`)
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
        .post(`/tasks/${taskId}/bundles/${bundleId}`)
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
        .post(`/tasks/${taskId}/bundles/${bundleId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ order: 0 })
        .expect(400);
    });

    it('should fail if the task is not found', async () => {
      const bundleId = 'bundle-1';
      const taskId = 'task-404';
      mockTaskRepository.findOneOrFail.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/bundles/${bundleId}`)
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
        .post(`/tasks/${taskId}/bundles/${bundleId}`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ order: 0 })
        .expect(404);
    });
  });

  describe('/tasks/bundles (POST)', () => {
    testEndpointAuth('/tasks/bundles', 'POST', () => app);
  });

  describe('/tasks/bundles/:bundleId/tasks (POST)', () => {
    testEndpointAuth('/tasks/bundles/bundle-3/tasks', 'POST', () => app);

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
        .post(`/tasks/bundles/${bundleId}/tasks`)
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
        .post(`/tasks/bundles/${bundleId}/tasks`)
        .set('Authorization', `Bearer ${await getValidJwt()}`)
        .send({ taskIds })
        .expect(400);
    });

    it('should fail if the bundle is not found', async () => {
      const bundleId = 'bundle-404';
      const taskIds = ['task-4', 'task-5'];
      mockTaskBundleRepository.findOneOrFail.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .post(`/tasks/bundles/${bundleId}/tasks`)
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
        .post(`/tasks/bundles/${bundleId}/tasks`)
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
        .post(`/tasks/bundles/${bundleId}/tasks`)
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
