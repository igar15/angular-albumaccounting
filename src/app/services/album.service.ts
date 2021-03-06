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

  getAlbumListPaginate(page: number, size: number): Observable<GetResponseAlbums> {
    const paginateQueryParams = `?page=${page}&size=${size}`;
    return this.httpClient.get<GetResponseAlbums>(`${this.albumsUrl}${paginateQueryParams}`);
  }

  searchAlbumsByDecimalPaginate(decimalNumber: string, page: number, size: number): Observable<GetResponseAlbums> {
    const decimalNumberAndPaginateQueryParams = `?decimalNumber=${decimalNumber}&page=${page}&size=${size}`;
    return this.httpClient.get<GetResponseAlbums>(`${this.albumsUrl}/byDecimal${decimalNumberAndPaginateQueryParams}`);
  }

  searchAlbumsByHolderPaginate(holderName: string, page: number, size: number): Observable<GetResponseAlbums> {
    const holderNameAndPaginateQueryParams = `?holderName=${holderName}&page=${page}&size=${size}`;
    return this.httpClient.get<GetResponseAlbums>(`${this.albumsUrl}/byHolder${holderNameAndPaginateQueryParams}`);
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

interface GetResponseAlbums {
  content: Album[],
  pageable: {
    page: number,
    size: number
  },
  total: number
}