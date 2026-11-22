import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BidangRequest, BidangResponse } from '../models/bidang.model';

@Service()
export class BidangService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/bidang';

  public list(): Observable<BidangResponse[]> {
    return this.http.get<BidangResponse[]>(this.baseUrl);
  }

  public getById(uuid: string): Observable<BidangResponse> {
    return this.http.get<BidangResponse>(`${this.baseUrl}/${uuid}`);
  }

  public create(data: BidangRequest): Observable<BidangResponse> {
    return this.http.post<BidangResponse>(this.baseUrl, data);
  }

  public update(uuid: string, data: BidangRequest): Observable<BidangResponse> {
    return this.http.put<BidangResponse>(`${this.baseUrl}/${uuid}`, data);
  }

  public delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${uuid}`);
  }
}
