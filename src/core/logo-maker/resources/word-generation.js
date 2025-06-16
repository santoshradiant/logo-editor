import AMCore from '../amcore.js'
import random from '../utils/weighted-random'
import { availableTLDs } from './tld-info'
// import wordnetData from './Wordnet.json'
const wordnetData = window.System.import('data-wordnet')
// Filter names and brands and adjectives (find combined words)
// check if it's
// goods
//    sell new/sell old/rent/lease/exchange
//      food/drinks (sells butter fruit bananas etc)
//      clothing/fashion (shoes
//      transportation
//        cars
//        bikes
//        tickets
//      consumer appliances
//      industry appliances
//      recreative
//        sports (active, not checkers and stuff)
//          indoor (tabletennis,
//          outdoor field (football, soccer, baseball)
//          water (skiing, (kite)surfing)
//          snow (skiing, snowboarding)
//          mountain (climbing, biking)
//          combat (airsoft, paintball)
//          hunt
//        collector/hobby model trains, stamps etc.
//        games
//        media discs etc
//      entertainment
//        concert and other tickets
// services
//    food (restaurants, bar, cafe)
//    health (massage, doctor, etc)
//    transportation
//    payments
//    accounting
//    insurance
//    consulting
//    cleaning
//    repairing
//    designing
//    advertising
//    hosting
//    entertainment
//      broadcast radio & television
//      party someone visits you acting clown
//      park place you visit
//      agency for parties
//    recreative
//      agency for travel
//      travel blog
// Singular errors
// Appliances get no singular

// Clasifications
// word is other brand name "nissan cars" "samsung phones"
// word is name "andre's pizza", "petes flowers"
// two nouns "bike bags" "pizza restaurant"
// services "... analytics" "... marketing"
// leds go, hats go (1 sylable) go (replace, go with dance, do it)
// nuts up, hats up,

// umb|rella|xation

// Ideas
// Team ...
// The ...

// Filter wordnet words
// Check blacklist for words fishit is fish and hit but contains shit :)

// delibrate spelling mistakes
// reverse k and (ca|co|cu|c$|ct) ? cookie => koocie put stuf like arrows in logo to correct mistake
// reverse s and k(ci|ce|cy) ? only if can NO(citrus => sitruc) but cinsere is ok
// reverse z and s
// reverse d and t
// change g to j (jiraf)
//

// Adding numbers like 24 7 360

// clocktopus  maybe make the word combiner more relaxed to make these kind of combos
// realestat ion silent e doesn't count

const positiveAdjectives = [
  'amazing',
  'awesome',
  'beautiful',
  'charming',
  'charismatic',
  'cheerful',
  'creative',
  'cool',
  'driven',
  'delightful',
  'divine',
  'excellent',
  'enchanting',
  'enchanted',
  'fabulous',
  'fantastic',
  'fresh',
  'gorgeous',
  'glorius',
  'happy',
  'harmonious',
  'honest',
  'hot',
  'innovative',
  'incredible',
  'joyful',
  'kind',
  'loving',
  'lucky',
  'outstanding',
  'optimistic',
  'original',
  'marvelous',
  'noble',
  'perfect',
  'passionate',
  'quick',
  'relaxed',
  'reliable',
  'remarkable',
  'royal',
  'spectacular',
  'splendid',
  'stellar',
  'super',
  'solid',
  'stunning',
  'sensational',
  'terrific',
  'trusted',
  'upbeat',
  'unbelievable',
  'ultimate',
  'victorious',
  'wonderful',
  'wondrous',
  'witty',

  'adventurous',
  'affectionable',
  'ambitious',
  'amusing',
  'authentic',
  'astral',
  'better',
  'beloved',
  'bright',
  'brave',
  'clean',
  'clear',
  'caring',
  'custom',
  'conscious',
  'confident',
  'considerate',
  'coarageous',
  'dandy',
  'delicious',
  'efficient',
  'eager',
  'empowered',
  'empowering',
  'energetic',
  'enlightened',
  'enthusiastic',
  'excited',
  'exquisite',
  'frank',
  'friendly',
  'fun',
  'funny',
  'good',
  'gentle',
  'genuine',
  'generous',
  'great',
  'gracious',
  'healthy',
  'helpful',
  'heroic',
  'heartfull',
  'humorous',
  'inspiring',
  'imaginative',
  'inspirational',
  'intuitive',
  'irresistible',
  'joyous',
  'joysome',
  'juicy',
  'king',
  'kingly',
  'knightly',
  'legit',
  'loyal',
  'lush',
  'luxurious',
  'moral',
  'magnificent',
  'memorable',
  'modest',
  'natural',
  'neat',
  'nice',
  'new',
  'quick',
  'patient',
  'peaceful',
  'playful',
  'polite',
  'powerful',
  'precious',
  'prosperous',
  'performance',
  'rich',
  'radiant',
  'responsible',
  'sympathetic',
  'sensible',
  'serene',
  'shining',
  'smart',
  'serious',
  'sincere',
  'sacred',
  'smooth',
  'thankful',
  'thriving',
  'trusting',
  'trusted',
  'tough',
  'unlimited',
  'unique',
  'unreal',
  'uplifted',
  'valuable',
  'versatile',
  'vibrant',
  'warm',
  'wealthy',
  'wise',
  'young',
  'youthful',
  'zappy',
  'zestful',

  'golden',

  'pro',
  'go',
  'my',
  'your',

  'wow',
  'yeah',
  'yes',
  'yummy',

  // ['next', 'let\'s'], needs singular form, not plural
  // ' \'r us',
  'team',
  'global'
]

