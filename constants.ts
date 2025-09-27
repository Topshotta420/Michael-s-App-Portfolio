import type { Plan } from './types';

export const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    priceDetails: 'Forever',
    features: [
      '1 book per week',
      '1 of 5 rotating characters weekly',
      '1 of 5 rotating storylines weekly',
      'Standard AI-generated illustrations',
      '4-page stories',
    ],
    cta: 'Start Creating',
  },
  {
    name: 'Standard',
    price: '$9.99',
    priceDetails: '/ month',
    features: [
      'Up to 10 books per month',
      '20 characters & 20 storylines',
      'Create up to 5 custom characters',
      'Create up to 5 custom storylines',
      'High-quality illustrations',
      'Longer 6-page stories',
    ],
    cta: 'Get Started',
    isPopular: true,
  },
  {
    name: 'Premium',
    price: '$19.99',
    priceDetails: '/ month',
    features: [
      'Unlimited books',
      '50+ character & storyline library',
      'Unlimited custom characters & plots',
      'Collaborate with AI on plots',
      'Upload your own images for characters',
      'Epic 8-page stories',
    ],
    cta: 'Start 3-Day Free Trial',
  },
];

export const FREE_CHARACTERS_POOL = [
    'Brave Knight', 'Wise Owl', 'Cheeky Monkey', 'Giggling Ghost', 'Friendly Dragon', 'Curious Cat', 'Speedy Rabbit', 'Dancing Dinosaur', 'Singing Star', 'Sleepy Sloth', 'Mischievous Pixie', 'Explorer Fox'
];

export const CHARACTERS: { [key in 'Standard' | 'Premium']: string[] } = {
    Standard: [
        ...FREE_CHARACTERS_POOL.slice(0, 8), 'Pirate Captain', 'Ninja Squirrel', 'Detective Dog', 'Space Adventurer', 'Magical Mermaid', 'Grumpy Gnome', 'Time-Traveling Turtle', 'Chef Bear', 'Artist Fox', 'Musical Robot', 'Superhero Bear', 'Fairy Princess'
    ],
    Premium: [
        'Brave Knight', 'Wise Owl', 'Cheeky Monkey', 'Giggling Ghost', 'Friendly Dragon', 'Curious Cat', 'Speedy Rabbit', 'Dancing Dinosaur', 'Singing Star', 'Sleepy Sloth', 'Mischievous Pixie', 'Explorer Fox',
        'Pirate Captain', 'Ninja Squirrel', 'Detective Dog', 'Space Adventurer', 'Magical Mermaid', 'Grumpy Gnome', 'Time-Traveling Turtle', 'Chef Bear', 'Artist Fox', 'Musical Robot', 'Superhero Bear', 'Fairy Princess',
        'Scientist Sloth', 'Weather-Wizard Wolf', 'Underwater Octopus Explorer', 'Mountain-Climbing Goat', 'Jungle-Explorer Jaguar', 'Shy Yeti', 'Laughing Hyena', 'Gardener Badger', 'Pilot Penguin', 
        'Construction Worker Beaver', 'Doctor Dolphin', 'Teacher Toucan', 'Librarian Lion', 'Firefighter Frog', 'Astronaut Aardvark', 'Baker Bunny', 'Dancer Dragonfly', 'Singer Canary', 'Photographer Peacock', 
        'Magician Moth', 'King Koala', 'Queen Quokka', 'Inventor Impala', 'Jester Jellyfish', 'Storyteller Swan', 'Dream-Weaver Spider'
    ]
};

export const FREE_STORYLINES_POOL = [
    'The Lost Treasure', 'The Big Race', 'A Magical Friendship', 'The Mystery of the Missing Toy', 'The Day the Animals Talked', 'The Sleepy Volcano', 'The Secret of the Glimmering Cave', 'The Flying Bicycle', 'The Birthday Surprise', 'The Naughty Raincloud', 'The Grumpy Cloud Who Learned to Rain', 'The Little Star Who Was Afraid of the Dark'
];

export const STORYLINES: { [key in 'Standard' | 'Premium']: string[] } = {
    Standard: [
        ...FREE_STORYLINES_POOL,
        'A Journey to the Moon', 'The Underwater Kingdom', 'The Case of the Stolen Crown', 'The Invisible Friend', 'The Enchanted Forest', 'The Robot Who Learned to Laugh', 'The Quest for the Sunstone', 'The Dragon with a Sweet Tooth'
    ],
    Premium: [
        ...FREE_STORYLINES_POOL,
        'A Journey to the Moon', 'The Underwater Kingdom', 'The Case of the Stolen Crown', 'The Invisible Friend', 'The Enchanted Forest', 'The Robot Who Learned to Laugh', 'The Quest for the Sunstone', 'The Dragon with a Sweet Tooth',
        'The importance of sharing', 'Learning to say sorry', 'The power of kindness', 'Why it\'s okay to be different', 'Overcoming a fear of the dark', 'The joy of making new friends', 'The magic of reading a book', 
        'Why we should listen to our parents', 'The adventure of trying new foods', 'Learning to be patient', 'The fun of tidying up', 'A story about being brave at the doctor', 'The magic of saying "please" and "thank you"', 
        'A tale about not giving up', 'The importance of teamwork', 'A story about a lost pet finding its way home', 'The day everything was upside down', 'The mystery of the magical garden', 'A journey to the land of dreams', 
        'The secret life of toys', 'A competition where everyone wins', 'The first day of school', 'Learning to ride a bike', 'A story about a magical, color-changing chameleon', 'The silly symphony of the jungle', 
        'A quest to find the perfect bedtime story', 'The cloud that made funny shapes', 'The little seed that grew into a giant tree', 'The river that flowed with chocolate milk', 'The grumpy bear who learned to hug'
    ]
};