import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private url = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.url}/dashboard`);
  }

  getCollection(params: any = {}): Observable<any> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<any>(`${this.url}/collection`, { params: httpParams });
  }

  getOutstanding(): Observable<any> {
    return this.http.get<any>(`${this.url}/outstanding`);
  }

  getCompleted(params: any = {}): Observable<any> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<any>(`${this.url}/completed`, { params: httpParams });
  }

  getCustomers(): Observable<any> {
    return this.http.get<any>(`${this.url}/customers`);
  }

  exportCollectionUrl(params: any = {}): string {
    const q = new URLSearchParams(params).toString();
    return `${environment.apiUrl}/reports/collection/export${q ? '?' + q : ''}`;
  }

  exportOutstandingUrl(): string {
    return `${environment.apiUrl}/reports/outstanding/export`;
  }
}