// const domainComExtensions = ['com', 'online', 'wine', 'us', 'shop', 'net', 'org', 'club', 'rocks', 'website', 'biz', 'fit', 'nyc']
// Also offered on domain.com xyz co education me today tel club biz info (don't know complete list, ask domains.com)

// Most popular domains on tld-list.com
// net org co xyz info io me top ai in eu us online pw biz club tech
// work tvv space pro cc gg win ws science download de ca uk app it im sh shop
// ru store es asia xxx to host site one life design party cloud website se stream mx link

const animals = [
  'lion',
  'tiger',
  'dinosaur',
  'elephant',
  'giraffe',
  'octopus',

  'albatross',
  'alligator',
  'chameleon',
  'badger',
  'bear',
  'beaver',
  'bison',
  'hippopotamus',
  'flamingo',
  'alpaca',
  'anaconda',
  'antelope',
  'armadillo',
  'baboon',
  'bobcat',
  'bonobo',
  'buffalo',
  'bunny',
  'butterfly',
  'camel',
  'cat',
  'caterpillar',
  'catfish',
  'cheetah',
  'chimpanzee',
  'chipmunk',
  'cobra',
  'cockatoo',
  'cockroach',
  'codfish',
  'constrictor',
  'cougar',
  'coyote',
  'crab',
  'crocodile',
  'crow',
  'deer',
  'dingo',
  'dolphin',
  'donkey',
  'dragon',
  'dragonfly',
  'duck',
  'duckling',
  'eagle',
  'elk',
  'falcon',
  'ferret',
  'fish',
  'fox',
  'frog',
  'gazelle',
  'gecko',
  'gerbil',
  'gnu',
  'goat',
  'goose',
  'gopher',
  'gorilla',
  'grasshopper',
  'groundhog',
  'gull',
  'hamster',
  'hatchling',
  'hawk',
  'hedgehog',
  'hen',
  'hog',
  'hornet',
  'horse',
  'hound',
  'hyena',
  'iguana',
  'impala',
  'insect',
  'jackal',
  'jackrabbit',
  'jaguar',
  'kangaroo',
  'kingfisher',
  'kitten',
  'koala',
  'komodo',
  'ladybug',
  'lamb',
  'lemming',
  'lemur',
  'leopard',
  'lizard',
  'llama',
  'lynx',
  'magpie',
  'mallard',
  'mantis',
  'marmot',
  'meerkat',
  'mockingbird',
  'mole',
  'mongoose',
  'monkey',
  'monster',
  'moose',
  'mosquito',
  'nighthawk',
  'nightingale',
  'ocelot',
  'opossum',
  'orca',
  'osprey',
  'ostrich',
  'otter',
  'owl',
  'ox',
  'panda',
  'parakeet',
  'parrot',
  'partridge',
  'peacock',
  'pelican',
  'penguin',
  'pig',
  'pigeon',
  'platypus',
  'polecat',
  'porcupine',
  'possum',
  'puma',
  'python',
  'rabbit',
  'raccoon',
  'racer',
  'rat',
  'rattlesnake',
  'raven',
  'reindeer',
  'rhinoceros',
  'roadrunner',
  'robin',
  'rooster',
  'salmon',
  'sandpiper',
  'seal',
  'sealion',
  'shark',
  'sheep',
  'sidewinder',
  'skimmer',
  'skunk',
  'sloth',
  'snake',
  'sparrow',
  'spider',
  'squirrel',
  'starling',
  'stork',
  'swallow',
  'swan',
  'tadpole',
  'tapir',
  'tarantula',
  'termite',
  'toad',
  'tortoise',
  'toucan',
  'trout',
  'turkey',
  'turtle',
  'viper',
  'vulture',
  'wallaby',
  'walrus',
  'warthog',
  'wasp',
  'weasel',
  'weaver',
  'whale',
  'wolf',
  'wombat',
  'woodchuck',
  'woodpecker',
  'zebra',
  'bird',
  'bee'
]

