/**
 * Seed Countries
 * Populates the countries table with all world countries
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// All countries with ISO codes, dial codes, currencies, and approximate USD exchange rates
const countries = [
  // Priority countries (Horn of Africa) - sortOrder 1-10
  { code: 'SO', name: 'Somalia', dialCode: '+252', currency: 'SOS', currencySymbol: 'S', usdExchangeRate: 571, sortOrder: 1 },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', currency: 'ETB', currencySymbol: 'Br', usdExchangeRate: 56.5, sortOrder: 2 },
  { code: 'KE', name: 'Kenya', dialCode: '+254', currency: 'KES', currencySymbol: 'KSh', usdExchangeRate: 153, sortOrder: 3 },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253', currency: 'DJF', currencySymbol: 'Fdj', usdExchangeRate: 177.7, sortOrder: 4 },
  { code: 'ER', name: 'Eritrea', dialCode: '+291', currency: 'ERN', currencySymbol: 'Nfk', usdExchangeRate: 15, sortOrder: 5 },

  // Middle East (common for Somali diaspora)
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', currency: 'AED', currencySymbol: 'د.إ', usdExchangeRate: 3.67, sortOrder: 10 },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', currency: 'SAR', currencySymbol: '﷼', usdExchangeRate: 3.75, sortOrder: 11 },
  { code: 'QA', name: 'Qatar', dialCode: '+974', currency: 'QAR', currencySymbol: '﷼', usdExchangeRate: 3.64, sortOrder: 12 },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', currency: 'KWD', currencySymbol: 'د.ك', usdExchangeRate: 0.31, sortOrder: 13 },
  { code: 'OM', name: 'Oman', dialCode: '+968', currency: 'OMR', currencySymbol: '﷼', usdExchangeRate: 0.38, sortOrder: 14 },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', currency: 'BHD', currencySymbol: '.د.ب', usdExchangeRate: 0.38, sortOrder: 15 },

  // Western countries (diaspora)
  { code: 'US', name: 'United States', dialCode: '+1', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 20 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', currency: 'GBP', currencySymbol: '£', usdExchangeRate: 0.79, sortOrder: 21 },
  { code: 'CA', name: 'Canada', dialCode: '+1', currency: 'CAD', currencySymbol: '$', usdExchangeRate: 1.36, sortOrder: 22 },
  { code: 'AU', name: 'Australia', dialCode: '+61', currency: 'AUD', currencySymbol: '$', usdExchangeRate: 1.53, sortOrder: 23 },

  // European countries
  { code: 'DE', name: 'Germany', dialCode: '+49', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 30 },
  { code: 'FR', name: 'France', dialCode: '+33', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 31 },
  { code: 'IT', name: 'Italy', dialCode: '+39', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 32 },
  { code: 'ES', name: 'Spain', dialCode: '+34', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 33 },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 34 },
  { code: 'SE', name: 'Sweden', dialCode: '+46', currency: 'SEK', currencySymbol: 'kr', usdExchangeRate: 10.5, sortOrder: 35 },
  { code: 'NO', name: 'Norway', dialCode: '+47', currency: 'NOK', currencySymbol: 'kr', usdExchangeRate: 10.8, sortOrder: 36 },
  { code: 'DK', name: 'Denmark', dialCode: '+45', currency: 'DKK', currencySymbol: 'kr', usdExchangeRate: 6.9, sortOrder: 37 },
  { code: 'FI', name: 'Finland', dialCode: '+358', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 38 },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', currency: 'CHF', currencySymbol: 'CHF', usdExchangeRate: 0.88, sortOrder: 39 },
  { code: 'AT', name: 'Austria', dialCode: '+43', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 40 },
  { code: 'BE', name: 'Belgium', dialCode: '+32', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 41 },
  { code: 'PT', name: 'Portugal', dialCode: '+351', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 42 },
  { code: 'IE', name: 'Ireland', dialCode: '+353', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 43 },
  { code: 'PL', name: 'Poland', dialCode: '+48', currency: 'PLN', currencySymbol: 'zł', usdExchangeRate: 4.0, sortOrder: 44 },
  { code: 'GR', name: 'Greece', dialCode: '+30', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 45 },

  // African countries
  { code: 'EG', name: 'Egypt', dialCode: '+20', currency: 'EGP', currencySymbol: '£', usdExchangeRate: 30.9, sortOrder: 50 },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', currency: 'NGN', currencySymbol: '₦', usdExchangeRate: 1550, sortOrder: 51 },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', currency: 'ZAR', currencySymbol: 'R', usdExchangeRate: 18.5, sortOrder: 52 },
  { code: 'GH', name: 'Ghana', dialCode: '+233', currency: 'GHS', currencySymbol: '₵', usdExchangeRate: 12.5, sortOrder: 53 },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', currency: 'TZS', currencySymbol: 'TSh', usdExchangeRate: 2500, sortOrder: 54 },
  { code: 'UG', name: 'Uganda', dialCode: '+256', currency: 'UGX', currencySymbol: 'USh', usdExchangeRate: 3750, sortOrder: 55 },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', currency: 'RWF', currencySymbol: 'FRw', usdExchangeRate: 1250, sortOrder: 56 },
  { code: 'SD', name: 'Sudan', dialCode: '+249', currency: 'SDG', currencySymbol: 'ج.س', usdExchangeRate: 600, sortOrder: 57 },
  { code: 'MA', name: 'Morocco', dialCode: '+212', currency: 'MAD', currencySymbol: 'د.م.', usdExchangeRate: 10.1, sortOrder: 58 },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', currency: 'TND', currencySymbol: 'د.ت', usdExchangeRate: 3.1, sortOrder: 59 },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', currency: 'DZD', currencySymbol: 'د.ج', usdExchangeRate: 135, sortOrder: 60 },
  { code: 'LY', name: 'Libya', dialCode: '+218', currency: 'LYD', currencySymbol: 'ل.د', usdExchangeRate: 4.85, sortOrder: 61 },
  { code: 'SN', name: 'Senegal', dialCode: '+221', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 62 },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 63 },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', currency: 'XAF', currencySymbol: 'FCFA', usdExchangeRate: 605, sortOrder: 64 },
  { code: 'AO', name: 'Angola', dialCode: '+244', currency: 'AOA', currencySymbol: 'Kz', usdExchangeRate: 830, sortOrder: 65 },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258', currency: 'MZN', currencySymbol: 'MT', usdExchangeRate: 63.5, sortOrder: 66 },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', currency: 'ZWL', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 67 },
  { code: 'BW', name: 'Botswana', dialCode: '+267', currency: 'BWP', currencySymbol: 'P', usdExchangeRate: 13.5, sortOrder: 68 },
  { code: 'MU', name: 'Mauritius', dialCode: '+230', currency: 'MUR', currencySymbol: '₨', usdExchangeRate: 45, sortOrder: 69 },

  // Asian countries
  { code: 'IN', name: 'India', dialCode: '+91', currency: 'INR', currencySymbol: '₹', usdExchangeRate: 83.3, sortOrder: 70 },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', currency: 'PKR', currencySymbol: '₨', usdExchangeRate: 278, sortOrder: 71 },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', currency: 'BDT', currencySymbol: '৳', usdExchangeRate: 110, sortOrder: 72 },
  { code: 'CN', name: 'China', dialCode: '+86', currency: 'CNY', currencySymbol: '¥', usdExchangeRate: 7.25, sortOrder: 73 },
  { code: 'JP', name: 'Japan', dialCode: '+81', currency: 'JPY', currencySymbol: '¥', usdExchangeRate: 149, sortOrder: 74 },
  { code: 'KR', name: 'South Korea', dialCode: '+82', currency: 'KRW', currencySymbol: '₩', usdExchangeRate: 1320, sortOrder: 75 },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', currency: 'IDR', currencySymbol: 'Rp', usdExchangeRate: 15700, sortOrder: 76 },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', currency: 'MYR', currencySymbol: 'RM', usdExchangeRate: 4.7, sortOrder: 77 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', currency: 'SGD', currencySymbol: '$', usdExchangeRate: 1.34, sortOrder: 78 },
  { code: 'TH', name: 'Thailand', dialCode: '+66', currency: 'THB', currencySymbol: '฿', usdExchangeRate: 35.5, sortOrder: 79 },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', currency: 'VND', currencySymbol: '₫', usdExchangeRate: 24500, sortOrder: 80 },
  { code: 'PH', name: 'Philippines', dialCode: '+63', currency: 'PHP', currencySymbol: '₱', usdExchangeRate: 56, sortOrder: 81 },
  { code: 'TR', name: 'Turkey', dialCode: '+90', currency: 'TRY', currencySymbol: '₺', usdExchangeRate: 32, sortOrder: 82 },
  { code: 'IL', name: 'Israel', dialCode: '+972', currency: 'ILS', currencySymbol: '₪', usdExchangeRate: 3.7, sortOrder: 83 },
  { code: 'JO', name: 'Jordan', dialCode: '+962', currency: 'JOD', currencySymbol: 'د.أ', usdExchangeRate: 0.71, sortOrder: 84 },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', currency: 'LBP', currencySymbol: 'ل.ل', usdExchangeRate: 89500, sortOrder: 85 },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', currency: 'IQD', currencySymbol: 'ع.د', usdExchangeRate: 1310, sortOrder: 86 },
  { code: 'IR', name: 'Iran', dialCode: '+98', currency: 'IRR', currencySymbol: '﷼', usdExchangeRate: 42000, sortOrder: 87 },
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', currency: 'AFN', currencySymbol: '؋', usdExchangeRate: 70, sortOrder: 88 },
  { code: 'YE', name: 'Yemen', dialCode: '+967', currency: 'YER', currencySymbol: '﷼', usdExchangeRate: 250, sortOrder: 89 },

  // Americas
  { code: 'MX', name: 'Mexico', dialCode: '+52', currency: 'MXN', currencySymbol: '$', usdExchangeRate: 17.2, sortOrder: 90 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', currency: 'BRL', currencySymbol: 'R$', usdExchangeRate: 4.95, sortOrder: 91 },
  { code: 'AR', name: 'Argentina', dialCode: '+54', currency: 'ARS', currencySymbol: '$', usdExchangeRate: 870, sortOrder: 92 },
  { code: 'CO', name: 'Colombia', dialCode: '+57', currency: 'COP', currencySymbol: '$', usdExchangeRate: 3950, sortOrder: 93 },
  { code: 'CL', name: 'Chile', dialCode: '+56', currency: 'CLP', currencySymbol: '$', usdExchangeRate: 950, sortOrder: 94 },
  { code: 'PE', name: 'Peru', dialCode: '+51', currency: 'PEN', currencySymbol: 'S/', usdExchangeRate: 3.75, sortOrder: 95 },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', currency: 'VES', currencySymbol: 'Bs', usdExchangeRate: 36.5, sortOrder: 96 },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 97 },

  // Oceania
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', currency: 'NZD', currencySymbol: '$', usdExchangeRate: 1.65, sortOrder: 100 },

  // Other European
  { code: 'RU', name: 'Russia', dialCode: '+7', currency: 'RUB', currencySymbol: '₽', usdExchangeRate: 92, sortOrder: 110 },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', currency: 'UAH', currencySymbol: '₴', usdExchangeRate: 41, sortOrder: 111 },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', currency: 'CZK', currencySymbol: 'Kč', usdExchangeRate: 23, sortOrder: 112 },
  { code: 'HU', name: 'Hungary', dialCode: '+36', currency: 'HUF', currencySymbol: 'Ft', usdExchangeRate: 360, sortOrder: 113 },
  { code: 'RO', name: 'Romania', dialCode: '+40', currency: 'RON', currencySymbol: 'lei', usdExchangeRate: 4.6, sortOrder: 114 },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', currency: 'BGN', currencySymbol: 'лв', usdExchangeRate: 1.8, sortOrder: 115 },
  { code: 'HR', name: 'Croatia', dialCode: '+385', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 116 },
  { code: 'RS', name: 'Serbia', dialCode: '+381', currency: 'RSD', currencySymbol: 'din', usdExchangeRate: 108, sortOrder: 117 },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 118 },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 119 },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 120 },
  { code: 'LV', name: 'Latvia', dialCode: '+371', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 121 },
  { code: 'EE', name: 'Estonia', dialCode: '+372', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 122 },
];

async function seedCountries() {
  console.log('Seeding countries...');

  let created = 0;
  let updated = 0;

  for (const country of countries) {
    try {
      const existing = await prisma.country.findUnique({
        where: { code: country.code },
      });

      if (existing) {
        await prisma.country.update({
          where: { code: country.code },
          data: country,
        });
        updated++;
      } else {
        await prisma.country.create({
          data: country,
        });
        created++;
      }
    } catch (error) {
      console.error(`Error seeding country ${country.code}:`, error.message);
    }
  }

  console.log(`Countries seeded: ${created} created, ${updated} updated`);
}

seedCountries()
  .catch((e) => {
    console.error('Error seeding countries:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
