import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPost } from '../../types/post';

@Component({
  selector: 'app-post-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './post-edit.html',
  styleUrl: './post-edit.scss',
  standalone: true,
})
export class PostEdit implements OnInit {
  postForm: FormGroup;
  @Input() postData?: IPost;
  editForm!: FormGroup;
  categories = ['OTHER', 'PIES', 'JAMS', 'VEGETABLES', 'DAIRY', 'MEAT', 'BAKERY'];


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    if (this.postData) {
      this.editForm.patchValue(this.postData);
    } else {
      this.getLocation();
    }
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['OTHER', [Validators.required]],
      district: [''],
      photos: [[]],
      lat: [null],
      lon: [null],
      notifyNeighbors: [false],
      // Скрытые поля сохраняем в форме или обрабатываем отдельно при отправке
      id: [null],
      contact: [''],
      userId: [null],
      createdAt: [new Date()]
    });
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.editForm.patchValue({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      });
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const updatedPost: IPost = this.editForm.value;
      console.log('Данные для сохранения:', updatedPost);
      // Здесь вызов сервиса: this.postService.update(updatedPost)
    }
  }
}
