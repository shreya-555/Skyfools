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
].map(([name,category,price,description,art],id)=>({id,name,category,price,description,art}));
export const frame=n=>`/frames/ezgif-frame-${String(n).padStart(3,'0')}.jpg`;