const brand2list = [
  'burrito',
  'pizza',
  'hamburger',
  'steak',
  'tosti',
  'burger',
  'fries',
  'chips',
  'noodle',

  'bagel',
  'batter',
  'biscuit',
  'bread',
  'burger',
  'candy',
  'caramel',
  'caviar',
  'chocolate',
  'cider',
  'cocoa',
  'cream',
  'croissant',
  'crumble',
  'cuisine',
  'dessert',
  'dish',
  'drink',
  'food',
  'glaze',
  'grill',
  'ice',
  'juice',
  'marinade',
  'meat',
  'milk',
  'mousse',
  'muffin',
  'mushroom',
  'olive',
  'omelette',
  'pan',
  'pasta',
  'paste',
  'pastry',
  'pudding',
  'raclette',
  'recipe',
  'rice',
  'salad',
  'sandwich',
  'sauce',
  'seasoning',
  'soda',
  'soup',
  'soy',
  'spice',
  'stew',
  'syrup',
  'tartar',
  'taste',
  'toast',
  'waffle',
  'water',
  'wheat',
  'wok',
  'yeast',
  'yogurt',
  'basil',
  'cayenne',
  'cinnamon',
  'coriander',
  'curry',
  'ginger',
  'lemon',
  'mint',
  'paprika',
  'parsley',
  'pepper',
  'salt',
  'sugar',
  'thyme',
  'nutmeg',
  'oregano',
  'rosemary',
  'sesame',

  'chicken',
  'cow',
  'duck',
  'bee',
  'horse',
  'cat',
  'dog',
  'cattle',
  'beef',

  'coffee',
  'cookie',
  'tea',
  'cola',
  'lemonade',
  'wine',
  'liquor',
  'bourbon',
  'brandy',
  'gin',
  'liqueur',
  'rum',
  'scotch',
  'tequila',
  'vodka',
  'whiskey',
  'cognac',
  'cake',
  'cheese',
  'egg',

  'tomato',
  'broccoli',
  'spinach',
  'bean',
  'potato',

  'apple',
  'apricot',
  'avocado',
  'banana',
  'berry',
  'cantaloupe',
  'cherry',
  'citron',
  'citrus',
  'coconut',
  'date',
  'fig',
  'grape',
  'guava',
  'kiwi',
  'lemon',
  'lime',
  'mango',
  'melon',
  'papaya',
  'peach',
  'pear',
  'pineapple',
  'plum',
  'prune',
  'raisin',
  'raspberry',
  'tangerine',

  'butter',
  'chili',
  'garlic',
  'honey',
  'ketchup',
  'margarine',
  'mayonnaise',
  'mustard',
  'oil',
  'onion',
  'pesto',
  'relish',
  'salsa',
  'vinegar',
  'wasabi',

  'bulldozer',
  'drywall',
  'granite',

  'clothing',
  'clothes',
  'kitchen',
  'king',
  'dishwasher',
  'antique',
  'art',
  'appliances',
  'refridgerator',
  'oven',

  'bag',
  'ball',
  'band',
  //  'knee', 'nose', 'foot', 'arm', 'muscle', 'nail', 'neck', 'head', 'heart', 'hand', 'eye', 'face', 'hair', 'ear', 'leg', 'chest', 'chin', 'thumb',
  'banner',
  'poster',
  'circle',
  'square',
  'triangle',

  'guitar',
  'piano',
  'accordion',
  'flute',
  'drum',
  'bongo',
  'clarinet',
  'harp',
  'trumpet',
  'trombone',
  'tuba',
  'violin',
  'xylophone',
  'whistle',
  'keyboard',

  'knife',
  'banquette',
  'bench',
  'chair',
  'couch',
  'loveseat',
  'pouf',
  'sofa',
  'stool',

  'film',
  'stunt',

  'actor',
  'clown',
  'magician',
  'designer',
  'programmer',

  'wood',
  'bamboo',
  'birch',
  'cedar',
  'mahogany',
  'maple',
  'oak',
  'pine',

  'archer',
  'athlete',
  'badminton',
  'bicycle',
  'canoe',
  'club',
  'coach',
  'compete',
  'crew',
  'cyclist',
  'dart',
  'defense',
  'fencing',
  'fitness',
  'frisbee',
  'goalie',
  'golfer',
  'gymnast',
  'hockey',
  'javelin',
  'jumper',
  'karate',
  'kayak',
  'kite',
  'kiting',
  'lacrosse',
  'olympics',
  'racer',
  'referee',
  'rower',
  'scuba diver',
  'skiing',
  'skie',
  'slalom',
  'sledder',
  'snowboard',
  'soccer',
  'squash',
  'stick',
  'surfer',
  'swimmer',
  'target',
  'tennis',
  'triathlon',
  'umpire',
  'wrestler',

  'pilot',
  'flight',
  'bagage',
  'trip',
  'passenger',

  'filament',
  'motor',
  'printer',
  'machine',
  'parts',

  'pearls',
  'equipment',
  'coin',
  'gold',
  'silver',
  'jewelry',
  'metal',
  'elevator',
  'basket',
  'bath',
  'bed',
  'bell',
  'blade',
  'board',
  'boat',
  'book',
  'boot',
  'bottle',
  'box',
  'brake',
  'branch',
  'brick',
  'bridge',
  'brush',
  'bucket',
  'bulb',
  'camera',
  'card',
  'cart',
  'carriage',
  'chain',
  'clock',
  'cloud',
  'coat',
  'collar',
  'comb',
  'cord',
  'cup',
  'curtain',
  'cushion',
  'door',
  'drawer',
  'dress',
  'engine',
  'feather',
  'flag',
  'floor',
  'fork',
  'glove',
  'hammer',
  'hat',
  'hook',
  'horn',
  'jewel',
  'kettle',
  'key',
  'knot',
  'leaf',

  'bike',
  'train',
  'car',
  'cabriolet',
  'convertible',
  'coupe',
  'hotrod',
  'hybrid',
  'limo',
  'roadster',
  'taxi',
  'truck',
  'lorry',

  'gaming',
  'game',
  'console',
  'controller',
  'toy',
  'costume',
  'lock',
  'map',
  'parcel',
  'pen',
  'pencil',
  'picture',
  'pin',
  'pipe',
  'plane',
  'plate',
  'pocket',
  'rail',
  'ring',
  'roof',
  'root',
  'sail',
  'school',
  'scissors',
  'sheep',
  'shelf',
  'ship',
  'freeze',
  'shirt',
  'shoe',
  'snake',
  'sock',
  'spade',
  'sponge',
  'spoon',
  'spring',
  'stamp',
  'star',
  'stem',
  'store',
  'street',
  'sun',
  'table',
  'tail',
  'pie',
  'ticket',
  'toe',
  'tongue',
  'tooth',
  'town',
  'train',
  'tray',
  'tree',
  'trousers',
  'beach umbrella',
  'umbrella',
  'wall',
  'watch',
  'wheel',
  'window',
  'wing',
  'wire'
]

