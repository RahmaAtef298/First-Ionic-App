import { BookingService } from './../../../bookings/booking.service';
import { AuthService } from './../../../auth/auth.service';
import { PlacesService } from './../../places.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Place } from '../../place.model';
import { ActionSheetController, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  place: Place;
  placeSub: Subscription;
  isBookable = false;
  isLoading = false;
  constructor(private route: ActivatedRoute,
              private router: Router,
              private placesService: PlacesService,
              private modalCtrl: ModalController,
              private actionSheetCtrl: ActionSheetController,
              private authService: AuthService,
              private bookingService: BookingService,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.router.navigate(['/places/tabs/discover']);
        return;
      }
      const placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(placeId).subscribe(place => {
        this.place = place;
        this.isLoading = false;
      },
      error => {
        this.alertCtrl
          .create({
            header: 'An error ocurred!',
            message: 'Could not load place.',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/places/tabs/discover']);
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      });
      console.log(this.place);
    });
  }

  onBookPlace(){
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('Select');
          }
        },
        // {
        //   text: 'Random Date',
        //   handler: () => {
        //     this.openBookingModal('Random');
        //   }
        // },
        {
          text: 'Cancel',
          role: 'Cancel'
        }
      ]
    })
    .then(actionSheetEl => {
      actionSheetEl.present();
    });
   }

   openBookingModal( mode: 'Select' | 'Random'){
    console.log(mode);
    this.modalCtrl.create({component: CreateBookingComponent, componentProps: { selectedPlace: this.place, selectedMode: mode }}).then(
      modelEl => {
        modelEl.present();
        return modelEl.onDidDismiss();
      })
      .then(resultData => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === 'confirm') {
          this.loadingCtrl
            .create({ message: 'Booking Place...' })
            .then(loadingEl => {
              loadingEl.present();
              const data = resultData.data.bookingData;
              console.log(data);
              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
            });
        }
      });
   }

   ngOnDestroy(){
     if (this.placeSub) {
       this.placeSub.unsubscribe();
     }
   }
}
