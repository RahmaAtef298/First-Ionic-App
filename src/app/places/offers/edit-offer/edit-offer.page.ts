import { PlacesService } from './../../places.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Place } from '../../place.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  place: Place;
  EditOfferForm: FormGroup;
  placeSub: Subscription;
  isLoading = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private placesService: PlacesService,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.router.navigate(['/places/tabs/offers']);
        return;
      }
      const placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(placeId).subscribe( place => {
        this.place = place;
        this.EditOfferForm = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          })
        });
        this.isLoading = false;
      },
      error => {
        this.alertCtrl
          .create({
            header: 'An error occurred!',
            message: 'Place could not be fetched. Please try again later.',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/places/tabs/offers']);
                }
              }
            ]
          })
          .then(alertEl => {
            alertEl.present();
          });
      });
    });
  }

  onUpdateOffer(){
    if (!this.EditOfferForm.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Updating Place...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.placesService
          .updatePlace(
            this.place.id,
            this.EditOfferForm.value.title,
            this.EditOfferForm.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.EditOfferForm.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }

  ngOnDestroy(){
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
