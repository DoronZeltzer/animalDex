import { AnimalCategory } from '../types/animal';

export interface ChallengeAnimal {
  name: string;       // matches AI commonName (case-insensitive contains)
  hint: string;       // clue shown to the user
  category: AnimalCategory;
}

// ── Animals per broad region ───────────────────────────────────────────────────

const EUROPE: ChallengeAnimal[] = [
  { name: 'European Robin', hint: 'A small bird with a bright red-orange breast, common in gardens.', category: 'air' },
  { name: 'Red Fox', hint: 'A clever rusty-red canid often spotted at dawn or dusk.', category: 'land' },
  { name: 'European Hedgehog', hint: 'A spiny insectivore that rolls into a ball when threatened.', category: 'land' },
  { name: 'Mallard', hint: 'The most common duck — male has a vivid green head.', category: 'air' },
  { name: 'Common Wood Pigeon', hint: 'A large, plump grey pigeon with white neck patches.', category: 'air' },
  { name: 'House Sparrow', hint: 'A small chirpy brown bird, found almost everywhere near humans.', category: 'air' },
  { name: 'European Starling', hint: 'A glossy iridescent bird that forms huge murmurations in autumn.', category: 'air' },
  { name: 'Great Tit', hint: 'A cheerful yellow-and-black garden bird with a loud call.', category: 'air' },
  { name: 'European Rabbit', hint: 'A grey-brown bunny with long ears, often seen in meadows.', category: 'land' },
  { name: 'Barn Owl', hint: 'A ghostly white owl with a heart-shaped face, active at night.', category: 'air' },
  { name: 'Common Buzzard', hint: 'A large broad-winged raptor that soars over open countryside.', category: 'air' },
  { name: 'Grey Heron', hint: 'A tall grey wading bird that stands motionless at water edges.', category: 'air' },
  { name: 'European Magpie', hint: 'A bold black-and-white bird known for collecting shiny objects.', category: 'air' },
  { name: 'Common Blackbird', hint: 'Males are jet black with an orange beak; famous for evening song.', category: 'air' },
  { name: 'Mute Swan', hint: 'An elegant white water bird with an orange bill.', category: 'sea' },
  { name: 'Eurasian Jay', hint: 'A colourful corvid with a striking blue wing patch.', category: 'air' },
  { name: 'European Mole', hint: 'A velvety black digger that leaves molehills across lawns.', category: 'land' },
  { name: 'Common Frog', hint: 'A mottled green-brown frog found near ponds and gardens.', category: 'land' },
  { name: 'Common Carp', hint: 'A large golden-bronze freshwater fish in lakes and rivers.', category: 'sea' },
  { name: 'Eurasian Otter', hint: 'A sleek aquatic mammal with a long tail, found along rivers.', category: 'sea' },
];

const NORTH_AMERICA: ChallengeAnimal[] = [
  { name: 'White-tailed Deer', hint: 'A graceful deer that flashes its white tail when alarmed.', category: 'land' },
  { name: 'American Robin', hint: 'A thrush with a rusty-orange breast, common in lawns.', category: 'air' },
  { name: 'Gray Squirrel', hint: 'A bushy-tailed rodent that buries acorns for winter.', category: 'land' },
  { name: 'Canada Goose', hint: 'A large goose with a black neck and white chinstrap.', category: 'air' },
  { name: 'Raccoon', hint: 'A clever masked mammal that raids trash cans at night.', category: 'land' },
  { name: 'Eastern Chipmunk', hint: 'A tiny striped rodent that stuffs food in its cheek pouches.', category: 'land' },
  { name: 'Red-tailed Hawk', hint: 'A common large hawk with a brick-red tail, seen perching on posts.', category: 'air' },
  { name: 'American Bald Eagle', hint: 'The national bird — a massive raptor with a white head.', category: 'air' },
  { name: 'Wild Turkey', hint: 'A large ground bird with an iridescent body and red wattle.', category: 'land' },
  { name: 'Northern Cardinal', hint: 'The male is a vivid red bird with a pointed crest.', category: 'air' },
  { name: 'Opossum', hint: 'North America\'s only marsupial — plays dead when threatened.', category: 'land' },
  { name: 'American Bullfrog', hint: 'A large green frog with a deep booming call near ponds.', category: 'land' },
  { name: 'Blue Jay', hint: 'A bold blue-and-white bird known for its loud calls.', category: 'air' },
  { name: 'Groundhog', hint: 'A stocky burrowing rodent — also called a woodchuck.', category: 'land' },
  { name: 'Monarch Butterfly', hint: 'An orange-and-black butterfly famous for its long migration.', category: 'air' },
  { name: 'Great Blue Heron', hint: 'A towering grey wading bird that stands still at water edges.', category: 'air' },
  { name: 'Striped Skunk', hint: 'A black-and-white mammal that sprays a powerful odour when threatened.', category: 'land' },
  { name: 'American Alligator', hint: 'A large dark reptile lurking in swamps and slow rivers.', category: 'sea' },
  { name: 'Common Snapping Turtle', hint: 'A prehistoric-looking turtle with a powerful bite.', category: 'sea' },
  { name: 'Hummingbird', hint: 'A tiny jewel-like bird that hovers while feeding on flowers.', category: 'air' },
];