const // location words to put behind noun to make it unique, TODO split between food only and rest
  locations = [
    'community',
    'organization',
    'environment',
    'restaurant',
    'shop',
    'service',
    'city',
    'court',
    'office',
    'lounge',
    'company',
    'mart',
    'island',
    'basin',
    'farm',
    'garden',
    'house',
    'world',
    'universe',
    'galaxy',
    'oasis',
    'boutique',
    'bastion',
    'castle',
    'citadel',
    'keep',
    'moat',
    'outpost',
    'department',

    'abbey',
    'airport',
    'arch',
    'arena',
    'armory',
    'bakery',
    'bank',
    'barn',
    'barracks',
    'bridge',
    'bunker',
    'cabana',
    'cafe',
    'capitol',
    'cathedral',
    'chalet',
    'chapel',
    'chateau',
    'church',
    'cinema',
    'cottage',
    'crypt',
    'depot',
    'dome',
    'dormitory',
    'duplex',
    'embassy',
    'factory',
    'fort',
    'fortress',
    'foundry',
    'gallery',
    'garage',
    'hall',
    'hangar',
    'hospital',
    'hostel',
    'hotel',
    'jail',
    'kiosk',
    'laboratory',
    'library',
    'lodge',
    'mall',
    'manor',
    'marina',
    'market',
    'mill',
    'monastery',
    'monument',
    'motel',
    'museum',
    'observatory',
    'pagoda',
    'palace',
    'pavilion',
    'plant',
    'prison',
    'refinery',
    'restaurant',
    'school',
    'shed',
    'shrine',
    'silo',
    'skyscraper',
    'spire',
    'stable',
    'stadium',
    'station',
    'store',
    'temple',
    'terminal',
    'theater',
    'theater',
    'tower',
    'triplex',
    'university',
    'vault',
    'fjord',
    'glacier',
    'harbor',
    'vulcano',
    'land',
    'spring',
    'beach',

    'bookcase',
    'bookshelf',
    'buffet',
    'bureau',
    'cabinet',
    'chest'
  ]

