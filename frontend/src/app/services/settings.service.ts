import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Setting, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private url = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  get(): Observable<ApiResponse<Setting>> {
    return this.http.get<ApiResponse<Setting>>(this.url);
  }

  update(formData: FormData): Observable<ApiResponse<Setting>> {
    return this.http.put<ApiResponse<Setting>>(this.url, formData);
  }
}
