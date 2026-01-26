import React, { useState, useEffect } from 'react';
import { Calculator, Coins, TrendingUp, Home, Wheat, Users, Heart, Info, ChevronDown, ChevronUp, Star, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface ZakatType {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: React.ComponentType<any>;
  nisabAr: string;
  nisabEn: string;
  rateAr: string;
  rateEn: string;
  rate: number;
  nisabValue?: number;
}

const ZAKAT_TYPES: ZakatType[] = [
  {
    id: 'money',
    nameAr: 'زكاة المال والنقود',
    nameEn: 'Money & Cash Zakat',
    descriptionAr: 'زكاة النقود والأموال المدخرة',
    descriptionEn: 'Zakat on cash and savings',
    icon: Coins,
    nisabAr: 'قيمة 85 جرام ذهب أو 595 جرام فضة',
    nisabEn: 'Value of 85g gold or 595g silver',
    rateAr: '2.5% (ربع العشر)',
    rateEn: '2.5% (Quarter of tenth)',
    rate: 0.025,
    nisabValue: 85 // grams of gold
  },
  {
    id: 'gold',
    nameAr: 'زكاة الذهب',
    nameEn: 'Gold Zakat',
    descriptionAr: 'زكاة الذهب والحلي',
    descriptionEn: 'Zakat on gold and jewelry',
    icon: Star,
    nisabAr: '85 جرام ذهب خالص (عيار 24)',
    nisabEn: '85 grams of pure gold (24 karat)',
    rateAr: '2.5% من القيمة',
    rateEn: '2.5% of value',
    rate: 0.025,
    nisabValue: 85
  },
  {
    id: 'silver',
    nameAr: 'زكاة الفضة',
    nameEn: 'Silver Zakat',
    descriptionAr: 'زكاة الفضة والحلي الفضية',
    descriptionEn: 'Zakat on silver and silver jewelry',
    icon: Moon,
    nisabAr: '595 جرام فضة',
    nisabEn: '595 grams of silver',
    rateAr: '2.5% من القيمة',
    rateEn: '2.5% of value',
    rate: 0.025,
    nisabValue: 595
  },
  {
    id: 'trade',
    nameAr: 'زكاة عروض التجارة',
    nameEn: 'Trade Goods Zakat',
    descriptionAr: 'زكاة البضائع والسلع التجارية',
    descriptionEn: 'Zakat on trade goods and merchandise',
    icon: TrendingUp,
    nisabAr: 'قيمة النصاب (85 جرام ذهب)',
    nisabEn: 'Nisab value (85g gold equivalent)',
    rateAr: '2.5% من قيمة البضاعة',
    rateEn: '2.5% of goods value',
    rate: 0.025,
    nisabValue: 85
  },
  {
    id: 'crops',
    nameAr: 'زكاة الزروع والثمار',
    nameEn: 'Crops & Fruits Zakat',
    descriptionAr: 'زكاة المحاصيل الزراعية والثمار',
    descriptionEn: 'Zakat on agricultural crops and fruits',
    icon: Wheat,
    nisabAr: '653 كيلوجرام (5 أوسق)',
    nisabEn: '653 kilograms (5 Awsuq)',
    rateAr: '10% (مطر) أو 5% (ري)',
    rateEn: '10% (rain-fed) or 5% (irrigated)',
    rate: 0.1,
    nisabValue: 653
  },
  {
    id: 'livestock',
    nameAr: 'زكاة الأنعام',
    nameEn: 'Livestock Zakat',
    descriptionAr: 'زكاة الإبل والبقر والغنم',
    descriptionEn: 'Zakat on camels, cattle, and sheep',
    icon: Users,
    nisabAr: 'حسب النوع والعدد',
    nisabEn: 'According to type and number',
    rateAr: 'حسب الجدول الشرعي',
    rateEn: 'According to Islamic schedule',
    rate: 0,
    nisabValue: 0
  },
  {
    id: 'property',
    nameAr: 'زكاة العقارات',
    nameEn: 'Real Estate Zakat',
    descriptionAr: 'زكاة العقارات المعدة للتجارة',
    descriptionEn: 'Zakat on real estate for trade',
    icon: Home,
    nisabAr: 'قيمة النصاب',
    nisabEn: 'Nisab value',
    rateAr: '2.5% من القيمة السوقية',
    rateEn: '2.5% of market value',
    rate: 0.025,
    nisabValue: 85
  }
];

const ZAKAT_RECIPIENTS = [
  { nameAr: 'الفقراء', nameEn: 'The Poor (Al-Fuqara)', descriptionAr: 'من لا يملك ما يسد حاجته الأساسية', descriptionEn: 'Those who do not have enough to meet basic needs' },
  { nameAr: 'المساكين', nameEn: 'The Needy (Al-Masakin)', descriptionAr: 'من يملك بعض ما يحتاجه لكنه لا يكفيه', descriptionEn: 'Those who have some but not enough for their needs' },
  { nameAr: 'العاملون عليها', nameEn: 'Zakat Administrators', descriptionAr: 'من يُعينون على جمع الزكاة وتوزيعها', descriptionEn: 'Those who collect and distribute Zakat' },
  { nameAr: 'المؤلفة قلوبهم', nameEn: 'Those Whose Hearts Are Reconciled', descriptionAr: 'من يُراد تأليف قلوبهم على الإسلام', descriptionEn: 'New Muslims or those inclined toward Islam' },
  { nameAr: 'في الرقاب', nameEn: 'To Free Slaves', descriptionAr: 'عتق الرقاب أو فك أسرى المسلمين', descriptionEn: 'To free slaves or captives' },
  { nameAr: 'الغارمين', nameEn: 'Those in Debt', descriptionAr: 'من أثقلتهم الديون ولا يقدرون على سدادها', descriptionEn: 'Those burdened with debt they cannot repay' },
  { nameAr: 'في سبيل الله', nameEn: 'In the Path of Allah', descriptionAr: 'الجهاد المشروع والدعوة والتعليم الشرعي', descriptionEn: 'For Islamic causes, education, and dawah' },
  { nameAr: 'ابن السبيل', nameEn: 'The Wayfarer', descriptionAr: 'المسافر المنقطع عن ماله', descriptionEn: 'Travelers stranded without resources' }
];

export default function ZakatCalculator() {
  const { theme } = useTheme();
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [selectedType, setSelectedType] = useState<string>('money');
  const [amount, setAmount] = useState<string>('');
  const [goldPrice, setGoldPrice] = useState<string>('');
  const [silverPrice, setSilverPrice] = useState<string>('');
  const [debts, setDebts] = useState<string>('');
  const [irrigationType, setIrrigationType] = useState<'rain' | 'irrigation'>('rain');
  const [livestockType, setLivestockType] = useState<'camels' | 'cattle' | 'sheep'>('sheep');
  const [livestockCount, setLivestockCount] = useState<string>('');
  const [showRecipients, setShowRecipients] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [zakatResult, setZakatResult] = useState<{
    amount: number;
    eligible: boolean;
    nisabValue: number;
    netAmount: number;
  } | null>(null);

  const currentType = ZAKAT_TYPES.find(type => type.id === selectedType);

  useEffect(() => {
    calculateZakat();
  }, [amount, goldPrice, silverPrice, debts, selectedType, irrigationType, livestockCount, livestockType]);

  const calculateZakat = () => {
    if (!amount || !currentType) {
      setZakatResult(null);
      return;
    }

    const amountValue = parseFloat(amount) || 0;
    const debtsValue = parseFloat(debts) || 0;
    const netAmount = Math.max(0, amountValue - debtsValue);

    let nisabValue = 0;
    let zakatAmount = 0;
    let eligible = false;

    switch (selectedType) {
      case 'money':
      case 'trade':
      case 'property':
        const goldPriceValue = parseFloat(goldPrice) || 0;
        nisabValue = 85 * goldPriceValue; // 85 grams of gold
        eligible = netAmount >= nisabValue;
        zakatAmount = eligible ? netAmount * 0.025 : 0;
        break;

      case 'gold':
        const goldWeight = amountValue; // in grams
        eligible = goldWeight >= 85;
        const goldValue = goldWeight * (parseFloat(goldPrice) || 0);
        zakatAmount = eligible ? goldValue * 0.025 : 0;
        nisabValue = 85 * (parseFloat(goldPrice) || 0);
        break;

      case 'silver':
        const silverWeight = amountValue; // in grams
        eligible = silverWeight >= 595;
        const silverValue = silverWeight * (parseFloat(silverPrice) || 0);
        zakatAmount = eligible ? silverValue * 0.025 : 0;
        nisabValue = 595 * (parseFloat(silverPrice) || 0);
        break;

      case 'crops':
        const cropWeight = amountValue; // in kg
        eligible = cropWeight >= 653;
        const rate = irrigationType === 'rain' ? 0.1 : 0.05;
        zakatAmount = eligible ? cropWeight * rate : 0;
        nisabValue = 653;
        break;

      case 'livestock':
        const count = parseInt(livestockCount) || 0;
        zakatAmount = calculateLivestockZakat(livestockType, count);
        eligible = zakatAmount > 0;
        nisabValue = getMinimumLivestock(livestockType);
        break;
    }

    setZakatResult({
      amount: zakatAmount,
      eligible,
      nisabValue,
      netAmount
    });
  };

  const calculateLivestockZakat = (type: string, count: number): number => {
    switch (type) {
      case 'sheep':
        if (count >= 40 && count <= 120) return 1;
        if (count >= 121 && count <= 200) return 2;
        if (count >= 201 && count <= 399) return 3;
        if (count >= 400) return Math.floor(count / 100);
        return 0;

      case 'cattle':
        if (count >= 30 && count <= 39) return 1; // تبيع أو تبيعة
        if (count >= 40 && count <= 59) return 1; // مسنة
        if (count >= 60) return Math.floor(count / 30) + Math.floor((count % 30) / 40);
        return 0;

      case 'camels':
        if (count >= 5 && count <= 9) return 1; // شاة
        if (count >= 10 && count <= 14) return 2; // شاتان
        if (count >= 15 && count <= 19) return 3; // ثلاث شياه
        if (count >= 20 && count <= 24) return 4; // أربع شياه
        if (count >= 25) return 1; // بنت مخاض
        return 0;

      default:
        return 0;
    }
  };

  const getMinimumLivestock = (type: string): number => {
    switch (type) {
      case 'sheep': return 40;
      case 'cattle': return 30;
      case 'camels': return 5;
      default: return 0;
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className={cn(
      "bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 rounded-2xl shadow-2xl overflow-hidden",
      theme === 'ramadan' ? 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900 dark:via-orange-900 dark:to-yellow-900' : ''
    )}>
      {/* Header with Islamic Pattern */}
      <div className={cn(
        "relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800 p-6",
        theme === 'ramadan' ? 'from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-800 dark:via-orange-800 dark:to-yellow-800' : ''
      )}>
        {/* Islamic Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="islamic-pattern-zakat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <polygon points="10,0 20,10 10,20 0,10" fill="currentColor" />
                <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern-zakat)" />
          </svg>
        </div>

        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? 'حاسبة الزكاة' : 'Zakat Calculator'}
              </h2>
              <p className="text-white/80 text-sm">
                {language === 'ar' ? 'احسب زكاة مالك بدقة وفقاً للشريعة الإسلامية' : 'Calculate your Zakat accurately according to Islamic law'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setLanguage(lang => lang === 'en' ? 'ar' : 'en')}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            title={language === 'ar' ? 'تغيير اللغة' : 'Change Language'}
          >
            <span className="text-sm font-medium">
              {language === 'ar' ? 'EN' : 'عربي'}
            </span>
          </button>
        </div>
      </div>

      <div className="p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Zakat Type Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-emerald-700 dark:text-emerald-300">
            {language === 'ar' ? 'نوع الزكاة' : 'Type of Zakat'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ZAKAT_TYPES.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-4 rounded-xl text-left transition-all duration-200 hover:scale-105",
                    selectedType === type.id
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105"
                      : "bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-md border border-slate-200 dark:border-slate-700"
                  )}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={cn(
                      "w-5 h-5",
                      selectedType === type.id ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                    )} />
                    <h4 className={cn(
                      "font-bold text-sm",
                      selectedType === type.id ? "text-white" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {language === 'ar' ? type.nameAr : type.nameEn}
                    </h4>
                  </div>
                  <p className={cn(
                    "text-xs",
                    selectedType === type.id ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {language === 'ar' ? type.descriptionAr : type.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Type Info */}
        {currentType && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                  {language === 'ar' ? currentType.nameAr : currentType.nameEn}
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">{language === 'ar' ? 'النصاب:' : 'Nisab:'}</span>{' '}
                    {language === 'ar' ? currentType.nisabAr : currentType.nisabEn}
                  </p>
                  <p>
                    <span className="font-medium">{language === 'ar' ? 'المقدار:' : 'Rate:'}</span>{' '}
                    {language === 'ar' ? currentType.rateAr : currentType.rateEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {language === 'ar' ? 'بيانات الحساب' : 'Calculation Data'}
            </h3>

            {/* Common Fields */}
            {(selectedType === 'money' || selectedType === 'trade' || selectedType === 'property' || selectedType === 'gold' || selectedType === 'silver') && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {selectedType === 'gold' 
                      ? (language === 'ar' ? 'وزن الذهب (جرام)' : 'Gold Weight (grams)')
                      : selectedType === 'silver'
                      ? (language === 'ar' ? 'وزن الفضة (جرام)' : 'Silver Weight (grams)')
                      : (language === 'ar' ? 'المبلغ' : 'Amount')
                    }
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter amount'}
                  />
                </div>

                {(selectedType === 'money' || selectedType === 'trade' || selectedType === 'property' || selectedType === 'gold') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'سعر جرام الذهب (عيار 24)' : 'Gold Price per gram (24k)'}
                    </label>
                    <input
                      type="number"
                      value={goldPrice}
                      onChange={(e) => setGoldPrice(e.target.value)}
                      className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder={language === 'ar' ? 'سعر الذهب' : 'Gold price'}
                    />
                  </div>
                )}

                {selectedType === 'silver' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'سعر جرام الفضة' : 'Silver Price per gram'}
                    </label>
                    <input
                      type="number"
                      value={silverPrice}
                      onChange={(e) => setSilverPrice(e.target.value)}
                      className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder={language === 'ar' ? 'سعر الفضة' : 'Silver price'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'الديون المستحقة (اختياري)' : 'Outstanding Debts (optional)'}
                  </label>
                  <input
                    type="number"
                    value={debts}
                    onChange={(e) => setDebts(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={language === 'ar' ? 'مبلغ الديون' : 'Debt amount'}
                  />
                </div>
              </>
            )}

            {/* Crops specific fields */}
            {selectedType === 'crops' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'كمية المحصول (كيلوجرام)' : 'Crop Amount (kilograms)'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={language === 'ar' ? 'الكمية بالكيلوجرام' : 'Amount in kg'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'طريقة الري' : 'Irrigation Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIrrigationType('rain')}
                      className={cn(
                        "p-3 rounded-lg text-center transition-colors",
                        irrigationType === 'rain'
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500"
                          : "bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                      )}
                    >
                      <div className="text-sm font-medium">
                        {language === 'ar' ? 'مطر/نهر' : 'Rain/River'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {language === 'ar' ? '10%' : '10%'}
                      </div>
                    </button>
                    <button
                      onClick={() => setIrrigationType('irrigation')}
                      className={cn(
                        "p-3 rounded-lg text-center transition-colors",
                        irrigationType === 'irrigation'
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500"
                          : "bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                      )}
                    >
                      <div className="text-sm font-medium">
                        {language === 'ar' ? 'ري صناعي' : 'Irrigation'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {language === 'ar' ? '5%' : '5%'}
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Livestock specific fields */}
            {selectedType === 'livestock' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'نوع الأنعام' : 'Livestock Type'}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'sheep', nameAr: 'غنم', nameEn: 'Sheep', min: 40 },
                      { id: 'cattle', nameAr: 'بقر', nameEn: 'Cattle', min: 30 },
                      { id: 'camels', nameAr: 'إبل', nameEn: 'Camels', min: 5 }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setLivestockType(type.id as any)}
                        className={cn(
                          "p-3 rounded-lg text-center transition-colors",
                          livestockType === type.id
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500"
                            : "bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                        )}
                      >
                        <div className="text-sm font-medium">
                          {language === 'ar' ? type.nameAr : type.nameEn}
                        </div>
                        <div className="text-xs text-slate-500">
                          {language === 'ar' ? `من ${type.min}` : `From ${type.min}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'عدد الرؤوس' : 'Number of Animals'}
                  </label>
                  <input
                    type="number"
                    value={livestockCount}
                    onChange={(e) => setLivestockCount(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={language === 'ar' ? 'عدد الرؤوس' : 'Number of animals'}
                  />
                </div>
              </>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {language === 'ar' ? 'نتيجة الحساب' : 'Calculation Result'}
            </h3>

            {zakatResult ? (
              <div className="space-y-4">
                <div className={cn(
                  "p-6 rounded-xl border-2",
                  zakatResult.eligible
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
                )}>
                  <div className="text-center">
                    <div className={cn(
                      "text-3xl font-bold mb-2",
                      zakatResult.eligible ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {zakatResult.eligible 
                        ? (selectedType === 'livestock' 
                          ? `${zakatResult.amount} ${language === 'ar' ? 'رأس' : 'animals'}`
                          : formatCurrency(zakatResult.amount))
                        : (language === 'ar' ? 'لا تجب الزكاة' : 'No Zakat Due')
                      }
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {language === 'ar' ? 'مقدار الزكاة الواجبة' : 'Required Zakat Amount'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {language === 'ar' ? 'النصاب' : 'Nisab'}
                    </div>
                    <div className="text-lg font-bold">
                      {selectedType === 'livestock' 
                        ? `${zakatResult.nisabValue} ${language === 'ar' ? 'رأس' : 'animals'}`
                        : formatCurrency(zakatResult.nisabValue)
                      }
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {language === 'ar' ? 'المبلغ الصافي' : 'Net Amount'}
                    </div>
                    <div className="text-lg font-bold">
                      {selectedType === 'livestock' 
                        ? `${livestockCount || 0} ${language === 'ar' ? 'رأس' : 'animals'}`
                        : formatCurrency(zakatResult.netAmount)
                      }
                    </div>
                  </div>
                </div>

                {zakatResult.eligible && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                          {language === 'ar' ? 'تذكير مهم' : 'Important Reminder'}
                        </p>
                        <p className="text-blue-600 dark:text-blue-400">
                          {language === 'ar' 
                            ? 'تأكد من مرور سنة هجرية كاملة على المال وأن يكون فوق النصاب طوال العام'
                            : 'Ensure a full lunar year has passed and the amount remained above nisab throughout the year'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'أدخل البيانات لحساب الزكاة' : 'Enter data to calculate Zakat'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Conditions Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowConditions(!showConditions)}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {language === 'ar' ? 'شروط وجوب الزكاة' : 'Conditions for Zakat Obligation'}
            </h3>
            {showConditions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showConditions && (
            <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-3">
                    {language === 'ar' ? 'الشروط الأساسية' : 'Basic Conditions'}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{language === 'ar' ? 'بلوغ النصاب المحدد شرعاً' : 'Reaching the prescribed nisab'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{language === 'ar' ? 'مرور سنة هجرية كاملة (الحول)' : 'Completion of one lunar year (hawl)'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{language === 'ar' ? 'الملكية التامة للمال' : 'Full ownership of the wealth'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{language === 'ar' ? 'عدم وجود ديون تنقص المال عن النصاب' : 'No debts that reduce wealth below nisab'}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-3">
                    {language === 'ar' ? 'الأدلة الشرعية' : 'Islamic Evidence'}
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <p className="font-arabic text-right text-base mb-2">
                        «ليس فيما دون خمس أواق صدقة»
                      </p>
                      <p className="text-xs text-slate-500">
                        {language === 'ar' ? 'رواه البخاري ومسلم' : 'Narrated by Bukhari and Muslim'}
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <p className="font-arabic text-right text-base mb-2">
                        «لا زكاة في مال حتى يحول عليه الحول»
                      </p>
                      <p className="text-xs text-slate-500">
                        {language === 'ar' ? 'رواه الترمذي وأبو داود' : 'Narrated by Tirmidhi and Abu Dawud'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recipients Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowRecipients(!showRecipients)}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {language === 'ar' ? 'مصارف الزكاة الثمانية' : 'Eight Categories of Zakat Recipients'}
            </h3>
            {showRecipients ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showRecipients && (
            <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="font-arabic text-xl text-center leading-relaxed">
                  ﴿إِنَّمَا ٱلصَّدَقَٰتُ لِلۡفُقَرَآءِ وَٱلۡمَسَٰكِينِ وَٱلۡعَٰمِلِينَ عَلَيۡهَا وَٱلۡمُؤَلَّفَةِ قُلُوبُهُمۡ وَفِي ٱلرِّقَابِ وَٱلۡغَٰرِمِينَ وَفِي سَبِيلِ ٱللَّهِ وَٱبۡنِ ٱلسَّبِيلِۖ فَرِيضَةٗ مِّنَ ٱللَّهِۗ وَٱللَّهُ عَلِيمٌ حَكِيمٌ﴾
                </p>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {language === 'ar' ? 'سورة التوبة: 60' : 'Surah At-Tawbah: 60'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ZAKAT_RECIPIENTS.map((recipient, index) => (
                  <div key={index} className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? recipient.nameAr : recipient.nameEn}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {language === 'ar' ? recipient.descriptionAr : recipient.descriptionEn}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}