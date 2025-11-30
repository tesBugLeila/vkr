import { Component, OnInit } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { Post } from '../post/post';
import { IPost } from '../../types/post';

@Component({
  selector: 'app-list',
  imports: [SearchBar, Post],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  standalone: true,
})
export class List implements OnInit {
  public posts: IPost[] = [
    {
      id: 'b32c4800-1b14-42aa-bd19-3b2fcbce17fa',
      title: 'Сыр твердый домашний на био-ферментах',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt distinctio eos incidunt inventore quaerat quia, quos velit. Est eum nemo nisi! Cumque dignissimos facilis fuga, illum laborum modi sed tenetur.',
      price: 250,
      contact: '7925180',
      category: 'молочная продукция',
      district: 'Вокзал',
      photos: [],
      lat: 53.224263,
      lon: 50.64128,
      notifyNeighbors: true,
      userId: 'ec361353-8fed-4ccf-b952-099153033a7b',
      createdAt: new Date(),
    },
    {
      id: 'b32c4800-1b14-42aa-bd19-3b2fcbce17fa',
      title: 'Молоко домашнее 1 литр',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt distinctio eos incidunt inventore quaerat quia, quos velit. Est eum nemo nisi! Cumque dignissimos facilis fuga, illum laborum modi sed tenetur.',
      price: 200,
      contact: '7925180',
      category: 'молочная продукция',
      district: 'Вокзал',
      photos: [],
      lat: 53.224263,
      lon: 50.64128,
      notifyNeighbors: true,
      userId: 'ec361353-8fed-4ccf-b952-099153033a7b',
      createdAt: new Date(),
    },
    {
      id: 'b32c4800-1b14-42aa-bd19-3b2fcbce17fa',
      title: 'Колбаса свинина говядина от местного производителя ',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt distinctio eos incidunt inventore quaerat quia, quos velit. Est eum nemo nisi! Cumque dignissimos facilis fuga, illum laborum modi sed tenetur.',
      price: 950,
      contact: '7925180',
      category: 'мясная продукция',
      district: 'Вокзал',
      photos: [],
      lat: 53.224263,
      lon: 50.64128,
      notifyNeighbors: true,
      userId: 'ec361353-8fed-4ccf-b952-099153033a7b',
      createdAt: new Date(),
    },
    {
      id: 'b32c4800-1b14-42aa-bd19-3b2fcbce17fa',
      title: 'Пельмени ручной лепки говядина ',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt distinctio eos incidunt inventore quaerat quia, quos velit. Est eum nemo nisi! Cumque dignissimos facilis fuga, illum laborum modi sed tenetur.',
      price: 870,
      contact: '7925180',
      category: 'мясная продукция',
      district: 'Вокзал',
      photos: [],
      lat: 53.224263,
      lon: 50.64128,
      notifyNeighbors: true,
      userId: 'ec361353-8fed-4ccf-b952-099153033a7b',
      createdAt: new Date(),
    },
    {
      id: 'b32c4800-1b14-42aa-bd19-3b2fcbce17fa',
      title: 'Семейная пасика Мёд (цена за 1 литр) ',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt distinctio eos incidunt inventore quaerat quia, quos velit. Est eum nemo nisi! Cumque dignissimos facilis fuga, illum laborum modi sed tenetur.',
      price: 600,
      contact: '7925180',
      category: 'мёд',
      district: 'Крестьянская',
      photos: [],
      lat: 53.24037,
      lon: 50.624702,
      notifyNeighbors: true,
      userId: 'ec361353-8fed-4ccf-b952-099153033a7b',
      createdAt: new Date(),
    },
  ];
  public ngOnInit() {}
}
