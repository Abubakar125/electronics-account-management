import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Payment, ApiResponse, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private url = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(params: any = {}): Observable<PaginatedResponse<Payment>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<PaginatedResponse<Payment>>(this.url, { params: httpParams });
  }

  getById(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.url}/${id}`);
  }

  create(data: any): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.url, data);
  }

  getReceiptUrl(id: number): string {
    return `${environment.apiUrl}/payments/${id}/receipt`;
  }
}
