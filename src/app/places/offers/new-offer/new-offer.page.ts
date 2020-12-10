import { PlacesService } from './../../places.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

  AddOfferForm: FormGroup;
  constructor(private loadingCtrl: LoadingController, private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.AddOfferForm = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.minLength(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
    });
  }

  onImagePicked(imageData: string){
    console.log(imageData);
  }

  onCreateOffer(){
    console.log(this.AddOfferForm.value);
    console.log(new Date(this.AddOfferForm.value.dateFrom),
    new Date(this.AddOfferForm.value.dateTo));
    if (!this.AddOfferForm.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Creating Place...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.placesService
          .addPlace(
            this.AddOfferForm.value.title,
            this.AddOfferForm.value.description,
            +this.AddOfferForm.value.price,
            new Date(this.AddOfferForm.value.dateFrom),
            new Date(this.AddOfferForm.value.dateTo)
          )
          .subscribe(() => {
            console.log(new Date(this.AddOfferForm.value.dateFrom),
            new Date(this.AddOfferForm.value.dateTo));
            loadingEl.dismiss();
            this.AddOfferForm.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }

}
