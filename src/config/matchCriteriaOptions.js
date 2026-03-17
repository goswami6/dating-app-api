// All dropdown/option values for match criteria fields
// Used by GET /api/config/match-criteria-options

const matchCriteriaOptions = {
  relationship_goals: [
    { title: "Long-term partner", icon: "💕" },
    { title: "Long-term, open to short", icon: "😍" },
    { title: "Short-term, open to long", icon: "🥂" },
    { title: "Short-term fun", icon: "🎉" },
    { title: "New friends", icon: "👋" },
    { title: "Still figuring it out", icon: "🤔" },
    { title: "Friendship", icon: "🤝" },
    { title: "Love", icon: "❤️" }
  ],

  pronouns: [
    "She", "Her", "He", "Him", "They", "Them", "Xe", "Xem", "Fae", "Faer",
    "E", "Ey", "Em", "Eir", "Ze", "Hir", "Zir", "Zie", "Hers", "His", "Theirs"
  ],

  languages: [
    "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "ASL", "Assamese",
    "Aymara", "Azerbaijani", "Bambara", "Basque", "Belarusian", "Bengali",
    "Bhojpuri", "Bosnian", "Breton", "Bulgarian", "Burmese", "Cantonese",
    "Catalan", "Cebuano", "Chichewa", "Corsican", "Croatian", "Czech",
    "Danish", "Dhivehi", "Dogri", "Dutch", "English", "Esperanto", "Estonian",
    "Ewe", "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian",
    "German", "Greek", "Guarani", "Gujarati", "Haitian Creole", "Hausa",
    "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo",
    "Ilocano", "Indonesian", "Irish", "Italian", "Japanese", "Javanese",
    "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Konkani", "Korean", "Krio"
  ],

  zodiac_signs: [
    "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini",
    "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"
  ],

  education_levels: [
    "High School", "Bachelors", "Masters", "Ph.D.",
    "Trade School", "In college", "In grad school"
  ],

  family_plan_options: [
    "I want children",
    "I don't want children",
    "I have children and want more",
    "I have children and don't want more",
    "Not sure yet"
  ],

  communication_styles: [
    "Phone caller",
    "Video chatter",
    "I'm slow to answer on WhatsApp",
    "Bad texter",
    "Better in person"
  ],

  love_styles: [
    "Thoughtful gestures",
    "Presents",
    "Touch",
    "Compliments",
    "Time together"
  ],

  pet_options: [
    "Dog", "Cat", "Reptile", "Amphibian", "Bird", "Fish",
    "Don't have but love", "Other", "Turtle", "Hamster",
    "Rabbit", "Pet-free", "All the pets", "Want a pet", "Allergic to pets"
  ],

  drinking_options: [
    "Not for me", "Sober", "Sober curious",
    "On special occasions", "Socially on weekends", "Most Nights"
  ],

  smoking_options: [
    "Social smoker", "Smoker when drinking",
    "Non-smoker", "Smoker", "Trying to quit"
  ],

  workout: [
    "Everyday", "Often", "Sometimes", "Never"
  ],

  social_media_options: [
    "Influencer status", "Socially active",
    "Off the grid", "Passive scroller"
  ],

  sexual_orientations: [
    { title: "Straight", description: "A person attracted to opposite gender" },
    { title: "Gay", description: "Attracted to same gender" },
    { title: "Lesbian", description: "Woman attracted to women" },
    { title: "Bisexual", description: "Attracted to more than one gender" },
    { title: "Asexual", description: "Does not experience sexual attraction" },
    { title: "Demisexual", description: "Attraction after emotional connection" },
    { title: "Pansexual", description: "Attracted regardless of gender" },
    { title: "Queer", description: "Spectrum of orientations" },
    { title: "Bicurious", description: "Curious about more than one gender" },
    { title: "Aromantic", description: "No romantic attraction" },
    { title: "Not listed", description: "Tell us what's missing" }
  ],

  gender: ["Male", "Female", "Non-binary", "Other", "all"],

  // Text input fields (no predefined options, just placeholders)
  text_fields: {
    height: { placeholder: "e.g. 5'8\" or 173cm", type: "string" },
    school: { placeholder: "e.g. Delhi University", type: "string" },
    job_title: { placeholder: "e.g. Software Engineer", type: "string" },
    living_in: { placeholder: "e.g. Mumbai, India", type: "string" }
  }
};

module.exports = matchCriteriaOptions;
