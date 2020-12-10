import { Place } from './../../places/place.model';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'Select' | 'Random';
  @ViewChild('bookForm', {static: true}) bookForm: NgForm;
  startDate: string;
  endDate: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const availableDateFrom = new Date(this.selectedPlace.availableDateFrom);
    const availableDateTo = new Date(this.selectedPlace.availableDateTo);
    console.log(availableDateFrom, availableDateTo);
    // if (this.selectedMode === 'Random') {
    //   this.startDate = new Date(
    //     availableDateFrom.getTime() + Math.random() * availableDateTo.getTime() - 7 * 24 * 60 * 60 * 1000 ).toISOString();
    //   this.endDate = new Date(
    //     new Date(this.startDate).getTime() +
    //     Math.random() * new Date(this.startDate).getTime() -
    //     7 * 24 * 60 * 60 * 1000 - new Date(this.startDate).getTime()
    //   ).toISOString();
    // }
  }

  onCancel(){
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onBookPlace(){
    console.log(this.bookForm.value);
    if (!this.bookForm.valid || !this.validDates) {
      return;
    }
    this.modalCtrl.dismiss({
      bookingData: {
      firstName: this.bookForm.value['first-name'],
      lastName: this.bookForm.value['last-name'],
      guestNumber: +this.bookForm.value['guest-number'],
      dateFrom: new Date(this.bookForm.value['date-from']),
      dateTo: new Date(this.bookForm.value['date-to'])
    }
    }, 'confirm');
  }

  validDates(){
    const startDate = new Date(this.bookForm.value.dateFrom);
    const endDate = new Date(this.bookForm.value.dateTo);
    return  endDate > startDate;
  }
}
