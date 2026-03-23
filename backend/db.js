const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'carpartportal.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    trim TEXT,
    engine TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('performance', 'normal', 'both')),
    brand TEXT,
    description TEXT,
    price REAL,
    compatibility TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS build_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    car_make TEXT,
    car_model TEXT,
    car_year_min INTEGER,
    car_year_max INTEGER,
    category TEXT NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    estimated_cost TEXT,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS saved_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    part_id INTEGER NOT NULL,
    car_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
    UNIQUE(user_id, part_id)
  );
`);

// Seed parts if empty
const partCount = db.prepare('SELECT COUNT(*) as cnt FROM parts').get();
if (partCount.cnt === 0) {
  const insertPart = db.prepare(`
    INSERT INTO parts (name, category, type, brand, description, price, compatibility, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedParts = [
    // Performance parts
    ['Cold Air Intake', 'Engine', 'performance', 'K&N', 'High-flow cold air intake system for improved horsepower and torque. Increases airflow to the engine for better combustion.', 299.99, 'Universal - check fitment', null],
    ['Performance Exhaust System', 'Exhaust', 'performance', 'Borla', 'Cat-back exhaust system with improved flow and aggressive exhaust note. Stainless steel construction.', 899.99, 'Multiple fitments available', null],
    ['Coilover Suspension Kit', 'Suspension', 'performance', 'KW Suspensions', 'Height-adjustable coilover kit for improved handling and lowered stance. 36-way damping adjustment.', 1499.99, 'Vehicle-specific fitment required', null],
    ['Performance Brake Kit', 'Brakes', 'performance', 'Brembo', 'Slotted and drilled rotor kit with high-performance pads. Improved stopping power and heat dissipation.', 649.99, 'Vehicle-specific', null],
    ['Turbocharger Kit', 'Engine', 'performance', 'Garrett', 'Complete turbocharger upgrade kit with intercooler, piping, and BOV. Significant power gains.', 2499.99, 'Engine-specific', null],
    ['Performance Chip/ECU Tune', 'Engine', 'performance', 'APR', 'ECU software upgrade for increased power and torque throughout the powerband. Safe for stock hardware.', 599.99, 'Vehicle/ECU specific', null],
    ['Sway Bar Kit', 'Suspension', 'performance', 'Eibach', 'Front and rear sway bar upgrade for reduced body roll and improved handling. Adjustable stiffness.', 349.99, 'Vehicle-specific', null],
    ['Short Shifter Kit', 'Drivetrain', 'performance', 'Mishimoto', 'Reduced-throw short shifter for faster, more precise gear changes. Billet aluminum construction.', 149.99, 'Transmission-specific', null],
    ['Performance Air Filter', 'Engine', 'performance', 'K&N', 'High-flow drop-in replacement air filter. Washable and reusable. Minor power gains.', 59.99, 'Universal - check fitment', null],
    ['Racing Seats', 'Interior', 'performance', 'Sparco', 'Lightweight bucket seats with integrated harness slots. FIA approved for track use.', 799.99, 'Universal with adapters', null],
    ['Strut Tower Brace', 'Suspension', 'performance', 'Whiteline', 'Front strut tower brace for improved chassis rigidity and handling response.', 199.99, 'Vehicle-specific', null],
    ['Performance Clutch Kit', 'Drivetrain', 'performance', 'ACT', 'Heavy-duty clutch kit for increased power handling. Street/strip applications.', 449.99, 'Transmission-specific', null],
    // Normal parts
    ['Brake Pads (Front)', 'Brakes', 'normal', 'Akebono', 'OEM-quality ceramic brake pads. Low dust, quiet operation. Excellent daily driver choice.', 49.99, 'Vehicle-specific', null],
    ['Oil Filter', 'Engine', 'normal', 'Mobil 1', 'Extended performance oil filter. Traps 99% of harmful particles. Compatible with synthetic oils.', 12.99, 'Vehicle-specific', null],
    ['Air Filter (Cabin)', 'HVAC', 'normal', 'Bosch', 'Activated carbon cabin air filter. Removes pollen, dust, and odors.', 24.99, 'Vehicle-specific', null],
    ['Spark Plugs (Set of 4)', 'Engine', 'normal', 'NGK', 'Iridium spark plugs for reliable ignition and long service life. OEM replacement.', 39.99, 'Engine-specific', null],
    ['Serpentine Belt', 'Engine', 'normal', 'Gates', 'OEM-spec serpentine belt. Long-lasting EPDM construction for all-weather use.', 34.99, 'Vehicle-specific', null],
    ['Windshield Wipers', 'Exterior', 'normal', 'Bosch ICON', 'Beam blade wipers for streak-free visibility in all conditions. Easy installation.', 29.99, 'Vehicle-specific', null],
    ['Battery', 'Electrical', 'normal', 'Optima', 'AGM battery with reserve capacity. Excellent cold-cranking amps for reliable starting.', 189.99, 'Group size specific', null],
    ['Alternator', 'Electrical', 'normal', 'Denso', 'Remanufactured OEM alternator. Full electrical testing ensures reliable charging.', 219.99, 'Vehicle-specific', null],
    ['Radiator Hose Kit', 'Cooling', 'normal', 'Gates', 'Upper and lower radiator hoses. Silicone-reinforced for long service life.', 44.99, 'Vehicle-specific', null],
    ['Wheel Bearing Hub Assembly', 'Suspension', 'normal', 'Timken', 'Complete hub assembly with integrated wheel bearing. OEM replacement quality.', 129.99, 'Vehicle-specific', null],
    ['CV Axle Shaft', 'Drivetrain', 'normal', 'GSP', 'Remanufactured CV axle shaft. All joints inspected and greased. Ready to install.', 89.99, 'Vehicle-specific', null],
    ['Fuel Filter', 'Fuel System', 'normal', 'Wix', 'OEM replacement inline fuel filter. Protects injectors from contaminants.', 19.99, 'Vehicle-specific', null],
    ['Thermostat', 'Cooling', 'normal', 'Stant', 'OEM-spec thermostat for proper engine temperature regulation.', 16.99, 'Vehicle-specific', null],
    // Both
    ['Suspension Lowering Springs', 'Suspension', 'both', 'Eibach Pro-Kit', 'Sport lowering springs that lower ride height 1-1.5" while improving handling. Comfortable daily driving.', 249.99, 'Vehicle-specific', null],
    ['Performance Tires', 'Wheels & Tires', 'both', 'Michelin Pilot Sport', 'Ultra-high-performance all-season tires. Excellent grip in wet and dry conditions.', 189.99, 'Size-specific', null],
    ['Upgraded Headlights (LED)', 'Exterior', 'both', 'Morimoto', 'LED headlight upgrade. OEM+ brightness and pattern with plug-and-play installation.', 399.99, 'Vehicle-specific', null],
    ['Sport Air Filter (Drop-In)', 'Engine', 'both', 'aFe Power', 'High-flow drop-in air filter. Increases airflow vs. paper element for slight power gains.', 49.99, 'Vehicle-specific', null],
  ];

  const insertMany = db.transaction((parts) => {
    for (const part of parts) insertPart.run(...part);
  });
  insertMany(seedParts);
}

