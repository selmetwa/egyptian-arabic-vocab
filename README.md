# Arabic Dialects Vocabulary API

15,099 Words across 4 Arabic dialects

Comprehensive vocabulary database including:
- **Darija (Moroccan Arabic)**: 2,376 words
- **Egyptian Arabic**: 6,314 words  
- **Levantine Arabic**: 2,511 words
- **Modern Standard Arabic**: 3,898 words

Each entry includes English translation, Arabic text, transliteration, and audio pronunciation URLs.

## Available Sections by Dialect

### Darija (Moroccan Arabic)
- adjectives_5, adverbs_5, animals_5, around_the_house_4, cars_and_other_transportation_5
- clothing_jewelry_and_accessories_5, family_5, food_and_drink_5, health_and_medicine_5
- language_5, life_and_death_5, numbers_6, recreation_and_relaxation_5
- school_and_education_5, verbs_5, weather_5, work_and_professions_4

### Egyptian Arabic  
- adjectives, adverbs, animals, around_the_house, cars_and_other_transportation
- clothing_jewelry_and_accessories, family, food_and_drink, health_and_medicine
- language, life_and_death, numbers, recreation_and_relaxation
- school_and_education, verbs, weather, work_and_professions

### Levantine Arabic
- adjectives_2, adverbs_2, animals_2, cars_and_other_transportation_2
- clothing_jewelry_and_accessories_2, family_2, food_and_drink_2, health_and_medicine_2
- language_2, life_and_death_2, numbers_2, recreation_and_relaxation_2
- school_and_education_2, the_human_body_and_describing_people_2
- verbs_2, weather_2, work_and_professions_2

### Modern Standard Arabic
- animals (limited vocabulary available)

### Legacy Egyptian Arabic Sections (Original Format)
- animals, vocabulary_from_around_the_house, city_and_transportation, clothing, colors
- education, emotions__and__personality_traits, food, geography, human_body
- mankind_and_kinship, media_and_the_arts, medicine, nature__and__weather
- religion, sports__and__hobbies, technology, time, work_and_money
- media, media_2, media_3, crime_and_punishment, government_and_politics, war

## API

### New Dialect Endpoints
Get vocabulary for specific Arabic dialects:

```
GET /vocab/:dialect/:section
GET /vocab/:dialect/all
```

**Available dialects**: `darija`, `egyptian`, `levantine`, `modern-standard-arabic`

#### Complete Endpoint List

##### 🇲🇦 Darija (Moroccan Arabic) - 18 endpoints
```
GET /vocab/darija/all
GET /vocab/darija/adjectives_5
GET /vocab/darija/adverbs_5
GET /vocab/darija/animals_5
GET /vocab/darija/around_the_house_4
GET /vocab/darija/cars_and_other_transportation_5
GET /vocab/darija/clothing_jewelry_and_accessories_5
GET /vocab/darija/family_5
GET /vocab/darija/food_and_drink_5
GET /vocab/darija/health_and_medicine_5
GET /vocab/darija/language_5
GET /vocab/darija/life_and_death_5
GET /vocab/darija/numbers_6
GET /vocab/darija/recreation_and_relaxation_5
GET /vocab/darija/school_and_education_5
GET /vocab/darija/verbs_5
GET /vocab/darija/weather_5
GET /vocab/darija/work_and_professions_4
```

##### 🇪🇬 Egyptian Arabic - 42 endpoints
```
GET /vocab/egyptian/all
GET /vocab/egyptian/adjectives
GET /vocab/egyptian/adverbs
GET /vocab/egyptian/animals
GET /vocab/egyptian/around_the_house
GET /vocab/egyptian/cars_and_other_transportation
GET /vocab/egyptian/city_and_transportation
GET /vocab/egyptian/clothing_jewelry_and_accessories
GET /vocab/egyptian/clothing
GET /vocab/egyptian/colors
GET /vocab/egyptian/crime_and_punishment
GET /vocab/egyptian/education
GET /vocab/egyptian/emotions__and__personality_traits
GET /vocab/egyptian/family
GET /vocab/egyptian/food_and_drink
GET /vocab/egyptian/food
GET /vocab/egyptian/geography
GET /vocab/egyptian/government_and_politics
GET /vocab/egyptian/health_and_medicine
GET /vocab/egyptian/human_body
GET /vocab/egyptian/language
GET /vocab/egyptian/life_and_death
GET /vocab/egyptian/mankind_and_kinship
GET /vocab/egyptian/media_2
GET /vocab/egyptian/media_3
GET /vocab/egyptian/media_and_the_arts
GET /vocab/egyptian/media
GET /vocab/egyptian/medicine
GET /vocab/egyptian/nature__and__weather
GET /vocab/egyptian/numbers
GET /vocab/egyptian/recreation_and_relaxation
GET /vocab/egyptian/religion
GET /vocab/egyptian/school_and_education
GET /vocab/egyptian/sports__and__hobbies
GET /vocab/egyptian/technology
GET /vocab/egyptian/time
GET /vocab/egyptian/verbs
GET /vocab/egyptian/vocabulary_from_around_the_house
GET /vocab/egyptian/war
GET /vocab/egyptian/weather
GET /vocab/egyptian/work_and_money
GET /vocab/egyptian/work_and_professions
```

