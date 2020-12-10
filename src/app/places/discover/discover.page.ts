import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlacesService } from './../places.service';
import { Place } from '../place.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

  loadedPlaces: Place[];
  listedPlaces: Place[];
  isLoading = false;
  placesSub: Subscription;

  constructor(private placesService: PlacesService) { }

  ngOnInit() {
    // this.isLoading = true;
    // this.placesSub = this.placesService.fetchPlaces().subscribe((places) => {
    //   this.loadedPlaces = places;
    //   this.listedPlaces = this.loadedPlaces.slice(1);
    //   console.log(places);
    //   this.isLoading = false;
    // });
    this.placesSub = this.placesService.Places.subscribe(places => {
      this.loadedPlaces = places;
      this.listedPlaces = this.loadedPlaces.slice(1);
      console.log(this.loadedPlaces);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe((places) => {
      console.log(places);
      this.isLoading = false;
    });
  }

  ngOnDestroy(){
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
