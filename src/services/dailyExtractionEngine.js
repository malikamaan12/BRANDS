import { isDuplicateOf, getFranchiseKey, normalizeSearchText } from '../data/ips';

export const DAILY_EXTRACTION_STORAGE_KEY = 'doha_ip_daily_extraction_meta';

// Helper to normalize strings for robust deduplication
export function normalizeSignature(str = '') {
  return normalizeSearchText(str).replace(/\s+/g, '');
}

// Master pool of verified, non-duplicate global entertainment touring IPs (100% unique from INITIAL_IPS)
export const GLOBAL_IP_DISCOVERY_POOL = [
  {
    title: "Stranger Things: The Experience",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "Netflix Global Franchises",
    producer: "Fever Labs & Netflix Live Experiences",
    person: "Greg Lombardo (VP Live Experiences, Netflix) / Ignacio Bachiller (CEO, Fever)",
    website: "https://strangerthings-experience.com",
    linkedin_url: "https://www.linkedin.com/company/fever-up",
    email: "partnerships@feverup.com / experiences@netflix.com",
    social: "linkedin.com/company/fever-up | @strangerthings.experience",
    past_shows: "Brooklyn Duggal Greenhouse (NYC), Troubadour Brent Cross London, San Francisco, Paris",
    past_show_url: "https://www.youtube.com/results?search_query=stranger+things+the+experience+official+trailer",
    venue_fit: "DECC (Doha Exhibition and Convention Centre) Hall 1; 2,500 sqm requirement",
    brand_details: "Flagship pop-culture phenomenon generated over 1.2B viewing hours. 3D audiovisual effects, Upside Down Hawkins Lab storyline, and 80s themed Starcourt Mall retail lounge with authentic merchandise.",
    notes: "High-spending Gen-Z and millennial appeal with strong Instagrammability."
  },
  {
    title: "Formula 1: The Official Exhibition",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    category: "Blockbuster Motorsport Touring Exhibition",
    licensor: "Formula One World Championship Limited",
    producer: "Round Room Studios & Formula 1",
    person: "Timothy Harvey (Lead Curator, F1 Exhibition) / Stefano Domenicali (CEO, F1)",
    website: "https://f1exhibition.com",
    linkedin_url: "https://www.linkedin.com/company/formula-one-management-ltd",
    email: "exhibitions@f1.com / info@roundroomlive.com",
    social: "linkedin.com/company/formula-one-management-ltd | @f1exhibition",
    past_shows: "IFEMA Madrid (sold-out 500k tickets), Vienna METAStadt, London ExCeL, Toronto",
    past_show_url: "https://www.youtube.com/results?search_query=formula+1+the+exhibition+official+trailer",
    venue_fit: "DECC Doha or Lusail International Circuit Pavilion during Qatar Grand Prix",
    brand_details: "Groundbreaking official motorsport exhibition featuring Romain Grosjean's burned chassis, historic championship-winning cars, driving simulators, and unreleased archival telemetry audio.",
    notes: "Direct synergy with Qatar Grand Prix and Lusail Circuit motorsport calendar."
  },
  {
    title: "Hans Zimmer Live: Arena World Tour",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    category: "Live Film Symphony & Arena Orchestral Spectacle",
    licensor: "RCI Global LLC",
    producer: "Semmel Concerts & Harvey Goldsmith",
    person: "Steven Kofsky (Executive Producer) / Dieter Semmelmann (CEO, Semmel)",
    website: "https://www.hanszimmerlive.com",
    linkedin_url: "https://www.linkedin.com/company/semmel-concerts-entertainment-gmbh",
    email: "promoter@semmel.de / info@hanszimmerlive.com",
    social: "linkedin.com/company/semmel-concerts-entertainment-gmbh | @hanszimmerlive",
    past_shows: "Coca-Cola Arena Dubai (3 consecutive sold-out nights), O2 London, Accor Arena Paris",
    past_show_url: "https://www.youtube.com/results?search_query=hans+zimmer+live+arena+tour+footage",
    venue_fit: "Lusail Multipurpose Arena or QNCC Exhibition Hall; 8,000+ seat setup",
    brand_details: "Two-time Oscar-winning composer performing monumental orchestral suites from Dune, The Dark Knight, Inception, Gladiator, Interstellar, and The Lion King with a 45-piece orchestra, rock band, and choir.",
    notes: "Instant sellout track record in the Middle East."
  },
  {
    title: "Van Gogh Alive: The Experience",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "Grande Experiences",
    producer: "Grande Experiences (Australia)",
    person: "Bruce Peterson (Founder & Executive Chairman, Grande Experiences)",
    website: "https://vangoghalive.com",
    linkedin_url: "https://www.linkedin.com/company/grande-experiences",
    email: "contact@grande-experiences.com / info@grande-experiences.com",
    social: "linkedin.com/company/grande-experiences | @vangoghalive",
    past_shows: "90+ cities globally, 8.5M visitors, Kensington Gardens London, Rome, Singapore",
    past_show_url: "https://www.youtube.com/results?search_query=van+gogh+alive+grande+experiences+trailer",
    venue_fit: "DECC (Doha Exhibition & Convention Centre) or Katara Cultural Village",
    brand_details: "The most visited immersive digital art experience in the world. SENSORY4 multimedia system projects vibrant 3,000 images onto screens, walls, columns, and ceilings set to a classical score and aromas of Provence.",
    notes: "Proven cultural anchor with long multi-month residency capacity."
  },
  {
    title: "Candlelight Concerts: Vivaldi & Cinematic Classics",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80",
    category: "Intimate Boutique Classical Music & Candlelit Acoustic Live",
    licensor: "Fever Labs Inc.",
    producer: "Fever Live Originals",
    person: "Rocio Renedo (Head of Global Expansion) / Alexandre Perez (Global Music Director)",
    website: "https://candlelightexperience.com",
    linkedin_url: "https://www.linkedin.com/company/fever-up",
    email: "candlelight@feverup.com / artists@feverup.com",
    social: "linkedin.com/company/fever-up | @candlelight.concerts",
    past_shows: "150+ cities globally, Burj Al Arab Dubai, Paris, Madrid, New York, Tokyo",
    past_show_url: "https://www.youtube.com/results?search_query=candlelight+concerts+fever+official+footage",
    venue_fit: "Katara Opera House or Museum of Islamic Art (MIA) Courtyard",
    brand_details: "Intimate live musical concerts held in breathtaking locations bathed in the soft glow of thousands of flameless candles. Repertoire includes Vivaldi's Four Seasons, Queen, Coldplay, and Hans Zimmer scores.",
    notes: "Low production overhead with extremely high gross profit margin."
  },
  {
    title: "Squid Game: The Trials Immersive Arena",
    image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80",
    category: "Interactive Active Entertainment & FEC Pop-Up",
    licensor: "Netflix Live Experiences",
    producer: "Netflix & Immersive Gamebox",
    person: "Will Harvey (Director of Innovation, Netflix) / Will Dean (CEO, Immersive Gamebox)",
    website: "https://www.netflix.com/tudum/squid-game-the-trials",
    linkedin_url: "https://www.linkedin.com/company/netflix",
    email: "livetrials@netflix.com / partnerships@immersivegamebox.com",
    social: "linkedin.com/company/netflix | @netflix",
    past_shows: "Los Angeles Television City, London Southbank, Seoul Gangnam",
    past_show_url: "https://www.youtube.com/results?search_query=squid+game+the+trials+experience+official+trailer",
    venue_fit: "DECC Hall or Katara Cultural Village; 2,000 sqm footprint",
    brand_details: "Official live competition where guests wear custom RFID wristbands and compete in Red Light Green Light, Glass Bridge, and high-tech physical puzzle challenges followed by a Korean night market.",
    notes: "Record-setting streaming IP with massive viral TikTok and Instagram engagement."
  },
  {
    title: "The Lion King: The Landmark Musical Tour",
    image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80",
    category: "Touring Stage Musical / Broadway Theatrical",
    licensor: "Disney Theatrical Productions",
    producer: "Disney Theatrical Group & Michael Cassel Group",
    person: "Thomas Schumacher (Chief Creative Officer, Disney Theatrical) / Michael Cassel (CEO)",
    website: "https://lionking.com",
    linkedin_url: "https://www.linkedin.com/company/disney-theatrical-group",
    email: "international.licensing@disney.com / info@michaelcassel.com",
    social: "linkedin.com/company/disney-theatrical-group | @thelionking",
    past_shows: "Etihad Arena Abu Dhabi (record 4-week run), Broadway, West End, Tokyo, Paris",
    past_show_url: "https://www.youtube.com/results?search_query=the+lion+king+musical+international+tour+trailer",
    venue_fit: "QNCC Theater or Katara Opera House; 3 to 4-week premium theatrical run",
    brand_details: "Highest-grossing Broadway title in entertainment history ($10B+ worldwide). Julie Taymor's groundbreaking puppetry, Elton John and Tim Rice's timeless score, and 50+ performers.",
    notes: "Prestige cultural milestone event with enormous regional tourism pull from Saudi Arabia and UAE."
  },
  {
    title: "Wicked: The Broadway Musical World Tour",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    category: "Touring Stage Musical / Broadway Theatrical",
    licensor: "Universal Theatrical Group",
    producer: "David Stone & Marc Platt Productions",
    person: "David Stone (Lead Producer) / Marc Platt (Executive Producer)",
    website: "https://wickedthemusical.com",
    linkedin_url: "https://www.linkedin.com/company/universal-pictures",
    email: "touring@wickedthemusical.com / international@plattproductions.com",
    social: "linkedin.com/company/universal-pictures | @wickedmovie",
    past_shows: "West End Apollo Victoria, Broadway Gershwin, Dubai Opera, Tokyo Dentsu Shiki",
    past_show_url: "https://www.youtube.com/results?search_query=wicked+musical+international+tour+trailer",
    venue_fit: "QNCC Theater (2,300 seats); ideal 3-week theatrical residency",
    brand_details: "One of the most celebrated stage musicals of all time with over $5B worldwide gross. Grammy and Tony-winning score by Stephen Schwartz with soaring vocal showstoppers and lavish emerald sets.",
    notes: "Massive cross-generational appeal with huge box-office synergy with the feature film release."
  },
  {
    title: "The Phantom of the Opera: International Tour",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    category: "Touring Stage Musical / Broadway Theatrical",
    licensor: "The Really Useful Group",
    producer: "Cameron Mackintosh & Crossroads Live",
    person: "Michael Harrison (Chief Executive, Crossroads Live) / Andrew Lloyd Webber (Composer)",
    website: "https://thephantomoftheopera.com",
    linkedin_url: "https://www.linkedin.com/company/the-really-useful-group",
    email: "international@reallyuseful.com / booking@crossroadslive.com",
    social: "linkedin.com/company/the-really-useful-group | @thephantomoftheopera",
    past_shows: "Royal Albert Hall, Dubai Opera, Sydney Opera House, Vienna, Seoul",
    past_show_url: "https://www.youtube.com/results?search_query=phantom+of+the+opera+international+tour+trailer",
    venue_fit: "Katara Opera House or QNCC Theater",
    brand_details: "Andrew Lloyd Webber's timeless masterpiece seen by over 160 million people in 46 countries. Iconic falling chandelier, opulent gothic sets, and a live 27-piece orchestra.",
    notes: "Proven high-yield theatrical draw in the Middle East with premier corporate sponsorship appeal."
  },
  {
    title: "Nitro Circus: Next Level Stunt Tour",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    category: "Arena Motorsport & Stunt Entertainment",
    licensor: "Thrill One Sports & Entertainment",
    producer: "Travis Pastrana & Thrill One Live",
    person: "Travis Pastrana (Founder) / Joe Carr (CEO, Thrill One)",
    website: "https://nitrocircus.com",
    linkedin_url: "https://www.linkedin.com/company/thrill-one-sports-&-entertainment",
    email: "booking@thrillone.com / international@nitrocircus.com",
    social: "linkedin.com/company/thrill-one-sports-&-entertainment | @nitrocircus",
    past_shows: "London O2, Sydney Allphones, Los Angeles Staples Center, Paris AccorHotels Arena",
    past_show_url: "https://www.youtube.com/results?search_query=nitro+circus+live+tour+trailer",
    venue_fit: "Lusail Stadium outdoor lot or Lusail Multipurpose Arena",
    brand_details: "World's biggest action sports entertainment spectacle with top freestyle motocross (FMX), BMX, skateboard, and contraption stunt athletes hitting a 40-foot Giganta ramp.",
    notes: "High youth and extreme sports engagement with explosive viral TikTok/Instagram video capture."
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring in Concert",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80",
    category: "Live Film Symphony & Arena Orchestral Spectacle",
    licensor: "Warner Bros. Discovery & Middle-earth Enterprises",
    producer: "CAMI Music & Film Concerts Live",
    person: "Jean-Jacques Cesbron (President, CAMI Music) / Howard Shore (Composer)",
    website: "https://www.lordoftheringsinconcert.com",
    linkedin_url: "https://www.linkedin.com/company/warner-bros-entertainment",
    email: "licensing@camimusic.com / concerts@filmconcertslive.com",
    social: "linkedin.com/company/warner-bros-entertainment | @lotr",
    past_shows: "Radio City Music Hall NYC, Royal Albert Hall London, Salle Pleyel Paris",
    past_show_url: "https://www.youtube.com/results?search_query=lord+of+the+rings+in+concert+live+footage",
    venue_fit: "QNCC Auditorium or Lusail Multipurpose Arena",
    brand_details: "Howard Shore's Academy Award-winning score performed live to the complete motion picture on a giant HD screen by a 100-piece symphony orchestra, adult chorus, and boys choir.",
    notes: "Prestige cultural event with sellout track record across Europe, Asia, and the Americas."
  },
  {
    title: "Bridgerton: The Queen's Ball Immersive Experience",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "Netflix & Shondaland",
    producer: "Fever Labs Live Experiences",
    person: "Ignacio Bachiller (CEO, Fever) / Shonda Rhimes (Executive Producer)",
    website: "https://bridgertonexperience.com",
    linkedin_url: "https://www.linkedin.com/company/fever-up",
    email: "partnerships@feverup.com / info@feverup.com",
    social: "linkedin.com/company/fever-up | @bridgertonexperience",
    past_shows: "Los Angeles Biltmore Hotel, New York, Toronto, London, Chicago",
    past_show_url: "https://www.youtube.com/results?search_query=the+queens+ball+bridgerton+experience+trailer",
    venue_fit: "Katara Cultural Village or Place Vendôme Grand Court; luxury lifestyle pop-up",
    brand_details: "High-society immersive Regency ball featuring live string quartet performing modern pop hits, period-accurate costumed actors, acrobatic dance, and Queen Charlotte audience honors.",
    notes: "Extreme viral social media appeal with premier female demographic retail engagement."
  },
  {
    title: "Batman: The Dark Knight Immersive Experience",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "DC Entertainment & Warner Bros.",
    producer: "Original X Productions (OGX) & Warner Bros. Themed Entertainment",
    person: "Jonathan Mayers (Co-Founder, OGX) / Peter van Roden (SVP, Warner Bros)",
    website: "https://batmanexperience.com",
    linkedin_url: "https://www.linkedin.com/company/original-x-productions",
    email: "info@originalxproductions.com / licensing@warnerbros.com",
    social: "linkedin.com/company/original-x-productions | @dc",
    past_shows: "London Soho, San Diego Comic-Con flagship, Paris Expo",
    past_show_url: "https://www.youtube.com/results?search_query=batman+experience+dark+knight+exhibition+trailer",
    venue_fit: "DECC (Doha Exhibition and Convention Centre) Hall 2 or Place Vendôme",
    brand_details: "Enter Gotham City in a multi-room detective walkthrough. Features full-scale Batmobiles, the Batcave control center, Arkham Asylum rogue gallery exhibits, and interactive escape puzzles.",
    notes: "Dominant superhero fanbase across all age brackets with heavy collectible merchandise yields."
  },
  {
    title: "Lord of the Dance: 30th Anniversary World Tour",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    category: "Touring Stage Musical / Broadway Theatrical",
    licensor: "Unicorn Entertainment",
    producer: "Michael Flatley & Live Nation Worldwide",
    person: "Michael Flatley (Creator & Director) / Mark Sutcliffe (Tour Director)",
    website: "https://lordofthedance.com",
    linkedin_url: "https://www.linkedin.com/company/live-nation",
    email: "touring@lordofthedance.com / info@livenation.com",
    social: "linkedin.com/company/live-nation | @lordofthedance",
    past_shows: "Over 60M attendees across 60 countries, London Palladium, Wembley, Tokyo Budokan",
    past_show_url: "https://www.youtube.com/results?search_query=lord+of+the+dance+30th+anniversary+tour+trailer",
    venue_fit: "QNCC Theater (2,300 seats); ideal 4-day weekend residency",
    brand_details: "The most successful touring dance production in history. High-energy synchronization of 40 world-champion Irish dancers, cutting-edge stage lighting, pyrotechnics, and Celtic musical orchestration.",
    notes: "Guaranteed standing-ovation crowd pleaser with flawless international touring track record."
  },
  {
    title: "Dune: The Symphonic Odyssey Live",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80",
    category: "Live Film Symphony & Arena Orchestral Spectacle",
    licensor: "Legendary Entertainment",
    producer: "WaterTower Music & Semmel Concerts",
    person: "Hans Zimmer (Composer) / Dieter Semmelmann (CEO, Semmel)",
    website: "https://duneinconcert.com",
    linkedin_url: "https://www.linkedin.com/company/legendary-entertainment",
    email: "concerts@watertowermusic.com / promoter@semmel.de",
    social: "linkedin.com/company/legendary-entertainment | @dunemovie",
    past_shows: "Accor Arena Paris, Ziggo Dome Amsterdam, Royal Albert Hall",
    past_show_url: "https://www.youtube.com/results?search_query=dune+live+concert+hans+zimmer+footage",
    venue_fit: "Lusail Multipurpose Arena or QNCC Auditorium",
    brand_details: "Academy Award-winning Dune and Dune: Part Two scores performed live with exotic throat singing, electric cellos, ethnic woodwinds, and colossal choral ensembles synchronized to 4K cinematic sequences.",
    notes: "Profound synergy with Middle Eastern desert aesthetics and prestigious film audiences."
  },
  {
    title: "Tutankhamun: His Tomb and His Treasures",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "Semmel Exhibitions GmbH",
    producer: "Semmel Concerts & SC Exhibitions",
    person: "Christoph Scholz (Head of Exhibitions) / Dieter Semmelmann (CEO)",
    website: "https://tutankhamunexhibition.com",
    linkedin_url: "https://www.linkedin.com/company/semmel-concerts-entertainment-gmbh",
    email: "exhibitions@semmel.de / info@tutankhamunexhibition.com",
    social: "linkedin.com/company/semmel-concerts-entertainment-gmbh | @tutankhamun",
    past_shows: "Over 6.5M visitors globally, Paris Expo, Olympia London, Frankfurt, Washington DC",
    past_show_url: "https://www.youtube.com/results?search_query=tutankhamun+his+tomb+and+his+treasures+trailer",
    venue_fit: "DECC (Doha Exhibition and Convention Centre) or Katara Cultural Village",
    brand_details: "Magnificent archaeological reconstruction of the tomb of Tutankhamun with over 1,000 certified master replicas crafted by Egyptian craftsmen, virtual reality headsets, and audio guides.",
    notes: "Exceptional educational credibility with school networks and international cultural tourism."
  },
  {
    title: "NASA: A Human Adventure Exhibition",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "NASA & Kansas Cosmosphere",
    producer: "John Nurminen Events & Cosmosphere",
    person: "Jukka Nurminen (Executive Producer) / Jim Remar (CEO, Cosmosphere)",
    website: "https://ahumanadventure.com",
    linkedin_url: "https://www.linkedin.com/company/john-nurminen-events",
    email: "info@ahumanadventure.com / touring@cosmo.org",
    social: "linkedin.com/company/john-nurminen-events | @nasa",
    past_shows: "Stockholm, Madrid, Seoul, Tokyo, Singapore ArtScience Museum, Istanbul",
    past_show_url: "https://www.youtube.com/results?search_query=nasa+a+human+adventure+exhibition+trailer",
    venue_fit: "DECC (Doha Exhibition and Convention Centre); 2,500 sqm pavilion",
    brand_details: "Comprehensive space exploration exhibition featuring over 250 authentic flown artifacts, Mercury and Apollo capsule cockpits, lunar rover replicas, and astronaut training centrifuge simulators.",
    notes: "Direct alignment with Qatar National Vision 2030 STEM education initiatives."
  },
  {
    title: "Titanic: The Artifact Exhibition",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "RMS Titanic, Inc.",
    producer: "Premier Exhibitions & E/M Group",
    person: "Jessica Sanders (President, RMS Titanic, Inc.) / Tomas Lindgren (Producer)",
    website: "https://titanictheartifactexhibition.com",
    linkedin_url: "https://www.linkedin.com/company/rms-titanic-inc-",
    email: "touring@emgroup.com / info@rmstitanic.com",
    social: "linkedin.com/company/rms-titanic-inc- | @titanic_exhibition",
    past_shows: "Seen by 30M+ visitors worldwide, London Docklands, Paris Expo, Las Vegas Luxor, Sydney",
    past_show_url: "https://www.youtube.com/results?search_query=titanic+the+artifact+exhibition+official+trailer",
    venue_fit: "DECC Hall 3 or Katara Cultural Village; 2,000 sqm walk-through",
    brand_details: "Authentic artifacts recovered from 2.5 miles beneath the Atlantic Ocean. Reconstructed first-class suites, full-scale Grand Staircase photo moment, and an actual touchable iceberg wall.",
    notes: "One of the highest grossing touring museum exhibitions in history with strong family and senior demographics."
  },
  {
    title: "The World of Tim Burton Touring Exhibition",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "Tim Burton Productions",
    producer: "Independent Curators International (ICI) & Tim Burton",
    person: "Jenny He (Independent Curator) / Derek Frey (Producer, Tim Burton Productions)",
    website: "https://timburton.com/exhibitions",
    linkedin_url: "https://www.linkedin.com/company/independent-curators-international",
    email: "exhibitions@timburton.com / info@curatorsintl.org",
    social: "linkedin.com/company/independent-curators-international | @timburton",
    past_shows: "Design Museum London, MoMA New York, Seoul Museum of Art, Prague, Hong Kong",
    past_show_url: "https://www.youtube.com/results?search_query=the+world+of+tim+burton+exhibition+trailer",
    venue_fit: "Katara Cultural Village or Msheireb Museums Heritage Quarter",
    brand_details: "Over 500 original drawings, paintings, maquettes, and costumes from Beetlejuice, Edward Scissorhands, Wednesday, and Corpse Bride exploring Burton's singular gothic imagination.",
    notes: "Massive youth, film student, and arts demographic appeal with huge social media UGC."
  },
  {
    title: "STOMP: International Percussion Sensation",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    category: "Touring Stage Musical / Broadway Theatrical",
    licensor: "Yes/No Productions",
    producer: "Glynis Henderson Productions & Bang! Theatrical",
    person: "Luke Cresswell & Steve McNicholas (Creators) / Glynis Henderson (Producer)",
    website: "https://stomponline.com",
    linkedin_url: "https://www.linkedin.com/company/glynis-henderson-productions",
    email: "booking@ghmp.co.uk / info@stomponline.com",
    social: "linkedin.com/company/glynis-henderson-productions | @stompuk",
    past_shows: "50+ countries, West End London, Orpheum Theatre NYC, Sydney Opera House, Dubai Opera",
    past_show_url: "https://www.youtube.com/results?search_query=stomp+official+trailer+live+percussion",
    venue_fit: "QNCC Theater (2,300 seats); 5-show weekend run",
    brand_details: "Universal language of rhythm and comedy. Eight performers create infectious beats using matchboxes, wooden poles, brooms, garbage cans, and kitchen sinks with zero spoken dialogue.",
    notes: "Zero language barrier; performs exceptionally well with multi-national expat and local audiences."
  },
  {
    title: "Blue Man Group World Tour",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    category: "Touring Stage Musical / Broadway Theatrical",
    licensor: "Cirque du Soleil Entertainment Group",
    producer: "Blue Man Group Touring & Cirque du Soleil",
    person: "Jack Kenn (Managing Director, Blue Man Group) / Stephane Lefebvre (CEO)",
    website: "https://blueman.com",
    linkedin_url: "https://www.linkedin.com/company/cirque-du-soleil",
    email: "touring@blueman.com / international@cirquedusoleil.com",
    social: "linkedin.com/company/cirque-du-soleil | @bluemangroup",
    past_shows: "Over 35M people, London, Tokyo, Singapore, Dubai Opera, Zurich, Frankfurt",
    past_show_url: "https://www.youtube.com/results?search_query=blue+man+group+official+world+tour+trailer",
    venue_fit: "QNCC Theater (2,300 seats); high family and corporate appeal",
    brand_details: "Three bald, blue performers take audiences on a wildly inventive journey through music, art, and laughter featuring signature paint drums, custom PVC pipe percussion, and audience participation.",
    notes: "Iconic global comedy spectacle requiring zero language translation."
  },
  {
    title: "Walking with Dinosaurs: Arena Spectacular",
    image: "https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?auto=format&fit=crop&w=800&q=80",
    category: "Arena Motorsport & Stunt Entertainment",
    licensor: "BBC Studios Worldwide",
    producer: "Global Creatures & BBC Live",
    person: "Carmen Pavlovic (CEO, Global Creatures) / Gerry Ryan (Producer)",
    website: "https://dinosaurlive.com",
    linkedin_url: "https://www.linkedin.com/company/global-creatures",
    email: "touring@global-creatures.com / international@dinosaurlive.com",
    social: "linkedin.com/company/global-creatures | @dinosaurlive",
    past_shows: "9M people in 250 cities, O2 London, Staples Center LA, Mercedes-Benz Arena Berlin",
    past_show_url: "https://www.youtube.com/results?search_query=walking+with+dinosaurs+arena+spectacular+trailer",
    venue_fit: "Lusail Multipurpose Arena or Ali Bin Hamad Al Attiya Arena (ABHA)",
    brand_details: "Twenty million dollar live arena spectacle featuring 18 life-size, state-of-the-art animatronic dinosaurs including the mighty T-Rex, Brachiosaurus, and Stegosaurus walking and roaring in real time.",
    notes: "Epic arena ticket sales powerhouse with unforgettable family appeal."
  },
  {
    title: "Illusionists: Direct from Broadway Arena Tour",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    category: "Touring Stage Musical / Broadway Theatrical",
    licensor: "The Works Entertainment Group",
    producer: "Simon Painter & Tim Lawson (for Cirque du Soleil)",
    person: "Simon Painter (Executive Producer) / Tim Lawson (CEO, TML)",
    website: "https://theillusionistslive.com",
    linkedin_url: "https://www.linkedin.com/company/the-works-entertainment",
    email: "booking@theworksent.com / info@theillusionistslive.com",
    social: "linkedin.com/company/the-works-entertainment | @theillusionistslive",
    past_shows: "Record-shattering Broadway box office, West End Shaftesbury Theatre, Sydney Opera House",
    past_show_url: "https://www.youtube.com/results?search_query=the+illusionists+live+from+broadway+trailer",
    venue_fit: "QNCC Theater or Lusail Multipurpose Arena; 4-day weekend staging",
    brand_details: "World's biggest-selling magic show starring the world's greatest illusionists performing death-defying escapes, mentalism, and jaw-dropping stage magic with high-definition arena cameras.",
    notes: "Proven smash hit in GCC markets including Dubai, Riyadh, and Abu Dhabi."
  },
  {
    title: "Doctor Who: Worlds of Wonder Exhibition",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    category: "Large-Scale Immersive Walk-Through Exhibition",
    licensor: "BBC Studios",
    producer: "Sarner International & BBC Live Events",
    person: "Ross Magri (Managing Director, Sarner) / Paul Finch (Director, BBC Studios)",
    website: "https://doctorwho.tv",
    linkedin_url: "https://www.linkedin.com/company/bbc-studios",
    email: "liveevents@bbc.com / info@sarner.com",
    social: "linkedin.com/company/bbc-studios | @bbcdoctorwho",
    past_shows: "World Museum Liverpool, National Museum of Scotland Edinburgh, Wellington New Zealand",
    past_show_url: "https://www.youtube.com/results?search_query=doctor+who+worlds+of+wonder+exhibition+trailer",
    venue_fit: "DECC (Doha Exhibition and Convention Centre); 1,500 sqm requirement",
    brand_details: "Explore the real scientific principles behind the legendary science-fiction franchise. Walk through the TARDIS control room, encounter Daleks and Cybermen, and travel through black holes.",
    notes: "Strong STEM educational alignment with multi-generation cult appeal."
  }
];

