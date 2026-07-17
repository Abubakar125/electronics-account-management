import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Account, ApiResponse, PaginatedResponse, Payment } from '../models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private url = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getAll(params: any = {}): Observable<PaginatedResponse<Account>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<PaginatedResponse<Account>>(this.url, { params: httpParams });
  }

  getById(id: number): Observable<ApiResponse<Account>> {
    return this.http.get<ApiResponse<Account>>(`${this.url}/${id}`);
  }

  create(data: any): Observable<ApiResponse<Account>> {
    return this.http.post<ApiResponse<Account>>(this.url, data);
  }

  update(id: number, data: any): Observable<ApiResponse<Account>> {
    return this.http.put<ApiResponse<Account>>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`);
  }

  getPayments(id: number): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.url}/${id}/payments`);
  }
}
