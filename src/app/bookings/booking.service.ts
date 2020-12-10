import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, map, switchMap } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private _bookings = new BehaviorSubject<Booking[]>([]);
  constructor( private authService: AuthService, private http: HttpClient ) { }

  get Bookings() {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ){
    let generatedId: string;
    let newBooking: Booking;
    let fetchedUserId: any;
    return this.authService.UserId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        fetchedUserId = userId;
        console.log(fetchedUserId);
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          fetchedUserId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );
        return this.http.post<{ name: string }>(
          `https://ionic-app-1d9f4.firebaseio.com/bookings.json?auth=${token}`,
          { ...newBooking, id: null }
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this._bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  fetchBookings() {
    let fetchedUserId: string | boolean;
    return this.authService.UserId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User not found!');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: BookingData }>(
          `https://ionic-app-1d9f4.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        );
      }),
      map(bookingData => {
        const bookings = [];
        for (const key in bookingData) {
          if (bookingData.hasOwnProperty(key)) {
            bookings.push(
              new Booking(
                key,
                bookingData[key].placeId,
                bookingData[key].userId,
                bookingData[key].placeTitle,
                bookingData[key].placeImage,
                bookingData[key].firstName,
                bookingData[key].lastName,
                bookingData[key].guestNumber,
                new Date(bookingData[key].bookedFrom),
                new Date(bookingData[key].bookedTo)
              )
            );
          }
        }
        return bookings;
      }),
      tap(bookings => {
        this._bookings.next(bookings);
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://ionic-app-1d9f4.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this._bookings;
      }),
      take(1),
      tap(bookings => {
        this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  }
}
