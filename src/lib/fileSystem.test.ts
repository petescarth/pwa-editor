import { describe, it, expect, vi } from 'vitest';
import {
  verifyFileHandlePermission,
  checkHandleReadPermission,
  checkHandleWritePermission,
} from './fileSystem';

describe('fileSystem permissions', () => {
  it('returns true if queryPermission already granted', async () => {
    const handle = {
      queryPermission: vi.fn().mockResolvedValue('granted'),
      requestPermission: vi.fn(),
    } as unknown as FileSystemFileHandle;

    const result = await verifyFileHandlePermission(handle, false);
    expect(result).toBe(true);
    expect(handle.queryPermission).toHaveBeenCalledWith({ mode: 'read' });
    expect(handle.requestPermission).not.toHaveBeenCalled();
  });

  it('returns false immediately if queryPermission returns denied without calling requestPermission', async () => {
    const handle = {
      queryPermission: vi.fn().mockResolvedValue('denied'),
      requestPermission: vi.fn(),
    } as unknown as FileSystemFileHandle;

    const result = await verifyFileHandlePermission(handle, true);
    expect(result).toBe(false);
    expect(handle.queryPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
    expect(handle.requestPermission).not.toHaveBeenCalled();
  });

  it('calls requestPermission if queryPermission returns prompt', async () => {
    const handle = {
      queryPermission: vi.fn().mockResolvedValue('prompt'),
      requestPermission: vi.fn().mockResolvedValue('granted'),
    } as unknown as FileSystemFileHandle;

    const result = await verifyFileHandlePermission(handle, true);
    expect(result).toBe(true);
    expect(handle.requestPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
  });

  it('checkHandleReadPermission only queries read mode', async () => {
    const handle = {
      queryPermission: vi.fn().mockResolvedValue('granted'),
    } as unknown as FileSystemFileHandle;

    const result = await checkHandleReadPermission(handle);
    expect(result).toBe(true);
    expect(handle.queryPermission).toHaveBeenCalledWith({ mode: 'read' });
  });

  it('checkHandleWritePermission queries readwrite mode', async () => {
    const handle = {
      queryPermission: vi.fn().mockResolvedValue('granted'),
    } as unknown as FileSystemFileHandle;

    const result = await checkHandleWritePermission(handle);
    expect(result).toBe(true);
    expect(handle.queryPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
  });
});
