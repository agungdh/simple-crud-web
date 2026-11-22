import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PangkatGolonganRequest, PangkatGolonganResponse } from '../models/pangkat-golongan.model';

@Service()
export class PangkatGolonganService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/pangkat-golongan';

  public list(): Observable<PangkatGolonganResponse[]> {
    return this.http.get<PangkatGolonganResponse[]>(this.baseUrl);
  }

  public getById(uuid: string): Observable<PangkatGolonganResponse> {
    return this.http.get<PangkatGolonganResponse>(`${this.baseUrl}/${uuid}`);
  }

  public create(data: PangkatGolonganRequest): Observable<PangkatGolonganResponse> {
    return this.http.post<PangkatGolonganResponse>(this.baseUrl, data);
  }

  public update(uuid: string, data: PangkatGolonganRequest): Observable<PangkatGolonganResponse> {
    return this.http.put<PangkatGolonganResponse>(`${this.baseUrl}/${uuid}`, data);
  }

  public delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${uuid}`);
  }
}