// const
//   brand3list = [
//     'repair', 'massage', 'administration', 'engineering', 'messaging',
//     'analysis', 'strategy', 'communication', 'advertising', 'transporting', 'presentation', 'distributing',
//     'army', 'management', 'doctor',
//     'construction', 'insurance', 'analytics', 'investment', 'technology', 'direction', 'imagination', 'percentage', 'recommendation', 'employment', 'atmosphere', 'awareness',
//     'candidate', 'investor']

// TODO move to AMCore
const doKeyInc = (obj, key) => {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    obj[key] = { count: 0 }
  }
  obj[key].count++
  return obj[key]
}

let instance = null

class WordGeneration {
  static getInstance () {
    if (instance) {
      return instance
    }
    instance = new WordGeneration()
    return instance
  }

  constructor () {
    this.wordEndings = {}

    const skipCat = ['NOUN.ANIMAL', 'NOUN.PLANT', 'NOUN.COMMUNICATION', 'NOUN.LOCATION']

    const scan = tree => {
      if (Array.isArray(tree)) {
        for (const word of tree) {
          for (let i = 3; i < Math.min(word.length - 2, 10); i++) {
            const rec = doKeyInc(this.wordEndings, word.substring(word.length - i).toLowerCase())
            rec.preLetters = rec.preLetters || {}

            for (let j = 2; j < 4; j++) {
              const pos = word.length - i - j
              if (pos > 2) {
                doKeyInc(rec.preLetters, word.substr(pos, j).toLowerCase())
              }
            }
          }
        }
      } else {
        for (const cat of Object.keys(tree)) {
          if (skipCat.indexOf(cat) === -1) {
            scan(tree[cat])
          }
        }
      }
    }
    scan(wordnetData)

    // let combiAnimals = []
    // for (let word of brand2list) {
    //   this.addCombiWords(combiAnimals, word, animals, 4)
    // }
    // console.log('combianimals: ', combiAnimals)
  }