##### 🇱🇧 Levantine Arabic - 19 endpoints
```
GET /vocab/levantine/all
GET /vocab/levantine/adjectives_2
GET /vocab/levantine/adverbs_2
GET /vocab/levantine/animals_2
GET /vocab/levantine/cars_and_other_transportation_2
GET /vocab/levantine/clothing_jewelry_and_accessories_2
GET /vocab/levantine/family_2
GET /vocab/levantine/food_and_drink_2
GET /vocab/levantine/health_and_medicine_2
GET /vocab/levantine/language_2
GET /vocab/levantine/life_and_death_2
GET /vocab/levantine/numbers_2
GET /vocab/levantine/recreation_and_relaxation_2
GET /vocab/levantine/school_and_education_2
GET /vocab/levantine/the_human_body_and_describing_people_2
GET /vocab/levantine/verbs_2
GET /vocab/levantine/weather_2
GET /vocab/levantine/work_and_professions_2
GET /vocab/levantine/work_and_professions
```

##### 📚 Modern Standard Arabic - 26 endpoints
```
GET /vocab/modern-standard-arabic/all
GET /vocab/modern-standard-arabic/animals
GET /vocab/modern-standard-arabic/city_and_transportation
GET /vocab/modern-standard-arabic/clothing
GET /vocab/modern-standard-arabic/colors
GET /vocab/modern-standard-arabic/crime_and_punishment
GET /vocab/modern-standard-arabic/education
GET /vocab/modern-standard-arabic/emotions__and__personality_traits
GET /vocab/modern-standard-arabic/food
GET /vocab/modern-standard-arabic/geography
GET /vocab/modern-standard-arabic/government_and_politics
GET /vocab/modern-standard-arabic/human_body
GET /vocab/modern-standard-arabic/mankind_and_kinship
GET /vocab/modern-standard-arabic/media_2
GET /vocab/modern-standard-arabic/media_3
GET /vocab/modern-standard-arabic/media_and_the_arts
GET /vocab/modern-standard-arabic/media
GET /vocab/modern-standard-arabic/medicine
GET /vocab/modern-standard-arabic/nature__and__weather
GET /vocab/modern-standard-arabic/religion
GET /vocab/modern-standard-arabic/sports__and__hobbies
GET /vocab/modern-standard-arabic/technology
GET /vocab/modern-standard-arabic/time
GET /vocab/modern-standard-arabic/vocabulary_from_around_the_house
GET /vocab/modern-standard-arabic/war
GET /vocab/modern-standard-arabic/work_and_money
```

#### Examples
```bash
# Get all Egyptian Arabic vocabulary
GET /vocab/egyptian/all

# Get Darija animals vocabulary  
GET /vocab/darija/animals_5

# Get Levantine food vocabulary
GET /vocab/levantine/food_and_drink_2
```

#### Response Format
```json
{
  "english": "good",
  "transliteration": "kuwáyyis", 
  "arabic": "كُوَيِّس",
  "audioUrl": "http://media.lingualism.com/.../ecav57-1.mp3",
  "source": "adjectives"
}
```

### Legacy Endpoints (Backwards Compatibility)
Original Egyptian Arabic endpoints:

```
GET /vocab/:section
```

Example: `/vocab/animals`

Response format:
```json
{
  "english": "cow",
  "standardArabic": "بقرة", 
  "standardArabicTransliteration": "baqara",
  "egyptianArabic": "بقرة",
  "egyptianArabicTransliteration": "ba'ara"
}
```