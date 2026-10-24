export const sources={coffee:'https://www.zomato.com/mumbai/the-lovefools-2-hill-road-bandra-west/order?disableOpenApp=1&fsc=1',food:'https://magicpin.in/Mumbai/Bandra-West/Restaurant/Lovefools/store/16aa733/delivery',visit:'https://www.zomato.com/mumbai/the-lovefools-2-hill-road-bandra-west',story:'https://roadbook.com/mumbai/city-guide/best-restaurants-bandra-mumbai/'};
export const menu=[
 ['Cappuccino','Coffee',250,'A coffee-bar classic.','cup'],
 ['Raspberry Pinwheel','Bakery',475,'A raspberry-named bake from the bakery listing.','pastry'],
 ['Grilled Emmental Sandwich Veg','Brunch',630,'A grilled Emmental sandwich, listed on the breakfast menu.','sandwich'],
 ['Iced latte','Cold drinks',260,'An iced favourite from the coffee bar.','glass'],
 ['Kochi mocha','Coffee',380,'The coffee bar’s named mocha.','cup'],
 ['Thai freeze (cold)','Cold drinks',550,'A cold speciality on the coffee menu.','glass'],
 ['Tiramisu cold coffee','Cold drinks',550,'Tiramisu meets cold coffee on the listed menu.','glass'],
 ['Berry Blast','Cold drinks',450,'A berry-named cold beverage.','glass'],
 ['Chocolate Pinwheel','Bakery',450,'A chocolate-named pinwheel from the bakery.','pastry'],
 ['Apple Pie','Bakery',495,'Apple pie from the bakery selection.','pastry'],
 ['Open Avacado Sandwich','Brunch',630,'An open sandwich from the breakfast listing.','sandwich'],
 ['Truffle Scramble M. M. Sourdough','Brunch',630,'A truffle scramble and sourdough dish as listed.','sandwich'],
 ['Whisky Tiramisu','Dessert',460,'A whisky-named take on tiramisu.','cake'],
 ['Hazelnut & Chocolate Rocher','Dessert',395,'A hazelnut and chocolate-named sweet.','cake'],
 ['Pistachio Financier','Dessert',215,'A pistachio-named financier.','cake']
].map(([name,category,price,description,art],id)=>({id,name,category,price,description,art,source:['Coffee','Cold drinks'].includes(category)&&name!=='Berry Blast'?sources.coffee:sources.food}));
export const reviews=[{name:'Shikha',rating:5,quote:'quaint lil place',source:sources.visit+'/reviews',note:'Public review excerpt · Zomato'},{name:'Shreyas',rating:5,quote:'Love the vibe, cocktails were fab and the tiramisu was heavenly Just a lil difficult to find.',source:sources.visit+'/reviews',note:'Public review excerpt · Zomato'},{name:'mansi',rating:null,quote:'The ambience is superb and everything we ate was a 10/10.',source:'https://www.justdial.com/Mumbai/The-Lovefools-Opposite-Telco-Market-Bandra-West/022PXX22-XX22-200828091957-B7Q1_BZDET/reviews',note:'13 May 2024 · Justdial. The full review also criticises dessert.'}];
export const frame=n=>`/frames/ezgif-frame-${String(n).padStart(3,'0')}.jpg`;