  // from stackoverflow
  toPlural = (wordIn, revert) => {
    const plural = {
      '(quiz)$': '$1zes',
      '^(ox)$': '$1en',
      '([m|l])ouse$': '$1ice',
      '(matr|vert|ind)ix|ex$': '$1ices',
      '(x|ch|ss|sh)$': '$1es',
      '([^aeiouy]|qu)y$': '$1ies',
      '(hive)$': '$1s',
      '(?:([^f])fe|([lr])f)$': '$1$2ves',
      '(shea|lea|loa|thie)f$': '$1ves',
      sis$: 'ses',
      '([ti])um$': '$1a',
      '(tomat|potat|ech|her|vet)o$': '$1oes',
      '(bu|pu)s$': '$1ses',
      '(alias)$': '$1es',
      '(ax|test)is$': '$1es',
      '(us)$': '$1es',
      '([^s]+)$': '$1s'
    }

    const singular = {
      '(quiz)zes$': '$1',
      '(matr)ices$': '$1ix',
      '(vert|ind)ices$': '$1ex',
      '^(ox)en$': '$1',
      '(alias)es$': '$1',
      '(vir)i$': '$1us',
      '(cris|ax|test)es$': '$1is',
      '(shoe)s$': '$1',
      '(o)es$': '$1',
      '(bus)es$': '$1',
      '([m|l])ice$': '$1ouse',
      '(x|ch|ss|sh)es$': '$1',
      '(m)ovies$': '$1ovie',
      '(s)eries$': '$1eries',
      '([^aeiouy]|qu)ies$': '$1y',
      '([lr])ves$': '$1f',
      '(tive)s$': '$1',
      '(hive)s$': '$1',
      '(li|wi|kni)ves$': '$1fe',
      '(shea|loa|lea|thie)ves$': '$1f',
      '(^analy)ses$': '$1sis',

      // TODO gives stack overflow on words like proctopus?
      // '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': '$1$2sis',
      '([ti])a$': '$1um',
      '(n)ews$': '$1ews',
      '(h|bl)ouses$': '$1ouse',
      '(corpse)s$': '$1',
      pus$: 'pus',
      '(us)es$': '$1',
      s$: ''
    }

    const irregular = {
      move: 'moves',
      foot: 'feet',
      goose: 'geese',
      sex: 'sexes',
      child: 'children',
      man: 'men',
      tooth: 'teeth',
      person: 'people'
    }

    const uncountable = [
      'sheep',
      'fish',
      'deer',
      'moose',
      'series',
      'species',
      'money',
      'rice',
      'information',
      'equipment',
      'clothes'
    ]

    // save some time in the case that singular and plural are the same
    if (uncountable.indexOf(wordIn.toLowerCase()) >= 0) {
      return wordIn
    }

    let pattern, replace
    // check for irregular forms
    for (const word in irregular) {
      if (revert) {
        pattern = new RegExp(irregular[word] + '$', 'i')
        replace = word
      } else {
        pattern = new RegExp(word + '$', 'i')
        replace = irregular[word]
      }
      if (pattern.test(wordIn)) {
        return wordIn.replace(pattern, replace)
      }
    }

    let array
    if (revert) {
      array = singular
    } else {
      array = plural
    }

    // check for matches using regular expressions
    for (const reg in array) {
      pattern = new RegExp(reg, 'i')

      if (pattern.test(wordIn)) {
        return wordIn.replace(pattern, array[reg])
      }
    }

    return wordIn
  }

  getWordInfo = word => {
    word = word.toUpperCase()
    const wordResults = []
    const scan = (catName, tree) => {
      if (Array.isArray(tree)) {
        if (AMCore.binSearch(tree, word) !== -1) {
          wordResults.push(catName)
        }
      } else {
        for (const cat of Object.keys(tree)) {
          scan(cat, tree[cat])
        }
      }
    }
    scan('', wordnetData)

    if (wordResults.length === 0) {
      const singular = this.toPlural(word, true).toUpperCase()
      if (singular !== word) {
        return this.getWordInfo(singular)
      }
    }
    return wordResults
  }

