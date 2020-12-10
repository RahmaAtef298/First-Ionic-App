import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, tap, delay, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './../auth/auth.service';
import { Place } from './place.model';

interface PlaceData {
  availableFrom: Date;
  availableTo: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private authService: AuthService, private http: HttpClient) { }

  private _places = new BehaviorSubject<Place[]>([ ]);

  get Places(){
    return this._places.asObservable();
  }

  getPlace(placeId: string){
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<PlaceData>(
          `https://ionic-app-1d9f4.firebaseio.com/offered-places/${placeId}.json?auth=${token}`
        );
      }),
      map(placeData => {
        return new Place(
          placeId,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId
        );
      })
    );
  }

  fetchPlaces() {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: PlaceData }>(
          `https://ionic-app-1d9f4.firebaseio.com/offered-places.json?auth=${token}`
        );
      }),
      map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId
              )
            );
          }
        }
        return places;
        // return [];
      }),
      tap(places => {
        this._places.next(places);
      })
    );
  }
  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    console.log(dateFrom, dateTo);
    let generatedId: string;
    let fetchedUserId: any  ;
    let newPlace: Place;
    return this.authService.UserId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
          price,
          dateFrom,
          dateTo,
          fetchedUserId
        );
        console.log(newPlace);
        return this.http.post<{ name: string }>(
          `https://ionic-app-1d9f4.firebaseio.com/offered-places.json?auth=${token}`,
          {
            ...newPlace,
            id: null
          }
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this._places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
        console.log(this._places);
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this._places;
      }),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableDateFrom,
          oldPlace.availableDateTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://ionic-app-1d9f4.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
