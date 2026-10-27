/* Sneak Beat — store configuration and catalogue.
   Everything a shop owner changes lives in this file.

   Store facts come from @sneakbeat.yvn and the 2GIS listing (Oct 2026).
   PROTOTYPE DATA — confirm with the store before launch:
     · DEMO PRODUCT PHOTOS: studio shots borrowed from kith.com to show how a real
       catalogue looks. Not for a public launch — replace with the brands' official
       assets (via the distributor) or the store's own shoot in the same style.
     · prices, sizes in stock and product names (prices were not public)
     · delivery fees and the free-delivery threshold
     · the 14-day exchange policy */

const IG = 'assets/ig/';
const BR = 'assets/brands/';

window.CONFIG = {
  instagram: 'sneakbeat.yvn',
  // Hero film. DEMO CLIP: Mixkit #98 "Person walking on crosswalk" (free Mixkit licence) —
  // replace with the store's own shoot. Alternative ready: assets/video/film-4893.mp4 / .jpg
  film: { src: 'assets/video/film-98.mp4', poster: 'assets/video/film-98.jpg' },
  // WEEKLY DROP (off for now — pitch idea for the client). Set `drop` to an object like this and the
  // hero shows the drop instead of the store's bio line:
  //   drop: {
  //     title: { en: 'Samba OG is back', ru: 'Samba OG снова в наличии', hy: 'Samba OG-ն վերադարձել է' },
  //     sub: { en: 'The indoor classic, in white and black.', ru: 'Зальная классика — в белом и чёрном.', hy: 'Դահլիճի դասականը՝ սպիտակ և սև։' },
  //     link: '#/shop?q=Samba'
  //   },
  drop: null,
  delivery: { courierFee: 1000, regionsFee: 2500, freeOver: 50000 },
  store: {
    address: {
      en: '4 Aram St, 1st floor, Kentron, Yerevan',
      ru: 'ул. Арама 4, 1 этаж, Кентрон, Ереван',
      hy: 'Արամի 4, 1-ին հարկ, Կենտրոն, Երևան'
    },
    hours: '10:00 – 22:00',
    phone: '+374 43 300366',
    deliveryPhone: '+374 96 501514',
    mapQuery: '40.179191,44.514619',
    images: [IG + 'ig-03.jpg', IG + 'ig-12.jpg'],
    // store page: the storefront photo cut between "SNEAK" and "BEAT", shown side by side as one facade
    front: ['assets/store/storefront-left.jpg', 'assets/store/storefront-right.jpg']
  },
  genderTiles: [
    { gender: 'men', image: IG + 'ig-08.jpg' },
    { gender: 'women', image: IG + 'ig-11.jpg' }
  ],
  // One line per brand for the Brands menu and brand pages, plus the store's own Instagram photo where one exists
  // (the AI-labelled posts are left out). Edit freely — HY / RU / EN.
  // `hero`: the wide photo across the top of the brand page (pos = crop on laptops, posPhone = crop on phones,
  // light: true = pale photo, so a darker fade behind the white text). DEMO: official press / campaign images from
  // each brand's own newsroom or site, for showing in person only — replace with the distributor's files before launch.
  brandInfo: {
    Nike: { hero: { image: BR + 'nike.jpg', pos: '50% 62%', posPhone: '50% 50%' }, image: IG + 'ig-01.jpg', post: 'https://www.instagram.com/sneakbeat.yvn/reel/DerUHsto93W/', story: {
      en: 'From the 1972 Cortez to the Air Force 1 — the classics, on Aram Street.',
      ru: 'От Cortez 1972 года до Air Force 1 — классика на улице Арама.',
      hy: '1972-ի Cortez-ից մինչև Air Force 1՝ դասականները Արամի փողոցում։' } },
    Jordan: { hero: { image: BR + 'jordan.jpg', pos: '50% 40%', posPhone: '50% 50%' }, image: IG + 'ig-10.jpg', post: 'https://www.instagram.com/sneakbeat.yvn/reel/DeCbU2BIIiU/', story: {
      en: 'The Air Jordan line — born on the court in 1985, worn everywhere since.',
      ru: 'Линия Air Jordan — родилась на площадке в 1985-м, а носят её везде.',
      hy: 'Air Jordan շարքը՝ ծնված խաղահրապարակում 1985-ին, կրվում է ամենուր։' } },
    adidas: { hero: { image: BR + 'adidas.jpg', pos: '50% 70%', posPhone: '58% 50%' }, image: IG + 'ig-11.jpg', post: 'https://www.instagram.com/p/DeCToF1iApA/', story: {
      en: 'Three stripes from the terraces: Samba, Gazelle and the indoor classics.',
      ru: 'Три полоски с трибун: Samba, Gazelle и зальная классика.',
      hy: 'Երեք շերտ տրիբունաներից՝ Samba, Gazelle և դահլիճի դասականները։' } },
    'New Balance': { hero: { image: BR + 'new-balance.jpg', pos: '50% 50%', posPhone: '62% 50%', light: true }, story: {
      en: 'Made for comfort since 1906 — the grey runners everyone wants.',
      ru: 'Удобство с 1906 года — те самые серые кроссовки.',
      hy: 'Հարմարավետություն 1906-ից՝ այն մոխրագույն սնիքերները, որ բոլորն են ուզում։' } },
    On: { hero: { image: BR + 'on.jpg', pos: '15% 85%', posPhone: '30% 50%' }, image: IG + 'ig-08.jpg', post: 'https://www.instagram.com/p/DePAD6SiFU6/', story: {
      en: 'Swiss engineering you can feel — CloudTec® cushioning for every day.',
      ru: 'Швейцарская инженерия, которую чувствуешь, — амортизация CloudTec® на каждый день.',
      hy: 'Շվեյցարական ինժեներիա, որ զգում ես՝ CloudTec® ամորտիզացիա ամեն օրվա համար։' } },
    Vans: { hero: { image: BR + 'vans.jpg', pos: '40% 70%', posPhone: '45% 50%' }, image: IG + 'ig-06.jpg', post: 'https://www.instagram.com/p/DeYp5lqRDqi/', story: {
      en: 'Off the Wall since 1966 — canvas, waffle soles and skate heritage.',
      ru: 'Off the Wall с 1966 года — канвас, подошва waffle и скейт-наследие.',
      hy: 'Off the Wall 1966-ից՝ կտավ, waffle ներբան և սքեյթի ժառանգություն։' } },
    Puma: { hero: { image: BR + 'puma.jpg', pos: '50% 75%', posPhone: '70% 50%' }, story: {
      en: 'Motorsport-born silhouettes, led by the slim Speedcat.',
      ru: 'Силуэты из мира автоспорта во главе с тонким Speedcat.',
      hy: 'Ավտոսպորտից ծնված սիլուետներ՝ բարակ Speedcat-ի գլխավորությամբ։' } },
    Converse: { hero: { image: BR + 'converse.jpg', pos: '50% 100%', posPhone: '52% 50%', light: true }, story: {
      en: 'The Chuck 70 — premium canvas that goes with everything.',
      ru: 'Chuck 70 — премиальный канвас, который подходит ко всему.',
      hy: 'Chuck 70՝ պրեմիում կտավ, որ համընկնում է ամեն ինչի հետ։' } },
    Crocs: { story: {
      en: 'In the store on Aram Street — ask us about sizes and colours.',
      ru: 'В магазине на улице Арама — спрашивайте о размерах и цветах.',
      hy: 'Արամի փողոցի խանութում՝ հարցրեք չափսերի և գույների մասին։' } },
    Camper: { story: {
      en: 'In the store on Aram Street — ask us about sizes and colours.',
      ru: 'В магазине на улице Арама — спрашивайте о размерах и цветах.',
      hy: 'Արամի փողոցի խանութում՝ հարցրեք չափսերի և գույների մասին։' } }
  },
  // Brand logos for the curved band on the homepage. DEMO FILES: Simple Icons (Nike, Jordan, adidas, New Balance,
  // Puma) and Wikimedia Commons (On, Vans, Converse, Crocs — public domain; Camper — CC BY-SA 3.0).
  // For launch, use the official files from the brands / distributor. `w` = logo width as % of the card,
  // set by eye so a thin swoosh and a solid wordmark carry the same weight. Coloured logos (Crocs, Camper) keep their colours.
  logos: {
    Nike: { src: 'assets/logos/nike.svg', w: 50 }, Jordan: { src: 'assets/logos/jordan.svg', w: 24 },
    adidas: { src: 'assets/logos/adidas.svg', w: 30 }, 'New Balance': { src: 'assets/logos/newbalance.svg', w: 34 },
    On: { src: 'assets/logos/on.svg', w: 22 }, Vans: { src: 'assets/logos/vans.svg', w: 44 },
    Puma: { src: 'assets/logos/puma.svg', w: 34 }, Converse: { src: 'assets/logos/converse.svg', w: 36 },
    Crocs: { src: 'assets/logos/crocs.svg', w: 46 }, Camper: { src: 'assets/logos/camper.png', w: 40 }
  },
  // Brands on the shelves (from the store's Instagram highlights). Only those with listed pairs get a link.
  brands: ['Nike', 'Jordan', 'adidas', 'New Balance', 'On', 'Vans', 'Puma', 'Converse', 'Crocs', 'Camper'],
  feed: [
    { src: IG + 'ig-03.jpg', url: 'https://www.instagram.com/sneakbeat.yvn/reel/Dejspv2h_LL/' },
    { src: IG + 'ig-01.jpg', url: 'https://www.instagram.com/sneakbeat.yvn/reel/DerUHsto93W/' },
    { src: IG + 'ig-05.jpg', url: 'https://www.instagram.com/p/DeZj4-3CHe9/' },
    { src: IG + 'ig-12.jpg', url: 'https://www.instagram.com/sneakbeat.yvn/reel/Dd9EzJxBsTo/' },
    { src: IG + 'ig-07.jpg', url: 'https://www.instagram.com/michel_ghaytanjyan/reel/DeRtyNECKf9/' },
    { src: IG + 'ig-09.jpg', url: 'https://www.instagram.com/varuj.margaryan/reel/DeEXsIIswQs/' }
  ],
  popularSearches: ['Samba', 'Air Force 1', 'Jordan', '9060', 'Cloudtilt', 'Black'],
  sizeRange: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  sizeChart: [
    { eu: '36', us: '4', uk: '3.5', cm: '22.5' }, { eu: '37', us: '5', uk: '4', cm: '23.5' },
    { eu: '38', us: '5.5', uk: '5', cm: '24' }, { eu: '39', us: '6.5', uk: '6', cm: '24.5' },
    { eu: '40', us: '7', uk: '6.5', cm: '25' }, { eu: '41', us: '8', uk: '7', cm: '26' },
    { eu: '42', us: '8.5', uk: '8', cm: '26.5' }, { eu: '43', us: '9.5', uk: '9', cm: '27.5' },
    { eu: '44', us: '10', uk: '9.5', cm: '28' }, { eu: '45', us: '11', uk: '10.5', cm: '29' },
    { eu: '46', us: '12', uk: '11', cm: '30' }
  ],
  colors: [
    { value: 'black', hex: '#111111', label: { en: 'Black', ru: 'Чёрный', hy: 'Սև' } },
    { value: 'white', hex: '#ffffff', label: { en: 'White', ru: 'Белый', hy: 'Սպիտակ' } },
    { value: 'grey', hex: '#9a9a9e', label: { en: 'Grey', ru: 'Серый', hy: 'Մոխրագույն' } },
    { value: 'beige', hex: '#d9cbb3', label: { en: 'Beige', ru: 'Бежевый', hy: 'Բեժ' } },
    { value: 'brown', hex: '#7a5a48', label: { en: 'Brown', ru: 'Коричневый', hy: 'Շագանակագույն' } },
    { value: 'red', hex: '#b3262d', label: { en: 'Red', ru: 'Красный', hy: 'Կարմիր' } },
    { value: 'blue', hex: '#3d8fb0', label: { en: 'Blue', ru: 'Голубой', hy: 'Կապույտ' } }
  ],
  models: {
    af1: { desc: {
      en: 'The 1982 basketball shoe that never left the street. Crisp leather, Nike Air in the sole and the pivot-circle outsole.',
      ru: 'Баскетбольная модель 1982 года, которая так и не ушла с улиц. Гладкая кожа, Nike Air в подошве и узор «круг вращения».',
      hy: '1982 թվականի բասկետբոլային մոդել, որը այդպես էլ չլքեց փողոցները։ Կաշի, Nike Air ներբանում և դասական պտտման շրջանակով ներբան։' } },
    cortez: { desc: {
      en: 'The 1972 runner that became a street classic. Leather and suede upper, the herringbone sole and a slim, low profile.',
      ru: 'Беговая модель 1972 года, ставшая уличной классикой. Верх из кожи и замши, подошва «ёлочкой» и низкий силуэт.',
      hy: '1972 թվականի վազքի մոդել, որը դարձավ փողոցային դասական։ Կաշվից և զամշից վերնամաս, «եղևնաձև» ներբան և ցածր սիլուետ։' } },
    dunk: { desc: {
      en: 'Made for college courts in 1985, now a skate and street staple. Layered leather overlays and a padded low collar.',
      ru: 'Создан для студенческого баскетбола в 1985-м, сегодня — классика скейта и улицы. Кожаные накладки и мягкий низкий борт.',
      hy: 'Ստեղծվել է 1985-ին ուսանողական բասկետբոլի համար, այսօր՝ սքեյթի և փողոցի դասական։ Կաշվե շերտեր և փափուկ ցածր եզր։' } },
    aj1low: { desc: {
      en: 'The original 1985 colour blocking on the low-cut Air Jordan 1. Full leather, Air-Sole cushioning and the Wings logo on the heel.',
      ru: 'Оригинальная цветовая схема 1985 года в низком Air Jordan 1. Натуральная кожа, амортизация Air-Sole и логотип Wings на пятке.',
      hy: '1985-ի օրիգինալ գունային լուծումը ցածր Air Jordan 1-ում։ Ամբողջովին կաշի, Air-Sole ամորտիզացիա և Wings լոգո կրունկին։' } },
    aj4: { desc: {
      en: 'The 1989 icon with the mesh side panels and the visible Air unit. Leather upper, plastic wing eyelets and a cushioned ride.',
      ru: 'Икона 1989 года с сетчатыми вставками и видимым Air в пятке. Кожаный верх, пластиковые «крылья» для шнуровки.',
      hy: '1989-ի խորհրդանիշը՝ ցանցե կողային վահանակներով և տեսանելի Air-ով։ Կաշվե վերնամաս և պլաստիկ «թևեր» կապիչների համար։' } },
    samba: { desc: {
      en: 'Born on indoor football pitches, worn everywhere since. Leather upper, suede T-toe overlay and the gum rubber sole.',
      ru: 'Рождены для футбольного зала, а носят их везде. Кожаный верх, замшевая накладка на носке и каучуковая подошва цвета gum.',
      hy: 'Ստեղծվել են փակ դահլիճի ֆուտբոլի համար, կրում են ամենուր։ Կաշվե վերնամաս, զամշե ծածկույթ քթամասում և gum ռետինե ներբան։' } },
    gazelle: { desc: {
      en: 'The indoor Gazelle from 1979: soft suede, serrated three stripes and a translucent gum sole with grip for the court.',
      ru: 'Зальная Gazelle 1979 года: мягкая замша, зубчатые три полоски и полупрозрачная подошва gum.',
      hy: '1979-ի փակ դահլիճի Gazelle-ը՝ փափուկ զամշ, ատամնավոր երեք շերտ և կիսաթափանցիկ gum ներբան։' } },
    nb990: { desc: {
      en: 'Made in USA. Pigskin suede and mesh over ENCAP cushioning — the grey runner that defined the 990 line.',
      ru: 'Сделано в США. Замша и сетка поверх амортизации ENCAP — тот самый серый раннер линейки 990.',
      hy: 'Արտադրված է ԱՄՆ-ում։ Զամշ և ցանց ENCAP ամորտիզացիայի վրա՝ 990 շարքը սահմանած մոխրագույն սնիքերը։' } },
    nb9060: { desc: {
      en: 'A 99X-series design pushed forward: sculpted ABZORB and SBS cushioning, a wavy sole and a suede and mesh upper.',
      ru: 'Дизайн серии 99X, доведённый до будущего: объёмная амортизация ABZORB и SBS, волнистая подошва, замша и сетка.',
      hy: '99X շարքի դիզայնը՝ առաջ մղված։ ABZORB և SBS ամորտիզացիա, ալիքաձև ներբան, զամշ և ցանց։' } },
    nb1906r: { desc: {
      en: 'A 2000s performance runner, back in metallic detail. N-ergy and ABZORB cushioning with a breathable mesh upper.',
      ru: 'Беговая модель 2000-х в металлических деталях. Амортизация N-ergy и ABZORB, дышащая сетка.',
      hy: '2000-ականների վազքի մոդելը՝ մետաղական մանրամասներով։ N-ergy և ABZORB ամորտիզացիա, շնչող ցանց։' } },
    cloudtilt: { desc: {
      en: 'Built for all-day comfort, on and off the run. CloudTec Phase® cushioning rolls you forward with every step.',
      ru: 'Комфорт на весь день — на пробежке и в городе. Амортизация CloudTec Phase® мягко перекатывает стопу вперёд.',
      hy: 'Ամբողջ օրվա հարմարավետություն՝ վազքին և քաղաքում։ CloudTec Phase® ամորտիզացիան մեղմ առաջ է տանում ամեն քայլին։' } },
    authentic: { desc: {
      en: 'The 1966 Vans original in the premium LX build: heavyweight canvas, padded insole and the classic waffle sole.',
      ru: 'Оригинальная модель Vans 1966 года в премиальной версии LX: плотный канвас, мягкая стелька и подошва waffle.',
      hy: '1966-ի օրիգինալ Vans-ը պրեմիում LX տարբերակով՝ խիտ կտավ, փափուկ ներդիր և դասական waffle ներբան։' } },
    chuck70: { desc: {
      en: 'The premium Chuck: heavier canvas, a glossy egret midsole and extra cushioning inside. Low-top, goes with everything.',
      ru: 'Премиальный Chuck: плотный канвас, глянцевая подошва цвета egret и дополнительная амортизация. Низкий, подходит ко всему.',
      hy: 'Պրեմիում Chuck՝ խիտ կտավ, փայլուն egret ներբան և լրացուցիչ ամորտիզացիա։ Ցածր, համընկնում է ամեն ինչի հետ։' } },
    speedcat: { desc: {
      en: 'The slim motorsport shoe from 1999, back in suede. Low profile, rounded toe and a thin rubber sole.',
      ru: 'Тонкая «гоночная» модель 1999 года снова в замше. Низкий профиль, скруглённый нос и тонкая резиновая подошва.',
      hy: '1999-ի բարակ ավտոսպորտային մոդելը՝ կրկին զամշով։ Ցածր պրոֆիլ, կլորացված քթամաս և բարակ ռետինե ներբան։' } }
  }
};

