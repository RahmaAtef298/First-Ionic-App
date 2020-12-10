import { PlacesService } from './../places.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  loadedOffers: Place[];
  isLoading = false;
  offersSub: Subscription;

  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
  //   this.isLoading = true;
  //   this.offersSub = this.placesService.fetchPlaces().subscribe((places) => {
  //     this.loadedOffers = places;
  //     this.isLoading = false;
  //  });
    this.offersSub = this.placesService.Places.subscribe( places => {
      this.loadedOffers = places;
    });
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
     this.isLoading = false;
   });
  }

  onEdit(offerId: string, slidingItem: IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log(offerId);
  }

  ngOnDestroy(){
    if (this.offersSub) {
     this.offersSub.unsubscribe();
    }
  }

}
