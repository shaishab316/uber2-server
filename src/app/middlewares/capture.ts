import type { Express, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import ServerError from '../../errors/ServerError';
import catchAsync from './catchAsync';
import { errorLogger, logger } from '../../utils/logger';
import chalk from 'chalk';
import { json } from '../../utils/transform/json';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export const fileValidators = {
  images: {
    validator: /^image\//,
  },
  videos: {
    validator: /^video\//,
  },
  audios: {
    validator: /^audio\//,
  },
  documents: {
    validator: /(pdf|word|excel|text)/,
  },
  any: {
    validator: /.*/,
  },
} as const;

export const fileTypes = Object.keys(
  fileValidators,
) as (keyof typeof fileValidators)[];

interface UploadFields {
  [field: string]: {
    default?: string | string[] | null;
    maxCount?: number;
    size?: number;
    fileType: (typeof fileTypes)[number];
  };
}

// Base upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directories exist (async)
const ensureUploadDirs = async (): Promise<void> => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    await Promise.all(
      fileTypes.map(type =>
        fs.mkdir(path.join(UPLOAD_DIR, type), { recursive: true }),
      ),
    );
  } catch (error) {
    errorLogger.error('Failed to create upload directories:', error);
    throw error;
  }
};

// Initialize directories on module load
ensureUploadDirs().catch(err =>
  errorLogger.error('Upload directory initialization failed:', err),
);

/**
 * Universal file uploader middleware
 */
const capture = (fields: UploadFields) =>
  catchAsync(async (req, res, next) => {
    req.tempFiles ??= [];

    try {
      await new Promise<void>((resolve, reject) =>
        upload(fields)(req, res, (err: any) => (err ? reject(err) : resolve())),
      );

      const files = req.files as { [field: string]: Express.Multer.File[] };

      for (const field of Object.keys(fields)) {
        const fieldFiles = files?.[field];

        if (fieldFiles?.length) {
          const uploadedFiles = fieldFiles.map(
            file => `/${fields[field].fileType}/${file.filename}`,
          );

          req.body[field] =
            (fields[field]?.maxCount || 1) > 1
              ? uploadedFiles
              : uploadedFiles[0];

          req.tempFiles.push(...uploadedFiles);
        } else {
          req.body[field] = fields[field].default ?? null;
        }
      }
    } catch (error) {
      errorLogger.error('File upload error:', error);

      // Set defaults on error
      for (const field of Object.keys(fields)) {
        req.body[field] = fields[field].default ?? null;
      }
    } finally {
      // Parse JSON data if exists
      if (req.body?.data) {
        try {
          Object.assign(req.body, json(req.body.data));
          delete req.body.data;
        } catch (err) {
          errorLogger.error('Failed to parse form data:', err);
        }
      }

      next();
    }
  });

export default capture;

/**
 * Delete file from local disk (optimized with async)
 */
export const deleteFile = async (filename: string): Promise<boolean> => {
  const sanitizedFilename = path.basename(filename);

  try {
    logger.info(chalk.yellow(`🗑️ Deleting file: '${sanitizedFilename}'`));

    // Use Promise.all to check all directories concurrently
    const deletePromises = fileTypes.map(async fileType => {
      const filePath = path.join(UPLOAD_DIR, fileType, sanitizedFilename);

      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        return fileType;
      }
      return null;
    });

    const results = await Promise.all(deletePromises);
    const deletedFrom = results.filter(Boolean);

    if (deletedFrom.length > 0) {
      logger.info(
        chalk.green(
          `✔ File '${sanitizedFilename}' deleted from ${deletedFrom.join(', ')}`,
        ),
      );
      return true;
    }

    errorLogger.error(chalk.red(`❌ File '${sanitizedFilename}' not found!`));
    return false;
  } catch (error: any) {
    errorLogger.error(
      chalk.red(`❌ Failed to delete '${sanitizedFilename}'`),
      error?.stack ?? error,
    );
    return false;
  }
};

/**
 * Delete multiple files concurrently
 *
 * @deprecated use {@link deleteFilesQueue}
 */
export const deleteFiles = async (filenames: string[]): Promise<boolean[]> => {
  return Promise.all(filenames.map(deleteFile));
};

/**
 * Optimized disk storage configuration
 */
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType =
      (req as any).uploadFields?.[file.fieldname]?.fileType || 'any';
    const dir = path.join(UPLOAD_DIR, fileType);

    cb(null, dir);
  },
  filename: (_, file, cb) => {
    // More efficient sanitization
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path
      .basename(file.originalname, ext)
      .replace(/[^\w]+/g, '-')
      .toLowerCase()
      .substring(0, 100); // Limit length

    const filename = `${basename}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter with better error messages
 */
const fileFilter =
  (fields: UploadFields) =>
  (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fieldConfig = fields[file.fieldname];

    if (!fieldConfig) {
      return cb(
        new ServerError(
          StatusCodes.BAD_REQUEST,
          `Unexpected field: ${file.fieldname}`,
        ),
      );
    }

    const { fileType } = fieldConfig;
    const validator = fileValidators[fileType]?.validator;

    if (!validator) {
      return cb(
        new ServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `Invalid file type configuration: ${fileType}`,
        ),
      );
    }

    const mime = file.mimetype.toLowerCase();

    if (mime === 'application/octet-stream' || validator.test(mime)) {
      return cb(null, true);
    }

    cb(
      new ServerError(
        StatusCodes.BAD_REQUEST,
        `File '${file.originalname}' is not a valid ${fileType} (got ${mime})`,
      ),
    );
  };

/**
 * Create multer upload middleware
 */
const upload = (fields: UploadFields) => {
  // Calculate max file size from all fields
  const maxFileSize = Math.max(
    ...Object.values(fields).map(f => (f.size || 5) * 1024 * 1024),
  );

  const multerInstance = multer({
    storage,
    fileFilter: fileFilter(fields),
    limits: {
      fileSize: maxFileSize,
      files: Object.values(fields).reduce(
        (sum, f) => sum + (f.maxCount || 1),
        0,
      ),
    },
  }).fields(
    Object.entries(fields).map(([name, config]) => ({
      name,
      maxCount: config.maxCount || 1,
    })),
  );

  // Wrapper to inject fields metadata
  return (req: any, res: any, next: any) => {
    req.uploadFields = fields;
    return multerInstance(req, res, next);
  };
};

/**
 * Helper to get file path
 */
export const getFilePath = (fileUrl: string): string | null => {
  try {
    const [, fileType, filename] = fileUrl.split('/');
    if (!fileType || !filename) return null;

    const filePath = path.join(UPLOAD_DIR, fileType, filename);
    return existsSync(filePath) ? filePath : null;
  } catch {
    return null;
  }
};

/**
 * Check if file exists
 */
export const fileExists = async (fileUrl: string): Promise<boolean> => {
  const filePath = getFilePath(fileUrl);
  if (!filePath) return false;

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
