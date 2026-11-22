import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePegawaiRequest,
  PegawaiResponse,
  UpdatePegawaiRequest,
} from '../models/pegawai.model';

@Service()
export class PegawaiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/pegawai';

  public list(): Observable<PegawaiResponse[]> {
    return this.http.get<PegawaiResponse[]>(this.baseUrl);
  }

  public getById(uuid: string): Observable<PegawaiResponse> {
    return this.http.get<PegawaiResponse>(`${this.baseUrl}/${uuid}`);
  }

  public create(data: CreatePegawaiRequest): Observable<PegawaiResponse> {
    return this.http.post<PegawaiResponse>(this.baseUrl, data);
  }

  public update(uuid: string, data: UpdatePegawaiRequest): Observable<PegawaiResponse> {
    return this.http.put<PegawaiResponse>(`${this.baseUrl}/${uuid}`, data);
  }

  public delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${uuid}`);
  }
}