const SOUTH_AMERICA: ChallengeAnimal[] = [
  { name: 'Capybara', hint: 'The world\'s largest rodent, semi-aquatic and very social.', category: 'land' },
  { name: 'Toucan', hint: 'A tropical bird with an enormous, colourful beak.', category: 'air' },
  { name: 'Scarlet Macaw', hint: 'A dazzling red-yellow-blue parrot of the rainforest.', category: 'air' },
  { name: 'Three-toed Sloth', hint: 'A slow-moving mammal that hangs upside down in trees.', category: 'land' },
  { name: 'Giant Anteater', hint: 'A long-snouted mammal that tears open termite mounds.', category: 'land' },
  { name: 'Jaguar', hint: 'A powerful spotted big cat — the largest in the Americas.', category: 'land' },
  { name: 'Anaconda', hint: 'The world\'s heaviest snake, lurking in tropical rivers.', category: 'sea' },
  { name: 'Howler Monkey', hint: 'A large primate famous for its ear-splitting roar at dawn.', category: 'land' },
  { name: 'Andean Condor', hint: 'One of the world\'s largest flying birds, soaring over the Andes.', category: 'air' },
  { name: 'Spectacled Caiman', hint: 'A medium-sized crocodilian with a bony ridge between its eyes.', category: 'sea' },
  { name: 'Pink River Dolphin', hint: 'A uniquely pink freshwater dolphin of the Amazon basin.', category: 'sea' },
  { name: 'Poison Dart Frog', hint: 'A tiny, brilliantly coloured frog whose skin is toxic.', category: 'land' },
  { name: 'Tapir', hint: 'A stocky mammal with a short flexible trunk-like nose.', category: 'land' },
  { name: 'Flamingo', hint: 'A tall pink wading bird that feeds with its head upside down.', category: 'air' },
  { name: 'Piranha', hint: 'A notorious sharp-toothed freshwater fish found in Amazon rivers.', category: 'sea' },
];

const AFRICA: ChallengeAnimal[] = [
  { name: 'African Elephant', hint: 'Earth\'s largest land animal, with massive ears shaped like Africa.', category: 'land' },
  { name: 'Lion', hint: 'The "king of the jungle" — lives on grassy savannahs in prides.', category: 'land' },
  { name: 'Giraffe', hint: 'The tallest animal on Earth, browsing treetops with a long neck.', category: 'land' },
  { name: 'Plains Zebra', hint: 'A horse-like mammal with striking black-and-white stripes.', category: 'land' },
  { name: 'Hippopotamus', hint: 'A massive semi-aquatic mammal that spends days in rivers.', category: 'sea' },
  { name: 'Cheetah', hint: 'The fastest land animal — built for explosive sprints.', category: 'land' },
  { name: 'African Wild Dog', hint: 'A mottled painted dog that hunts in coordinated packs.', category: 'land' },
  { name: 'Warthog', hint: 'A wild pig with curved tusks and wart-like bumps on its face.', category: 'land' },
  { name: 'Ostrich', hint: 'The world\'s largest bird — flightless but runs at 70 km/h.', category: 'land' },
  { name: 'Meerkat', hint: 'A small mongoose that stands upright to watch for predators.', category: 'land' },
  { name: 'Nile Crocodile', hint: 'Africa\'s largest reptile, ambushing prey at river crossings.', category: 'sea' },
  { name: 'African Penguin', hint: 'A black-and-white penguin that nests on South African beaches.', category: 'sea' },
  { name: 'Secretary Bird', hint: 'A tall eagle-like raptor that stalks prey on foot in grasslands.', category: 'air' },
  { name: 'African Buffalo', hint: 'A massive bovine with swept-back horns, living in large herds.', category: 'land' },
  { name: 'Vervet Monkey', hint: 'A small grey monkey with a black face, common near villages.', category: 'land' },
];

