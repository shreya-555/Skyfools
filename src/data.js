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
const reviewSources={District:'https://www.district.in/dining/mumbai/the-lovefools-2-hill-road-bandra-west',Zomato:sources.visit+'/reviews',ZomatoPA:'https://www.zomato.com/pa/mumbai/lovefools-hill-road-bandra-west/reviews',ZomatoID:'https://www.zomato.com/id/mumbai/the-lovefools-2-hill-road-bandra-west/reviews',Wanderlog:'https://wanderlog.com/place/details/6175029/the-lovefools'};
export const reviews=[
 ['Ashish',5,'Praised manager Sachin’s personal attention and said he would return.','District'],
 ['Anna',5,'Loved the flavourful dishes, cocktails and romantic setting; considered the higher prices worthwhile.','Wanderlog'],
 ['Moira Vaz',4,'Loved the food and atmosphere, with attentive and efficient service.','District'],
 ['Mukul C',5,'Enjoyed breakfast and the character of the old bungalow.','Wanderlog'],
 ['Vinod Gopalakrishnan Kumar',5,'Enjoyed inventive flavours and the warmth and helpfulness of the team.','District'],
 ['Shikha',5,'Described the restaurant as a charming, small spot.','Zomato'],
 ['Amin S',5,'Praised the creative menu, drinks and knowledgeable team in a cosy Portuguese-style setting.','Wanderlog'],
 ['Swaminathan Iyer',5,'Spoke positively about the dining, setting and hospitality.','ZomatoPA'],
 ['Zenia',5,'Enjoyed the visit and praised the team and food.','ZomatoPA'],
 ['Akshay Patel',5,'Was especially impressed by the food.','ZomatoID'],
 ['Aashneet G',4,'Said the food, drinks and service delighted the whole group.','Wanderlog'],
 ['Shrey Sanghavi',5,'Liked both the dishes and the attractive setting.','ZomatoID'],
 ['Khushboo',5,'Enjoyed the atmosphere and gourmet cooking.','ZomatoID'],
 ['Kartik',5,'Praised inventive fusion dishes that felt refreshingly different.','ZomatoID'],
 ['Mugdha Joshi',4,'Enjoyed the umami-rich dishes, especially Thai chat; found it somewhat expensive.','District']
].map(([name,rating,summary,platform])=>({name,rating,summary,source:reviewSources[platform],platform:platform==='Wanderlog'?'Google via Wanderlog':platform.startsWith('Zomato')?'Zomato':platform}));
export const frame=n=>`/frames/ezgif-frame-${String(n).padStart(3,'0')}.jpg`;
