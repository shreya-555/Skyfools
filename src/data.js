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
].map(([name,category,price,description,art],id)=>({id,name,category,price,description,art,detail:[
 'A classic hot coffee made with espresso, steamed milk and a soft layer of foam. Creamy in texture with a clear coffee finish.',
 'A spiral-shaped bakery treat with raspberry flavour. A sweet, fruit-led choice for a coffee break.',
 'A warm vegetarian grilled sandwich featuring Emmental cheese. A savoury brunch choice with a rich, melted-cheese centre.',
 'Espresso and chilled milk served over ice. Smooth and refreshing while keeping the flavour of a familiar latte.',
 'A mocha-style coffee with chocolate notes. A richer choice when you want coffee and something sweet together.',
 'A chilled speciality from the cold drinks menu, made for a refreshing pause.',
 'A cold coffee inspired by tiramisu, pairing coffee flavour with a dessert-like profile.',
 'A berry-forward cold drink for a bright, fruity break from the coffee menu.',
 'A chocolate-flavoured pinwheel pastry from the bakery selection. Made for a sweet pause alongside coffee.',
 'A classic apple pie from the bakery selection, with the familiar comfort of a fruit-filled baked dessert.',
 'An open-faced avocado sandwich from the brunch selection. A lighter savoury option for a long café visit.',
 'A brunch plate bringing truffle scramble and sourdough together. Rich, savoury and made for a slower morning.',
 'A whisky variation on tiramisu, the layered coffee dessert. A richer finish to the meal.',
 'A hazelnut and chocolate dessert with a rocher-inspired name. Nutty and chocolate-forward.',
 'A pistachio financier, the small French-style cake known for its soft centre and gently browned edges.'
 ][id]}));
export const frame=n=>`/frames/ezgif-frame-${String(n).padStart(3,'0')}.jpg`;