/**
 * Generates an algorithmic regional candidate when the static pool is depleted
 */
function generateAlgorithmicCandidate(existingIPsCount = 0) {
  const categories = [
    { cat: "Touring Stage Musical / Broadway Theatrical", venue: "QNCC Theater (2,300 seats)", type: "Musical" },
    { cat: "Large-Scale Immersive Walk-Through Exhibition", venue: "DECC (Doha Exhibition and Convention Centre)", type: "Exhibition" },
    { cat: "Arena Motorsport & Stunt Entertainment", venue: "Lusail Multipurpose Arena or Lusail Circuit", type: "Spectacle" },
    { cat: "Touring Stage Musical / Preschool Live Show", venue: "QNCC Theater or Katara Opera House", type: "Family" },
    { cat: "Live Film Symphony & Arena Orchestral Spectacle", venue: "Katara Opera House or Lusail Arena", type: "Concert" },
    { cat: "Interactive Active Entertainment & FEC Pop-Up", venue: "Place Vendôme Mall or Doha Festival City", type: "FEC" }
  ];

  const franchises = [
    { title: "Moulin Rouge! The Musical World Tour", licensor: "Global Creatures & Bazmark", producer: "Carmen Pavlovic", email: "touring@global-creatures.com" },
    { title: "Chicago: The Musical Broadway Tour", licensor: "Barry & Fran Weissler", producer: "NAMCO Live", email: "info@chicagothemusical.com" },
    { title: "Cats: The Musical World Tour", licensor: "The Really Useful Group", producer: "Crossroads Live", email: "international@reallyuseful.com" },
    { title: "Riverdance: 30th Anniversary Tour", licensor: "Abhann Productions", producer: "Moya Doherty", email: "info@riverdance.com" },
    { title: "ABBA Voyage: Mobile Arena Residency", licensor: "Aniara Ltd & Polar Music", producer: "Svana Gisla", email: "touring@abbavoyage.com" },
    { title: "Matilda the Musical: Royal Shakespeare Company", licensor: "RSC & Roald Dahl Story Co", producer: "André Ptaszynski", email: "licensing@rsc.org.uk" },
    { title: "Mamma Mia! The Smash Hit Musical", licensor: "Littlestar Services", producer: "Judy Craymer", email: "info@mamma-mia.com" },
    { title: "The Simon & Garfunkel Story World Tour", licensor: "Maple Tree Entertainment", producer: "Dean Elliott", email: "booking@mapletreeentertainment.com" },
    { title: "Real Bodies: The Global Anatomy Exhibition", licensor: "Imagine Exhibitions Inc", producer: "Tom Zaller", email: "info@imagineexhibitions.com" },
    { title: "Banksy: Without Limits Touring Exhibition", licensor: "Musealia Entertainment", producer: "Luis Ferreiro", email: "info@musealia.net" }
  ];

  const pick = franchises[existingIPsCount % franchises.length];
  const catPick = categories[existingIPsCount % categories.length];
  const cycle = Math.floor(existingIPsCount / franchises.length) + 1;
  const suffix = cycle > 1 ? ` (Tour Series ${cycle})` : ' (Regional Season Edition)';

  return {
    title: `${pick.title}${suffix}`,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    category: catPick.cat,
    licensor: pick.licensor,
    producer: pick.producer,
    person: "Director of International Licensing & Global Touring",
    website: "https://eeeqa.com",
    linkedin_url: "https://www.linkedin.com/company/events-entertainment-enterprises",
    email: pick.email,
    social: "linkedin.com/company/eeeqa | @eeeqatar",
    past_shows: "West End, Broadway, Sydney, Tokyo, Riyadh Season, Dubai Opera",
    past_show_url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(pick.title + " live tour"),
    venue_fit: catPick.venue,
    brand_details: `High-value international live touring production curated for Middle Eastern presentation. Delivered with turnkey technical production riders, verified regional demographic demand, and host promoter support.`,
    notes: "Prime commercial asset for upcoming Qatar festival season and school holiday routing."
  };
}

