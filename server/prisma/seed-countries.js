/**
 * Seed Countries
 * Populates the countries table with all world countries
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// All 195 countries with ISO codes, dial codes, currencies, and approximate USD exchange rates
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
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', currency: 'CZK', currencySymbol: 'Kč', usdExchangeRate: 23, sortOrder: 46 },
  { code: 'HU', name: 'Hungary', dialCode: '+36', currency: 'HUF', currencySymbol: 'Ft', usdExchangeRate: 360, sortOrder: 47 },
  { code: 'RO', name: 'Romania', dialCode: '+40', currency: 'RON', currencySymbol: 'lei', usdExchangeRate: 4.6, sortOrder: 48 },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', currency: 'BGN', currencySymbol: 'лв', usdExchangeRate: 1.8, sortOrder: 49 },
  { code: 'HR', name: 'Croatia', dialCode: '+385', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 50 },
  { code: 'RS', name: 'Serbia', dialCode: '+381', currency: 'RSD', currencySymbol: 'din', usdExchangeRate: 108, sortOrder: 51 },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 52 },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 53 },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 54 },
  { code: 'LV', name: 'Latvia', dialCode: '+371', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 55 },
  { code: 'EE', name: 'Estonia', dialCode: '+372', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 56 },
  { code: 'RU', name: 'Russia', dialCode: '+7', currency: 'RUB', currencySymbol: '₽', usdExchangeRate: 92, sortOrder: 57 },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', currency: 'UAH', currencySymbol: '₴', usdExchangeRate: 41, sortOrder: 58 },
  { code: 'BY', name: 'Belarus', dialCode: '+375', currency: 'BYN', currencySymbol: 'Br', usdExchangeRate: 3.3, sortOrder: 59 },
  { code: 'MD', name: 'Moldova', dialCode: '+373', currency: 'MDL', currencySymbol: 'L', usdExchangeRate: 17.8, sortOrder: 60 },
  { code: 'AL', name: 'Albania', dialCode: '+355', currency: 'ALL', currencySymbol: 'L', usdExchangeRate: 95, sortOrder: 61 },
  { code: 'MK', name: 'North Macedonia', dialCode: '+389', currency: 'MKD', currencySymbol: 'ден', usdExchangeRate: 57, sortOrder: 62 },
  { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387', currency: 'BAM', currencySymbol: 'KM', usdExchangeRate: 1.8, sortOrder: 63 },
  { code: 'ME', name: 'Montenegro', dialCode: '+382', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 64 },
  { code: 'XK', name: 'Kosovo', dialCode: '+383', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 65 },
  { code: 'IS', name: 'Iceland', dialCode: '+354', currency: 'ISK', currencySymbol: 'kr', usdExchangeRate: 137, sortOrder: 66 },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 67 },
  { code: 'MT', name: 'Malta', dialCode: '+356', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 68 },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 69 },
  { code: 'MC', name: 'Monaco', dialCode: '+377', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 70 },
  { code: 'AD', name: 'Andorra', dialCode: '+376', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 71 },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423', currency: 'CHF', currencySymbol: 'CHF', usdExchangeRate: 0.88, sortOrder: 72 },
  { code: 'SM', name: 'San Marino', dialCode: '+378', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 73 },
  { code: 'VA', name: 'Vatican City', dialCode: '+379', currency: 'EUR', currencySymbol: '€', usdExchangeRate: 0.92, sortOrder: 74 },
  { code: 'GE', name: 'Georgia', dialCode: '+995', currency: 'GEL', currencySymbol: '₾', usdExchangeRate: 2.7, sortOrder: 75 },
  { code: 'AM', name: 'Armenia', dialCode: '+374', currency: 'AMD', currencySymbol: '֏', usdExchangeRate: 405, sortOrder: 76 },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994', currency: 'AZN', currencySymbol: '₼', usdExchangeRate: 1.7, sortOrder: 77 },

  // African countries
  { code: 'EG', name: 'Egypt', dialCode: '+20', currency: 'EGP', currencySymbol: '£', usdExchangeRate: 30.9, sortOrder: 100 },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', currency: 'NGN', currencySymbol: '₦', usdExchangeRate: 1550, sortOrder: 101 },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', currency: 'ZAR', currencySymbol: 'R', usdExchangeRate: 18.5, sortOrder: 102 },
  { code: 'GH', name: 'Ghana', dialCode: '+233', currency: 'GHS', currencySymbol: '₵', usdExchangeRate: 12.5, sortOrder: 103 },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', currency: 'TZS', currencySymbol: 'TSh', usdExchangeRate: 2500, sortOrder: 104 },
  { code: 'UG', name: 'Uganda', dialCode: '+256', currency: 'UGX', currencySymbol: 'USh', usdExchangeRate: 3750, sortOrder: 105 },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', currency: 'RWF', currencySymbol: 'FRw', usdExchangeRate: 1250, sortOrder: 106 },
  { code: 'SD', name: 'Sudan', dialCode: '+249', currency: 'SDG', currencySymbol: 'ج.س', usdExchangeRate: 600, sortOrder: 107 },
  { code: 'SS', name: 'South Sudan', dialCode: '+211', currency: 'SSP', currencySymbol: '£', usdExchangeRate: 130, sortOrder: 108 },
  { code: 'MA', name: 'Morocco', dialCode: '+212', currency: 'MAD', currencySymbol: 'د.م.', usdExchangeRate: 10.1, sortOrder: 109 },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', currency: 'TND', currencySymbol: 'د.ت', usdExchangeRate: 3.1, sortOrder: 110 },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', currency: 'DZD', currencySymbol: 'د.ج', usdExchangeRate: 135, sortOrder: 111 },
  { code: 'LY', name: 'Libya', dialCode: '+218', currency: 'LYD', currencySymbol: 'ل.د', usdExchangeRate: 4.85, sortOrder: 112 },
  { code: 'SN', name: 'Senegal', dialCode: '+221', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 113 },
  { code: 'CI', name: "Cote d'Ivoire", dialCode: '+225', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 114 },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', currency: 'XAF', currencySymbol: 'FCFA', usdExchangeRate: 605, sortOrder: 115 },
  { code: 'AO', name: 'Angola', dialCode: '+244', currency: 'AOA', currencySymbol: 'Kz', usdExchangeRate: 830, sortOrder: 116 },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258', currency: 'MZN', currencySymbol: 'MT', usdExchangeRate: 63.5, sortOrder: 117 },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', currency: 'ZWL', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 118 },
  { code: 'BW', name: 'Botswana', dialCode: '+267', currency: 'BWP', currencySymbol: 'P', usdExchangeRate: 13.5, sortOrder: 119 },
  { code: 'MU', name: 'Mauritius', dialCode: '+230', currency: 'MUR', currencySymbol: '₨', usdExchangeRate: 45, sortOrder: 120 },
  { code: 'ZM', name: 'Zambia', dialCode: '+260', currency: 'ZMW', currencySymbol: 'ZK', usdExchangeRate: 26, sortOrder: 121 },
  { code: 'MW', name: 'Malawi', dialCode: '+265', currency: 'MWK', currencySymbol: 'MK', usdExchangeRate: 1680, sortOrder: 122 },
  { code: 'NA', name: 'Namibia', dialCode: '+264', currency: 'NAD', currencySymbol: '$', usdExchangeRate: 18.5, sortOrder: 123 },
  { code: 'SZ', name: 'Eswatini', dialCode: '+268', currency: 'SZL', currencySymbol: 'L', usdExchangeRate: 18.5, sortOrder: 124 },
  { code: 'LS', name: 'Lesotho', dialCode: '+266', currency: 'LSL', currencySymbol: 'L', usdExchangeRate: 18.5, sortOrder: 125 },
  { code: 'MG', name: 'Madagascar', dialCode: '+261', currency: 'MGA', currencySymbol: 'Ar', usdExchangeRate: 4500, sortOrder: 126 },
  { code: 'SC', name: 'Seychelles', dialCode: '+248', currency: 'SCR', currencySymbol: '₨', usdExchangeRate: 13.5, sortOrder: 127 },
  { code: 'KM', name: 'Comoros', dialCode: '+269', currency: 'KMF', currencySymbol: 'CF', usdExchangeRate: 450, sortOrder: 128 },
  { code: 'MR', name: 'Mauritania', dialCode: '+222', currency: 'MRU', currencySymbol: 'UM', usdExchangeRate: 39.5, sortOrder: 129 },
  { code: 'ML', name: 'Mali', dialCode: '+223', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 130 },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 131 },
  { code: 'NE', name: 'Niger', dialCode: '+227', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 132 },
  { code: 'TD', name: 'Chad', dialCode: '+235', currency: 'XAF', currencySymbol: 'FCFA', usdExchangeRate: 605, sortOrder: 133 },
  { code: 'CF', name: 'Central African Republic', dialCode: '+236', currency: 'XAF', currencySymbol: 'FCFA', usdExchangeRate: 605, sortOrder: 134 },
  { code: 'CG', name: 'Congo', dialCode: '+242', currency: 'XAF', currencySymbol: 'FCFA', usdExchangeRate: 605, sortOrder: 135 },
  { code: 'CD', name: 'DR Congo', dialCode: '+243', currency: 'CDF', currencySymbol: 'FC', usdExchangeRate: 2750, sortOrder: 136 },
  { code: 'GA', name: 'Gabon', dialCode: '+241', currency: 'XAF', currencySymbol: 'FCFA', usdExchangeRate: 605, sortOrder: 137 },
  { code: 'GQ', name: 'Equatorial Guinea', dialCode: '+240', currency: 'XAF', currencySymbol: 'FCFA', usdExchangeRate: 605, sortOrder: 138 },
  { code: 'ST', name: 'Sao Tome and Principe', dialCode: '+239', currency: 'STN', currencySymbol: 'Db', usdExchangeRate: 22.5, sortOrder: 139 },
  { code: 'BI', name: 'Burundi', dialCode: '+257', currency: 'BIF', currencySymbol: 'FBu', usdExchangeRate: 2850, sortOrder: 140 },
  { code: 'BJ', name: 'Benin', dialCode: '+229', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 141 },
  { code: 'TG', name: 'Togo', dialCode: '+228', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 142 },
  { code: 'GN', name: 'Guinea', dialCode: '+224', currency: 'GNF', currencySymbol: 'FG', usdExchangeRate: 8600, sortOrder: 143 },
  { code: 'GW', name: 'Guinea-Bissau', dialCode: '+245', currency: 'XOF', currencySymbol: 'CFA', usdExchangeRate: 605, sortOrder: 144 },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232', currency: 'SLE', currencySymbol: 'Le', usdExchangeRate: 22.5, sortOrder: 145 },
  { code: 'LR', name: 'Liberia', dialCode: '+231', currency: 'LRD', currencySymbol: '$', usdExchangeRate: 192, sortOrder: 146 },
  { code: 'GM', name: 'Gambia', dialCode: '+220', currency: 'GMD', currencySymbol: 'D', usdExchangeRate: 67, sortOrder: 147 },
  { code: 'CV', name: 'Cape Verde', dialCode: '+238', currency: 'CVE', currencySymbol: '$', usdExchangeRate: 101, sortOrder: 148 },
  { code: 'EH', name: 'Western Sahara', dialCode: '+212', currency: 'MAD', currencySymbol: 'د.م.', usdExchangeRate: 10.1, sortOrder: 149 },

  // Asian countries
  { code: 'IN', name: 'India', dialCode: '+91', currency: 'INR', currencySymbol: '₹', usdExchangeRate: 83.3, sortOrder: 200 },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', currency: 'PKR', currencySymbol: '₨', usdExchangeRate: 278, sortOrder: 201 },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', currency: 'BDT', currencySymbol: '৳', usdExchangeRate: 110, sortOrder: 202 },
  { code: 'CN', name: 'China', dialCode: '+86', currency: 'CNY', currencySymbol: '¥', usdExchangeRate: 7.25, sortOrder: 203 },
  { code: 'JP', name: 'Japan', dialCode: '+81', currency: 'JPY', currencySymbol: '¥', usdExchangeRate: 149, sortOrder: 204 },
  { code: 'KR', name: 'South Korea', dialCode: '+82', currency: 'KRW', currencySymbol: '₩', usdExchangeRate: 1320, sortOrder: 205 },
  { code: 'KP', name: 'North Korea', dialCode: '+850', currency: 'KPW', currencySymbol: '₩', usdExchangeRate: 900, sortOrder: 206 },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', currency: 'IDR', currencySymbol: 'Rp', usdExchangeRate: 15700, sortOrder: 207 },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', currency: 'MYR', currencySymbol: 'RM', usdExchangeRate: 4.7, sortOrder: 208 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', currency: 'SGD', currencySymbol: '$', usdExchangeRate: 1.34, sortOrder: 209 },
  { code: 'TH', name: 'Thailand', dialCode: '+66', currency: 'THB', currencySymbol: '฿', usdExchangeRate: 35.5, sortOrder: 210 },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', currency: 'VND', currencySymbol: '₫', usdExchangeRate: 24500, sortOrder: 211 },
  { code: 'PH', name: 'Philippines', dialCode: '+63', currency: 'PHP', currencySymbol: '₱', usdExchangeRate: 56, sortOrder: 212 },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', currency: 'MMK', currencySymbol: 'K', usdExchangeRate: 2100, sortOrder: 213 },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', currency: 'KHR', currencySymbol: '៛', usdExchangeRate: 4100, sortOrder: 214 },
  { code: 'LA', name: 'Laos', dialCode: '+856', currency: 'LAK', currencySymbol: '₭', usdExchangeRate: 20800, sortOrder: 215 },
  { code: 'BN', name: 'Brunei', dialCode: '+673', currency: 'BND', currencySymbol: '$', usdExchangeRate: 1.34, sortOrder: 216 },
  { code: 'TL', name: 'Timor-Leste', dialCode: '+670', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 217 },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', currency: 'LKR', currencySymbol: '₨', usdExchangeRate: 310, sortOrder: 218 },
  { code: 'NP', name: 'Nepal', dialCode: '+977', currency: 'NPR', currencySymbol: '₨', usdExchangeRate: 133, sortOrder: 219 },
  { code: 'BT', name: 'Bhutan', dialCode: '+975', currency: 'BTN', currencySymbol: 'Nu.', usdExchangeRate: 83.3, sortOrder: 220 },
  { code: 'MV', name: 'Maldives', dialCode: '+960', currency: 'MVR', currencySymbol: 'Rf', usdExchangeRate: 15.4, sortOrder: 221 },
  { code: 'MN', name: 'Mongolia', dialCode: '+976', currency: 'MNT', currencySymbol: '₮', usdExchangeRate: 3450, sortOrder: 222 },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7', currency: 'KZT', currencySymbol: '₸', usdExchangeRate: 450, sortOrder: 223 },
  { code: 'UZ', name: 'Uzbekistan', dialCode: '+998', currency: 'UZS', currencySymbol: 'so\'m', usdExchangeRate: 12500, sortOrder: 224 },
  { code: 'TM', name: 'Turkmenistan', dialCode: '+993', currency: 'TMT', currencySymbol: 'm', usdExchangeRate: 3.5, sortOrder: 225 },
  { code: 'TJ', name: 'Tajikistan', dialCode: '+992', currency: 'TJS', currencySymbol: 'SM', usdExchangeRate: 10.9, sortOrder: 226 },
  { code: 'KG', name: 'Kyrgyzstan', dialCode: '+996', currency: 'KGS', currencySymbol: 'с', usdExchangeRate: 89, sortOrder: 227 },
  { code: 'TR', name: 'Turkey', dialCode: '+90', currency: 'TRY', currencySymbol: '₺', usdExchangeRate: 32, sortOrder: 228 },
  { code: 'IL', name: 'Israel', dialCode: '+972', currency: 'ILS', currencySymbol: '₪', usdExchangeRate: 3.7, sortOrder: 229 },
  { code: 'JO', name: 'Jordan', dialCode: '+962', currency: 'JOD', currencySymbol: 'د.أ', usdExchangeRate: 0.71, sortOrder: 230 },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', currency: 'LBP', currencySymbol: 'ل.ل', usdExchangeRate: 89500, sortOrder: 231 },
  { code: 'SY', name: 'Syria', dialCode: '+963', currency: 'SYP', currencySymbol: '£', usdExchangeRate: 13000, sortOrder: 232 },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', currency: 'IQD', currencySymbol: 'ع.د', usdExchangeRate: 1310, sortOrder: 233 },
  { code: 'IR', name: 'Iran', dialCode: '+98', currency: 'IRR', currencySymbol: '﷼', usdExchangeRate: 42000, sortOrder: 234 },
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', currency: 'AFN', currencySymbol: '؋', usdExchangeRate: 70, sortOrder: 235 },
  { code: 'YE', name: 'Yemen', dialCode: '+967', currency: 'YER', currencySymbol: '﷼', usdExchangeRate: 250, sortOrder: 236 },
  { code: 'PS', name: 'Palestine', dialCode: '+970', currency: 'ILS', currencySymbol: '₪', usdExchangeRate: 3.7, sortOrder: 237 },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', currency: 'TWD', currencySymbol: 'NT$', usdExchangeRate: 32, sortOrder: 238 },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', currency: 'HKD', currencySymbol: '$', usdExchangeRate: 7.8, sortOrder: 239 },
  { code: 'MO', name: 'Macau', dialCode: '+853', currency: 'MOP', currencySymbol: 'MOP$', usdExchangeRate: 8, sortOrder: 240 },

  // Americas
  { code: 'MX', name: 'Mexico', dialCode: '+52', currency: 'MXN', currencySymbol: '$', usdExchangeRate: 17.2, sortOrder: 300 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', currency: 'BRL', currencySymbol: 'R$', usdExchangeRate: 4.95, sortOrder: 301 },
  { code: 'AR', name: 'Argentina', dialCode: '+54', currency: 'ARS', currencySymbol: '$', usdExchangeRate: 870, sortOrder: 302 },
  { code: 'CO', name: 'Colombia', dialCode: '+57', currency: 'COP', currencySymbol: '$', usdExchangeRate: 3950, sortOrder: 303 },
  { code: 'CL', name: 'Chile', dialCode: '+56', currency: 'CLP', currencySymbol: '$', usdExchangeRate: 950, sortOrder: 304 },
  { code: 'PE', name: 'Peru', dialCode: '+51', currency: 'PEN', currencySymbol: 'S/', usdExchangeRate: 3.75, sortOrder: 305 },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', currency: 'VES', currencySymbol: 'Bs', usdExchangeRate: 36.5, sortOrder: 306 },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 307 },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', currency: 'BOB', currencySymbol: 'Bs.', usdExchangeRate: 6.9, sortOrder: 308 },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', currency: 'PYG', currencySymbol: '₲', usdExchangeRate: 7500, sortOrder: 309 },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', currency: 'UYU', currencySymbol: '$', usdExchangeRate: 39, sortOrder: 310 },
  { code: 'GY', name: 'Guyana', dialCode: '+592', currency: 'GYD', currencySymbol: '$', usdExchangeRate: 209, sortOrder: 311 },
  { code: 'SR', name: 'Suriname', dialCode: '+597', currency: 'SRD', currencySymbol: '$', usdExchangeRate: 37, sortOrder: 312 },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', currency: 'GTQ', currencySymbol: 'Q', usdExchangeRate: 7.8, sortOrder: 313 },
  { code: 'HN', name: 'Honduras', dialCode: '+504', currency: 'HNL', currencySymbol: 'L', usdExchangeRate: 24.7, sortOrder: 314 },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 315 },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', currency: 'NIO', currencySymbol: 'C$', usdExchangeRate: 36.6, sortOrder: 316 },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', currency: 'CRC', currencySymbol: '₡', usdExchangeRate: 520, sortOrder: 317 },
  { code: 'PA', name: 'Panama', dialCode: '+507', currency: 'PAB', currencySymbol: 'B/.', usdExchangeRate: 1, sortOrder: 318 },
  { code: 'BZ', name: 'Belize', dialCode: '+501', currency: 'BZD', currencySymbol: '$', usdExchangeRate: 2, sortOrder: 319 },
  { code: 'CU', name: 'Cuba', dialCode: '+53', currency: 'CUP', currencySymbol: '$', usdExchangeRate: 24, sortOrder: 320 },
  { code: 'JM', name: 'Jamaica', dialCode: '+1876', currency: 'JMD', currencySymbol: '$', usdExchangeRate: 156, sortOrder: 321 },
  { code: 'HT', name: 'Haiti', dialCode: '+509', currency: 'HTG', currencySymbol: 'G', usdExchangeRate: 132, sortOrder: 322 },
  { code: 'DO', name: 'Dominican Republic', dialCode: '+1809', currency: 'DOP', currencySymbol: '$', usdExchangeRate: 58, sortOrder: 323 },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1787', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 324 },
  { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1868', currency: 'TTD', currencySymbol: '$', usdExchangeRate: 6.8, sortOrder: 325 },
  { code: 'BB', name: 'Barbados', dialCode: '+1246', currency: 'BBD', currencySymbol: '$', usdExchangeRate: 2, sortOrder: 326 },
  { code: 'BS', name: 'Bahamas', dialCode: '+1242', currency: 'BSD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 327 },
  { code: 'LC', name: 'Saint Lucia', dialCode: '+1758', currency: 'XCD', currencySymbol: '$', usdExchangeRate: 2.7, sortOrder: 328 },
  { code: 'GD', name: 'Grenada', dialCode: '+1473', currency: 'XCD', currencySymbol: '$', usdExchangeRate: 2.7, sortOrder: 329 },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', dialCode: '+1784', currency: 'XCD', currencySymbol: '$', usdExchangeRate: 2.7, sortOrder: 330 },
  { code: 'AG', name: 'Antigua and Barbuda', dialCode: '+1268', currency: 'XCD', currencySymbol: '$', usdExchangeRate: 2.7, sortOrder: 331 },
  { code: 'DM', name: 'Dominica', dialCode: '+1767', currency: 'XCD', currencySymbol: '$', usdExchangeRate: 2.7, sortOrder: 332 },
  { code: 'KN', name: 'Saint Kitts and Nevis', dialCode: '+1869', currency: 'XCD', currencySymbol: '$', usdExchangeRate: 2.7, sortOrder: 333 },

  // Oceania
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', currency: 'NZD', currencySymbol: '$', usdExchangeRate: 1.65, sortOrder: 400 },
  { code: 'FJ', name: 'Fiji', dialCode: '+679', currency: 'FJD', currencySymbol: '$', usdExchangeRate: 2.25, sortOrder: 401 },
  { code: 'PG', name: 'Papua New Guinea', dialCode: '+675', currency: 'PGK', currencySymbol: 'K', usdExchangeRate: 3.75, sortOrder: 402 },
  { code: 'SB', name: 'Solomon Islands', dialCode: '+677', currency: 'SBD', currencySymbol: '$', usdExchangeRate: 8.4, sortOrder: 403 },
  { code: 'VU', name: 'Vanuatu', dialCode: '+678', currency: 'VUV', currencySymbol: 'Vt', usdExchangeRate: 120, sortOrder: 404 },
  { code: 'WS', name: 'Samoa', dialCode: '+685', currency: 'WST', currencySymbol: 'T', usdExchangeRate: 2.75, sortOrder: 405 },
  { code: 'TO', name: 'Tonga', dialCode: '+676', currency: 'TOP', currencySymbol: 'T$', usdExchangeRate: 2.35, sortOrder: 406 },
  { code: 'KI', name: 'Kiribati', dialCode: '+686', currency: 'AUD', currencySymbol: '$', usdExchangeRate: 1.53, sortOrder: 407 },
  { code: 'FM', name: 'Micronesia', dialCode: '+691', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 408 },
  { code: 'MH', name: 'Marshall Islands', dialCode: '+692', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 409 },
  { code: 'PW', name: 'Palau', dialCode: '+680', currency: 'USD', currencySymbol: '$', usdExchangeRate: 1, sortOrder: 410 },
  { code: 'NR', name: 'Nauru', dialCode: '+674', currency: 'AUD', currencySymbol: '$', usdExchangeRate: 1.53, sortOrder: 411 },
  { code: 'TV', name: 'Tuvalu', dialCode: '+688', currency: 'AUD', currencySymbol: '$', usdExchangeRate: 1.53, sortOrder: 412 },
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
  console.log(`Total countries in database: ${created + updated}`);
}

seedCountries()
  .catch((e) => {
    console.error('Error seeding countries:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
