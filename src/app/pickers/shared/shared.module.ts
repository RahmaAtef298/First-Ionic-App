import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesPickerComponent } from '../images-picker/images-picker.component';



@NgModule({
  declarations: [ImagesPickerComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ImagesPickerComponent]
})
export class SharedModule { }
