/* eslint-disable */
/**
 * Netlify Serverless Function — handles all /api/* routes.
 * In-memory stores for users and cars (reset on cold starts; acceptable for demo).
 * Parts and build ideas are pre-seeded and always available.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'carpartportal_secret_key_change_in_production';

// ─── In-memory stores ────────────────────────────────────────────────────────
let nextUserId = 1;
let nextCarId = 1;
const users = new Map();       // id → user object
const cars = new Map();        // id → car object
const savedParts = new Map();  // `${userId}_${partId}` → {user_id, part_id, car_id, created_at}

// ─── Seed: Parts ─────────────────────────────────────────────────────────────
let nextPartId = 1;
const makePart = (name, category, type, brand, description, price, compatibility) => ({
  id: nextPartId++,
  name, category, type, brand, description, price, compatibility,
  image_url: null,
  created_at: new Date().toISOString(),
});

const PARTS = [
  // ── Performance ──────────────────────────────────────────────────────────
  makePart('Cold Air Intake', 'Engine', 'performance', 'K&N',
    'High-flow cold air intake system for improved horsepower and torque. Increases airflow to the engine for better combustion.',
    299.99, 'Universal - check fitment'),
  makePart('Short Ram Intake', 'Engine', 'performance', 'Injen',
    'Short ram intake for increased throttle response and power. Polished aluminum tubing with high-flow filter.',
    189.99, 'Vehicle-specific'),
  makePart('Performance Exhaust System', 'Exhaust', 'performance', 'Borla',
    'Cat-back exhaust system with improved flow and aggressive exhaust note. Stainless steel construction.',
    899.99, 'Multiple fitments available'),
  makePart('Axle-Back Exhaust', 'Exhaust', 'performance', 'MagnaFlow',
    'Axle-back exhaust upgrade for a deeper, more aggressive tone with minimal drone. Direct bolt-on.',
    449.99, 'Vehicle-specific'),
  makePart('Long Tube Headers', 'Exhaust', 'performance', 'Hooker',
    'Long tube headers for maximum exhaust scavenging and significant horsepower gains. 304 stainless steel.',
    749.99, 'Vehicle-specific'),
  makePart('Catted Downpipe', 'Exhaust', 'performance', 'Invidia',
    'High-flow catted downpipe with 200-cell cat. Significant turbo spool improvement and power gains while remaining emissions compliant.',
    549.99, 'Vehicle/turbo-specific'),
  makePart('Coilover Suspension Kit', 'Suspension', 'performance', 'KW Suspensions',
    'Height-adjustable coilover kit for improved handling and lowered stance. 36-way damping adjustment.',
    1499.99, 'Vehicle-specific fitment required'),
  makePart('Coilover Suspension Kit', 'Suspension', 'performance', 'BC Racing',
    'Type-BR coilovers with independent height and damping adjustment. Street and track capable.',
    899.99, 'Vehicle-specific fitment required'),
  makePart('Performance Brake Kit', 'Brakes', 'performance', 'Brembo',
    'Slotted and drilled rotor kit with high-performance pads. Improved stopping power and heat dissipation.',
    649.99, 'Vehicle-specific'),
  makePart('Big Brake Kit (6-Piston)', 'Brakes', 'performance', 'StopTech',
    '6-piston front big brake kit with 380mm rotors. Massive reduction in brake fade under heavy track use.',
    2199.99, 'Vehicle-specific'),
  makePart('Stainless Steel Brake Lines', 'Brakes', 'performance', 'Goodridge',
    'Stainless braided brake lines for improved pedal feel and reduced expansion under pressure.',
    89.99, 'Vehicle-specific'),
  makePart('Turbocharger Kit', 'Engine', 'performance', 'Garrett',
    'Complete turbocharger upgrade kit with intercooler, piping, and BOV. Significant power gains.',
    2499.99, 'Engine-specific'),
  makePart('Front-Mount Intercooler (FMIC)', 'Engine', 'performance', 'Mishimoto',
    'Large front-mount intercooler for dramatically lower charge air temps. Full pipe kit included.',
    649.99, 'Vehicle-specific'),
  makePart('Blow-Off Valve', 'Engine', 'performance', 'Turbosmart',
    'Atmospheric BOV for a satisfying pssh sound and improved turbo response. Anodized aluminum.',
    189.99, 'Turbo-specific'),
  makePart('Performance Chip / ECU Tune', 'Engine', 'performance', 'APR',
    'ECU software upgrade for increased power and torque throughout the powerband. Safe for stock hardware.',
    599.99, 'Vehicle/ECU specific'),
  makePart('High-Flow Fuel Injectors', 'Fuel System', 'performance', 'Injector Dynamics',
    '1000cc high-impedance fuel injectors for high-power builds. Plug-and-play on supported vehicles.',
    499.99, 'Engine-specific'),
  makePart('High-Flow Fuel Pump', 'Fuel System', 'performance', 'Walbro',
    '450lph high-pressure in-tank fuel pump. Supports up to 700whp on E85.',
    179.99, 'Tank-specific'),
  makePart('Methanol Injection Kit', 'Engine', 'performance', 'Snow Performance',
    'Stage 3 methanol injection kit. Cools charge temps and enables higher boost safely.',
    449.99, 'Universal'),
  makePart('Sway Bar Kit', 'Suspension', 'performance', 'Eibach',
    'Front and rear sway bar upgrade for reduced body roll and improved handling. Adjustable stiffness.',
    349.99, 'Vehicle-specific'),
  makePart('Strut Tower Brace', 'Suspension', 'performance', 'Whiteline',
    'Front strut tower brace for improved chassis rigidity and handling response.',
    199.99, 'Vehicle-specific'),
  makePart('Adjustable Rear Camber Arms', 'Suspension', 'performance', 'SPC',
    'Adjustable rear upper and lower camber arms for proper alignment after lowering.',
    299.99, 'Vehicle-specific'),
  makePart('Short Shifter Kit', 'Drivetrain', 'performance', 'Mishimoto',
    'Reduced-throw short shifter for faster, more precise gear changes. Billet aluminum construction.',
    149.99, 'Transmission-specific'),
  makePart('Performance Clutch Kit', 'Drivetrain', 'performance', 'ACT',
    'Heavy-duty clutch kit for increased power handling. Street/strip applications.',
    449.99, 'Transmission-specific'),
  makePart('Limited-Slip Differential (LSD)', 'Drivetrain', 'performance', 'Quaife',
    'Torque-biasing mechanical LSD for improved traction and controlled oversteer. OEM fitment.',
    899.99, 'Axle/differential-specific'),
  makePart('Performance Air Filter', 'Engine', 'performance', 'K&N',
    'High-flow drop-in replacement air filter. Washable and reusable. Minor power gains.',
    59.99, 'Universal - check fitment'),
  makePart('Oil Catch Can', 'Engine', 'performance', 'Mishimoto',
    'Baffled oil catch can to prevent blow-by deposits on intake valves. Keeps engine clean.',
    119.99, 'Universal with brackets'),
  makePart('Racing Seats', 'Interior', 'performance', 'Sparco',
    'Lightweight bucket seats with integrated harness slots. FIA approved for track use.',
    799.99, 'Universal with adapters'),
  makePart('Racing Harness (5-Point)', 'Interior', 'performance', 'Schroth',
    '5-point FIA-approved racing harness. Essential for track days with a roll cage or bar.',
    299.99, 'Universal - harness bar required'),
  makePart('Roll Bar / Harness Bar', 'Interior', 'performance', 'NRG',
    'Bolt-in harness bar for installing a racing harness. Bolt-in, no welding required.',
    349.99, 'Vehicle-specific'),
  makePart('Racing Steering Wheel', 'Interior', 'performance', 'Momo',
    '350mm suede-wrapped racing steering wheel. Improved feedback and ergonomics for track use.',
    249.99, 'Requires hub adapter'),
  makePart('Quick Release Hub', 'Interior', 'performance', 'NRG',
    'Push-to-release quick release hub. Allows fast steering wheel removal for entry/egress.',
    89.99, 'Hub adapter required'),
  makePart('Carbon Fiber Hood', 'Exterior', 'performance', 'Seibon',
    'OEM-replacement carbon fiber hood. Weight reduction over stock steel hood. Vented options available.',
    899.99, 'Vehicle-specific'),
  makePart('Front Splitter', 'Exterior', 'performance', 'APR Performance',
    'Carbon fiber front splitter for increased front downforce. GTC-300 adjustable rods included.',
    499.99, 'Vehicle-specific'),
  makePart('Rear Wing / Spoiler', 'Exterior', 'performance', 'APR Performance',
    'GTC-200 adjustable carbon fiber rear wing. Multiple heights and angles for aero tuning.',
    799.99, 'Universal with brackets'),

  // ── Normal / OEM ─────────────────────────────────────────────────────────
  makePart('Brake Pads (Front)', 'Brakes', 'normal', 'Akebono',
    'OEM-quality ceramic brake pads. Low dust, quiet operation. Excellent daily driver choice.',
    49.99, 'Vehicle-specific'),
  makePart('Brake Rotors (Front Pair)', 'Brakes', 'normal', 'Brembo',
    'OEM-spec vented front brake rotors. Excellent thermal capacity and fade resistance.',
    89.99, 'Vehicle-specific'),
  makePart('Brake Caliper (Remanufactured)', 'Brakes', 'normal', 'Cardone',
    'Remanufactured brake caliper. Full load-test and hardware included. Guaranteed fit.',
    79.99, 'Vehicle-specific'),
  makePart('Oil Filter', 'Engine', 'normal', 'Mobil 1',
    'Extended performance oil filter. Traps 99% of harmful particles. Compatible with synthetic oils.',
    12.99, 'Vehicle-specific'),
  makePart('Air Filter (Cabin)', 'HVAC', 'normal', 'Bosch',
    'Activated carbon cabin air filter. Removes pollen, dust, and odors.',
    24.99, 'Vehicle-specific'),
  makePart('Spark Plugs (Set of 4)', 'Engine', 'normal', 'NGK',
    'Iridium spark plugs for reliable ignition and long service life. OEM replacement.',
    39.99, 'Engine-specific'),
  makePart('Serpentine Belt', 'Engine', 'normal', 'Gates',
    'OEM-spec serpentine belt. Long-lasting EPDM construction for all-weather use.',
    34.99, 'Vehicle-specific'),
  makePart('Timing Belt Kit', 'Engine', 'normal', 'Gates',
    'Complete timing belt kit with water pump, tensioner, and idler pulleys. Everything needed for the service.',
    189.99, 'Engine-specific'),
  makePart('Water Pump', 'Cooling', 'normal', 'Graf',
    'OEM-quality water pump. Ensures proper coolant circulation and engine temperature management.',
    69.99, 'Vehicle-specific'),
  makePart('Radiator Hose Kit', 'Cooling', 'normal', 'Gates',
    'Upper and lower radiator hoses. Silicone-reinforced for long service life.',
    44.99, 'Vehicle-specific'),
  makePart('Thermostat', 'Cooling', 'normal', 'Stant',
    'OEM-spec thermostat for proper engine temperature regulation.',
    16.99, 'Vehicle-specific'),
  makePart('Windshield Wipers', 'Exterior', 'normal', 'Bosch ICON',
    'Beam blade wipers for streak-free visibility in all conditions. Easy installation.',
    29.99, 'Vehicle-specific'),
  makePart('Battery', 'Electrical', 'normal', 'Optima',
    'AGM battery with reserve capacity. Excellent cold-cranking amps for reliable starting.',
    189.99, 'Group size specific'),
  makePart('Alternator', 'Electrical', 'normal', 'Denso',
    'Remanufactured OEM alternator. Full electrical testing ensures reliable charging.',
    219.99, 'Vehicle-specific'),
  makePart('Mass Air Flow Sensor', 'Electrical', 'normal', 'Bosch',
    'OEM-spec MAF sensor for accurate air/fuel metering. Fixes lean codes and rough idle.',
    89.99, 'Vehicle-specific'),
  makePart('Oxygen Sensor (Upstream)', 'Electrical', 'normal', 'Bosch',
    'Wideband upstream oxygen sensor. Restores proper fuel trimming and fuel economy.',
    49.99, 'Vehicle-specific'),
  makePart('Wheel Bearing Hub Assembly', 'Suspension', 'normal', 'Timken',
    'Complete hub assembly with integrated wheel bearing. OEM replacement quality.',
    129.99, 'Vehicle-specific'),
  makePart('Tie Rod End (Pair)', 'Suspension', 'normal', 'Moog',
    'Inner and outer tie rod ends. Precision machined for accurate steering geometry.',
    79.99, 'Vehicle-specific'),
  makePart('Ball Joint (Front Lower)', 'Suspension', 'normal', 'Moog',
    'OEM-spec lower ball joint. Greaseable design for extended service life.',
    54.99, 'Vehicle-specific'),
  makePart('Control Arm (Front Lower)', 'Suspension', 'normal', 'Moog',
    'Front lower control arm with new ball joint and bushing pre-installed.',
    129.99, 'Vehicle-specific'),
  makePart('Sway Bar End Links', 'Suspension', 'normal', 'Moog',
    'Front sway bar end links. Eliminates clunking and restores proper handling.',
    34.99, 'Vehicle-specific'),
  makePart('CV Axle Shaft', 'Drivetrain', 'normal', 'GSP',
    'Remanufactured CV axle shaft. All joints inspected and greased. Ready to install.',
    89.99, 'Vehicle-specific'),
  makePart('Transmission Mount', 'Drivetrain', 'normal', 'Anchor',
    'OEM-spec transmission mount. Eliminates drivetrain vibration and improves shift feel.',
    44.99, 'Vehicle-specific'),
  makePart('Motor Mount Set', 'Drivetrain', 'normal', 'Anchor',
    'Complete motor mount set. Reduces vibration and prevents drivetrain movement.',
    79.99, 'Vehicle-specific'),
  makePart('Fuel Filter', 'Fuel System', 'normal', 'Wix',
    'OEM replacement inline fuel filter. Protects injectors from contaminants.',
    19.99, 'Vehicle-specific'),
  makePart('Power Steering Pump', 'Steering', 'normal', 'Cardone',
    'Remanufactured power steering pump. Eliminates whining and restores full assist.',
    99.99, 'Vehicle-specific'),
  makePart('Valve Cover Gasket Set', 'Engine', 'normal', 'Fel-Pro',
    'Complete valve cover gasket set with spark plug tube seals. Stops common oil leaks.',
    39.99, 'Engine-specific'),
  makePart('Head Gasket Set', 'Engine', 'normal', 'Cometic',
    'Multi-layer steel (MLS) head gasket set for OEM or performance engine rebuilds.',
    189.99, 'Engine-specific'),

  // ── Both (Performance & Normal) ───────────────────────────────────────────
  makePart('Suspension Lowering Springs', 'Suspension', 'both', 'Eibach Pro-Kit',
    'Sport lowering springs that lower ride height 1-1.5" while improving handling. Comfortable daily driving.',
    249.99, 'Vehicle-specific'),
  makePart('Performance Tires', 'Wheels & Tires', 'both', 'Michelin Pilot Sport 4S',
    'Ultra-high-performance summer tires. Class-leading wet and dry grip with everyday usability.',
    229.99, 'Size-specific'),
  makePart('All-Season Performance Tires', 'Wheels & Tires', 'both', 'Continental ExtremeContact DWS06+',
    'Max-performance all-season tires. Excellent balance of dry, wet, and light snow grip.',
    189.99, 'Size-specific'),
  makePart('Alloy Wheels (Set of 4)', 'Wheels & Tires', 'both', 'Enkei RPF1',
    '17" lightweight forged alloy wheels. 5.5kg each — saves rotating unsprung mass. Motorsport heritage.',
    1299.99, 'Bolt pattern and offset specific'),
  makePart('Upgraded Headlights (LED)', 'Exterior', 'both', 'Morimoto',
    'LED headlight upgrade. OEM+ brightness and pattern with plug-and-play installation.',
    399.99, 'Vehicle-specific'),
  makePart('LED Tail Lights', 'Exterior', 'both', 'Morimoto',
    'Sequential LED tail lights with plug-and-play harness. Modern look with improved visibility.',
    349.99, 'Vehicle-specific'),
  makePart('Sport Air Filter (Drop-In)', 'Engine', 'both', 'aFe Power',
    'High-flow drop-in air filter. Increases airflow vs. paper element for slight power gains.',
    49.99, 'Vehicle-specific'),
  makePart('Catback Exhaust (Dual Exit)', 'Exhaust', 'both', 'Flowmaster',
    'American Muscle series dual-exit catback. Aggressive tone without being intrusive at cruise.',
    599.99, 'Vehicle-specific'),
  makePart('Skid Plate / Underbody Protection', 'Exterior', 'both', 'TRD / Rock Hard 4x4',
    'Aluminum or steel underbody protection for engine and transmission. Daily or off-road use.',
    299.99, 'Vehicle-specific'),
  makePart('Roof Rack (Platform Style)', 'Exterior', 'both', 'Rhino-Rack',
    'Universal platform roof rack. Carry bikes, kayaks, gear for camping or adventure.',
    449.99, 'Universal with vehicle-specific feet'),
  makePart('Tonneau Cover (Roll-Up)', 'Exterior', 'both', 'Extang',
    'Trifecta soft tonneau cover. Protects truck bed cargo and improves fuel economy.',
    379.99, 'Truck bed size specific'),
  makePart('Window Tint Film (DIY Kit)', 'Exterior', 'both', 'LEXEN',
    'Pre-cut window tint film kit. 20% VLT ceramic tint. Heat rejection and UV blocking.',
    79.99, 'Vehicle-specific cut'),
  makePart('Engine Oil Cooler Kit', 'Cooling', 'both', 'Mishimoto',
    'Thermostatic sandwich plate oil cooler kit. Keeps oil temps in check on spirited drives and track days.',
    299.99, 'Universal with vehicle-specific adapter'),
  makePart('Transmission Oil Cooler', 'Drivetrain', 'both', 'Mishimoto',
    'Universal transmission cooler with -6AN fittings. Essential for towing or track use.',
    189.99, 'Universal'),
];

// ─── Seed: Builds ─────────────────────────────────────────────────────────────
let nextBuildId = 1;
const makeBuild = (title, description, car_make, car_model, car_year_min, car_year_max, category, difficulty, estimated_cost) => ({
  id: nextBuildId++,
  user_id: null,
  title, description, car_make, car_model, car_year_min, car_year_max,
  category, difficulty, estimated_cost,
  image_url: null,
  likes: Math.floor(Math.random() * 80) + 5,
  created_at: new Date().toISOString(),
  author: null,
});

const BUILDS = [
  // ── Generic builds ──────────────────────────────────────────────────────
  makeBuild('Street Performance Build',
    'Transform your daily driver into a fun weekend warrior. Focus on handling, brakes, and a modest power bump. Perfect balance of street manners and track capability. Start with suspension, then brakes, then engine mods.',
    null, null, null, null, 'Performance', 'Intermediate', '$3,000 - $8,000'),

  makeBuild('Budget Daily Driver Refresh',
    'Bring your high-mileage daily back to life on a budget. Focus on reliability and safety: new brakes, fresh tires, suspension refresh, and fluid services. A well-maintained car is a reliable car.',
    null, null, null, null, 'Maintenance', 'Beginner', '$500 - $2,000'),

  makeBuild('Track Day Build',
    'Build a dedicated track weapon from your sports car. Strip unnecessary weight, upgrade brakes significantly, install coilovers, add a rollbar, and dial in the alignment. Safety first!',
    null, null, null, null, 'Performance', 'Expert', '$10,000 - $25,000'),

  makeBuild('JDM Style Build',
    'Achieve that classic JDM look and feel. Lower the car on coilovers, add a front lip and rear spoiler, install Work or SSR wheels, and tint the windows. Clean and purposeful.',
    null, null, null, null, 'Style', 'Intermediate', '$4,000 - $10,000'),

  makeBuild('Sleeper Build',
    'Keep it stock-looking on the outside while massively upgrading the mechanicals. The goal: embarrass supercars at the stoplight while looking like a grocery getter.',
    null, null, null, null, 'Performance', 'Advanced', '$8,000 - $20,000'),

  makeBuild('Overlander / Off-Road Build',
    'Take your truck or SUV off the beaten path. Lift it with a proper suspension kit, add all-terrain tires, underbody protection, and recovery gear. Adventure awaits.',
    null, null, null, null, 'Off-Road', 'Intermediate', '$5,000 - $15,000'),

  makeBuild('Audio Upgrade Build',
    'Create the ultimate in-car audio experience. Upgrade head unit, add component speakers, a proper subwoofer, and sound deadening. Deadening first for best results.',
    null, null, null, null, 'Interior', 'Beginner', '$1,000 - $5,000'),

  makeBuild('Turbocharged Build',
    'Add forced induction to your naturally aspirated engine. Full supporting mods are essential: fuel system, intercooler, proper tune. Big power potential but requires careful planning.',
    null, null, null, null, 'Performance', 'Expert', '$5,000 - $15,000'),

  makeBuild('Stance Build',
    'Achieve that low and wide stance. Aggressive coilovers, wide aftermarket wheels with stretched tires, and flush fitment. Visual impact is the goal.',
    null, null, null, null, 'Style', 'Intermediate', '$3,000 - $8,000'),

  makeBuild('Reliability / Longevity Build',
    'Make your car last 300,000+ miles. Preventive maintenance, upgraded cooling system, quality fluids, and addressing worn components before they fail. The smart build.',
    null, null, null, null, 'Maintenance', 'Beginner', '$1,000 - $4,000'),

  makeBuild('EV Conversion Concept',
    'Convert a classic car to electric power. Motor, battery pack, controller, and the unique challenge of integrating modern tech into a vintage chassis. The future meets the past.',
    null, null, null, null, 'Custom', 'Expert', '$15,000 - $50,000'),

  makeBuild('Drift Build',
    'Set up your RWD platform for sideways action. Angle kit for maximum steering lock, coilovers, LSD, hydraulic handbrake, and a cage for safety. Learn car control in the most fun way possible.',
    null, null, null, null, 'Performance', 'Advanced', '$5,000 - $12,000'),

  // ── Car-specific builds ─────────────────────────────────────────────────
  makeBuild('Honda Civic Type R Street Build',
    'Transform the FK8/FL5 Civic Type R into the ultimate track-focused street car. Suspension tuning, brake upgrade, intake, exhaust, and ECU tune for maximum track performance.',
    'Honda', 'Civic Type R', 2017, 2024, 'Performance', 'Advanced', '$6,000 - $12,000'),

  makeBuild('Ford Mustang GT Coyote Build',
    'Unleash the potential of the 5.0 Coyote V8. Cold air intake, long tube headers, performance tune, and upgraded suspension for a seriously fast Mustang.',
    'Ford', 'Mustang GT', 2015, 2024, 'Performance', 'Intermediate', '$5,000 - $10,000'),

  makeBuild('Subaru WRX Rally-Inspired',
    'Build your WRX into a road-going rally car. Suspension, brakes, intake, exhaust, and AWD tuning. Add STI brakes for serious stopping power.',
    'Subaru', 'WRX', 2015, 2024, 'Performance', 'Advanced', '$7,000 - $15,000'),

  makeBuild('Mazda MX-5 Miata Track Build',
    "The world's best-selling sports car becomes an even better track toy. Coilovers, roll bar, harness, brake pads, sticky tires, and an alignment. The Miata is always the answer.",
    'Mazda', 'MX-5 Miata', 2016, 2024, 'Performance', 'Intermediate', '$4,000 - $9,000'),

  makeBuild('Toyota GR86 / Subaru BRZ Build',
    'The twinned sports coupes respond incredibly well to mods. Start with a tune + intake, then tackle suspension with coilovers and sway bars. Add a supercharger kit for big power.',
    'Toyota', 'GR86', 2022, 2024, 'Performance', 'Intermediate', '$5,000 - $12,000'),

  makeBuild('Toyota Supra A90 Build',
    'The B58-powered A90 Supra loves boost. Downpipe, intake, and flash tune unlock 100+ hp easily. Follow with coilovers, big brakes, and aero for a complete package.',
    'Toyota', 'Supra', 2019, 2024, 'Performance', 'Advanced', '$8,000 - $18,000'),

  makeBuild('Nissan 370Z Track Prep',
    'Prepare the Z34 for track duty. Coilovers, brake upgrade, Nismo sway bars, short shifter, and an ECU tune. The 370Z rewards a balanced approach to mods.',
    'Nissan', '370Z', 2009, 2020, 'Performance', 'Intermediate', '$5,000 - $10,000'),

  makeBuild('Mitsubishi Lancer Evo X Time Attack',
    'Take the EVO X to the next level. Turbo upgrade, fueling, FMIC, full brake overhaul, suspension, and ACD/AYC tuning. A capable time attack platform.',
    'Mitsubishi', 'Lancer Evolution X', 2008, 2015, 'Performance', 'Expert', '$10,000 - $22,000'),

  makeBuild('Dodge Challenger SRT Hellcat Build',
    'Make the already-wild Hellcat even more extreme. Pulley upgrade, ported supercharger, headers, tune, and sticky drag radials. Sub-10 second quarter miles are possible.',
    'Dodge', 'Challenger SRT Hellcat', 2015, 2023, 'Performance', 'Expert', '$8,000 - $20,000'),

  makeBuild('BMW E46 M3 Restoration & Track Build',
    'The iconic E46 M3 deserves a proper restoration. Refresh all rubber bushings (Powerflex), rebuild the S54 engine, add coilovers, CSL-style aero, and quality brake upgrades.',
    'BMW', 'M3 (E46)', 2001, 2006, 'Performance', 'Expert', '$12,000 - $30,000'),

  makeBuild('Volkswagen Golf GTI Street Build',
    'The GTI is a fantastic platform. IS38 turbo upgrade, intercooler, exhaust, and DSG tune. Add coilovers and BBS wheels for the complete Autobahn-ready look.',
    'Volkswagen', 'Golf GTI', 2015, 2023, 'Performance', 'Intermediate', '$4,000 - $9,000'),

  makeBuild('Jeep Wrangler JL Overland Build',
    'Take your JL Wrangler on serious adventures. 2" or 3" lift, 35" tires, winch, rock sliders, skid plates, and a rooftop tent. Capability and comfort in equal measure.',
    'Jeep', 'Wrangler JL', 2018, 2024, 'Off-Road', 'Intermediate', '$6,000 - $16,000'),

  makeBuild('Toyota Tacoma TRD Pro Overland',
    'Build the Tacoma into the ultimate overland rig. Old Man Emu suspension, 33" AT tires, ARB bumper, dual battery, and fridge. The truck that does it all.',
    'Toyota', 'Tacoma', 2016, 2024, 'Off-Road', 'Intermediate', '$7,000 - $18,000'),

  makeBuild('Porsche 911 Track Day Build',
    'Prepare your 991/992 for Porsche Club track days. PCCB brake upgrade, coilover or PASM sport setting, Michelin PS Cup 2 tires, and a proper alignment. Already a giant killer.',
    'Porsche', '911', 2012, 2024, 'Performance', 'Advanced', '$10,000 - $25,000'),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const respond = (statusCode, data) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(data),
});

function requireAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

function parseBody(rawBody) {
  if (!rawBody) return {};
  try {
    return typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  } catch {
    return {};
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
exports.handler = async function (event) {
  const { httpMethod: method, headers: reqHeaders, queryStringParameters: qs = {} } = event;
  const body = parseBody(event.body);
  const auth = reqHeaders.authorization || reqHeaders.Authorization || '';

  // Strip function prefix from path so routes match /auth/... /parts/... etc.
  let path = event.path || '/';
  path = path.replace(/^(\/\.netlify\/functions\/api|\/api)/, '') || '/';
  if (!path.startsWith('/')) path = '/' + path;

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const segments = path.split('/').filter(Boolean); // e.g. ['auth', 'signup']

  // ── AUTH ──────────────────────────────────────────────────────────────────

  // POST /auth/signup
  if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'signup') {
    const { username, email, password } = body;
    if (!username || !email || !password) {
      return respond(400, { error: 'Username, email and password are required.' });
    }
    if (password.length < 6) {
      return respond(400, { error: 'Password must be at least 6 characters.' });
    }
    // Check uniqueness
    for (const u of users.values()) {
      if (u.username === username) return respond(409, { error: 'Username or email already in use.' });
      if (u.email === email) return respond(409, { error: 'Username or email already in use.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = nextUserId++;
    const user = { id, username, email, password: hashed, created_at: new Date().toISOString() };
    users.set(id, user);
    const token = jwt.sign({ userId: id, username }, JWT_SECRET, { expiresIn: '7d' });
    return respond(201, { token, user: { id, username, email } });
  }

  // POST /auth/login
  if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'login') {
    const { email, password } = body;
    if (!email || !password) {
      return respond(400, { error: 'Email and password are required.' });
    }
    const user = [...users.values()].find(u => u.email === email);
    if (!user) return respond(401, { error: 'Invalid email or password.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return respond(401, { error: 'Invalid email or password.' });
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    return respond(200, { token, user: { id: user.id, username: user.username, email: user.email } });
  }

  // GET /auth/me
  if (method === 'GET' && segments[0] === 'auth' && segments[1] === 'me') {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const user = users.get(decoded.userId);
    if (!user) return respond(404, { error: 'User not found.' });
    return respond(200, { user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at } });
  }

  // ── PARTS ─────────────────────────────────────────────────────────────────

  // GET /parts/categories
  if (method === 'GET' && segments[0] === 'parts' && segments[1] === 'categories') {
    const cats = [...new Set(PARTS.map(p => p.category))].sort();
    return respond(200, cats);
  }

  // GET /parts/saved/list
  if (method === 'GET' && segments[0] === 'parts' && segments[1] === 'saved' && segments[2] === 'list') {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const saved = [...savedParts.values()]
      .filter(sp => sp.user_id === decoded.userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const result = saved.map(sp => {
      const part = PARTS.find(p => p.id === sp.part_id);
      return part ? { ...part, car_id: sp.car_id, saved_at: sp.created_at } : null;
    }).filter(Boolean);
    return respond(200, result);
  }

  // POST /parts/save
  if (method === 'POST' && segments[0] === 'parts' && segments[1] === 'save') {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const { partId, carId } = body;
    if (!partId) return respond(400, { error: 'partId is required.' });
    const key = `${decoded.userId}_${partId}`;
    savedParts.set(key, { user_id: decoded.userId, part_id: partId, car_id: carId || null, created_at: new Date().toISOString() });
    return respond(200, { message: 'Part saved.' });
  }

  // DELETE /parts/save/:partId
  if (method === 'DELETE' && segments[0] === 'parts' && segments[1] === 'save' && segments[2]) {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const key = `${decoded.userId}_${segments[2]}`;
    savedParts.delete(key);
    return respond(200, { message: 'Part unsaved.' });
  }

  // GET /parts/:id  (must come after named sub-routes)
  if (method === 'GET' && segments[0] === 'parts' && segments[1] && !isNaN(segments[1])) {
    const part = PARTS.find(p => p.id === parseInt(segments[1]));
    if (!part) return respond(404, { error: 'Part not found.' });
    return respond(200, part);
  }

  // GET /parts  (list with filters)
  if (method === 'GET' && segments[0] === 'parts' && !segments[1]) {
    const { type, category, search, page = '1', limit = '20' } = qs;
    let filtered = PARTS;
    if (type && type !== 'all') {
      filtered = filtered.filter(p => p.type === type || p.type === 'both');
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(s) ||
        (p.brand || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s)
      );
    }
    filtered = [...filtered].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    const total = filtered.length;
    const lim = parseInt(limit);
    const offset = (parseInt(page) - 1) * lim;
    const parts = filtered.slice(offset, offset + lim);
    return respond(200, { parts, total, page: parseInt(page), limit: lim });
  }

  // ── BUILDS ────────────────────────────────────────────────────────────────

  // GET /builds/categories/list
  if (method === 'GET' && segments[0] === 'builds' && segments[1] === 'categories' && segments[2] === 'list') {
    const allBuilds = [
      ...BUILDS,
      ...[...cars.values()], // user builds added later
    ];
    // Only from BUILDS for now
    const cats = [...new Set(BUILDS.map(b => b.category))].sort();
    return respond(200, cats);
  }

  // POST /builds/:id/like
  if (method === 'POST' && segments[0] === 'builds' && segments[1] && segments[2] === 'like') {
    const id = parseInt(segments[1]);
    const build = BUILDS.find(b => b.id === id);
    if (!build) return respond(404, { error: 'Build idea not found.' });
    build.likes = (build.likes || 0) + 1;
    return respond(200, { likes: build.likes });
  }

  // GET /builds/:id
  if (method === 'GET' && segments[0] === 'builds' && segments[1] && !isNaN(segments[1])) {
    const id = parseInt(segments[1]);
    const build = BUILDS.find(b => b.id === id);
    if (!build) return respond(404, { error: 'Build idea not found.' });
    return respond(200, build);
  }

  // POST /builds
  if (method === 'POST' && segments[0] === 'builds' && !segments[1]) {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const { title, description, car_make, car_model, car_year_min, car_year_max, category, difficulty, estimated_cost } = body;
    if (!title || !description || !category) {
      return respond(400, { error: 'Title, description and category are required.' });
    }
    const user = users.get(decoded.userId);
    const id = nextBuildId++;
    const build = {
      id,
      user_id: decoded.userId,
      title, description,
      car_make: car_make || null,
      car_model: car_model || null,
      car_year_min: car_year_min || null,
      car_year_max: car_year_max || null,
      category,
      difficulty: difficulty || null,
      estimated_cost: estimated_cost || null,
      image_url: null,
      likes: 0,
      created_at: new Date().toISOString(),
      author: user ? user.username : null,
    };
    BUILDS.push(build);
    return respond(201, build);
  }

  // GET /builds  (list with filters)
  if (method === 'GET' && segments[0] === 'builds' && !segments[1]) {
    const { category, difficulty, search, make, page = '1', limit = '12' } = qs;
    let filtered = BUILDS;
    if (category && category !== 'all') {
      filtered = filtered.filter(b => b.category === category);
    }
    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter(b => b.difficulty === difficulty);
    }
    if (make && make !== 'all') {
      filtered = filtered.filter(b => b.car_make === make || b.car_make == null);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(s) ||
        b.description.toLowerCase().includes(s) ||
        (b.car_make || '').toLowerCase().includes(s) ||
        (b.car_model || '').toLowerCase().includes(s)
      );
    }
    filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const total = filtered.length;
    const lim = parseInt(limit);
    const offset = (parseInt(page) - 1) * lim;
    const builds = filtered.slice(offset, offset + lim);
    return respond(200, { builds, total, page: parseInt(page), limit: lim });
  }

  // ── CARS ──────────────────────────────────────────────────────────────────

  // GET /cars
  if (method === 'GET' && segments[0] === 'cars' && !segments[1]) {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const userCars = [...cars.values()].filter(c => c.user_id === decoded.userId);
    return respond(200, userCars);
  }

  // POST /cars
  if (method === 'POST' && segments[0] === 'cars' && !segments[1]) {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const { year, make, model, trim, engine, notes } = body;
    if (!make || !model) return respond(400, { error: 'Make and model are required.' });
    const id = nextCarId++;
    const car = {
      id,
      user_id: decoded.userId,
      year: year || new Date().getFullYear(),
      make, model,
      trim: trim || null,
      engine: engine || null,
      notes: notes || null,
      created_at: new Date().toISOString(),
    };
    cars.set(id, car);
    return respond(201, car);
  }

  // GET /cars/:id
  if (method === 'GET' && segments[0] === 'cars' && segments[1] && !isNaN(segments[1])) {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const car = cars.get(parseInt(segments[1]));
    if (!car) return respond(404, { error: 'Car not found.' });
    if (car.user_id !== decoded.userId) return respond(403, { error: 'Forbidden.' });
    return respond(200, car);
  }

  // PUT /cars/:id
  if (method === 'PUT' && segments[0] === 'cars' && segments[1] && !isNaN(segments[1])) {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const id = parseInt(segments[1]);
    const car = cars.get(id);
    if (!car) return respond(404, { error: 'Car not found.' });
    if (car.user_id !== decoded.userId) return respond(403, { error: 'Forbidden.' });
    const { year, make, model, trim, engine, notes } = body;
    const updated = { ...car, year: year || car.year, make: make || car.make, model: model || car.model, trim: trim ?? car.trim, engine: engine ?? car.engine, notes: notes ?? car.notes };
    cars.set(id, updated);
    return respond(200, updated);
  }

  // DELETE /cars/:id
  if (method === 'DELETE' && segments[0] === 'cars' && segments[1] && !isNaN(segments[1])) {
    const decoded = requireAuth(auth);
    if (!decoded) return respond(401, { error: 'Unauthorized.' });
    const id = parseInt(segments[1]);
    const car = cars.get(id);
    if (!car) return respond(404, { error: 'Car not found.' });
    if (car.user_id !== decoded.userId) return respond(403, { error: 'Forbidden.' });
    cars.delete(id);
    // Clean up saved parts associated with this car
    for (const [key, sp] of savedParts.entries()) {
      if (sp.car_id === id) savedParts.set(key, { ...sp, car_id: null });
    }
    return respond(200, { message: 'Car deleted.' });
  }

  // ── Fallthrough ───────────────────────────────────────────────────────────
  return respond(404, { error: 'Not found.' });
};