/* Catalogue. `images` are in shooting order: side profile, pair, toe, heel, sole, detail.
   `sizes` maps EU size → pairs in stock (0 = sold out; drives the crossed-out sizes). */
const PR = 'assets/products/';
const shots = (h, n) => Array.from({ length: n }, (_, i) => `${PR}${h}/${i + 1}.jpg`);
const S = (...out) => Object.fromEntries(window.CONFIG.sizeRange.map(s => [s, out.includes(s) ? 0 : 1]));

window.PRODUCTS = [
  { id: 'nk-af1-wht', slug: 'nike-air-force-1-07-white', brand: 'Nike', model: 'af1', name: "Air Force 1 '07", colorway: 'White / White', sku: 'CW2288-111',
    gender: 'unisex', style: 'lifestyle', color: 'white', price: 55000, added: '2026-10-02', badge: 'best',
    images: shots('nkcw2288-111', 6), sizes: S('36') },
  { id: 'nk-cortez-wht', slug: 'nike-cortez-white-black', brand: 'Nike', model: 'cortez', name: 'Cortez', colorway: 'White / Black / Light Photo Blue', sku: 'DM4044-100',
    gender: 'women', style: 'lifestyle', color: 'white', price: 41000, added: '2026-10-19', badge: 'new',
    images: shots('nkdm4044-100', 5), sizes: S('45', '46') },
  { id: 'nk-dunk-clay', slug: 'nike-dunk-low-retro-cosmic-clay', brand: 'Nike', model: 'dunk', name: 'Dunk Low Retro', colorway: 'White / Cosmic Clay / Dusty Cactus', sku: 'DV0833-102',
    gender: 'women', style: 'lifestyle', color: 'blue', price: 55000, added: '2026-10-15', badge: null,
    images: shots('nkdv0833-102', 5), sizes: S('44', '45', '46') },
  { id: 'jd-aj1low-red', slug: 'air-jordan-1-low-og-black-varsity-red', brand: 'Jordan', model: 'aj1low', name: 'Air Jordan 1 Low OG', colorway: 'Black / Varsity Red / Summit White', sku: 'IR0088-001',
    gender: 'men', style: 'basketball', color: 'red', price: 74000, added: '2026-10-17', badge: 'new',
    images: shots('jbir0088-001', 6), sizes: S('36', '37', '42') },
  { id: 'jd-aj4-wht', slug: 'air-jordan-4-white-dark-blue-grey', brand: 'Jordan', model: 'aj4', name: 'Air Jordan 4', colorway: 'White / Dark Blue Grey / Tour Yellow', sku: 'IO2463-102',
    gender: 'men', style: 'basketball', color: 'white', price: 106000, added: '2026-10-11', badge: null,
    images: shots('jbio2463-102', 6), sizes: S('36', '37', '38', '45') },
  { id: 'ad-samba-wht', slug: 'adidas-samba-og-white', brand: 'adidas', model: 'samba', name: 'Samba OG', colorway: 'Cloud White / Core Black / Gum', sku: 'B75806',
    gender: 'unisex', style: 'lifestyle', color: 'white', price: 48000, added: '2026-10-18', badge: 'best',
    images: shots('aab75806', 6), sizes: S('36') },
  { id: 'ad-samba-blk', slug: 'adidas-samba-og-black', brand: 'adidas', model: 'samba', name: 'Samba OG', colorway: 'Core Black / Cloud White / Gum', sku: 'B75807',
    gender: 'unisex', style: 'lifestyle', color: 'black', price: 48000, added: '2026-10-18', badge: null,
    images: shots('aab75807', 6), sizes: S('43') },
  { id: 'ad-gazelle-brn', slug: 'adidas-gazelle-indoor-trace-brown', brand: 'adidas', model: 'gazelle', name: 'Gazelle Indoor', colorway: 'Trace Brown / Warm Vanilla / Gum', sku: 'KI2252',
    gender: 'unisex', style: 'lifestyle', color: 'brown', price: 58000, added: '2026-10-14', badge: 'new',
    images: shots('aaki2252', 6), sizes: S('46') },
  { id: 'ad-gazelle-off', slug: 'adidas-gazelle-indoor-off-white', brand: 'adidas', model: 'gazelle', name: 'Gazelle Indoor', colorway: 'Off White / Preloved Brown / Gum', sku: 'KH9693',
    gender: 'women', style: 'lifestyle', color: 'beige', price: 58000, added: '2026-10-14', badge: null,
    images: shots('aakh9693', 6), sizes: S('44', '45', '46') },
  { id: 'nb-990v4-gry', slug: 'new-balance-990v4-cool-grey', brand: 'New Balance', model: 'nb990', name: '990v4 Made in USA', colorway: 'Cool Grey', sku: 'U990GR4',
    gender: 'men', style: 'running', color: 'grey', price: 89000, added: '2026-10-13', badge: null,
    images: shots('nbu990gr4', 5), sizes: S('36', '37', '38') },
  { id: 'nb-990v4-blk', slug: 'new-balance-990v4-black', brand: 'New Balance', model: 'nb990', name: '990v4 Made in USA', colorway: 'Black', sku: 'U990BL4',
    gender: 'men', style: 'running', color: 'black', price: 89000, added: '2026-10-13', badge: null,
    images: shots('nbu990bl4', 6), sizes: S('36', '37', '41') },
  { id: 'nb-9060-gry', slug: 'new-balance-9060-grey-day', brand: 'New Balance', model: 'nb9060', name: '9060', colorway: 'Grey Day', sku: 'U9060GRY',
    gender: 'unisex', style: 'running', color: 'grey', price: 77000, added: '2026-10-09', badge: 'best',
    images: shots('nbu9060gry', 5), sizes: S('39') },
  { id: 'nb-1906r-slv', slug: 'new-balance-1906r-white-silver', brand: 'New Balance', model: 'nb1906r', name: '1906R', colorway: 'White / Silver Metallic', sku: 'M1906RCM',
    gender: 'unisex', style: 'running', color: 'white', price: 74000, added: '2026-10-06', badge: null,
    images: shots('nbu1906rcm', 5), sizes: S('36', '46') },
  { id: 'on-cloudtilt-grain', slug: 'on-cloudtilt-grain-white', brand: 'On', model: 'cloudtilt', name: 'Cloudtilt', colorway: 'Grain / White', sku: '3ME10105217',
    gender: 'men', style: 'running', color: 'beige', price: 82000, added: '2026-10-12', badge: 'new',
    images: shots('onr3me10105217', 5), sizes: S('36', '37') },
  { id: 'on-cloudtilt-plt', slug: 'on-cloudtilt-platinum-midnight', brand: 'On', model: 'cloudtilt', name: 'Cloudtilt', colorway: 'Platinum / Midnight', sku: '3ME10105216',
    gender: 'men', style: 'running', color: 'grey', price: 82000, added: '2026-10-12', badge: null,
    images: shots('onr3me10105216', 6), sizes: S('36', '37', '44') },
  { id: 'vn-authentic-blk', slug: 'vans-authentic-44-lx-black', brand: 'Vans', model: 'authentic', name: 'Authentic 44 LX', colorway: 'Black / Sand White', sku: 'VN000D9NHZ5',
    gender: 'unisex', style: 'skate', color: 'black', price: 43000, added: '2026-10-07', badge: null,
    images: shots('vn000d9nhz51', 4), sizes: S() },
  { id: 'cv-chuck70-blk', slug: 'converse-chuck-70-ox-black', brand: 'Converse', model: 'chuck70', name: 'Chuck 70 Ox', colorway: 'Black / Egret', sku: '162058C',
    gender: 'unisex', style: 'skate', color: 'black', price: 43000, added: '2026-10-04', badge: null,
    images: shots('converse-chuck-taylor-70-ox-black-egret', 5), sizes: S('46') },
  { id: 'pm-speedcat-blk', slug: 'puma-speedcat-og-black', brand: 'Puma', model: 'speedcat', name: 'Speedcat OG', colorway: 'PUMA Black / PUMA White', sku: '398846-01',
    gender: 'women', style: 'lifestyle', color: 'black', price: 48000, added: '2026-10-16', badge: 'new',
    images: shots('pu398846-01', 6), sizes: S('44', '45', '46') }
];