const ASIA: ChallengeAnimal[] = [
  { name: 'Giant Panda', hint: 'A black-and-white bear that lives almost exclusively on bamboo.', category: 'land' },
  { name: 'Snow Leopard', hint: 'A pale spotted big cat of mountain ranges in central Asia.', category: 'land' },
  { name: 'Asian Elephant', hint: 'Smaller-eared than its African cousin, with a domed back.', category: 'land' },
  { name: 'Bengal Tiger', hint: 'The world\'s largest wild cat, striped orange-and-black.', category: 'land' },
  { name: 'King Cobra', hint: 'The world\'s longest venomous snake, capable of raising its hood.', category: 'land' },
  { name: 'Komodo Dragon', hint: 'The world\'s largest lizard, found on a handful of Indonesian islands.', category: 'land' },
  { name: 'Red-crowned Crane', hint: 'An elegant white crane with a vivid red cap — symbol of luck.', category: 'air' },
  { name: 'Japanese Macaque', hint: 'A stocky monkey famous for sitting in hot springs in winter.', category: 'land' },
  { name: 'Orangutan', hint: 'A shaggy red great ape that spends most of its life in trees.', category: 'land' },
  { name: 'Indian Peafowl', hint: 'The peacock — a bird with a spectacular iridescent tail display.', category: 'land' },
  { name: 'Giant Hornbill', hint: 'A large tropical bird with a hollow bony casque on its beak.', category: 'air' },
  { name: 'Proboscis Monkey', hint: 'A distinctive monkey with an enormous pendulous nose.', category: 'land' },
  { name: 'Saltwater Crocodile', hint: 'The world\'s largest reptile, lurking in coastal waters and rivers.', category: 'sea' },
  { name: 'Koi Fish', hint: 'A colourful domesticated carp kept in ornamental ponds.', category: 'sea' },
  { name: 'Red Panda', hint: 'A cat-sized, rust-coloured mammal related to neither bears nor raccoons.', category: 'land' },
];

const OCEANIA: ChallengeAnimal[] = [
  { name: 'Red Kangaroo', hint: 'Australia\'s largest marsupial, bounding across open plains.', category: 'land' },
  { name: 'Koala', hint: 'A fluffy grey marsupial that sleeps 20 hours a day in eucalyptus trees.', category: 'land' },
  { name: 'Platypus', hint: 'A duck-billed, beaver-tailed, venomous-spurred egg-laying mammal.', category: 'sea' },
  { name: 'Wombat', hint: 'A stocky burrowing marsupial that produces cube-shaped droppings.', category: 'land' },
  { name: 'Kookaburra', hint: 'A large kingfisher famous for its cackling laugh-like call.', category: 'air' },
  { name: 'Emu', hint: 'Australia\'s tallest bird — flightless and faster than it looks.', category: 'land' },
  { name: 'Tasmanian Devil', hint: 'A ferocious little marsupial with a powerful bite and eerie screech.', category: 'land' },
  { name: 'Quokka', hint: 'A tiny wallaby famous for its happy smile — the world\'s happiest animal.', category: 'land' },
  { name: 'Black Swan', hint: 'An all-black swan with a vivid red bill, native to Australia.', category: 'sea' },
  { name: 'Echidna', hint: 'A spiny egg-laying mammal — the only one besides the platypus.', category: 'land' },
  { name: 'Cassowary', hint: 'A large flightless bird with a bony helmet and dagger-like claws.', category: 'land' },
  { name: 'Frilled-neck Lizard', hint: 'A lizard that spreads a dramatic frill around its neck when alarmed.', category: 'land' },
  { name: 'Wallaby', hint: 'A smaller relative of the kangaroo, common in eastern Australia.', category: 'land' },
  { name: 'Dugong', hint: 'A large sea cow grazing on seagrass in shallow coastal waters.', category: 'sea' },
  { name: 'Tawny Frogmouth', hint: 'A nocturnal bird that looks just like a broken tree branch.', category: 'air' },
];

const MIDDLE_EAST: ChallengeAnimal[] = [
  { name: 'Arabian Oryx', hint: 'A striking white antelope that once went extinct in the wild.', category: 'land' },
  { name: 'Dromedary Camel', hint: 'The one-humped camel, perfectly adapted to desert life.', category: 'land' },
  { name: 'Fennec Fox', hint: 'The world\'s smallest fox with giant ears to keep it cool.', category: 'land' },
  { name: 'Sand Cat', hint: 'A small wild cat perfectly suited to scorching desert sands.', category: 'land' },
  { name: 'Desert Monitor Lizard', hint: 'A large, powerful lizard that stalks the desert floor.', category: 'land' },
  { name: 'Loggerhead Sea Turtle', hint: 'A large sea turtle with a big head, nesting on warm beaches.', category: 'sea' },
  { name: 'Houbara Bustard', hint: 'A large terrestrial bird, traditionally hunted with falcons.', category: 'air' },
  { name: 'Arabian Horse', hint: 'One of the world\'s oldest horse breeds, elegant and spirited.', category: 'land' },
  { name: 'Egyptian Vulture', hint: 'A small white vulture with a yellow face, uses tools to crack eggs.', category: 'air' },
  { name: 'Rock Hyrax', hint: 'A small, rabbit-like mammal surprisingly related to elephants.', category: 'land' },
];

