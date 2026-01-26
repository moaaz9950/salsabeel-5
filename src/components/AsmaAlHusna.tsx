import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Search, Book, BookOpen, Star, AlertCircle, Lightbulb, Bookmark, Globe, Shield, Scale, Zap } from 'lucide-react';

// Complete list of Asma Al-Husna with detailed descriptions
const ASMA_AL_HUSNA = [
  { 
    number: 1, 
    name: "الله", 
    transliteration: "Allah", 
    meaning: "The God",
    detailed: "عَلَمٌ على الذات الإلهية، الاسم الأعظم الذي تفرد به الحق سبحانه."
  },
  { 
    number: 2, 
    name: "الرَّحْمَنُ", 
    transliteration: "Ar-Rahman", 
    meaning: "The Most Gracious",
    detailed: "كثير الرحمة، اسم مقصور عليه فلا يقال لغيره، يرحم بجلائل النعم."
  },
  { 
    number: 3, 
    name: "الرَّحِيمُ", 
    transliteration: "Ar-Raheem", 
    meaning: "The Most Merciful",
    detailed: "المنعم أبدًا، المتفضل دومًا، فرحمته لا تنتهي، يرحم بدقائق النّعم."
  },
  { 
    number: 4, 
    name: "الْمَلِكُ", 
    transliteration: "Al-Malik", 
    meaning: "The King, The Sovereign",
    detailed: "ملك الملوك، له الملك، مالك يوم الدين، مليك الخلق، فهو المالك المطلق."
  },
  { 
    number: 5, 
    name: "الْقُدُّوسُ", 
    transliteration: "Al-Quddus", 
    meaning: "The Most Holy",
    detailed: "الطاهر المنزه عن العيوب والنقائص، وعن كل ما تحيط به العقول."
  },
  { 
    number: 6, 
    name: "السَّلاَمُ", 
    transliteration: "As-Salaam", 
    meaning: "The Source of Peace",
    detailed: "ناشر السلام بين الأنام، سلمت ذاته من النقص والعيب والفناء."
  },
  { 
    number: 7, 
    name: "الْمُؤْمِنُ", 
    transliteration: "Al-Mu'min", 
    meaning: "The Guardian of Faith",
    detailed: "سلَّم أوليائه من عذابه، ويُصدق عباده ما وعدهم."
  },
  { 
    number: 8, 
    name: "الْمُهَيْمِنُ", 
    transliteration: "Al-Muhaymin", 
    meaning: "The Protector",
    detailed: "الحافظ لكل شيء، القائم على خلقه، والمطلع على خفايا الأمور، وخبايا الصدور."
  },
  { 
    number: 9, 
    name: "الْعَزِيزُ", 
    transliteration: "Al-Azeez", 
    meaning: "The Mighty",
    detailed: "المنفرد بالعزة، الظاهر الذي لا يُقهر، القوي الممتنع غالب كل شيء."
  },
  { 
    number: 10, 
    name: "الْجَبَّارُ", 
    transliteration: "Al-Jabbaar", 
    meaning: "The Compeller",
    detailed: "تنفذ مشيئته، ولا يخرج أحد عن تقديره، القاهر لخلقه على ما أراد."
  },
    { 
    number: 11, 
    name: "الْمُتَكَبِّرُ", 
    transliteration: "Al-Mutakabbir", 
    meaning: "The Supreme",
    detailed: "المتعالي عن صفات الخلق، المتكبر عن كل سوء، المختص بالكبرياء والعظمة."
  },
  { 
    number: 12, 
    name: "الْخَالِقُ", 
    transliteration: "Al-Khaaliq", 
    meaning: "The Creator",
    detailed: "المبدع لكل شيء، الموجد له على غير مثال سابق، بقدرته وإرادته."
  },
  { 
    number: 13, 
    name: "الْبَارِئُ", 
    transliteration: "Al-Baari'", 
    meaning: "The Evolver",
    detailed: "خلق الخلق بقدرته لا عن مثال سابق، وبرأهم من التفاوت."
  },
  { 
    number: 14, 
    name: "الْمُصَوِّرُ", 
    transliteration: "Al-Musawwir", 
    meaning: "The Fashioner",
    detailed: "أعطى كل مخلوق صورة وهيئة يتميز بها عن غيره."
  },
  { 
    number: 15, 
    name: "الْغَفَّارُ", 
    transliteration: "Al-Ghaffaar", 
    meaning: "The All-Forgiving",
    detailed: "كثير المغفرة، يستر الذنوب مهما تكررت."
  },
  { 
    number: 16, 
    name: "الْقَهَّارُ", 
    transliteration: "Al-Qahhaar", 
    meaning: "The All-Subduer",
    detailed: "الغالب الذي قهر جميع الخلائق بقدرته وسلطانه."
  },
  { 
    number: 17, 
    name: "الْوَهَّابُ", 
    transliteration: "Al-Wahhaab", 
    meaning: "The Bestower",
    detailed: "الذي يعطي بلا مقابل، ويهب النعم تفضلاً وكرمًا."
  },
  { 
    number: 18, 
    name: "الرَّزَّاقُ", 
    transliteration: "Ar-Razzaaq", 
    meaning: "The Provider",
    detailed: "خلق الأرزاق وتكفل بإيصالها إلى جميع خلقه."
  },
  { 
    number: 19, 
    name: "الْفَتَّاحُ", 
    transliteration: "Al-Fattaah", 
    meaning: "The Opener",
    detailed: "يفتح أبواب الرزق والرحمة، ويفصل بين الحق والباطل."
  },
  { 
    number: 20, 
    name: "الْعَلِيمُ", 
    transliteration: "Al-'Aleem", 
    meaning: "The All-Knowing",
    detailed: "أحاط علمه بكل شيء، ظاهره وباطنه، دقيقه وجليله."
  },
  { 
    number: 21, 
    name: "الْقَابِضُ", 
    transliteration: "Al-Qaabid", 
    meaning: "The Withholder",
    detailed: "يقبض الرزق والأرواح بحكمته وعدله."
  },
  { 
    number: 22, 
    name: "الْبَاسِطُ", 
    transliteration: "Al-Baasit", 
    meaning: "The Expander",
    detailed: "يبسط الرزق والرحمة لمن يشاء من عباده."
  },
  { 
    number: 23, 
    name: "الْخَافِضُ", 
    transliteration: "Al-Khaafid", 
    meaning: "The Abaser",
    detailed: "يخفض من شاء من الظالمين والمتكبرين."
  },
  { 
    number: 24, 
    name: "الرَّافِعُ", 
    transliteration: "Ar-Raafi'", 
    meaning: "The Exalter",
    detailed: "يرفع المؤمنين بالطاعة والعلم والإيمان."
  },
  { 
    number: 25, 
    name: "الْمُعِزُّ", 
    transliteration: "Al-Mu'izz", 
    meaning: "The Giver of Honor",
    detailed: "يعز من يشاء بطاعته ونصره."
  },
  { 
    number: 26, 
    name: "الْمُذِلُّ", 
    transliteration: "Al-Mudhill", 
    meaning: "The Humiliator",
    detailed: "يذل من يشاء بعدله وحكمته."
  },
  { 
    number: 27, 
    name: "السَّمِيعُ", 
    transliteration: "As-Samee'", 
    meaning: "The All-Hearing",
    detailed: "سمعه محيط بكل الأصوات، لا تخفى عليه خافية."
  },
  { 
    number: 28, 
    name: "الْبَصِيرُ", 
    transliteration: "Al-Baseer", 
    meaning: "The All-Seeing",
    detailed: "يرى كل شيء ظاهرًا وباطنًا، دقيقه وجليله."
  },
  { 
    number: 29, 
    name: "الْحَكَمُ", 
    transliteration: "Al-Hakam", 
    meaning: "The Judge",
    detailed: "الحاكم بين عباده، الفاصل بين الحق والباطل."
  },
  { 
    number: 30, 
    name: "الْعَدْلُ", 
    transliteration: "Al-'Adl", 
    meaning: "The Utterly Just",
    detailed: "المنزه عن الظلم والجور، العادل في حكمه وقضائه."
  },
  { 
    number: 31, 
    name: "اللَّطِيفُ", 
    transliteration: "Al-Lateef", 
    meaning: "The Most Subtle",
    detailed: "الرفيق بعباده، يرزق وييسر ويحسن إليهم، ويتفضل عليهم بلطفه."
  },
  { 
    number: 32, 
    name: "الْخَبِيرُ", 
    transliteration: "Al-Khabeer", 
    meaning: "The All-Aware",
    detailed: "العليم بدقائق الأمور، لا تخفى عليه خافية."
  },
  { 
    number: 33, 
    name: "الْحَلِيمُ", 
    transliteration: "Al-Haleem", 
    meaning: "The Most Forbearing",
    detailed: "يمهل ولا يهمل، ويؤخر العقوبة رحمة وحكمة."
  },
  { 
    number: 34, 
    name: "الْعَظِيمُ", 
    transliteration: "Al-'Azeem", 
    meaning: "The Magnificent",
    detailed: "العظيم في ذاته وأسمائه وصفاته، لا يدانيه عظيم."
  },
  { 
    number: 35, 
    name: "الْغَفُورُ", 
    transliteration: "Al-Ghafoor", 
    meaning: "The Ever-Forgiving",
    detailed: "يغفر الذنوب مهما عظمت ويتجاوز عن الخطايا."
  },
  { 
    number: 36, 
    name: "الشَّكُورُ", 
    transliteration: "Ash-Shakoor", 
    meaning: "The Most Appreciative",
    detailed: "يجزي القليل من العمل بالكثير من الأجر."
  },
  { 
    number: 37, 
    name: "الْعَلِيُّ", 
    transliteration: "Al-'Aliyy", 
    meaning: "The Most High",
    detailed: "الرفيع القدر، المتعالي عن كل نقص."
  },
  { 
    number: 38, 
    name: "الْكَبِيرُ", 
    transliteration: "Al-Kabeer", 
    meaning: "The Most Great",
    detailed: "العظيم في صفاته وأفعاله، ذو الكبرياء والجلال."
  },
  { 
    number: 39, 
    name: "الْحَفِيظُ", 
    transliteration: "Al-Hafeedh", 
    meaning: "The Preserver",
    detailed: "يحفظ خلقه ويحفظ أعمالهم ويحصيها."
  },
  { 
    number: 40, 
    name: "الْمُقِيتُ", 
    transliteration: "Al-Muqeet", 
    meaning: "The Sustainer",
    detailed: "المتكفل بإيصال أقوات الخلق إليهم."
  },
  { 
    number: 41, 
    name: "الْحَسِيبُ", 
    transliteration: "Al-Haseeb", 
    meaning: "The Reckoner",
    detailed: "الكافي لعباده، عليه الاعتماد والحساب."
  },
  { 
    number: 42, 
    name: "الْجَلِيلُ", 
    transliteration: "Al-Jaleel", 
    meaning: "The Majestic",
    detailed: "المتصف بصفات الجلال والعظمة والكمال."
  },
  { 
    number: 43, 
    name: "الْكَرِيمُ", 
    transliteration: "Al-Kareem", 
    meaning: "The Most Generous",
    detailed: "الجواد الذي لا ينفد عطاؤه."
  },
  { 
    number: 44, 
    name: "الرَّقِيبُ", 
    transliteration: "Ar-Raqeeb", 
    meaning: "The Watchful",
    detailed: "المطلع على أعمال عباده وأحوالهم."
  },
  { 
    number: 45, 
    name: "الْمُجِيبُ", 
    transliteration: "Al-Mujeeb", 
    meaning: "The Answerer",
    detailed: "يجيب دعاء من دعاه وسؤال من سأله."
  },
  { 
    number: 46, 
    name: "الْوَاسِعُ", 
    transliteration: "Al-Waasi'", 
    meaning: "The All-Encompassing",
    detailed: "وسعت رحمته كل شيء، ووسع رزقه خلقه."
  },
  { 
    number: 47, 
    name: "الْحَكِيمُ", 
    transliteration: "Al-Hakeem", 
    meaning: "The Most Wise",
    detailed: "الحكيم في تدبيره وقضائه وأفعاله."
  },
  { 
    number: 48, 
    name: "الْوَدُودُ", 
    transliteration: "Al-Wadood", 
    meaning: "The Most Loving",
    detailed: "المحب لعباده، والمحبوب في قلوب أوليائه."
  },
  { 
    number: 49, 
    name: "الْمَجِيدُ", 
    transliteration: "Al-Majeed", 
    meaning: "The Most Glorious",
    detailed: "واسع الكرم، كثير الصفات الكاملة."
  },
  { 
    number: 50, 
    name: "الشَّهِيدُ", 
    transliteration: "Ash-Shaheed", 
    meaning: "The Witness",
    detailed: "الحاضر الذي لا يغيب عنه شيء."
  },
  { 
    number: 51, 
    name: "الْحَقُّ", 
    transliteration: "Al-Haqq", 
    meaning: "The Absolute Truth",
    detailed: "الحق في ذاته وصفاته وأفعاله."
  },
  { 
    number: 52, 
    name: "الْوَكِيلُ", 
    transliteration: "Al-Wakeel", 
    meaning: "The Trustee",
    detailed: "الكفيل بالخلق، المتولي لشؤونهم."
  },
  { 
    number: 53, 
    name: "الْقَوِيُّ", 
    transliteration: "Al-Qawiyy", 
    meaning: "The All-Powerful",
    detailed: "صاحب القدرة الكاملة التي لا تُغلب."
  },
  { 
    number: 54, 
    name: "الْمَتِينُ", 
    transliteration: "Al-Mateen", 
    meaning: "The Firm, The Steadfast",
    detailed: "القوي الذي لا يلحقه ضعف ولا تعب."
  },
  { 
    number: 55, 
    name: "الْوَلِيُّ", 
    transliteration: "Al-Waliyy", 
    meaning: "The Protector",
    detailed: "ناصر أوليائه والمتولي لأمورهم."
  },
  { 
    number: 56, 
    name: "الْحَمِيدُ", 
    transliteration: "Al-Hameed", 
    meaning: "The Praiseworthy",
    detailed: "المستحق للحمد والثناء على كل حال."
  },
  { 
    number: 57, 
    name: "الْمُحْصِي", 
    transliteration: "Al-Muhsee", 
    meaning: "The Accounter",
    detailed: "أحصى كل شيء بعلمه، لا يغيب عنه شيء."
  },
  { 
    number: 58, 
    name: "الْمُبْدِئُ", 
    transliteration: "Al-Mubdi'", 
    meaning: "The Originator",
    detailed: "أنشأ الخلق ابتداء من غير مثال."
  },
  { 
    number: 59, 
    name: "الْمُعِيدُ", 
    transliteration: "Al-Mu'eed", 
    meaning: "The Restorer",
    detailed: "يعيد الخلق بعد موتهم للحساب."
  },
  { 
    number: 60, 
    name: "الْمُحْيِي", 
    transliteration: "Al-Muhyi", 
    meaning: "The Giver of Life",
    detailed: "خالق الحياة ومعطيها لمن يشاء."
  },
  { 
    number: 61, 
    name: "الْمُمِيتُ", 
    transliteration: "Al-Mumeet", 
    meaning: "The Giver of Death",
    detailed: "مقدر الموت على كل حي، لا مميت سواه."
  },
  { 
    number: 62, 
    name: "الْحَيُّ", 
    transliteration: "Al-Hayy", 
    meaning: "The Ever-Living",
    detailed: "المتصف بالحياة الكاملة الأبدية التي لا بداية لها ولا نهاية."
  },
  { 
    number: 63, 
    name: "الْقَيُّومُ", 
    transliteration: "Al-Qayyoom", 
    meaning: "The Self-Existing",
    detailed: "القائم بنفسه، المقيم لغيره، المدبر لأمور خلقه."
  },
  { 
    number: 64, 
    name: "الْوَاجِدُ", 
    transliteration: "Al-Waajid", 
    meaning: "The Perceiver",
    detailed: "لا يعوزه شيء، ولا يعجزه شيء، يدرك كل ما يريد."
  },
  { 
    number: 65, 
    name: "الْمَاجِدُ", 
    transliteration: "Al-Maajid", 
    meaning: "The Illustrious",
    detailed: "الكامل في ذاته وأفعاله، كثير الجود والكرم."
  },
  { 
    number: 66, 
    name: "الْوَاحِدُ", 
    transliteration: "Al-Waahid", 
    meaning: "The One",
    detailed: "المنفرد في ذاته وصفاته وأفعاله، لا شريك له."
  },
  { 
    number: 67, 
    name: "الصَّمَدُ", 
    transliteration: "As-Samad", 
    meaning: "The Eternal Refuge",
    detailed: "المقصود في الحوائج، المستغني عن كل ما سواه."
  },
  { 
    number: 68, 
    name: "الْقَادِرُ", 
    transliteration: "Al-Qaadir", 
    meaning: "The All-Powerful",
    detailed: "القادر على إيجاد المعدوم وإعدام الموجود."
  },
  { 
    number: 69, 
    name: "الْمُقْتَدِرُ", 
    transliteration: "Al-Muqtadir", 
    meaning: "The Determiner",
    detailed: "القادر على كل شيء قدرة تامة لا يعجزه شيء."
  },
  { 
    number: 70, 
    name: "الْمُقَدِّمُ", 
    transliteration: "Al-Muqaddim", 
    meaning: "The Promoter",
    detailed: "يقدم من يشاء بحكمته وعدله."
  },
  { 
    number: 71, 
    name: "الْمُؤَخِّرُ", 
    transliteration: "Al-Mu'akhkhir", 
    meaning: "The Delayer",
    detailed: "يؤخر من يشاء بحكمته وعدله."
  },
  { 
    number: 72, 
    name: "الْأَوَّلُ", 
    transliteration: "Al-Awwal", 
    meaning: "The First",
    detailed: "الذي ليس قبله شيء."
  },
  { 
    number: 73, 
    name: "الْآخِرُ", 
    transliteration: "Al-Aakhir", 
    meaning: "The Last",
    detailed: "الذي ليس بعده شيء."
  },
  { 
    number: 74, 
    name: "الظَّاهِرُ", 
    transliteration: "Az-Zaahir", 
    meaning: "The Manifest",
    detailed: "الظاهر فوق كل شيء، الظاهر بآياته."
  },
  { 
    number: 75, 
    name: "الْبَاطِنُ", 
    transliteration: "Al-Baatin", 
    meaning: "The Hidden",
    detailed: "العالم ببواطن الأمور وخفاياها."
  },
  { 
    number: 76, 
    name: "الْوَالِي", 
    transliteration: "Al-Waali", 
    meaning: "The Governor",
    detailed: "المالك المتصرف في شؤون الخلق."
  },
  { 
    number: 77, 
    name: "الْمُتَعَالِي", 
    transliteration: "Al-Muta'aali", 
    meaning: "The Exalted",
    detailed: "المتنزه عن صفات النقص، العالي عن كل شيء."
  },
  { 
    number: 78, 
    name: "الْبَرُّ", 
    transliteration: "Al-Barr", 
    meaning: "The Source of Goodness",
    detailed: "العطوف على عباده، كثير الإحسان."
  },
  { 
    number: 79, 
    name: "التَّوَّابُ", 
    transliteration: "At-Tawwaab", 
    meaning: "The Accepter of Repentance",
    detailed: "يقبل توبة عباده ويعفو عن سيئاتهم."
  },
  { 
    number: 80, 
    name: "الْمُنْتَقِمُ", 
    transliteration: "Al-Muntaqim", 
    meaning: "The Avenger",
    detailed: "ينتقم من الظالمين بعد الإعذار والإنذار."
  },
  { 
    number: 81, 
    name: "العَفُوُّ", 
    transliteration: "Al-'Afuww", 
    meaning: "The Pardoner",
    detailed: "يمحو الذنوب ويتجاوز عن السيئات."
  },
  { 
    number: 82, 
    name: "الرَّؤُوفُ", 
    transliteration: "Ar-Ra'oof", 
    meaning: "The Most Kind",
    detailed: "شديد الرحمة واللطف بعباده."
  },
  { 
    number: 83, 
    name: "مَالِكُ الْمُلْكِ", 
    transliteration: "Maalik-ul-Mulk", 
    meaning: "Owner of Sovereignty",
    detailed: "يتصرف في ملكه كيف يشاء بلا معقب لحكمه."
  },
  { 
    number: 84, 
    name: "ذُو الْجَلَالِ وَالْإِكْرَامِ", 
    transliteration: "Dhul-Jalaali wal-Ikraam", 
    meaning: "Lord of Majesty and Honor",
    detailed: "المنفرد بالجلال والكمال والإكرام."
  },
  { 
    number: 85, 
    name: "الْمُقْسِطُ", 
    transliteration: "Al-Muqsit", 
    meaning: "The Just One",
    detailed: "العادل في حكمه، ينصف المظلوم."
  },
  { 
    number: 86, 
    name: "الْجَامِعُ", 
    transliteration: "Al-Jaami'", 
    meaning: "The Gatherer",
    detailed: "يجمع الخلائق ليوم لا ريب فيه."
  },
  { 
    number: 87, 
    name: "الْغَنِيُّ", 
    transliteration: "Al-Ghaniyy", 
    meaning: "The Self-Sufficient",
    detailed: "المستغني عن كل ما سواه، المفتقر إليه كل شيء."
  },
  { 
    number: 88, 
    name: "الْمُغْنِي", 
    transliteration: "Al-Mughni", 
    meaning: "The Enricher",
    detailed: "يغني من يشاء من عباده بفضله."
  },
  { 
    number: 89, 
    name: "الْمَانِعُ", 
    transliteration: "Al-Maani'", 
    meaning: "The Preventer",
    detailed: "يمنع العطاء لحكمة أو حماية."
  },
  { 
    number: 90, 
    name: "الضَّارُّ", 
    transliteration: "Ad-Daarr", 
    meaning: "The Distresser",
    detailed: "المقدر للضر لحكمة."
  },
  { 
    number: 91, 
    name: "النَّافِعُ", 
    transliteration: "An-Naafi'", 
    meaning: "The Benefactor",
    detailed: "المقدر للنفع والخير."
  },
  { 
    number: 92, 
    name: "النُّورُ", 
    transliteration: "An-Noor", 
    meaning: "The Light",
    detailed: "الهادي بنوره من يشاء إلى طريق الحق."
  },
  { 
    number: 93, 
    name: "الْهَادِي", 
    transliteration: "Al-Haadi", 
    meaning: "The Guide",
    detailed: "يهدي القلوب إلى الحق والصراط المستقيم."
  },
  { 
    number: 94, 
    name: "الْبَدِيعُ", 
    transliteration: "Al-Badee'", 
    meaning: "The Incomparable",
    detailed: "الموجد للأشياء على غير مثال سابق."
  },
  { 
    number: 95, 
    name: "الْبَاقِي", 
    transliteration: "Al-Baaqi", 
    meaning: "The Everlasting",
    detailed: "الدائم الذي لا يفنى."
  },
  { 
    number: 96, 
    name: "الْوَارِثُ", 
    transliteration: "Al-Waarith", 
    meaning: "The Inheritor",
    detailed: "الباقي بعد فناء الخلق."
  },
  { 
    number: 97, 
    name: "الرَّشِيدُ", 
    transliteration: "Ar-Rasheed", 
    meaning: "The Guide to the Right Path",
    detailed: "المرشد لعباده بحكمته."
  },
  { 
    number: 98, 
    name: "الصَّبُورُ", 
    transliteration: "As-Saboor", 
    meaning: "The Most Patient",
    detailed: "لا يعاجل العصاة بالعقوبة، بل يمهلهم."
  },
  { 
    number: 99, 
    name: "اللَّهُ", 
    transliteration: "Allah",
    meaning: "The One True God",
    detailed: "الاسم الجامع لكل صفات الكمال، لا يسمى به غيره."
  }

// Opposing names with their meanings
const OPPOSING_NAMES = [
  { names: ["القابض", "الباسط"], meaning: "يقتّر الرّزق ويوسّعه" },
  { names: ["الخافض", "الرافع"], meaning: "يخفض من عصاه، ويرفع من أطاعه" },
  { names: ["المُعزّ", "المُذل"], meaning: "يهب القوة فيعزّ وينزعها فيذل" },
  { names: ["المقدّم", "المؤخّر"], meaning: "يقرّب ويُبعد الأشياء والمخلوقات بحكمته" },
  { names: ["المُحيي", "المميت"], meaning: "خالق الحياة ومقدّر الموت" },
  { names: ["الأول", "الآخر"], meaning: "ليس قبله شيء وليس بعده شيء" },
  { names: ["الظاهر", "الباطن"], meaning: "علا فوق كل شيء، وعلم خفايا الأشياء" },
  { names: ["المعطي", "المانع"], meaning: "يهب ويحرم من شاء من نعمه وفضله" },
  { names: ["الضار", "النافع"], meaning: "العطاء والمنع بيده وبأمره" }
];

// Names from Quran with verses
const QURAN_NAMES_WITH_VERSES = [
  { verse: "وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ", reference: "البقرة: 127", names: ["السميع", "العليم"] },
  { verse: "رَبَّنَا وَابْعَثْ فِيهِمْ رَسُولاً مِّنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِكَ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ وَيُزَكِّيهِمْ إِنَّكَ أَنتَ العَزِيزُ الحَكِيمُ", reference: "البقرة: 129", names: ["العزيز", "الحكيم"] },
  { verse: "رَبَّنَا لاَ تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ", reference: "آل عمران: 8", names: ["الوهاب"] },
  // Add more verses as needed
];

// Names not mentioned in Quran
const NAMES_NOT_IN_QURAN = [
  "الخافض", "المعز", "المذل", "العدل", "الجليل", "الباعث", "المحصي", 
  "المبدئ", "المعيد", "المميت", "الواجد", "الماجد", "الوالي", 
  "المقسط", "المغني", "المانع", "الضار", "النافع", "الباقي", 
  "الرشيد", "الصبور"
];

// Disputed names
const DISPUTED_NAMES = {
  جامدة: ["الدهر", "الشيء"],
  مضافة: ["المحيط", "العالم", "الزارع", "الذارئ", "المسعّر"],
  إخبارية: ["أراد", "شاء", "أحدث", "الصانع", "الفاعل", "المتقن", "الماكر", 
             "المخادع", "الفاتن", "الكائد", "الصانع", "المستمع", "الحاسب", 
             "المنزل", "الكاتب", "المرسل", "المريد", "المحب", "المبغض", 
             "الرضا", "السخط", "البالي", "المبلي", "المبتلي"]
};

// Categories of names
const NAME_CATEGORIES = [
  {
    title: "صفات السلطان",
    names: ["الملك", "المهيمن", "مالك الملك", "القدوس", "الواحد", "الأحد", "الصمد", "ذو الجلالة والإكرام"],
    description: "اللبنة الأولى في بناء هويتنا وعلاقتنا مع الله عز وجل، فنبني حياتنا حسب المنهج الذي يريده السلطان.",
    icon: Shield
  },
  {
    title: "صفات الرزق",
    names: ["الوهاب", "الرزاق", "الفتاح", "المقيت", "الغني", "المغني"],
    description: "عندما ندرك نعم الله، لن نستطيع صرفها في غير طاعة الله عز وجل.",
    icon: Scale
  },
  {
    title: "صفات الكبرياء والعلو",
    names: ["العزيز", "المتكبر", "العلي", "الكبير", "الجليل", "العظيم", "المجيد", "المتعالي", "الماجد"],
    description: "عظمة الخلق تدل على عظمة الخالق.",
    icon: Globe
  },
  {
    title: "صفات الرفق",
    names: ["الرحمن", "الرحيم", "الحليم", "اللطيف", "الشكور", "الكريم", "الودود", "البر", "الرؤوف", "الحميد"],
    description: "قلّما تخلوا حياتنا من معصية نحتاج أنْ نلتجئ فيها إلى الله ذي الرفق.",
    icon: Heart
  },
  {
    title: "صفات التحكم الإيجابي",
    names: ["النور", "الصبور", "الهادي", "المحيي", "الباسط", "الرافع", "المعز", "المقدم", "الجامع", "النافع", "البر"],
    description: "عندما نهتدي بصفات التحكم الإيجابي؛ نرتقي ونهتدي في هرم الاحتياجات وتحقيق الذات.",
    icon: Zap
  }
];

type TabType = 'all' | 'opposing' | 'quran' | 'not-in-quran' | 'disputed' | 'categories' | 'impact';

export default function AsmaAlHusna() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favoriteNames');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const itemsPerPage = 10;
  
  // Filter names based on search and favorites
  const filteredNames = ASMA_AL_HUSNA.filter(name => {
    const matchesSearch = 
      name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.name.includes(searchTerm) ||
      (name.detailed && name.detailed.includes(searchTerm));
    
    const matchesFavorites = !showFavoritesOnly || favorites.includes(name.number);
    
    return matchesSearch && matchesFavorites;
  });
  
  const totalPages = Math.ceil(filteredNames.length / itemsPerPage);
  const currentNames = filteredNames.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const toggleFavorite = (number: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number];
      
      localStorage.setItem('favoriteNames', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const renderAllNames = () => (
    <>
      {currentNames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No names found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {currentNames.map((name) => (
            <div 
              key={name.number}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center text-sm font-medium">
                    {name.number}
                  </span>
                  <div>
                    <h3 className="font-arabic text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {name.name}
                    </h3>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {name.transliteration}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(name.number)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 transition-colors ${
                      favorites.includes(name.number) 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-slate-400 dark:text-slate-500'
                    }`} 
                  />
                </button>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Meaning
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {name.meaning}
                </p>
              </div>
              
              {name.detailed && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Detailed Explanation
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {name.detailed}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {filteredNames.length > 0 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 0 
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page <span className="font-semibold">{currentPage + 1}</span> of <span className="font-semibold">{totalPages}</span>
          </span>
          
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage >= totalPages - 1 
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );

  const renderOpposingNames = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="w-6 h-6 text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            الأسماء المتقابلة ومعانيها
          </h3>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OPPOSING_NAMES.map((pair, index) => (
            <div 
              key={index}
              className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-center gap-4 mb-3">
                <span className="font-arabic text-xl text-emerald-600 dark:text-emerald-400 font-bold">
                  {pair.names[0]}
                </span>
                <div className="w-8 h-px bg-slate-300 dark:bg-slate-600"></div>
                <span className="font-arabic text-xl text-emerald-600 dark:text-emerald-400 font-bold">
                  {pair.names[1]}
                </span>
              </div>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                {pair.meaning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuranNames = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Book className="w-6 h-6 text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            أسماء الله الحسنى في القرآن الكريم
          </h3>
        </div>
        
        <div className="space-y-6">
          {QURAN_NAMES_WITH_VERSES.map((item, index) => (
            <div 
              key={index}
              className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-arabic text-lg leading-relaxed text-slate-800 dark:text-slate-200 mb-2">
                    {item.verse}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.reference}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <div className="flex items-center gap-2">
                      {item.names.map((name, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotInQuran = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            الأسماء التي لم تذكر في القرآن
          </h3>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>ملاحظة:</strong> لم يكن اعتمادنا في تعداد أسماء الله الحسنى على الآثار الضعيفة، 
            وإنما كان المعول على ما ثبت في القرآن الكريم والسُّنَّة الصحيحة من هذه الأسماء.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {NAMES_NOT_IN_QURAN.map((name, index) => (
            <div 
              key={index}
              className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-center"
            >
              <span className="font-arabic text-xl text-slate-700 dark:text-slate-300">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDisputedNames = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            أسماء الله الحسنى المختلف فيها
          </h3>
        </div>
        
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-rose-800 dark:text-rose-300">
            دار خلاف بين علماء المسلمين حول إدراج بعض الأسماء الواردة في القرآن أو في أحاديث 
            الرسول ضمن أسماء الله الحسنى، وذلك بسبب طريقة ورودها.
          </p>
        </div>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
              الأسماء الجامدة
            </h4>
            <div className="flex flex-wrap gap-2">
              {DISPUTED_NAMES.جامدة.map((name, index) => (
                <span 
                  key={index}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg font-arabic"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
              ما ورد على وجه الإضافة أو التقييد
            </h4>
            <div className="flex flex-wrap gap-2">
              {DISPUTED_NAMES.مضافة.map((name, index) => (
                <span 
                  key={index}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg font-arabic"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
              ما ورد على وجه الإخبار لا التسمية
            </h4>
            <div className="flex flex-wrap gap-2">
              {DISPUTED_NAMES.إخبارية.map((name, index) => (
                <span 
                  key={index}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            أسماء الله الحسنى نور الله فينا
          </h3>
        </div>
        
        <div className="space-y-6">
          {NAME_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <div 
                key={index}
                className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                      {category.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.names.map((name, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-arabic"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderImpact = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            تأثير تعلم أسماء الله الحسنى على النفس والقلب
          </h3>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
            علم الأسماء الحسنى وصفات الله هو من أشرف العلوم التي ينبغي لكل مؤمن ومؤمنة أن يتعلمها. 
            فهذا العلم يفتح قلوبهم على عظمة الله وصفاته العالية، حيث يزيد شعورهم بقربه منه وحبه له.
          </p>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 my-8">
            <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-4">
              الفوائد الروحية والنفسية:
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-emerald-800 dark:text-emerald-300">
                  ينعكس على النفس فيصبح الإنسان أرحم وأكثر تسامحًا وتفهماً للآخرين
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-emerald-800 dark:text-emerald-300">
                  يؤثر إيجاباً في الإيمان بالله وأداء العبادات والأعمال الصالحة
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-emerald-800 dark:text-emerald-300">
                  يزيد من الخوف والورع والتقوى في القلب
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-emerald-800 dark:text-emerald-300">
                  يساعد على تحقيق التقرب إلى الله وتحسين الروح والنفس
                </span>
              </li>
            </ul>
          </div>
          
          <div className="text-center py-8">
            <p className="font-arabic text-2xl text-emerald-600 dark:text-emerald-400 mb-4">
              اللهم اجعل في قلوبنا وعقولنا من نور أسمائك وصفاتك
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return renderAllNames();
      case 'opposing':
        return renderOpposingNames();
      case 'quran':
        return renderQuranNames();
      case 'not-in-quran':
        return renderNotInQuran();
      case 'disputed':
        return renderDisputedNames();
      case 'categories':
        return renderCategories();
      case 'impact':
        return renderImpact();
      default:
        return renderAllNames();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Asma Al-Husna (99 Names of Allah)
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Explore the beautiful names of Allah with detailed explanations and categorizations
        </p>
      </div>
      
      <div className="p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'all' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            All Names
          </button>
          <button
            onClick={() => setActiveTab('opposing')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'opposing' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            Opposing Names
          </button>
          <button
            onClick={() => setActiveTab('quran')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'quran' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Book className="w-4 h-4" />
            In Quran
          </button>
          <button
            onClick={() => setActiveTab('not-in-quran')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'not-in-quran' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Not in Quran
          </button>
          <button
            onClick={() => setActiveTab('disputed')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'disputed' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Disputed
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'categories' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'impact' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Star className="w-4 h-4" />
            Impact
          </button>
        </div>
        
        {/* Search and Filters (only for main list) */}
        {activeTab === 'all' && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, transliteration, or meaning..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-12 pr-4 py-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
              />
            </div>
            
            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setCurrentPage(0);
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                showFavoritesOnly
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="font-medium">
                {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
              </span>
              {favorites.length > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  showFavoritesOnly 
                    ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        )}
        
        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}