const pexels=(id,name,author,alt)=>({file:`/food/${name}.jpg`,url:`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1100`,source:`https://www.pexels.com/photo/${id}/`,author,alt,license:'Pexels License',licenseUrl:'https://www.pexels.com/license/'});
export const photos={
  coffee:{file:'/food/coffee.jpg',url:'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1100&q=85',source:'https://unsplash.com/photos/tA90pRfL2gM',author:'Nathan Dumlao',alt:'Real photograph of coffee with latte art',license:'Unsplash License',licenseUrl:'https://unsplash.com/license'},
  iced:{file:'/food/iced.jpg',url:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1100&q=85',source:'https://unsplash.com/photos/L-sm1B4L1Ns',author:'Demi DeHerrera',alt:'Real photograph of an iced latte',license:'Unsplash License',licenseUrl:'https://unsplash.com/license'},
  sandwich:{file:'/food/sandwich.jpg',url:'https://images.unsplash.com/photo-1637149195704-3811b29b7643?auto=format&fit=crop&w=1100&q=85',source:'https://unsplash.com/photos/tbjQxB5xAmU',author:'Rens D',alt:'Real photograph of a grilled cheese sandwich',license:'Unsplash License',licenseUrl:'https://unsplash.com/license'},
  raspberry:pexels(35134576,'raspberry','Valeria Boltneva','Real photograph of a raspberry pastry'),
  pastry:pexels(30666863,'pastry','Natalia Olivera','Real photograph of chocolate croissant pastries'),
  apple:pexels(9969201,'apple','Vlada Karpovich','Real photograph of apple pie'),
  berry:pexels(9251275,'berry','Daniel Ruiz','Real photograph of a mixed berry smoothie'),
  avocado:pexels(8335329,'avocado','Fer Martinez Gonzalez','Real photograph of avocado toast'),
  eggs:pexels(34871731,'eggs','Richard L','Real photograph of scrambled eggs on toast'),
  tiramisu:pexels(14766327,'tiramisu','Evgeniya Davydova','Real photograph of tiramisu'),
  chocolate:pexels(10249461,'chocolate','Nishant Sharma','Real photograph of chocolate cake'),
  pistachio:pexels(13715795,'pistachio','Razane Adra','Real photograph of pistachio cake'),
};
export const itemPhotos=['coffee','raspberry','sandwich','iced','coffee','iced','iced','berry','pastry','apple','avocado','eggs','tiramisu','chocolate','pistachio'];
