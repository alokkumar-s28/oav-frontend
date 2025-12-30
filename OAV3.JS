// School data for ALL districts in Odisha
const schoolData = {
    'Angul': [
        'OAV BANMALIPUR ATHMALLIK',
        'OAV GOPINATHPUR CHENDIPADA',
        'OAV JHARABERENI KANIHA',
        'OAV KHANDAHARA ANGUL',
        'OAV RANIAKATA KISHORENAGAR',
        'OAV SHANTRI BANARPAL',
        'OAV SUBARNAPALI PALLAHARA',
        'OAV MAHULAPAL TALCHER'
    ],
    'Balangir': [
        'OAV BHAINSA PATNAGARH',
        'OAV BHALUMUNDA BANGOMUNDA',
        'OAV BHARUAMUNDA BELPARA',
        'OAV BIBINA SAINTALA',
        'OAV CHANDRAPUR DEOGAON',
        'OAV DUDUKA AGALPUR',
        'OAV JHARMUNDA LOISINGHA',
        'OAV JHARNI TUREKELA',
        'OAV KHAPRAKHOL KHAPARAKHOL',
        'OAV KURSUD TITILAGARH',
        'OAV MAHIMUNDA PUINTALA',
        'OAV MURIBAHAL MURIBAHAL',
        'OAV PATHACHEPA BOLANGIR',
        'OAV TENTULIKHUNTI GUDVELLA'
    ],
    'Balasore': [
        'OAV JAGESWARPADA BAHANAGA',
        'OAV BALARAMPUR BALIAPAL',
        'OAV PATHARAJHADA BASTA',
        'OAV KANTHIBHURI BHOGRAI',
        'OAV KALIKA JALESWAR',
        'OAV ARJUNPUR KHAIRA',
        'OAV JAMUDIHA NILAGIRI',
        'OAV DHIMPURA OUPADA',
        'OAV SUTEI REMUNA',
        'OAV DAKHINAODA SIMULIA',
        'OAV NADIGAON SORO',
        'OAV HINJALA BALASORE SADAR'
    ],
    'Bargarh': [
        'OAV AMBABHONA AMBABHONA',
        'OAV BALIDHIPA JHARBANDH',
        'OAV BANDHUPALI RAJBORASAMBAR',
        'OAV BARPADAR BHEDEN',
        'OAV BARPALI BARPALI',
        'OAV BHOIPURA ATTABIRA',
        'OAV FREZORPUR PAIKMAL',
        'OAV GAISILET GAISILET',
        'OAV GIVINDAPUR BARGARH',
        'OAV KANGAON SOHELLA',
        'OAV KESHAIPALI BHATLI',
        'OAV M-GANDAPALI BIJEPUR'
    ],
    'Bhadrak': [
        'OAV ERAM BASUDEVPUR',
        'OAV OLANGA BHADRAK',
        'OAV UTTARABADA BHANDARIPOKHARI',
        'OAV PALLASGADIA BONTH',
        'OAV MAJHIGAON CHANDABALI',
        'OAV SHYAMPUR DHAMNAGAR',
        'OAV SANTHAPURA TIHIDI'
    ],
    'Boudh': [
        'OAV TETELENGA BOUDH',
        'OAV MANIPUR HARBHANGA',
        'OAV AINLACHUAN KANTAMAL'
    ],
    'Cuttack': [
        'OAV ACHALKOT TIGIRIA',
        'OAV CHITALPUR KANTAPARA',
        'OAV GOVINDPUR BANKI-D PADA',
        'OAV JOKIDOLA BANKI',
        'OAV KANDARKANA TANGI',
        'OAV KAUDUKOLA MAHANGA',
        'OAV KIRIKICHA BADAMBA',
        'OAV KULAGAINSALO NISCHINTAKOILI',
        'OAV KULAILO ATHAGARH',
        'OAV PAIKAPADAPATNA NARASINGHPUR',
        'OAV RAGHABAPUR SALIPUR',
        'OAV RAMDASPUR BARANGA',
        'OAV SRIRAM CUTTACKSADAR',
        'OAV TOLA GOPINATHPUR NIALI'
    ],
    'Deogarh': [
        'OAV BARKOTE BARKOTE',
        'OAV BUDHAPAL REAMAL',
        'OAV TILEIBENI TILEIBENI'
    ],
    'Dhenkanal': [
        'OAV ANKARANTIPUR ODAPADA',
        'OAV BARIHAPUR PARAJANG',
        'OAV BISWANATHPUR GONDIA',
        'OAV JANTARIBOL KAMAKHYANAGAR',
        'OAV KANDHARA KANKADAHAD',
        'OAV MAHISHPAT DHENKANAL SADAR',
        'OAV NIJIGARH HINDOL',
        'OAV PURUSOTTAMPUR BHUBAN'
    ],
    'Gajapati': [
        'OAV LINGIPUR GOSANI',
        'OAV GUMMA GUMMA',
        'OAV ALADA KASHINAGAR',
        'OAV GUNDIMA MOHANA',
        'OAV PARIMALA NUAGADA',
        'OAV CHELLIGIDA RAYAGADA'
    ],
    'Ganjam': [
        'OAV BADAPUR PATRAPUR',
        'OAV BAURIGANDAPALLI KHALLIKOTE',
        'OAV BHATAKUMARADA P PUR',
        'OAV BHUSUNDA SHERAGADA',
        'OAV CHAMAKHANDI CHHATARPUR',
        'OAV CHANAMERI SANAKHEMUNDI',
        'OAV GOLIA BUGUDA',
        'OAV HATIOTA POLOSARA',
        'OAV JAMAGARADA JAGANNATH PRASAD',
        'OAV JILLUNDIPALII BHANJANAGAR',
        'OAV KABISURYANAGAR',
        'OAV KARAPALLI RANGAILUNDA',
        'OAV KUSAGUMA DHARAKOTE',
        'OAV KUSUMI KUKUDAKHANDI',
        'OAV NIMINA ASKA',
        'OAV PITATALI CHIKTI',
        'OAV BELLAGUNTHA',
        'OAV RAJAPUR BEGUNIPADA',
        'OAV SASANAMBAGAN HINJILICUT',
        'OAV SATRUSOLA GANJAM',
        'OAV SIDHESWAR DIGAPAHANDI',
        'OAV SORADA SORADA'
    ],
    'Jagatsinghpur': [
        'OAV KORKARA RAGHUNATHPUR',
        'OAV MULISINGH TIRTOL',
        'OAV DUA BALIKUDA',
        'OAV SADHEISASAN BIRIDI',
        'OAV SIHA ERASAMA',
        'OAV SALIJANGA JAGATSINGPUR',
        'OAV AGAPAL KUJANG',
        'OAV DAUGAON NAUGAON'
    ],
    'Jajapur': [
        'OAV RASULPUR RASULPUR',
        'OAV DARPANI BADCHANA',
        'OAV UTTARKUL BINJHARPUR',
        'OAV GOHIRAPATTOLI DANAGADI',
        'OAV MALLIKAPUR DASARATHPUR',
        'OAV DEULIPAL DHARMASALA',
        'OAV JAMDHAR JAJPUR',
        'OAV BEGANA KOREI',
        'OAV MADHAPUR SUKINDA'
    ],
    'Jharsuguda': [
        'OAV KATAPALI JHARSUGUDA',
        'OAV KIMIRA KIRIMIRA',
        'OAV PATRAPALI KOLABIRA',
        'OAV MUDRAJORE LAIKERA',
        'OAV LAKHANPUR LAKHANPUR'
    ],
    'Kalahandi': [
        'OAV MUSIGUDA BHAWANIPATNA',
        'OAV PARLA DHARMAGARH',
        'OAV GOLAMUNDA GOLAMUNDA',
        'OAV CHANCHARAPADA JAIPATNA',
        'OAV JUNAGARH JUNAGARH',
        'OAV KALAMPUR KALAMPUR',
        'OAV REGADA KARLAMUNDA',
        'OAV MASANIMUNDA KESINGA',
        'OAV BONGOMUNDA KOKSARA',
        'OAV DHANURBHATA LANJIGARH',
        'OAV MADANPUR RAMPUR MADANPUR RAMPUR',
        'OAV CHAPATAKHANDA NARLA',
        'OAV TH. RAMPUR TH. RAMPUR'
    ],
    'Kandhamal': [
        'OAV CHAKAPAD CHAKAPAD',
        'OAV DANDAPADAR BALIGUDA',
        'OAV DARINGBADI DARINGBADI',
        'OAV DHOBATOTA PHULBANI',
        'OAV DINDIRAGAON PHIRINGIA',
        'OAV DUTIMENDI KHAJURIPADA',
        'OAV G.UDAYAGIRI G.UDAYGIRI',
        'OAV JALESPATTA TUMUDIBANDHA',
        'OAV KUDUTULI K.NUAGAM',
        'OAV NUAGAON KOTAGARH',
        'OAV RAIKIA RAIKIA',
        'OAV SALAPGAM TIKABALI'
    ],
    'Kendrapara': [
        'OAV BELESWARP AUL',
        'OAV MANGARRAJPUR DERABISH',
        'OAV JAMUNAPADA GARADAPUR',
        'OAV TARANDO KENDRAPARA',
        'OAV ADOI MAHAKALPARA',
        'OAV UTTARANGA MARSHAAGHAI',
        'OAV BANTO PATTAMUNDAI',
        'OAV ACHINTA RAJKANIKA',
        'OAV MANGARRAJPUR RAJNAGAR'
    ],
    'Kendujhar': [
        'OAV SALAPADA ANANDAPUR',
        'OAV TALACHAMPEI BANSPAL',
        'OAV CHAMPUA CHAMPUA',
        'OAV SUANPADA GHASIPURA',
        'OAV TIKIRA GHATAGAON',
        'OAV HARICHANDANPUR HARICHANDANPUR',
        'OAV SUNDARAPAL HATADIHI',
        'OAV LAHANDA JODA',
        'OAV KENDIPOSI PATNA',
        'OAV SAHARAPADA SAHARAPADA',
        'OAV ORIA TELKOI',
        'OAV BODAPALASA KENDUJHAR SADAR'
    ],
    'Khordha': [
        'OAV ANDHURUA BHUBANESWARA',
        'OAV BEGUNIA BEGUNIA',
        'OAV ADIPADA TANGI',
        'OAV BENTAPUR BALIANTA',
        'OAV BHAKRASAHI BALIPATNA',
        'OAV BHATAPADA BANAPUR',
        'OAV GAINADA CHILIKA',
        'OAV PICHUKULI BOLAGARH',
        'OAV SANDHAPUR JATANI',
        'OAV SIALIA KHORDHA'
    ],
    'Koraput': [
        'OAV CHANDRAPADA BOIPARIGUDA',
        'OAV GANINAYAKPUT NANDAPUR',
        'OAV GOUDAGUDA LAXMIPUR',
        'OAV GUNDAL KUNDURA',
        'OAV JAYANTIGIRI JEYPORE',
        'OAV KOTIA POTANGI',
        'OAV KOTPAD KOTPAD',
        'OAV MACHHARA KORAPUT',
        'OAV MESSINGPUT LAMTAPUT',
        'OAV NILABADI BANDHUGAON',
        'OAV PACHINGI NARYANPATNA',
        'OAV PARAJAPUKI DASMANTPUR',
        'OAV POTTANGI POTTANGI',
        'OAV PUNGAR SEMILIGUDA',
        'OAV TARABHATTA BORIGUMA'
    ],
    'Malkangiri': [
        'OAV KANGARUKONDA KALIMELA',
        'OAV PODAGHAT KHAIRPUT',
        'OAV CHITRAKONDA KORUKUNDA',
        'OAV GUNDURIGUDA KUDUMULUGUMA',
        'OAV GONDHIPALLY MALKANGIRI',
        'OAV JULUNIBAHAL MATHILI',
        'OAV BAPANPALLI PODIA'
    ],
    'Mayurbhanj': [
        'OAV BADADALIMA TIRING',
        'OAV BADADEULI KARANJIA',
        'OAV BADASAHI BARSAHI',
        'OAV BHALIASOLE SULIAPADA',
        'OAV BHALUBASA KAPTIPADA',
        'OAV CHANDUA KULIANA',
        'OAV DIGDHAR THAKURMUNDA',
        'OAV GARUDABASA BETNOTI',
        'OAV JAMDAPAL BANGIRIPOSHI',
        'OAV JAMIRDIHA BISOI',
        'OAV JHARGAN BAHALDA',
        'OAV JUALIA UDALA',
        'OAV KHICHING SUKRULI',
        'OAV LAKHMANSAHI KHUNTA',
        'OAV LUHASILA BIJATALA',
        'OAV MAHULIA RASOGOVINDPUR',
        'OAV MATIAGARH JASHIPUR',
        'OAV MORADA MORADA',
        'OAV PASNA JAMADA',
        'OAV RANIBHOL BARIPADA',
        'OAV SANJAYDHANPOSI KUSUMI',
        'OAV SANMOUDA RAIRANGPUR',
        'OAV SANSOLE SAMAKHUNTA',
        'OAV SHIRSA SARASKANA',
        'OAV TINGIRIA RARUAN',
        'OAV TITIA GOPABANDHUNAGAR'
    ],
    'Nabarangpur': [
        'OAV FATKI CHANDAHANDI',
        'OAV DONGRIGUDA DABUGAON',
        'OAV JHARIGAON JHARIGAON',
        'OAV MAJHIGUDA KOSAGUMUDA',
        'OAV NANDAHANDI NANDAHANDI',
        'OAV AGNIPUR (HIRLI) NABARANGPUR',
        'OAV PAPADAHANDI PAPADAHANDI',
        'OAV DUMARDIHI RAIGHAR',
        'OAV LAKDIPAL TENTULIKHUNTI',
        'OAV BANGARIPADA UMARKOTE'
    ],
    'Nayagarh': [
        'OAV PANDARSINGAR GANIA',
        'OAV TARANDO KHANDAPADA',
        'OAV NOTAR NAYAGARH',
        'OAV NUAGAON NUAGAON',
        'OAV AKHUPADAR ODAGAON',
        'OAV FATEGARH BHAPUR',
        'OAV DWARAGAON DASAPALLA',
        'OAV BALARAMPUR RANAPUR'
    ],
    'Nuapada': [
        'OAV KESHRAJPUR BODEN',
        'OAV BADI KHARIAR',
        'OAV JHAGRAHI KOMNA',
        'OAV NEGIPALLI NUAPADA',
        'OAV TIMANPUR SINAPALI'
    ],
    'Puri': [
        'OAV BALUKHANDA PURI SADAR',
        'OAV BERBOI DELANG',
        'OAV GOVINDAPUR PIPLI',
        'OAV HANSAPADA NIMAPARA',
        'OAV JAMLAGADA KANASA',
        'OAV KUNJA KAKATPUR',
        'OAV MALUD KRUSHNAPRASAD',
        'OAV SARIFPUR ASTARANGA',
        'OAV SATYABADI',
        'OAV SIPASARUBALI BRAHMAGIRI',
        'OAV TARANGIRA GOP'
    ],
    'Rayagada': [
        'OAV BHALLERY BISAMAKATAK',
        'OAV CHANDRAPUR CHANDRAPUR',
        'OAV GUDARI GUDARI',
        'OAV GUNUPUR GUNUPUR',
        'OAV KALYANSINGHPUR KALYANSINGHPUR',
        'OAV KASHIPUR KASHIPUR',
        'OAV KOLNARA KOLNARA',
        'OAV JUMRUGUDA MUNIGUDA',
        'OAV BHALERI PADMAPUR',
        'OAV RAMANGUDA RAMANGUDA',
        'OAV TADAMABA RAYAGADA'
    ],
    'Sambalpur': [
        'OAV GOVINDPUR BAMARA',
        'OAV BADSINGHARI DHANKAUNDA',
        'OAV CHINIMAHUL JAMANKIRA',
        'OAV KUSUMI JUJUMURA',
        'OAV PARMANPUR KUCHINDA',
        'OAV PENTHABAHĀL NAKTIDEUL',
        'OAV RAMPUR REDHAKHOL',
        'OAV RENGALI RENGALI'
    ],
    'Subarnapur': [
        'OAV BINKA BINKA',
        'OAV RATHAPUR BIRMAHARAJPUR',
        'OAV FATAMUNDA DUNGURIPALI',
        'OAV PIPILIPALI SONEPUR',
        'OAV JAMKANI TARABHA',
        'OAV JHARBAHALI ULUNDA'
    ],
    'Sundargarh': [
        'OAV BABUNUAGAON BANAIGARH',
        'OAV BHOIPALI BARGAON',
        'OAV BUDAKATA KUTRA',
        'OAV GURUNDIA GURUNDIA',
        'OAV JAHARITOLI NUAGAON',
        'OAV KAMALAGA HEMGIRI',
        'OAV KUSUMDIHI KOIRA',
        'OAV LATYHIKATA LATHIKATA',
        'OAV LEPHRIPADA LEPHRIPADA',
        'OAV PARAGAPOSH LAHUNIPARA',
        'OAV RAJGANGPUR RAJGANGPUR',
        'OAV SIMDEGA SUBDEGA',
        'OAV TALASARA BALISANKARA',
        'OAV TALSANKARA SUNDARGARH',
        'OAV TELIPOSH KUARMUNDA',
        'OAV UJALPUR TANGARPALLI',
        'OAV MAHIPANI BISRA',
        'OMAV ROURKELA ROURKELA'
    ]
};

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.getElementById('mainNav');
const getStartedBtn = document.getElementById('getStartedBtn');
const enrollmentModal = document.getElementById('enrollmentModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeSuccessBtn = document.getElementById('closeSuccessBtn');
const enrollmentForm = document.getElementById('enrollmentForm');
const successMessage = document.getElementById('successMessage');
const successMessageText = document.getElementById('successMessageText');
const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');
const paymentModal = document.getElementById('paymentModal');
const closePaymentBtn = document.getElementById('closePaymentBtn');
const closePaymentSuccessBtn = document.getElementById('closePaymentSuccessBtn');
const paymentForm = document.getElementById('paymentForm');
const paymentSuccessMessage = document.getElementById('paymentSuccessMessage');
const paymentSuccessText = document.getElementById('paymentSuccessText');
const confirmationDetails = document.getElementById('confirmationDetails');
const submitPaymentBtn = document.getElementById('submitPaymentBtn');
const citySelect = document.getElementById('city');
const schoolGroup = document.getElementById('schoolGroup');
const schoolSelect = document.getElementById('school');
const ctaBtn = document.getElementById('ctaBtn');
const enrollmentIdField = document.getElementById('enrollmentId');
const studentNamePaymentField = document.getElementById('studentNamePayment');
const quickUpiPaymentBtn = document.getElementById('quickUpiPaymentBtn');

// Payment method elements
const paymentOptions = document.querySelectorAll('.payment-option');
const quickUpiDetails = document.getElementById('quickUpiDetails');
const qrDetails = document.getElementById('qrDetails');
const copyButtons = document.querySelectorAll('.copy-btn');

// Backend URL (set to your local server)
const BACKEND_URL = 'http://localhost:3000';

// Variables to store enrollment data
let currentEnrollmentId = '';
let currentStudentName = '';
let currentStudentData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default payment date
    document.getElementById('paymentDate').valueAsDate = new Date();
    
    // Hide all payment method details initially
    hideAllPaymentDetails();
    
    // Auto-select Quick UPI payment by default
    const quickUpiOption = document.querySelector('.payment-option[data-method="quickupi"]');
    if (quickUpiOption) {
        quickUpiOption.click();
    }
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    mobileMenuBtn.innerHTML = mainNav.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

// Simple course enrollment alert
document.querySelectorAll('.course-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const subjectName = this.closest('.course-content').querySelector('h3').textContent;
        alert(`Thank you for your interest in "${subjectName}"! Please use the main enrollment form to register.`);
    });
});

