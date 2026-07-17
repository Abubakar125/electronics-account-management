import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Customer, ApiResponse, PaginatedResponse, TimelineEvent, CustomerSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private url = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAll(params: any = {}): Observable<PaginatedResponse<Customer>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<PaginatedResponse<Customer>>(this.url, { params: httpParams });
  }

  getById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.url}/${id}`);
  }

  create(formData: FormData): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.url, formData);
  }

  update(id: number, formData: FormData): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.url}/${id}`, formData);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`);
  }

  getAccounts(id: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.url}/${id}/accounts`);
  }

  getTimeline(id: number): Observable<ApiResponse<TimelineEvent[]>> {
    return this.http.get<ApiResponse<TimelineEvent[]>>(`${this.url}/${id}/timeline`);
  }

  getSummary(id: number): Observable<ApiResponse<CustomerSummary>> {
    return this.http.get<ApiResponse<CustomerSummary>>(`${this.url}/${id}/summary`);
  }
}