// Seed build ideas if empty
const buildCount = db.prepare('SELECT COUNT(*) as cnt FROM build_ideas').get();
if (buildCount.cnt === 0) {
  const insertBuild = db.prepare(`
    INSERT INTO build_ideas (title, description, car_make, car_model, car_year_min, car_year_max, category, difficulty, estimated_cost, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedBuilds = [
    ['Street Performance Build', 'Transform your daily driver into a fun weekend warrior. Focus on handling, brakes, and a modest power bump. Perfect balance of street manners and track capability. Start with suspension, then brakes, then engine mods.', null, null, null, null, 'Performance', 'Intermediate', '$3,000 - $8,000', null],
    ['Budget Daily Driver Refresh', 'Bring your high-mileage daily back to life on a budget. Focus on reliability and safety: new brakes, fresh tires, suspension refresh, and fluid services. A well-maintained car is a reliable car.', null, null, null, null, 'Maintenance', 'Beginner', '$500 - $2,000', null],
    ['Track Day Build', 'Build a dedicated track weapon from your sports car. Strip unnecessary weight, upgrade brakes significantly, install coilovers, add a rollbar, and dial in the alignment. Safety first!', null, null, null, null, 'Performance', 'Expert', '$10,000 - $25,000', null],
    ['JDM Style Build', 'Achieve that classic JDM look and feel. Lower the car on coilovers, add a front lip and rear spoiler, install Work or SSR wheels, and tint the windows. Clean and purposeful.', null, null, null, null, 'Style', 'Intermediate', '$4,000 - $10,000', null],
    ['Sleeper Build', 'Keep it stock-looking on the outside while massively upgrading the mechanicals. The goal: embarrass supercars at the stoplight while looking like a grocery getter.', null, null, null, null, 'Performance', 'Advanced', '$8,000 - $20,000', null],
    ['Overlander / Off-Road Build', 'Take your truck or SUV off the beaten path. Lift it with a proper suspension kit, add all-terrain tires, underbody protection, and recovery gear. Adventure awaits.', null, null, null, null, 'Off-Road', 'Intermediate', '$5,000 - $15,000', null],
    ['Audio Upgrade Build', 'Create the ultimate in-car audio experience. Upgrade head unit, add component speakers, a proper subwoofer, and sound deadening. Deadening first for best results.', null, null, null, null, 'Interior', 'Beginner', '$1,000 - $5,000', null],
    ['Turbocharged Build', 'Add forced induction to your naturally aspirated engine. Full supporting mods are essential: fuel system, intercooler, proper tune. Big power potential but requires careful planning.', null, null, null, null, 'Performance', 'Expert', '$5,000 - $15,000', null],
    ['Stance Build', 'Achieve that low and wide stance. Aggressive coilovers, wide aftermarket wheels with stretched tires, and flush fitment. Visual impact is the goal.', null, null, null, null, 'Style', 'Intermediate', '$3,000 - $8,000', null],
    ['Reliability/Longevity Build', 'Make your car last 300,000+ miles. Preventive maintenance, upgraded cooling system, quality fluids, and addressing worn components before they fail. The smart build.', null, null, null, null, 'Maintenance', 'Beginner', '$1,000 - $4,000', null],
    ['EV Conversion Concept', 'Convert a classic car to electric power. Motor, battery pack, controller, and the unique challenge of integrating modern tech into a vintage chassis. The future meets the past.', null, null, null, null, 'Custom', 'Expert', '$15,000 - $50,000', null],
    ['Honda Civic Type R Street Build', 'Transform the FK8/FL5 Civic Type R into the ultimate track-focused street car. Suspension tuning, brake upgrade, intake, exhaust, and ECU tune for maximum track performance.', 'Honda', 'Civic Type R', 2017, 2024, 'Performance', 'Advanced', '$6,000 - $12,000', null],
    ['Mustang GT Coyote Build', 'Unleash the potential of the 5.0 Coyote V8. Cold air intake, long tube headers, performance tune, and upgraded suspension for a seriously fast Mustang.', 'Ford', 'Mustang GT', 2015, 2024, 'Performance', 'Intermediate', '$5,000 - $10,000', null],
    ['Subaru WRX Rally-Inspired', 'Build your WRX into a road-going rally car. Suspension, brakes, intake, exhaust, and AWD tuning. Add STI brakes for serious stopping power.', 'Subaru', 'WRX', 2015, 2024, 'Performance', 'Advanced', '$7,000 - $15,000', null],
  ];

  const insertMany = db.transaction((builds) => {
    for (const build of builds) insertBuild.run(...build);
  });
  insertMany(seedBuilds);
}

module.exports = db;
