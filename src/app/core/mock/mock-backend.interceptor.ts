import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { mockDb } from './mock-db';
import { ValidationErrorResponse, ErrorResponse } from '../models/api-error.model';

function errorResponse(status: number, message: string): Observable<never> {
  const body: ErrorResponse = { message };
  return throwError(() => ({
    status,
    statusText: status === 404 ? 'Not Found' : status === 401 ? 'Unauthorized' : 'Bad Request',
    error: body,
  }));
}

function validationErrorResponse(errors: Array<{ field: string; messages: string[] }>): Observable<never> {
  const body: ValidationErrorResponse = {
    message: 'Data yang diberikan tidak valid',
    errors,
  };
  return throwError(() => ({
    status: 422,
    statusText: 'Unprocessable Entity',
    error: body,
  }));
}

function jsonResponse<T>(data: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse<T>({ status, body: data })).pipe(delay(60));
}

function emptyResponse(status = 204): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse<unknown>({ status, body: null })).pipe(delay(60));
}

export function mockBackendInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const url = req.url;

  // Only intercept requests directed to /api
  if (!url.startsWith('/api') && !url.includes('/api/')) {
    return next(req);
  }

  const cleanUrl = url.replace(/^https?:\/\/[^/]+/, '');
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/, '').trim();

  // 1. Auth: POST /api/login
  if (req.method === 'POST' && cleanUrl === '/api/login') {
    const body = req.body as { username?: string; password?: string };
    if (!body?.username || !body?.password) {
      return validationErrorResponse([
        ...(!body?.username ? [{ field: 'username', messages: ['Username wajib diisi'] }] : []),
        ...(!body?.password ? [{ field: 'password', messages: ['Password wajib diisi'] }] : []),
      ]);
    }
    const result = mockDb.login(body.username, body.password);
    if (!result) {
      return errorResponse(401, 'Username atau password salah');
    }
    return jsonResponse({ token: result.token });
  }

  // 2. Auth: POST /api/logout
  if (req.method === 'POST' && cleanUrl === '/api/logout') {
    if (token) {
      mockDb.logout(token);
    }
    return emptyResponse(204);
  }

  // 3. Auth: GET /api/me
  if (req.method === 'GET' && cleanUrl === '/api/me') {
    if (!token) {
      return errorResponse(401, 'Token autentikasi tidak disertakan');
    }
    const user = mockDb.getUserByToken(token);
    if (!user) {
      return errorResponse(401, 'Sesi telah kedaluwarsa atau tidak valid');
    }
    const pegawai = mockDb.getPegawaiByUserId(user.uuid);
    if (!pegawai) {
      return errorResponse(404, 'Profil pegawai tidak ditemukan');
    }
    return jsonResponse(pegawai);
  }

  // Check auth for protected resources
  // (In local development/mock, if no token, return 401)
  if (!token && !cleanUrl.includes('/login')) {
    return errorResponse(401, 'Unauthorized: Diperlukan token autentikasi');
  }

  // 4. Bidang Endpoints
  // GET /api/bidang
  if (req.method === 'GET' && cleanUrl === '/api/bidang') {
    return jsonResponse(mockDb.listBidang());
  }

  // POST /api/bidang
  if (req.method === 'POST' && cleanUrl === '/api/bidang') {
    const body = req.body as { bidang?: string };
    if (!body?.bidang || body.bidang.trim().length === 0) {
      return validationErrorResponse([{ field: 'bidang', messages: ['Bidang wajib diisi'] }]);
    }
    const created = mockDb.createBidang({ bidang: body.bidang });
    return jsonResponse(created, 201);
  }

  // Match /api/bidang/:uuid
  const bidangMatch = cleanUrl.match(/^\/api\/bidang\/([^/]+)$/);
  if (bidangMatch) {
    const uuid = bidangMatch[1];
    if (req.method === 'GET') {
      const item = mockDb.getBidang(uuid);
      return item ? jsonResponse(item) : errorResponse(404, 'Data bidang tidak ditemukan');
    }
    if (req.method === 'PUT') {
      const body = req.body as { bidang?: string };
      if (!body?.bidang || body.bidang.trim().length === 0) {
        return validationErrorResponse([{ field: 'bidang', messages: ['Bidang wajib diisi'] }]);
      }
      const updated = mockDb.updateBidang(uuid, { bidang: body.bidang });
      return updated ? jsonResponse(updated) : errorResponse(404, 'Data bidang tidak ditemukan');
    }
    if (req.method === 'DELETE') {
      const deleted = mockDb.deleteBidang(uuid);
      return deleted ? emptyResponse(204) : errorResponse(404, 'Data bidang tidak ditemukan');
    }
  }

  // 5. Pangkat Golongan Endpoints
  // GET /api/pangkat-golongan
  if (req.method === 'GET' && cleanUrl === '/api/pangkat-golongan') {
    return jsonResponse(mockDb.listPangkatGolongan());
  }

  // POST /api/pangkat-golongan
  if (req.method === 'POST' && cleanUrl === '/api/pangkat-golongan') {
    const body = req.body as { jenjang?: string; pangkat?: string; golongan?: string; ruang?: string };
    const errs: Array<{ field: string; messages: string[] }> = [];
    if (!body?.jenjang) errs.push({ field: 'jenjang', messages: ['Jenjang wajib diisi'] });
    if (!body?.pangkat) errs.push({ field: 'pangkat', messages: ['Pangkat wajib diisi'] });
    if (!body?.golongan) errs.push({ field: 'golongan', messages: ['Golongan wajib diisi'] });
    if (!body?.ruang) errs.push({ field: 'ruang', messages: ['Ruang wajib diisi'] });
    if (errs.length > 0) return validationErrorResponse(errs);

    const created = mockDb.createPangkatGolongan({
      jenjang: body.jenjang!,
      pangkat: body.pangkat!,
      golongan: body.golongan!,
      ruang: body.ruang!,
    });
    return jsonResponse(created, 201);
  }

  // Match /api/pangkat-golongan/:uuid
  const pangkatMatch = cleanUrl.match(/^\/api\/pangkat-golongan\/([^/]+)$/);
  if (pangkatMatch) {
    const uuid = pangkatMatch[1];
    if (req.method === 'GET') {
      const item = mockDb.getPangkatGolongan(uuid);
      return item ? jsonResponse(item) : errorResponse(404, 'Data pangkat golongan tidak ditemukan');
    }
    if (req.method === 'PUT') {
      const body = req.body as { jenjang?: string; pangkat?: string; golongan?: string; ruang?: string };
      const errs: Array<{ field: string; messages: string[] }> = [];
      if (!body?.jenjang) errs.push({ field: 'jenjang', messages: ['Jenjang wajib diisi'] });
      if (!body?.pangkat) errs.push({ field: 'pangkat', messages: ['Pangkat wajib diisi'] });
      if (!body?.golongan) errs.push({ field: 'golongan', messages: ['Golongan wajib diisi'] });
      if (!body?.ruang) errs.push({ field: 'ruang', messages: ['Ruang wajib diisi'] });
      if (errs.length > 0) return validationErrorResponse(errs);

      const updated = mockDb.updatePangkatGolongan(uuid, {
        jenjang: body.jenjang!,
        pangkat: body.pangkat!,
        golongan: body.golongan!,
        ruang: body.ruang!,
      });
      return updated ? jsonResponse(updated) : errorResponse(404, 'Data pangkat golongan tidak ditemukan');
    }
    if (req.method === 'DELETE') {
      const deleted = mockDb.deletePangkatGolongan(uuid);
      return deleted ? emptyResponse(204) : errorResponse(404, 'Data pangkat golongan tidak ditemukan');
    }
  }

  // 6. Pegawai Endpoints
  // GET /api/pegawai
  if (req.method === 'GET' && cleanUrl === '/api/pegawai') {
    return jsonResponse(mockDb.listPegawai());
  }

  // POST /api/pegawai
  if (req.method === 'POST' && cleanUrl === '/api/pegawai') {
    const body = req.body as Record<string, unknown>;
    const errs: Array<{ field: string; messages: string[] }> = [];

    if (!body?.['username']) errs.push({ field: 'username', messages: ['Username wajib diisi'] });
    if (!body?.['password']) {
      errs.push({ field: 'password', messages: ['Password wajib diisi'] });
    } else if (typeof body['password'] === 'string' && body['password'].length < 8) {
      errs.push({ field: 'password', messages: ['Password minimal 8 karakter'] });
    }
    if (!body?.['bidangUuid']) errs.push({ field: 'bidangUuid', messages: ['Bidang wajib diisi'] });
    if (!body?.['tipe']) errs.push({ field: 'tipe', messages: ['Tipe wajib diisi'] });
    if (!body?.['status']) errs.push({ field: 'status', messages: ['Status wajib diisi'] });
    if (!body?.['nip']) errs.push({ field: 'nip', messages: ['NIP wajib diisi'] });
    if (!body?.['nama']) errs.push({ field: 'nama', messages: ['Nama wajib diisi'] });

    if (errs.length > 0) return validationErrorResponse(errs);

    const created = mockDb.createPegawai(body as unknown as Parameters<typeof mockDb.createPegawai>[0]);
    return jsonResponse(created, 201);
  }

  // Match /api/pegawai/:uuid
  const pegawaiMatch = cleanUrl.match(/^\/api\/pegawai\/([^/]+)$/);
  if (pegawaiMatch) {
    const uuid = pegawaiMatch[1];
    if (req.method === 'GET') {
      const item = mockDb.getPegawai(uuid);
      return item ? jsonResponse(item) : errorResponse(404, 'Data pegawai tidak ditemukan');
    }
    if (req.method === 'PUT') {
      const body = req.body as Record<string, unknown>;
      const errs: Array<{ field: string; messages: string[] }> = [];

      if (!body?.['username']) errs.push({ field: 'username', messages: ['Username wajib diisi'] });
      if (body?.['password'] && typeof body['password'] === 'string' && body['password'].length < 8) {
        errs.push({ field: 'password', messages: ['Password minimal 8 karakter bila diubah'] });
      }
      if (!body?.['bidangUuid']) errs.push({ field: 'bidangUuid', messages: ['Bidang wajib diisi'] });
      if (!body?.['tipe']) errs.push({ field: 'tipe', messages: ['Tipe wajib diisi'] });
      if (!body?.['status']) errs.push({ field: 'status', messages: ['Status wajib diisi'] });
      if (!body?.['nip']) errs.push({ field: 'nip', messages: ['NIP wajib diisi'] });
      if (!body?.['nama']) errs.push({ field: 'nama', messages: ['Nama wajib diisi'] });

      if (errs.length > 0) return validationErrorResponse(errs);

      const updated = mockDb.updatePegawai(uuid, body as unknown as Parameters<typeof mockDb.updatePegawai>[1]);
      return updated ? jsonResponse(updated) : errorResponse(404, 'Data pegawai tidak ditemukan');
    }
    if (req.method === 'DELETE') {
      const deleted = mockDb.deletePegawai(uuid);
      return deleted ? emptyResponse(204) : errorResponse(404, 'Data pegawai tidak ditemukan');
    }
  }

  return next(req);
}
