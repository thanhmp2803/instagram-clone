import { Post } from '@types'

const usernames = [
  'pthanh2803',
  'pthanh_2',
  'thanh_dev',
  'travel_lover',
  'foodie_hcm',
  'gym_warrior',
  'nature_photographer',
  'study_buddy',
  'music_producer',
  'weekend_chef',
  'artist_soul',
  'tech_enthusiast',
  'book_worm',
  'coffee_addict',
  'sunset_chaser',
  'street_photographer',
  'yoga_master',
  'gamer_life',
  'fashion_blogger',
  'pet_lover',
  'mountain_climber',
  'beach_vibes',
  'city_explorer',
  'home_cook',
  'fitness_freak',
  'movie_buff',
  'dance_queen',
  'plant_parent',
  'vintage_collector',
  'night_owl',
  'early_bird',
  'minimalist_life',
  'adventure_seeker',
  'art_curator',
  'wine_connoisseur',
  'biker_gang',
  'surfer_dude',
  'chef_master',
  'designer_eye',
  'coder_ninja',
  'startup_founder',
  'freelancer_life',
  'digital_nomad',
  'content_creator',
  'influencer_hub',
  'entrepreneur',
  'student_life',
  'teacher_vibes',
  'doctor_daily',
  'engineer_mind',
  'architect_vision',
]

const captions = [
  'Enjoying the sunny day 🌞',
  'Coffee time ☕',
  'Working on my new project 💻 #coding #javascript',
  'Beautiful sunset at the beach 🌅 Perfect way to end the day!',
  'Amazing pho bo at local restaurant 🍜 Best food in Saigon!',
  'Leg day complete! 💪 No pain, no gain #fitness #motivation',
  'Morning mist in Da Lat 🌫️ Nature never ceases to amaze me',
  'Late night study session 📚 Finals week is here!',
  'Working on my latest beat 🎵 Drop coming soon! #music #producer',
  'Homemade pizza night 🍕 Nothing beats cooking with family!',
  'Perfect weather for a morning run 🏃‍♂️ #fitness #morningvibes',
  'New art piece finished! 🎨 What do you think?',
  'Saturday night gaming session 🎮 #gaming #weekend',
  'Fresh flowers from the garden 🌸 #flowers #nature',
  'Trying out a new recipe today 👨‍🍳 #cooking #foodie',
  'Concert was absolutely amazing! 🎤 #music #live',
  'Reading by the window ☕📖 Perfect Sunday afternoon',
  'Yoga session complete 🧘‍♀️ Mind, body, soul',
  'New haircut, new me! ✂️ #selfie #newlook',
  'Weekend market finds 🛍️ #shopping #local',
  'Hiking trail adventure 🥾 #hiking #nature',
  'Delicious brunch with friends 🥐 #brunch #friends',
  'Working late but loving it 💼 #hustle #worklife',
  'Perfect latte art ☕ #coffee #art',
  'Beach day vibes 🏖️ #beach #summer',
  'New book just arrived 📚 #reading #books',
  'Sunset photography session 📸 #photography #sunset',
  'Gym session done ✅ #fitness #workout',
  'Rainy day mood 🌧️ #rain #cozy',
  'Cooking experiment success! 🍳 #cooking #homemade',
  'Morning meditation 🧘 #mindfulness #peace',
  'New playlist dropping soon 🎵 #music #spotify',
  'Study grind never stops 📝 #student #education',
  'Weekend project complete 🔨 #diy #weekend',
  'Fresh market vegetables 🥕 #healthy #fresh',
  'Late night coding session 💻 #code #developer',
  'Perfect weather for cycling 🚴‍♂️ #cycling #exercise',
  'Art gallery visit 🖼️ #art #culture',
  'Homemade bread success! 🍞 #baking #homemade',
  'Mountain view spectacular 🏔️ #mountain #view',
  'New camera lens test 📷 #photography #gear',
  'Dancing the night away 💃 #dance #fun',
  'Garden progress update 🌱 #gardening #plants',
  'Movie night setup ready 🍿 #movie #home',
  'Morning coffee ritual ☕ #coffee #morning',
  'New skateboard tricks 🛹 #skateboard #tricks',
  'Bookstore treasure hunt 📖 #books #bookstore',
  'Healthy smoothie bowl 🥣 #healthy #smoothie',
  'City lights at night 🌃 #city #lights',
  'Weekend farmers market 🥬 #market #local',
]

const timeOptions = [
  ['minutes', 1],
  ['minutes', 5],
  ['minutes', 15],
  ['minutes', 30],
  ['hours', 1],
  ['hours', 2],
  ['hours', 3],
  ['hours', 6],
  ['hours', 12],
  ['days', 1],
  ['days', 2],
  ['days', 3],
  ['days', 5],
  ['weeks', 1],
  ['weeks', 2],
  ['months', 1],
]

const generateRandomPost = (
  id: number,
  t?: (key: string, options?: { count?: number }) => string,
): Post => {
  // Use deterministic selection based on ID instead of Math.random()
  const usernameIndex = (id - 1) % usernames.length
  const captionIndex = (id - 1) % captions.length
  const timeIndex = (id - 1) % timeOptions.length

  const randomUsername = usernames[usernameIndex]
  const randomCaption = captions[captionIndex]
  const [timeUnit, timeCount] = timeOptions[timeIndex]
  const randomTime = t
    ? t(`feed.time.${timeUnit}`, { count: timeCount as number })
    : `${timeCount} ${timeUnit} ago`

  // Use deterministic values based on ID
  const randomLikes = ((id * 37) % 1000) + 1
  const randomComments = ((id * 17) % 100) + 1

  return {
    id,
    username: randomUsername,
    avatar: '/images/conmeo.jpg',
    image: '/images/conmeo.jpg',
    caption: randomCaption,
    likes: randomLikes,
    comments: randomComments,
    time: randomTime,
  }
}

export const generatePostData = (
  t?: (key: string, options?: { count?: number }) => string,
): Post[] => {
  const posts: Post[] = []

  // Generate 1000 posts
  for (let i = 1; i <= 1000; i++) {
    posts.push(generateRandomPost(i, t))
  }

  return posts
}
