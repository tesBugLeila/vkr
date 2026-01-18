import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-post-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './post-edit.html',
  styleUrl: './post-edit.scss',
  standalone: true,
})
export class PostEdit implements OnInit {
  postForm: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      title: [''],
      description: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      district: [''],
      photos: [''],
      lat: [],
      lon: [],
      notifyNeighbors: [true, Validators.required],
    });
  }
}
