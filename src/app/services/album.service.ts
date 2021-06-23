import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Album } from '../common/album';
import { AlbumTo } from '../common/album-to';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  private albumsUrl = `${environment.apiUrl}/albums`;

  constructor(private httpClient: HttpClient) { }

  getAlbum(id: number): Observable<Album> {
    return this.httpClient.get<Album>(`${this.albumsUrl}/${id}`);
  }

  getAlbumListPaginate(page: number, size: number): Observable<Album[]> {
    const paginateQueryParams = `?page=${page}&size=${size}`;
    return this.httpClient.get<Album[]>(`${this.albumsUrl}${paginateQueryParams}`);
  }

  createAlbum(albumTo: AlbumTo): Observable<Album> {
    return this.httpClient.post<Album>(this.albumsUrl, albumTo);
  }

  updateAlbum(albumTo: AlbumTo): Observable<any> {
    return this.httpClient.put<any>(`${this.albumsUrl}/${albumTo.id}`, albumTo);
  }

  deleteAlbum(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.albumsUrl}/${id}`);
  }
}