// Disable social media links
document.querySelectorAll('.social-links span').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        // No action taken when clicked
    });
});

// Show enrollment form when Get Started button is clicked
getStartedBtn.addEventListener('click', () => {
    enrollmentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Show enrollment form when CTA button is clicked
ctaBtn.addEventListener('click', () => {
    enrollmentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close modal when close button is clicked
closeModalBtn.addEventListener('click', () => {
    enrollmentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetEnrollmentForm();
});

// Close success message
closeSuccessBtn.addEventListener('click', () => {
    enrollmentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetEnrollmentForm();
});

// Close payment modal
closePaymentBtn.addEventListener('click', () => {
    paymentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close payment success message
closePaymentSuccessBtn.addEventListener('click', () => {
    paymentModal.classList.remove('active');
    enrollmentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetEnrollmentForm();
    resetPaymentForm();
});

// Close modal when clicking outside the form
enrollmentModal.addEventListener('click', (e) => {
    if (e.target === enrollmentModal) {
        enrollmentModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetEnrollmentForm();
    }
});

// Close payment modal when clicking outside
paymentModal.addEventListener('click', (e) => {
    if (e.target === paymentModal) {
        paymentModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Proceed to payment button
proceedToPaymentBtn.addEventListener('click', () => {
    // Close enrollment modal
    enrollmentModal.classList.remove('active');
    
    // Set enrollment details in payment form
    enrollmentIdField.value = currentEnrollmentId;
    studentNamePaymentField.value = currentStudentName;
    
    // Show payment modal
    setTimeout(() => {
        paymentModal.classList.add('active');
    }, 300);
});

// City selection handler
citySelect.addEventListener('change', function() {
    const selectedCity = this.value;
    
    // Clear previous school options
    schoolSelect.innerHTML = '<option value="">Select School</option>';
    
    // Show/hide school selection based on city
    if (Object.keys(schoolData).includes(selectedCity) && schoolData[selectedCity].length > 0) {
        schoolGroup.style.display = 'block';
        
        // Add schools based on selected city
        const schools = schoolData[selectedCity];
        if (schools) {
            schools.forEach(school => {
                const option = document.createElement('option');
                option.value = school;
                option.textContent = school;
                schoolSelect.appendChild(option);
            });
        }
        
        // Make school selection required
        schoolSelect.required = true;
    } else {
        schoolGroup.style.display = 'none';
        schoolSelect.required = false;
    }
});

// Payment method selection
paymentOptions.forEach(option => {
    option.addEventListener('click', function() {
        // Remove selected class from all options
        paymentOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Get selected method
        const method = this.getAttribute('data-method');
        
        // Show corresponding payment details
        showPaymentDetails(method);
    });
});

// Quick UPI Payment Button - Open UPI app
quickUpiPaymentBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Payment details
    const amount = 500;
    const upiId = '8338856099@ptaxis'; // CHANGED from @ybl to @ptaxis
    const phoneNumber = '8338856099';
    const merchantName = 'OAV Mantra Classes';
    const transactionNote = `Registration Fee for ${currentStudentName} (${currentEnrollmentId})`;
    
    // Create UPI payment links for different apps
    const upiLinks = {
        googlePay: `tez://upi/pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tn=${transactionNote}&cu=INR`,
        phonePe: `phonepe://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tn=${transactionNote}&cu=INR`,
        paytm: `paytmmp://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tn=${transactionNote}&cu=INR`,
        bhim: `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tn=${transactionNote}&cu=INR`,
        default: `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tn=${transactionNote}&cu=INR`
    };
    
    // Try to open UPI app
    try {
        // Try Google Pay first
        window.location.href = upiLinks.googlePay;
        
        // Fallback to default UPI if Google Pay fails
        setTimeout(() => {
            window.location.href = upiLinks.default;
        }, 500);
        
    } catch (error) {
        console.error('Error opening UPI app:', error);
        
        // Show manual instructions as fallback
        alert(`Please open your UPI app and send ₹500 to:\n\nMobile: ${phoneNumber}\nUPI ID: ${upiId}\n\nNote: ${transactionNote}`);
    }
});

// Copy buttons for payment details
copyButtons.forEach(button => {
    button.addEventListener('click', function() {
        const textToCopy = this.getAttribute('data-text');
        copyToClipboard(textToCopy);
        
        // Show feedback
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Copied!';
        this.style.background = 'var(--success)';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = '';
        }, 2000);
    });
});

// Payment form submission
paymentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const transactionId = document.getElementById('transactionId').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const selectedMethod = document.querySelector('.payment-option.selected');
    
    // Validate payment method selection
    if (!selectedMethod) {
        alert('Please select a payment method.');
        return;
    }
    
    // Validate screenshot upload based on selected method
    const method = selectedMethod.getAttribute('data-method');
    let screenshotValid = true;
    
    if (method === 'quickupi') {
        const screenshot = document.getElementById('paymentScreenshot').files[0];
        if (!screenshot) {
            alert('Please upload payment screenshot for UPI payment.');
            screenshotValid = false;
        }
    } else if (method === 'qr') {
        const screenshot = document.getElementById('qrScreenshot').files[0];
        if (!screenshot) {
            alert('Please upload payment screenshot for QR code payment.');
            screenshotValid = false;
        }
    }
    
    if (!screenshotValid) return;
    
    // Show loading state
    const originalText = submitPaymentBtn.innerHTML;
    submitPaymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
    submitPaymentBtn.disabled = true;
    
    // Prepare payment data
    const paymentData = {
        enrollmentId: currentEnrollmentId,
        studentName: currentStudentName,
        amount: 500,
        transactionId,
        paymentDate,
        paymentMethod: method,
        status: 'completed',
        timestamp: new Date().toISOString()
    };
    
    // Merge with enrollment data
    const completeData = {
        ...currentStudentData,
        ...paymentData
    };
    
        try {
        // Save payment data
        const result = await savePaymentData(completeData);

        // If backend returned a redirect for class-specific resources, navigate there
        if (result && result.redirect) {
            window.location.href = result.redirect;
            return;
        }

        // Show success message
        paymentForm.style.display = 'none';
        paymentSuccessMessage.style.display = 'block';

        // Set confirmation details
        confirmationDetails.innerHTML = `
            <strong>Enrollment ID:</strong> ${currentEnrollmentId}<br>
            <strong>Student:</strong> ${currentStudentName}<br>
            <strong>Amount Paid:</strong> ₹500<br>
            <strong>Transaction ID:</strong> ${transactionId}<br>
            <strong>Payment Date:</strong> ${paymentDate}<br>
            <strong>Payment Method:</strong> ${method === 'quickupi' ? 'Quick UPI' : 'QR Code'}
        `;

        console.log('✅ Payment successful:', result);

    } catch (error) {
        // Show error message
        alert('There was an error processing your payment. Please try again later or contact us at 89175 31123.');
        console.error('❌ Payment error:', error);
        
        // Reset button
        submitPaymentBtn.innerHTML = originalText;
        submitPaymentBtn.disabled = false;
    }
});

// Form validation functions
function validateName(name) {
    return name.trim().length >= 2 && /^[A-Za-z\s]+$/.test(name);
}

function validateMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(elementId, messageId, show = true) {
    const element = document.getElementById(elementId);
    const errorMessage = document.getElementById(messageId);
    
    if (show) {
        element.classList.add('error');
        errorMessage.classList.add('show');
    } else {
        element.classList.remove('error');
        errorMessage.classList.remove('show');
    }
}

// Generate enrollment ID
function generateEnrollmentId() {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `OAV-${timestamp}-${randomStr}`;
}

// Save enrollment data locally (for testing)
function saveEnrollmentLocally(formData, enrollmentId) {
    // Get existing enrollments from localStorage
    let enrollments = JSON.parse(localStorage.getItem('oavEnrollments')) || [];
    
    // Add new enrollment with ID and timestamp
    const enrollmentRecord = {
        ...formData,
        enrollmentId,
        receivedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'pending_payment'
    };
    
    // Add to array
    enrollments.push(enrollmentRecord);
    
    // Save back to localStorage
    localStorage.setItem('oavEnrollments', JSON.stringify(enrollments));
    
    // Also log to console
    console.log('📝 ENROLLMENT DATA SAVED LOCALLY:');
    console.log('Enrollment ID:', enrollmentId);
    console.log('Name:', formData.name);
    console.log('Mobile:', formData.mobile);
    console.log('Email:', formData.email);
    console.log('Class:', formData.class);
    console.log('City:', formData.city);
    console.log('School:', formData.school);
    console.log('Time:', enrollmentRecord.receivedAt);
    console.log('Status:', enrollmentRecord.status);
    console.log('Total Enrollments:', enrollments.length);
    console.log('-----------------------------');
    
    return enrollmentRecord;
}

// Save payment data locally
function savePaymentData(paymentData) {
    // If backend is configured, try to send payment to backend API
    if (BACKEND_URL) {
        return fetch(`${BACKEND_URL}/payment-success`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        })
        .then(async res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
        })
        .catch(err => {
            console.error('Error sending payment to backend, falling back to local save:', err);
            // Fallback to local storage when backend fails
            return savePaymentDataLocally(paymentData);
        });
    }

    // No backend configured — save locally
    return Promise.resolve(savePaymentDataLocally(paymentData));
}

// Helper to save payment data locally when backend isn't available
function savePaymentDataLocally(paymentData) {
    let enrollments = JSON.parse(localStorage.getItem('oavEnrollments')) || [];
    const updatedEnrollments = enrollments.map(enrollment => {
        if (enrollment.enrollmentId === paymentData.enrollmentId) {
            return {
                ...enrollment,
                ...paymentData,
                status: 'completed',
                paymentReceivedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };
        }
        return enrollment;
    });

    localStorage.setItem('oavEnrollments', JSON.stringify(updatedEnrollments));

    console.log('💰 PAYMENT DATA SAVED LOCALLY:');
    console.log('Enrollment ID:', paymentData.enrollmentId);
    console.log('Amount Paid: ₹', paymentData.amount);
    console.log('Transaction ID:', paymentData.transactionId);
    console.log('Payment Method:', paymentData.paymentMethod);
    console.log('Payment Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('-----------------------------');

    return {
        success: true,
        message: 'Payment saved locally',
        data: paymentData
    };
}

// Enrollment form submission handler
enrollmentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('studentName').value;
    const mobile = document.getElementById('mobileNumber').value;
    const email = document.getElementById('email').value;
    const studentClass = document.getElementById('studentClass').value;
    const city = document.getElementById('city').value;
    const school = document.getElementById('school').value;
    
    // Reset previous errors
    showError('studentName', 'nameError', false);
    showError('mobileNumber', 'mobileError', false);
    showError('email', 'emailError', false);
    showError('studentClass', 'classError', false);
    showError('city', 'cityError', false);
    showError('school', 'schoolError', false);
    
    let isValid = true;
    
    // Validate name
    if (!validateName(name)) {
        showError('studentName', 'nameError', true);
        isValid = false;
    }
    
    // Validate mobile
    if (!validateMobile(mobile)) {
        showError('mobileNumber', 'mobileError', true);
        isValid = false;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        showError('email', 'emailError', true);
        isValid = false;
    }
    
    // Validate class
    if (!studentClass) {
        showError('studentClass', 'classError', true);
        isValid = false;
    }
    
    // Validate city
    if (!city) {
        showError('city', 'cityError', true);
        isValid = false;
    }
    
    // Validate school if city has schools
    const citiesWithSchools = Object.keys(schoolData).filter(city => schoolData[city].length > 0);
    if (citiesWithSchools.includes(city) && !school) {
        showError('school', 'schoolError', true);
        isValid = false;
    }
    
    if (isValid) {
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Generate enrollment ID
        currentEnrollmentId = generateEnrollmentId();
        currentStudentName = name;
        
        // Prepare form data
        const formData = {
            name,
            mobile,
            email,
            class: studentClass,
            city,
            school: citiesWithSchools.includes(city) ? school : 'N/A',
            timestamp: new Date().toISOString(),
            source: 'OAV Mantra Website'
        };
        
        // Store data for later use
        currentStudentData = formData;
        
        try {
            // Save enrollment data
            const result = await saveEnrollmentData(formData, currentEnrollmentId);
            
            // Show success message with payment option
            enrollmentForm.style.display = 'none';
            successMessage.style.display = 'block';
            
            successMessageText.innerHTML = `
                <div style="text-align: center;">
                    <p><strong>Enrollment ID: ${currentEnrollmentId}</strong></p>
                    <div style="background: #f0f7ff; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <strong>${name}</strong><br>
                        Class ${studentClass}, ${city}<br>
                        ${mobile} | ${email}
                    </div>
                    <p>Your enrollment details have been saved successfully.</p>
                    <p><strong>Registration Fee: ₹500</strong></p>
                    <p>Please complete the payment to confirm your enrollment.</p>
                </div>
            `;
            
            console.log('✅ Enrollment submitted successfully:', result);
            
        } catch (error) {
            // Show error message
            alert('There was an error submitting your enrollment. Please try again later or contact us directly at 89175 31123.');
            console.error('❌ Enrollment submission error:', error);
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
});

// Submit enrollment data to backend or local storage
async function saveEnrollmentData(formData, enrollmentId) {
    // If no backend URL is set, use local storage
    if (!BACKEND_URL) {
        const enrollmentRecord = saveEnrollmentLocally(formData, enrollmentId);
        
        // Simulate API response
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Enrollment saved locally',
                    enrollmentId: enrollmentId,
                    data: enrollmentRecord
                });
            }, 1000);
        });
    }
    
    // If backend URL is set, send to backend
    try {
        const response = await fetch(`${BACKEND_URL}/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                enrollmentId,
                status: 'pending_payment'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Error submitting to backend:', error);
        
        // Fallback to local storage
        const enrollmentRecord = saveEnrollmentLocally(formData, enrollmentId);
        
        return {
            success: true,
            message: 'Enrollment saved locally (backend unavailable)',
            enrollmentId: enrollmentId,
            data: enrollmentRecord
        };
    }
}

// Helper functions
function hideAllPaymentDetails() {
    quickUpiDetails.style.display = 'none';
    qrDetails.style.display = 'none';
}

function showPaymentDetails(method) {
    hideAllPaymentDetails();
    
    if (method === 'quickupi') {
        quickUpiDetails.style.display = 'block';
    } else if (method === 'qr') {
        qrDetails.style.display = 'block';
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// Reset enrollment form function
function resetEnrollmentForm() {
    enrollmentForm.reset();
    enrollmentForm.style.display = 'block';
    successMessage.style.display = 'none';
    schoolGroup.style.display = 'none';
    schoolSelect.innerHTML = '<option value="">Select School</option>';
    successMessageText.innerHTML = 'Thank you for enrolling with OAV Mantra Classes. We will contact you shortly with further details.';
    
    // Reset error states
    showError('studentName', 'nameError', false);
    showError('mobileNumber', 'mobileError', false);
    showError('email', 'emailError', false);
    showError('studentClass', 'classError', false);
    showError('city', 'cityError', false);
    showError('school', 'schoolError', false);
    
    // Remove error classes
    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('error');
    });
    
    // Reset submit button
    const submitBtn = enrollmentForm.querySelector('.submit-btn');
    submitBtn.textContent = 'Submit Enrollment';
    submitBtn.disabled = false;
    
    // Reset enrollment data
    currentEnrollmentId = '';
    currentStudentName = '';
    currentStudentData = {};
}

// Reset payment form function
function resetPaymentForm() {
    paymentForm.reset();
    paymentForm.style.display = 'block';
    paymentSuccessMessage.style.display = 'none';
    document.getElementById('paymentDate').valueAsDate = new Date();
    
    // Reset payment method selection
    paymentOptions.forEach(opt => opt.classList.remove('selected'));
    hideAllPaymentDetails();
    
    // Reset file inputs
    document.getElementById('paymentScreenshot').value = '';
    document.getElementById('qrScreenshot').value = '';
    
    // Reset payment button
    submitPaymentBtn.innerHTML = '<i class="fas fa-lock"></i> Confirm Payment of ₹500';
    submitPaymentBtn.disabled = false;
    
    // Auto-select Quick UPI payment
    const quickUpiOption = document.querySelector('.payment-option[data-method="quickupi"]');
    if (quickUpiOption) {
        quickUpiOption.click();
    }
}

// Real-time validation for enrollment form
document.getElementById('studentName').addEventListener('input', function() {
    showError('studentName', 'nameError', !validateName(this.value));
});

document.getElementById('mobileNumber').addEventListener('input', function() {
    // Only allow numbers
    this.value = this.value.replace(/\D/g, '');
    showError('mobileNumber', 'mobileError', !validateMobile(this.value));
});

document.getElementById('email').addEventListener('input', function() {
    showError('email', 'emailError', !validateEmail(this.value));
});

document.getElementById('studentClass').addEventListener('change', function() {
    showError('studentClass', 'classError', !this.value);
});

document.getElementById('city').addEventListener('change', function() {
    showError('city', 'cityError', !this.value);
});

document.getElementById('school').addEventListener('change', function() {
    showError('school', 'schoolError', !this.value);
});

// Admin functions
function viewEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem('oavEnrollments')) || [];
    console.log('📋 ALL ENROLLMENTS:', enrollments);
    console.log('Total:', enrollments.length);
    
    // Count by status
    const pending = enrollments.filter(e => e.status === 'pending_payment').length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    
    console.log('📊 Status Summary:');
    console.log('Pending Payment:', pending);
    console.log('Completed:', completed);
    
    if (enrollments.length > 0) {
        alert(`Total Enrollments: ${enrollments.length}\nPending Payment: ${pending}\nCompleted: ${completed}\n\nCheck browser console for details.`);
    } else {
        alert('No enrollments found.');
    }
}

function clearEnrollments() {
    if (confirm('Are you sure you want to clear all enrollment data?')) {
        localStorage.removeItem('oavEnrollments');
        console.log('🗑️ All enrollments cleared.');
        alert('All enrollment data has been cleared.');
    }
}

function exportEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem('oavEnrollments')) || [];
    if (enrollments.length === 0) {
        alert('No enrollments to export.');
        return;
    }
    
    const dataStr = JSON.stringify(enrollments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `oav-enrollments-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('📥 Enrollments exported:', enrollments.length, 'records');
}

// Add admin functions to window for easy access
window.oavAdmin = {
    viewEnrollments,
    clearEnrollments,
    exportEnrollments,
    getEnrollmentCount: () => {
        const enrollments = JSON.parse(localStorage.getItem('oavEnrollments')) || [];
        return enrollments.length;
    },
    getPaymentStats: () => {
        const enrollments = JSON.parse(localStorage.getItem('oavEnrollments')) || [];
        const pending = enrollments.filter(e => e.status === 'pending_payment').length;
        const completed = enrollments.filter(e => e.status === 'completed').length;
        const totalAmount = enrollments
            .filter(e => e.status === 'completed')
            .reduce((sum, e) => sum + (e.amount || 0), 0);
        
        return {
            pending,
            completed,
            totalAmount,
            totalEnrollments: enrollments.length
        };
    }
};

// Log admin functions info
console.log('🔧 OAV Mantra Admin Functions:');
console.log('window.oavAdmin.viewEnrollments() - View all enrollments');
console.log('window.oavAdmin.exportEnrollments() - Export as JSON file');
console.log('window.oavAdmin.clearEnrollments() - Clear all data');
console.log('window.oavAdmin.getEnrollmentCount() - Get count');
console.log('window.oavAdmin.getPaymentStats() - Get payment statistics');