  getRandomCombiWord = (wordList, noun, exp = 1.0) => {
    const list = wordList.map(w => ({
      weight: 1 + (noun[0] === w[0]) * wordList.length * (3 + (noun[1] === w[1]) * 3) + Math.pow(1 / w.length, 2) * 10,
      word: w
    }))
    return random(list, exp).word
  }

  getRandomAdjective = noun => {
    return this.getRandomCombiWord(positiveAdjectives, noun)
  }

  getRandomShortAdjective = () => {
    const list = positiveAdjectives.map(w => ({
      weight: Math.pow(1 / w.length, 3),
      word: w
    }))
    return random(list).word
  }

  getRandomNoun = (plural = 0, noun) => {
    let result
    // if (Math.random() < 0.9) {
    result = noun || random(brand2list)
    // } else {
    //   result = noun || random(wordnetData.NOUNS['NOUN.' + random(['ANIMAL', 'FOOD', 'PLANT'])], 1.5).toLowerCase()
    // }
    if (plural === 2 || (plural !== 0 && Math.random() < 0.5)) {
      result = this.toPlural(result)
      // console.log(result, ':', this.getWordInfo(result))
    }
    return result
  }

  addCombiWords = (combiWords, noun, list, minCount = 1, minbothmax = 1, seperator = '') => {
    for (let w of list) {
      w = w.toLowerCase()
      if (w.length > 3 && w.length <= noun.length + 1) {
        const scanFrom = i => {
          for (let j = 0; j < noun.length; j++) {
            if (w[i] === noun[j]) {
              let foundCombi = true
              let overlapCount = 0
              if (i === 0) {
                let l = i
                overlapCount = noun.length - j
                if (j + w.length <= noun.length || overlapCount < minCount) {
                  foundCombi = false
                } else {
                  for (let k = j; k < noun.length; k++) {
                    if (w[l++] !== noun[k]) {
                      foundCombi = false
                      break
                    }
                  }
                }
                if (foundCombi) {
                  // combiWords.push({ weight: Math.pow(noun.length - j, 2), word: noun.substring(0, j) + w })
                  combiWords.push({
                    weight: Math.pow(overlapCount, 2),
                    word:
                      noun.substring(0, j) +
                      '|' +
                      seperator +
                      w.substring(0, overlapCount) +
                      '[' +
                      w.substring(overlapCount) +
                      ']'
                  })
                }
              } else {
                let l = 0
                overlapCount = w.length - (i - j)
                if (overlapCount < minCount || overlapCount >= w.length) {
                  foundCombi = false
                } else {
                  for (let k = i - j; k < w.length; k++) {
                    if (noun[l++] !== w[k]) {
                      foundCombi = false
                      break
                    }
                  }
                }
                if (foundCombi) {
                  combiWords.push({
                    weight: Math.pow(overlapCount, 2),
                    word:
                      '[' +
                      w.substring(0, w.length - overlapCount) +
                      ']' +
                      w.substring(w.length - overlapCount) +
                      '|' +
                      noun.substring(j + 1)
                  })
                }
              }
            }
          }
        }
        if (minbothmax >= 1) {
          scanFrom(0)
        }
        if (minbothmax <= 1) {
          scanFrom(w.length - 1)
        }
      }
    }
  }

  addCombiExtensions = (combiWords, word) => {
    const words = {}
    for (const w in this.wordEndings) {
      const rec = this.wordEndings[w]
      for (const ending in rec.preLetters) {
        if (word.endsWith(ending)) {
          const newRec = doKeyInc(words, word + '[' + w + ']')
          // TODO same syllable count => more weight
          newRec.count = Math.max(newRec.count, ending.length * rec.preLetters[ending].count * rec.count)
        }
      }
    }
    // TODO ending in dae never works, remove strange construction
    // upscore positive stuff (revo)utions (orga)nization, (fan)tastic, syllables should match postive word more points for matching vowels
    for (const word in words) {
      const count = words[word].count
      if (count > 1000) {
        combiWords.push({
          weight: count / 30000,
          word
        })
      }
    }
  }

