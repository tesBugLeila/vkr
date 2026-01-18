import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { IPost } from '../../../types/post';

@Component({
  selector: 'app-phone',
  imports: [],
  templateUrl: './phone.html',
  styleUrl: './phone.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Phone implements OnInit {
  @Input() public data?: IPost;
  loading = false;
  tel = '';
  phone = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.transform();
  }
  loadPhone() {
    this.loading = true;
    this.transform();
    setTimeout(() => {
      if (this.data && 'contact' in this.data) {
        this.data.contact = '79251800832';
      }
      this.tel = `+${this.data?.contact}`;
      this.loading = false;
      this.transform();
    },500)
  }
  transform() {
    if (this.data?.contact) {
      const phoneSrc = this.data?.contact.toString();

      if (!phoneSrc?.length) {
        return;
      }
      if (phoneSrc?.length === 7) {
        this.phone = `+${phoneSrc[0]} (${phoneSrc.substring(1, 4)}) ${phoneSrc.substring(4, 7)}-`;
        this.phone += !this.loading ? `XX-XX` : `░░-░░`;
      }
      if (phoneSrc?.length === 12) {
        this.phone = `${phoneSrc[0]}${phoneSrc[1]}-${phoneSrc.substring(2, 5)}-${phoneSrc.substring(5, 6)}-${phoneSrc.substring(6, 10)}-${phoneSrc.substring(10, 12)}`;
      }
    }
    this.cdr.detectChanges();
  }
}
