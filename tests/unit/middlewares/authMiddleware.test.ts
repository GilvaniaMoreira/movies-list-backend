import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../../src/middlewares/authMiddleware';
import * as jwtUtils from '../../../src/utils/jwt';
import prisma from '../../../src/config/prisma';

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  // Mock jwtUtils.verifyToken
  const mockVerifyToken = vi.spyOn(jwtUtils, 'verifyToken');

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next() if a valid token is provided', async () => {
    const token = 'valid.token.here';
    const decodedPayload = { id: 1, email: 'test@example.com' };

    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockVerifyToken.mockReturnValue(decodedPayload);

    await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockVerifyToken).toHaveBeenCalledWith(token);
    expect(mockRequest.user).toEqual({ id: decodedPayload.id, email: decodedPayload.email });
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', async () => {
    mockRequest.headers = {};

    await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header is malformed (no Bearer)', async () => {
    mockRequest.headers = { authorization: 'malformed-token' };

    await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it('should return 401 if Bearer token is missing', async () => {
    mockRequest.headers = { authorization: 'Bearer' };

    await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', async () => {
    const token = 'invalid.token.here';
    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockVerifyToken).toHaveBeenCalledWith(token);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if token is expired', async () => {
    const token = 'expired.token.here';
    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Token expired');
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockVerifyToken).toHaveBeenCalledWith(token);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle authorization header with extra spaces', async () => {
    const token = 'valid.jwt.token';
    const decodedPayload = { id: 1, email: 'test@example.com' };

    mockRequest.headers = {
      authorization: `  Bearer   ${token}  `,
    };

    // Com espaços extras, o split vai resultar em ['', '', 'Bearer', '', '', 'valid.jwt.token', '', '']
    // Então split(' ')[1] será '', não o token, causando erro 401
    await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });
});