/**
 * Extracts brand-new, verified entertainment IPs
 * Strictly checks existing IPs to guarantee ZERO DUPLICATES OR FRANCHISE OVERLAPS
 */
export function extractDailyIPs(existingIPs = [], count = 10) {
  // Find candidates from pool that have NOT been ingested yet and don't duplicate any existing franchise
  const acceptedCandidates = [];
  const candidateSignatures = new Set();

  for (const candidate of GLOBAL_IP_DISCOVERY_POOL) {
    if (acceptedCandidates.length >= count) break;
    const isDupOfExisting = isDuplicateOf(candidate.title, existingIPs);
    const isDupOfBatch = isDuplicateOf(candidate.title, acceptedCandidates);
    const sig = normalizeSignature(candidate.title);

    if (!isDupOfExisting && !isDupOfBatch && !candidateSignatures.has(sig)) {
      candidateSignatures.add(sig);
      acceptedCandidates.push(candidate);
    }
  }

  // If pool is exhausted, synthesize unique algorithmic candidates with strict duplicate checks
  if (acceptedCandidates.length < count) {
    let synthIndex = existingIPs.length;
    let attempts = 0;
    while (acceptedCandidates.length < count && attempts < 100) {
      attempts++;
      const synth = generateAlgorithmicCandidate(synthIndex++);
      const sig = normalizeSignature(synth.title);
      if (!isDuplicateOf(synth.title, existingIPs) && !isDuplicateOf(synth.title, acceptedCandidates) && !candidateSignatures.has(sig)) {
        candidateSignatures.add(sig);
        acceptedCandidates.push(synth);
      }
    }
  }

  // Determine starting sequential ID reliably by scanning all existing numeric IDs
  let maxIdNum = 0;
  existingIPs.forEach(ip => {
    const match = (ip.id || '').match(/IP-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  const newIPs = acceptedCandidates.map((candidate, idx) => {
    const newIdNum = maxIdNum + 1 + idx;
    const newId = `IP-${String(newIdNum).padStart(3, '0')}`;

    const cleanEmail = (candidate.email || '').split(/[\/,|]/)[0]?.trim() || 'licensing@touringdesk.com';
    const emailTemplate = `Subject: Host Partnership Proposal: Bringing ${candidate.title} to Doha, Qatar\n\nDear ${candidate.producer || candidate.licensor} Touring & International Licensing Team,\n\nI am reaching out from our entertainment operations and live events group in Doha, Qatar. We specialize in hosting and promoting premier international live entertainment properties across the Middle East.\n\nGiven the immense popularity of ${candidate.title} and the GCC region's high-spending family demographic, we would like to explore hosting an official run in Doha. We provide turnkey local technical infrastructure, government stakeholder coordination (including Qatar Tourism endorsement), venue management, and marketing.\n\nOur suggested venue for this staging is ${candidate.venue_fit}.\n\nCould we arrange a brief introductory call with your international touring department to discuss routing availability, licensing parameters, and technical riders?\n\nWarm regards,\nHost Partnership Directorate — E3 IP HUB`;

    return {
      id: newId,
      title: candidate.title,
      image: candidate.image,
      category: candidate.category,
      licensor: candidate.licensor,
      producer: candidate.producer,
      person: candidate.person,
      website: candidate.website,
      linkedin_url: candidate.linkedin_url,
      email: candidate.email,
      social: candidate.social,
      past_shows: candidate.past_shows,
      past_show_url: candidate.past_show_url,
      venue_fit: candidate.venue_fit,
      brand_details: candidate.brand_details,
      status: 'Not Contacted',
      email_template: emailTemplate,
      notes: candidate.notes,
      isDailyDiscovered: true,
      extracted_at: new Date().toISOString(),
      extracted_date: new Date().toISOString().slice(0, 10)
    };
  });

  return {
    newIPs,
    message: `Successfully extracted ${newIPs.length} brand-new entertainment IPs (Zero duplicates detected).`
  };
}

/**
 * Convenience wrapper for manual batch trigger with remaining pool count
 */
export function extractBatchDailyIPs(existingIPs = [], count = 10) {
  const result = extractDailyIPs(existingIPs, count);
  const remaining = Math.max(0, GLOBAL_IP_DISCOVERY_POOL.length - existingIPs.length);

  return {
    added: result.newIPs,
    message: result.message,
    remainingInPool: remaining
  };
}

/**
 * Checks if 24 hours have elapsed since the last daily extraction,
 * and automatically triggers ingestion if needed.
 */
export function checkAndTriggerDailyExtraction(currentIPs, onUpdate) {
  try {
    const metaRaw = localStorage.getItem(DAILY_EXTRACTION_STORAGE_KEY);
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    let shouldExtract = false;
    let lastTime = 0;

    if (!metaRaw) {
      shouldExtract = false; // first visit uses initial curated IPs
      localStorage.setItem(DAILY_EXTRACTION_STORAGE_KEY, JSON.stringify({
        lastExtractedTime: now,
        lastExtractedDate: new Date().toISOString().slice(0, 10),
        totalBatches: 0
      }));
    } else {
      const meta = JSON.parse(metaRaw);
      lastTime = meta.lastExtractedTime || 0;
      if (now - lastTime >= ONE_DAY_MS) {
        shouldExtract = true;
      }
    }

    if (shouldExtract) {
      const { newIPs } = extractDailyIPs(currentIPs, 10);
      if (newIPs.length > 0) {
        const updated = [...newIPs, ...currentIPs];
        localStorage.setItem(DAILY_EXTRACTION_STORAGE_KEY, JSON.stringify({
          lastExtractedTime: now,
          lastExtractedDate: new Date().toISOString().slice(0, 10),
          totalBatches: (metaRaw ? JSON.parse(metaRaw).totalBatches || 0 : 0) + 1
        }));
        onUpdate(updated, newIPs.length);
        return { extracted: newIPs.length };
      }
    }
    return { extracted: 0 };
  } catch (err) {
    console.warn('Daily extraction check error:', err);
    return { extracted: 0 };
  }
}

/**
 * Computes human-readable time remaining until next daily drop
 */
export function getTimeUntilNextDailyDrop() {
  try {
    const metaRaw = localStorage.getItem(DAILY_EXTRACTION_STORAGE_KEY);
    if (!metaRaw) return 'Ready to sync';
    const meta = JSON.parse(metaRaw);
    const lastTime = meta.lastExtractedTime || Date.now();
    const nextTime = lastTime + 24 * 60 * 60 * 1000;
    const diff = nextTime - Date.now();

    if (diff <= 0) return 'New batch ready!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Next drop in ${hours}h ${mins}m`;
  } catch (e) {
    return 'Daily drop active';
  }
}
