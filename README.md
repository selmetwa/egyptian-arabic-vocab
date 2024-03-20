# Egyptian Arabic Vocabulary API

[4107 Words scraped from Desert Sky](https://arabic.desert-sky.net/vocab.html)

## Sections
Sections include both Egyptian and Standard Arabic, as well as the respective transliteration
- [animals](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/animals.csv)
- [vocabulary_from_around_the_house](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/vocabulary_from_around_the_house.csv)
- [city_and_transportation](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/city_and_transportation.csv)
- [clothing](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/clothing.csv)
- [colors](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/colors.csv)
- [education](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/education.csv)
- [emotions__and__personality_traits](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/emotions__and__personality_traits.csv)
- [food](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/food.csv)
- [geography](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/geography.csv)
- [human_body](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/human_body.csv)
- [mankind_and_kinship](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/mankind_and_kinship.csv)
- [media_and_the_arts](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/media_and_the_arts.csv)
- [medicine](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/medicine.csv)
- [nature__and__weather](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/nature__and__weather.csv)
- [religion](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/religion.csv)
- [sports__and__hobbies](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/sports__and__hobbies.csv)
- [technology](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/technology.csv)
- [time](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/time.csv)
- [work_and_money](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/work_and_money.csv)
- [media](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/media.csv)
- [media_2](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/media_2.csv)
- [media_3](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/media_3.csv)
- [crime_and_punishment](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/crime_and_punishment.csv)
- [government_and_politics](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/government_and_politics.csv)
- [war](https://github.com/selmetwa/egyptian-arabic-vocab/blob/main/csv/war.csv)

## API
Use the following endpoint to get the vocabulary for a section:

```
GET /vocab/:section
```

Replace `:section` with the section name (`/vocab/animals`)
```
{
  english: "cow",
  standardArabic: "بقرة",
  standardArabicTransliteration: "baqara",
  egyptianArabic: "بقرة",
  egyptianArabicTransliteration: "ba'ara",
}
...
```