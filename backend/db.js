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
    // ── Performance ──────────────────────────────────────────────────────────
    ['Cold Air Intake', 'Engine', 'performance', 'K&N', 'High-flow cold air intake system for improved horsepower and torque. Increases airflow to the engine for better combustion.', 299.99, 'Universal - check fitment', null],
    ['Short Ram Intake', 'Engine', 'performance', 'Injen', 'Short ram intake for increased throttle response and power. Polished aluminum tubing with high-flow filter.', 189.99, 'Vehicle-specific', null],
    ['Performance Exhaust System', 'Exhaust', 'performance', 'Borla', 'Cat-back exhaust system with improved flow and aggressive exhaust note. Stainless steel construction.', 899.99, 'Multiple fitments available', null],
    ['Axle-Back Exhaust', 'Exhaust', 'performance', 'MagnaFlow', 'Axle-back exhaust upgrade for a deeper, more aggressive tone with minimal drone. Direct bolt-on.', 449.99, 'Vehicle-specific', null],
    ['Long Tube Headers', 'Exhaust', 'performance', 'Hooker', 'Long tube headers for maximum exhaust scavenging and significant horsepower gains. 304 stainless steel.', 749.99, 'Vehicle-specific', null],
    ['Catted Downpipe', 'Exhaust', 'performance', 'Invidia', 'High-flow catted downpipe with 200-cell cat. Significant turbo spool improvement and power gains while remaining emissions compliant.', 549.99, 'Vehicle/turbo-specific', null],
    ['Coilover Suspension Kit', 'Suspension', 'performance', 'KW Suspensions', 'Height-adjustable coilover kit for improved handling and lowered stance. 36-way damping adjustment.', 1499.99, 'Vehicle-specific fitment required', null],
    ['Coilover Suspension Kit', 'Suspension', 'performance', 'BC Racing', 'Type-BR coilovers with independent height and damping adjustment. Street and track capable.', 899.99, 'Vehicle-specific fitment required', null],
    ['Performance Brake Kit', 'Brakes', 'performance', 'Brembo', 'Slotted and drilled rotor kit with high-performance pads. Improved stopping power and heat dissipation.', 649.99, 'Vehicle-specific', null],
    ['Big Brake Kit (6-Piston)', 'Brakes', 'performance', 'StopTech', '6-piston front big brake kit with 380mm rotors. Massive reduction in brake fade under heavy track use.', 2199.99, 'Vehicle-specific', null],
    ['Stainless Steel Brake Lines', 'Brakes', 'performance', 'Goodridge', 'Stainless braided brake lines for improved pedal feel and reduced expansion under pressure.', 89.99, 'Vehicle-specific', null],
    ['Turbocharger Kit', 'Engine', 'performance', 'Garrett', 'Complete turbocharger upgrade kit with intercooler, piping, and BOV. Significant power gains.', 2499.99, 'Engine-specific', null],
    ['Front-Mount Intercooler (FMIC)', 'Engine', 'performance', 'Mishimoto', 'Large front-mount intercooler for dramatically lower charge air temps. Full pipe kit included.', 649.99, 'Vehicle-specific', null],
    ['Blow-Off Valve', 'Engine', 'performance', 'Turbosmart', 'Atmospheric BOV for a satisfying pssh sound and improved turbo response. Anodized aluminum.', 189.99, 'Turbo-specific', null],
    ['Performance Chip/ECU Tune', 'Engine', 'performance', 'APR', 'ECU software upgrade for increased power and torque throughout the powerband. Safe for stock hardware.', 599.99, 'Vehicle/ECU specific', null],
    ['High-Flow Fuel Injectors', 'Fuel System', 'performance', 'Injector Dynamics', '1000cc high-impedance fuel injectors for high-power builds. Plug-and-play on supported vehicles.', 499.99, 'Engine-specific', null],
    ['High-Flow Fuel Pump', 'Fuel System', 'performance', 'Walbro', '450lph high-pressure in-tank fuel pump. Supports up to 700whp on E85.', 179.99, 'Tank-specific', null],
    ['Methanol Injection Kit', 'Engine', 'performance', 'Snow Performance', 'Stage 3 methanol injection kit. Cools charge temps and enables higher boost safely.', 449.99, 'Universal', null],
    ['Sway Bar Kit', 'Suspension', 'performance', 'Eibach', 'Front and rear sway bar upgrade for reduced body roll and improved handling. Adjustable stiffness.', 349.99, 'Vehicle-specific', null],
    ['Strut Tower Brace', 'Suspension', 'performance', 'Whiteline', 'Front strut tower brace for improved chassis rigidity and handling response.', 199.99, 'Vehicle-specific', null],
    ['Adjustable Rear Camber Arms', 'Suspension', 'performance', 'SPC', 'Adjustable rear upper and lower camber arms for proper alignment after lowering.', 299.99, 'Vehicle-specific', null],
    ['Short Shifter Kit', 'Drivetrain', 'performance', 'Mishimoto', 'Reduced-throw short shifter for faster, more precise gear changes. Billet aluminum construction.', 149.99, 'Transmission-specific', null],
    ['Performance Clutch Kit', 'Drivetrain', 'performance', 'ACT', 'Heavy-duty clutch kit for increased power handling. Street/strip applications.', 449.99, 'Transmission-specific', null],
    ['Limited-Slip Differential (LSD)', 'Drivetrain', 'performance', 'Quaife', 'Torque-biasing mechanical LSD for improved traction and controlled oversteer. OEM fitment.', 899.99, 'Axle/differential-specific', null],
    ['Performance Air Filter', 'Engine', 'performance', 'K&N', 'High-flow drop-in replacement air filter. Washable and reusable. Minor power gains.', 59.99, 'Universal - check fitment', null],
    ['Oil Catch Can', 'Engine', 'performance', 'Mishimoto', 'Baffled oil catch can to prevent blow-by deposits on intake valves. Keeps engine clean.', 119.99, 'Universal with brackets', null],
    ['Racing Seats', 'Interior', 'performance', 'Sparco', 'Lightweight bucket seats with integrated harness slots. FIA approved for track use.', 799.99, 'Universal with adapters', null],
    ['Racing Harness (5-Point)', 'Interior', 'performance', 'Schroth', '5-point FIA-approved racing harness. Essential for track days with a roll cage or bar.', 299.99, 'Universal - harness bar required', null],
    ['Roll Bar / Harness Bar', 'Interior', 'performance', 'NRG', 'Bolt-in harness bar for installing a racing harness. No welding required.', 349.99, 'Vehicle-specific', null],
    ['Racing Steering Wheel', 'Interior', 'performance', 'Momo', '350mm suede-wrapped racing steering wheel. Improved feedback and ergonomics for track use.', 249.99, 'Requires hub adapter', null],
    ['Quick Release Hub', 'Interior', 'performance', 'NRG', 'Push-to-release quick release hub. Allows fast steering wheel removal for entry/egress.', 89.99, 'Hub adapter required', null],
    ['Carbon Fiber Hood', 'Exterior', 'performance', 'Seibon', 'OEM-replacement carbon fiber hood. Weight reduction over stock steel hood. Vented options available.', 899.99, 'Vehicle-specific', null],
    ['Front Splitter', 'Exterior', 'performance', 'APR Performance', 'Carbon fiber front splitter for increased front downforce. GTC-300 adjustable rods included.', 499.99, 'Vehicle-specific', null],
    ['Rear Wing / Spoiler', 'Exterior', 'performance', 'APR Performance', 'GTC-200 adjustable carbon fiber rear wing. Multiple heights and angles for aero tuning.', 799.99, 'Universal with brackets', null],
    // ── Normal / OEM ─────────────────────────────────────────────────────────
    ['Brake Pads (Front)', 'Brakes', 'normal', 'Akebono', 'OEM-quality ceramic brake pads. Low dust, quiet operation. Excellent daily driver choice.', 49.99, 'Vehicle-specific', null],
    ['Brake Rotors (Front Pair)', 'Brakes', 'normal', 'Brembo', 'OEM-spec vented front brake rotors. Excellent thermal capacity and fade resistance.', 89.99, 'Vehicle-specific', null],
    ['Brake Caliper (Remanufactured)', 'Brakes', 'normal', 'Cardone', 'Remanufactured brake caliper. Full load-test and hardware included. Guaranteed fit.', 79.99, 'Vehicle-specific', null],
    ['Oil Filter', 'Engine', 'normal', 'Mobil 1', 'Extended performance oil filter. Traps 99% of harmful particles. Compatible with synthetic oils.', 12.99, 'Vehicle-specific', null],
    ['Air Filter (Cabin)', 'HVAC', 'normal', 'Bosch', 'Activated carbon cabin air filter. Removes pollen, dust, and odors.', 24.99, 'Vehicle-specific', null],
    ['Spark Plugs (Set of 4)', 'Engine', 'normal', 'NGK', 'Iridium spark plugs for reliable ignition and long service life. OEM replacement.', 39.99, 'Engine-specific', null],
    ['Serpentine Belt', 'Engine', 'normal', 'Gates', 'OEM-spec serpentine belt. Long-lasting EPDM construction for all-weather use.', 34.99, 'Vehicle-specific', null],
    ['Timing Belt Kit', 'Engine', 'normal', 'Gates', 'Complete timing belt kit with water pump, tensioner, and idler pulleys. Everything needed for the service.', 189.99, 'Engine-specific', null],
    ['Water Pump', 'Cooling', 'normal', 'Graf', 'OEM-quality water pump. Ensures proper coolant circulation and engine temperature management.', 69.99, 'Vehicle-specific', null],
    ['Radiator Hose Kit', 'Cooling', 'normal', 'Gates', 'Upper and lower radiator hoses. Silicone-reinforced for long service life.', 44.99, 'Vehicle-specific', null],
    ['Thermostat', 'Cooling', 'normal', 'Stant', 'OEM-spec thermostat for proper engine temperature regulation.', 16.99, 'Vehicle-specific', null],
    ['Windshield Wipers', 'Exterior', 'normal', 'Bosch ICON', 'Beam blade wipers for streak-free visibility in all conditions. Easy installation.', 29.99, 'Vehicle-specific', null],
    ['Battery', 'Electrical', 'normal', 'Optima', 'AGM battery with reserve capacity. Excellent cold-cranking amps for reliable starting.', 189.99, 'Group size specific', null],
    ['Alternator', 'Electrical', 'normal', 'Denso', 'Remanufactured OEM alternator. Full electrical testing ensures reliable charging.', 219.99, 'Vehicle-specific', null],
    ['Mass Air Flow Sensor', 'Electrical', 'normal', 'Bosch', 'OEM-spec MAF sensor for accurate air/fuel metering. Fixes lean codes and rough idle.', 89.99, 'Vehicle-specific', null],
    ['Oxygen Sensor (Upstream)', 'Electrical', 'normal', 'Bosch', 'Wideband upstream oxygen sensor. Restores proper fuel trimming and fuel economy.', 49.99, 'Vehicle-specific', null],
    ['Wheel Bearing Hub Assembly', 'Suspension', 'normal', 'Timken', 'Complete hub assembly with integrated wheel bearing. OEM replacement quality.', 129.99, 'Vehicle-specific', null],
    ['Tie Rod End (Pair)', 'Suspension', 'normal', 'Moog', 'Inner and outer tie rod ends. Precision machined for accurate steering geometry.', 79.99, 'Vehicle-specific', null],
    ['Ball Joint (Front Lower)', 'Suspension', 'normal', 'Moog', 'OEM-spec lower ball joint. Greaseable design for extended service life.', 54.99, 'Vehicle-specific', null],
    ['Control Arm (Front Lower)', 'Suspension', 'normal', 'Moog', 'Front lower control arm with new ball joint and bushing pre-installed.', 129.99, 'Vehicle-specific', null],
    ['Sway Bar End Links', 'Suspension', 'normal', 'Moog', 'Front sway bar end links. Eliminates clunking and restores proper handling.', 34.99, 'Vehicle-specific', null],
    ['CV Axle Shaft', 'Drivetrain', 'normal', 'GSP', 'Remanufactured CV axle shaft. All joints inspected and greased. Ready to install.', 89.99, 'Vehicle-specific', null],
    ['Transmission Mount', 'Drivetrain', 'normal', 'Anchor', 'OEM-spec transmission mount. Eliminates drivetrain vibration and improves shift feel.', 44.99, 'Vehicle-specific', null],
    ['Motor Mount Set', 'Drivetrain', 'normal', 'Anchor', 'Complete motor mount set. Reduces vibration and prevents drivetrain movement.', 79.99, 'Vehicle-specific', null],
    ['Fuel Filter', 'Fuel System', 'normal', 'Wix', 'OEM replacement inline fuel filter. Protects injectors from contaminants.', 19.99, 'Vehicle-specific', null],
    ['Power Steering Pump', 'Steering', 'normal', 'Cardone', 'Remanufactured power steering pump. Eliminates whining and restores full assist.', 99.99, 'Vehicle-specific', null],
    ['Valve Cover Gasket Set', 'Engine', 'normal', 'Fel-Pro', 'Complete valve cover gasket set with spark plug tube seals. Stops common oil leaks.', 39.99, 'Engine-specific', null],
    ['Head Gasket Set', 'Engine', 'normal', 'Cometic', 'Multi-layer steel (MLS) head gasket set for OEM or performance engine rebuilds.', 189.99, 'Engine-specific', null],
    // ── Both (Performance & Normal) ───────────────────────────────────────────
    ['Suspension Lowering Springs', 'Suspension', 'both', 'Eibach Pro-Kit', 'Sport lowering springs that lower ride height 1-1.5" while improving handling. Comfortable daily driving.', 249.99, 'Vehicle-specific', null],
    ['Performance Tires', 'Wheels & Tires', 'both', 'Michelin Pilot Sport 4S', 'Ultra-high-performance summer tires. Class-leading wet and dry grip with everyday usability.', 229.99, 'Size-specific', null],
    ['All-Season Performance Tires', 'Wheels & Tires', 'both', 'Continental ExtremeContact DWS06+', 'Max-performance all-season tires. Excellent balance of dry, wet, and light snow grip.', 189.99, 'Size-specific', null],
    ['Alloy Wheels (Set of 4)', 'Wheels & Tires', 'both', 'Enkei RPF1', '17" lightweight forged alloy wheels. 5.5kg each — saves rotating unsprung mass. Motorsport heritage.', 1299.99, 'Bolt pattern and offset specific', null],
    ['Upgraded Headlights (LED)', 'Exterior', 'both', 'Morimoto', 'LED headlight upgrade. OEM+ brightness and pattern with plug-and-play installation.', 399.99, 'Vehicle-specific', null],
    ['LED Tail Lights', 'Exterior', 'both', 'Morimoto', 'Sequential LED tail lights with plug-and-play harness. Modern look with improved visibility.', 349.99, 'Vehicle-specific', null],
    ['Sport Air Filter (Drop-In)', 'Engine', 'both', 'aFe Power', 'High-flow drop-in air filter. Increases airflow vs. paper element for slight power gains.', 49.99, 'Vehicle-specific', null],
    ['Catback Exhaust (Dual Exit)', 'Exhaust', 'both', 'Flowmaster', 'American Muscle series dual-exit catback. Aggressive tone without being intrusive at cruise.', 599.99, 'Vehicle-specific', null],
    ['Skid Plate / Underbody Protection', 'Exterior', 'both', 'Rock Hard 4x4', 'Aluminum or steel underbody protection for engine and transmission. Daily or off-road use.', 299.99, 'Vehicle-specific', null],
    ['Roof Rack (Platform Style)', 'Exterior', 'both', 'Rhino-Rack', 'Universal platform roof rack. Carry bikes, kayaks, gear for camping or adventure.', 449.99, 'Universal with vehicle-specific feet', null],
    ['Tonneau Cover (Roll-Up)', 'Exterior', 'both', 'Extang', 'Trifecta soft tonneau cover. Protects truck bed cargo and improves fuel economy.', 379.99, 'Truck bed size specific', null],
    ['Window Tint Film (DIY Kit)', 'Exterior', 'both', 'LEXEN', 'Pre-cut window tint film kit. 20% VLT ceramic tint. Heat rejection and UV blocking.', 79.99, 'Vehicle-specific cut', null],
    ['Engine Oil Cooler Kit', 'Cooling', 'both', 'Mishimoto', 'Thermostatic sandwich plate oil cooler kit. Keeps oil temps in check on spirited drives and track days.', 299.99, 'Universal with vehicle-specific adapter', null],
    ['Transmission Oil Cooler', 'Drivetrain', 'both', 'Mishimoto', 'Universal transmission cooler with -6AN fittings. Essential for towing or track use.', 189.99, 'Universal', null],
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
    ['Drift Build', 'Set up your RWD platform for sideways action. Angle kit for maximum steering lock, coilovers, LSD, hydraulic handbrake, and a cage for safety. Learn car control in the most fun way possible.', null, null, null, null, 'Performance', 'Advanced', '$5,000 - $12,000', null],
    ['Honda Civic Type R Street Build', 'Transform the FK8/FL5 Civic Type R into the ultimate track-focused street car. Suspension tuning, brake upgrade, intake, exhaust, and ECU tune for maximum track performance.', 'Honda', 'Civic Type R', 2017, 2024, 'Performance', 'Advanced', '$6,000 - $12,000', null],
    ['Ford Mustang GT Coyote Build', 'Unleash the potential of the 5.0 Coyote V8. Cold air intake, long tube headers, performance tune, and upgraded suspension for a seriously fast Mustang.', 'Ford', 'Mustang GT', 2015, 2024, 'Performance', 'Intermediate', '$5,000 - $10,000', null],
    ['Subaru WRX Rally-Inspired', 'Build your WRX into a road-going rally car. Suspension, brakes, intake, exhaust, and AWD tuning. Add STI brakes for serious stopping power.', 'Subaru', 'WRX', 2015, 2024, 'Performance', 'Advanced', '$7,000 - $15,000', null],
    ['Mazda MX-5 Miata Track Build', "The world's best-selling sports car becomes an even better track toy. Coilovers, roll bar, harness, brake pads, sticky tires, and an alignment. The Miata is always the answer.", 'Mazda', 'MX-5 Miata', 2016, 2024, 'Performance', 'Intermediate', '$4,000 - $9,000', null],
    ['Toyota GR86 / Subaru BRZ Build', 'The twinned sports coupes respond incredibly well to mods. Start with a tune + intake, then tackle suspension with coilovers and sway bars. Add a supercharger kit for big power.', 'Toyota', 'GR86', 2022, 2024, 'Performance', 'Intermediate', '$5,000 - $12,000', null],
    ['Toyota Supra A90 Build', 'The B58-powered A90 Supra loves boost. Downpipe, intake, and flash tune unlock 100+ hp easily. Follow with coilovers, big brakes, and aero for a complete package.', 'Toyota', 'Supra', 2019, 2024, 'Performance', 'Advanced', '$8,000 - $18,000', null],
    ['Nissan 370Z Track Prep', 'Prepare the Z34 for track duty. Coilovers, brake upgrade, Nismo sway bars, short shifter, and an ECU tune. The 370Z rewards a balanced approach to mods.', 'Nissan', '370Z', 2009, 2020, 'Performance', 'Intermediate', '$5,000 - $10,000', null],
    ['Mitsubishi Lancer Evo X Time Attack', 'Take the EVO X to the next level. Turbo upgrade, fueling, FMIC, full brake overhaul, suspension, and ACD/AYC tuning. A capable time attack platform.', 'Mitsubishi', 'Lancer Evolution X', 2008, 2015, 'Performance', 'Expert', '$10,000 - $22,000', null],
    ['Dodge Challenger SRT Hellcat Build', 'Make the already-wild Hellcat even more extreme. Pulley upgrade, ported supercharger, headers, tune, and sticky drag radials. Sub-10 second quarter miles are possible.', 'Dodge', 'Challenger SRT Hellcat', 2015, 2023, 'Performance', 'Expert', '$8,000 - $20,000', null],
    ['BMW E46 M3 Restoration & Track Build', 'The iconic E46 M3 deserves a proper restoration. Refresh all rubber bushings (Powerflex), rebuild the S54 engine, add coilovers, CSL-style aero, and quality brake upgrades.', 'BMW', 'M3 (E46)', 2001, 2006, 'Performance', 'Expert', '$12,000 - $30,000', null],
    ['Volkswagen Golf GTI Street Build', 'The GTI is a fantastic platform. IS38 turbo upgrade, intercooler, exhaust, and DSG tune. Add coilovers and BBS wheels for the complete Autobahn-ready look.', 'Volkswagen', 'Golf GTI', 2015, 2023, 'Performance', 'Intermediate', '$4,000 - $9,000', null],
    ['Jeep Wrangler JL Overland Build', 'Take your JL Wrangler on serious adventures. 2" or 3" lift, 35" tires, winch, rock sliders, skid plates, and a rooftop tent. Capability and comfort in equal measure.', 'Jeep', 'Wrangler JL', 2018, 2024, 'Off-Road', 'Intermediate', '$6,000 - $16,000', null],
    ['Toyota Tacoma TRD Pro Overland', 'Build the Tacoma into the ultimate overland rig. Old Man Emu suspension, 33" AT tires, ARB bumper, dual battery, and fridge. The truck that does it all.', 'Toyota', 'Tacoma', 2016, 2024, 'Off-Road', 'Intermediate', '$7,000 - $18,000', null],
    ['Porsche 911 Track Day Build', 'Prepare your 991/992 for Porsche Club track days. PCCB brake upgrade, coilover or PASM sport setting, Michelin PS Cup 2 tires, and a proper alignment. Already a giant killer.', 'Porsche', '911', 2012, 2024, 'Performance', 'Advanced', '$10,000 - $25,000', null],
  ];

  const insertMany = db.transaction((builds) => {
    for (const build of builds) insertBuild.run(...build);
  });
  insertMany(seedBuilds);
}

module.exports = db;
