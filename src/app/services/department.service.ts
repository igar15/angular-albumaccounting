import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Department } from '../common/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private departmentsUrl = `${environment.apiUrl}/departments`;

  constructor(private httpClient: HttpClient) { }

  getDepartmentList(): Observable<Department[]> {
    return this.httpClient.get<Department[]>(this.departmentsUrl);
  }

  createDepartment(department: Department): Observable<Department> {
    return this.httpClient.post<Department>(this.departmentsUrl, department);
  }

  updateDepartment(department: Department): Observable<any> {
    return this.httpClient.put<any>(`${this.departmentsUrl}/${department.id}`, department);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.departmentsUrl}/${id}`);
  }
}