// ── Country → region mapping ───────────────────────────────────────────────────

const COUNTRY_REGION: Record<string, keyof typeof REGION_ANIMALS> = {
  // Europe
  NL: 'europe', DE: 'europe', FR: 'europe', GB: 'europe', IT: 'europe',
  ES: 'europe', BE: 'europe', AT: 'europe', CH: 'europe', SE: 'europe',
  NO: 'europe', DK: 'europe', FI: 'europe', PL: 'europe', CZ: 'europe',
  PT: 'europe', IE: 'europe', GR: 'europe', HU: 'europe', RO: 'europe',
  BG: 'europe', HR: 'europe', SK: 'europe', SI: 'europe', LT: 'europe',
  LV: 'europe', EE: 'europe', LU: 'europe', MT: 'europe', CY: 'europe',
  IS: 'europe', RS: 'europe', ME: 'europe', MK: 'europe', AL: 'europe',
  BA: 'europe', MD: 'europe', UA: 'europe', BY: 'europe', RU: 'europe',
  // North America
  US: 'northAmerica', CA: 'northAmerica', MX: 'northAmerica',
  GT: 'northAmerica', BZ: 'northAmerica', HN: 'northAmerica',
  SV: 'northAmerica', NI: 'northAmerica', CR: 'northAmerica', PA: 'northAmerica',
  CU: 'northAmerica', JM: 'northAmerica', HT: 'northAmerica',
  DO: 'northAmerica', TT: 'northAmerica',
  // South America
  BR: 'southAmerica', AR: 'southAmerica', CL: 'southAmerica',
  CO: 'southAmerica', PE: 'southAmerica', VE: 'southAmerica',
  EC: 'southAmerica', BO: 'southAmerica', PY: 'southAmerica',
  UY: 'southAmerica', GY: 'southAmerica', SR: 'southAmerica',
  // Africa
  ZA: 'africa', NG: 'africa', KE: 'africa', EG: 'africa', ET: 'africa',
  GH: 'africa', TZ: 'africa', UG: 'africa', MZ: 'africa', ZM: 'africa',
  ZW: 'africa', AO: 'africa', CM: 'africa', CI: 'africa', SN: 'africa',
  MR: 'africa', ML: 'africa', NE: 'africa', TD: 'africa', SD: 'africa',
  SO: 'africa', MG: 'africa', TN: 'africa', MA: 'africa', DZ: 'africa',
  LY: 'africa', RW: 'africa', BI: 'africa', DJ: 'africa',
  // Middle East
  SA: 'middleEast', AE: 'middleEast', TR: 'middleEast', IR: 'middleEast',
  IQ: 'middleEast', JO: 'middleEast', IL: 'middleEast', LB: 'middleEast',
  SY: 'middleEast', YE: 'middleEast', OM: 'middleEast', KW: 'middleEast',
  QA: 'middleEast', BH: 'middleEast', PK: 'middleEast', AF: 'middleEast',
  // Asia
  CN: 'asia', JP: 'asia', KR: 'asia', IN: 'asia', TH: 'asia',
  VN: 'asia', PH: 'asia', ID: 'asia', MY: 'asia', SG: 'asia',
  MM: 'asia', KH: 'asia', LA: 'asia', BD: 'asia', NP: 'asia',
  LK: 'asia', MN: 'asia', KZ: 'asia', UZ: 'asia', TW: 'asia',
  HK: 'asia', MO: 'asia', KP: 'asia',
  // Oceania
  AU: 'oceania', NZ: 'oceania', PG: 'oceania', FJ: 'oceania',
  WS: 'oceania', TO: 'oceania', VU: 'oceania', SB: 'oceania',
};

export const REGION_ANIMALS = {
  europe: EUROPE,
  northAmerica: NORTH_AMERICA,
  southAmerica: SOUTH_AMERICA,
  africa: AFRICA,
  asia: ASIA,
  oceania: OCEANIA,
  middleEast: MIDDLE_EAST,
};

export type Region = keyof typeof REGION_ANIMALS;

export function getRegionForCountry(countryCode: string): Region {
  return COUNTRY_REGION[countryCode.toUpperCase()] ?? 'europe';
}