  addAutoExtensions = (combiWords, noun) => {
    const extensions = {
      ie$: '[io]',
      a$: 'a[lia]',
      '(n|l)$': '$&[esque]',
      // '([^aeiouy])$': '$1ution',
      // '([^(?:a|e|i|o|u)])e$': '$1ing',
      '(e)l?$': '$1[lous]',
      '(s)$': '$1[tic]',
      'li|(a|e|i|o|u|y)$': '$1[licious]',
      '(f)$': '$1[ul]',
      '(b)$': '$1[le]',
      s$: '[z]'
    }
    // ness on singular (cookie)ness, good in combination with "your cookieness" " my cookieness" "good cookieness"
    // ology // to study the stuff hard to apply
    // versity (cookie)versity
    // verse (cookie)verse
    // tacular // (bike)tacular hard to apply from spectacular
    // osis (lion)osis
    // ness (grape)ness (cookie)ness // to be it
    // cation (cookie)fication (lion)ation (bike)=>bication (apricot)ation
    // fication (sauna)fication (cookie)fication NO(bikefication) (silent e rule) only (tosti)fication
    //  agram one sylable(cat)agram (duck)agram (cord)agram (bus)agram (bike)agram
    //   gram two sylable (octo)gram (table)gram NO(house)gram (though houseagram does exist, house is single sylable because the e is silent)
    // graphy emy amy
    // ly
    // able
    // bi => bee  wasabee ? can't find a lot zombee nairobee thats it maybee use it
    for (const reg in extensions) {
      const pattern = new RegExp(reg, 'i')
      if (pattern.test(noun)) {
        const replace = extensions[reg]
        combiWords.push({
          weight: 0.25 + 1 / (2 + replace.length),
          word: noun.replace(pattern, replace)
        })
      }
    }
  }

  getAllCombiWords = (combiWords, noun) => {
    const plural = this.toPlural(noun)
    combiWords.push({
      weight: 12,
      word: _ => '[' + this.getRandomAdjective(noun) + '] ' + plural
    })
    combiWords.push({
      weight: 6,
      word: _ => noun + ' [' + this.getRandomCombiWord(locations, noun, 1.5) + ']'
    })
    combiWords.push({
      weight: 2,
      word: _ => noun + ' [' + this.getRandomCombiWord(animals, noun, 2.0) + ']'
    })
    if (noun.indexOf(' ') === -1) {
      // combiWords.push({ weight: 0.05, word: _ => this.getRandomShortAdjective() + ' ' + this.getRandomNoun(1, noun) + ' ' + random(locations, 1.5) })
      // combiWords.push({ weight: 0.05, word: _ => this.getRandomShortAdjective() + ' ' + this.getRandomNoun(1, noun) + ' ' + random(animals, 1.5) })

      this.addCombiWords(combiWords, noun, locations, 2, 2)
      this.addCombiWords(combiWords, noun, animals, 2, 2)
      this.addCombiWords(combiWords, noun, positiveAdjectives, 2, 0)
      // this.addCombiWords(combiWords, noun, availableTLDs, 2, 2, '.')
      // this.addCombiWords(combiWords, noun, wordnetData.NOUNS['NOUN.PROCESS'], 2, 2)
      for (let ext of availableTLDs) {
        ext = ext.toLowerCase()
        if (noun.endsWith(ext) && noun.length > ext.length + 2) {
          const word = noun.substring(0, noun.length - ext.length) + '[.]' + ext
          combiWords.push({
            weight: 13,
            word
          })
          // console.log('TLD match: ', word)
        }
      }
    }

    // combiWords.push({ weight: 1000000000, word: noun + 'ness' })
    this.addCombiExtensions(combiWords, noun)
    this.addAutoExtensions(combiWords, noun)

    // reweight all combi's based on length
    for (const cw of combiWords) {
      if (cw.word.length) {
        cw.weight *= (1 / Math.max(6, cw.word.length)) * 6
      }
    }

    // console.log(noun + ':', combiWords)
    return combiWords
  }
}

export default WordGeneration
