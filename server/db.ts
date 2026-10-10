import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'cultureverse.db');
export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      preferred_culture_id TEXT,
      profile_image TEXT,
      biography TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Cultures
  db.exec(`
    CREATE TABLE IF NOT EXISTS cultures (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      greeting TEXT NOT NULL,
      description TEXT NOT NULL,
      hero_subtitle TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );
  `);

  // 3. User Cultural Interests
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_cultural_interests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      culture_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE CASCADE
    );
  `);

  // 4. Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      culture_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'BookOpen',
      FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE CASCADE
    );
  `);

  // 5. Cultural Resources
  db.exec(`
    CREATE TABLE IF NOT EXISTS cultural_resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      culture_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      contributor_id TEXT,
      content_type TEXT NOT NULL, -- 'article', 'oral_history', 'craft_tutorial', 'recipe', 'language', 'interview'
      language TEXT NOT NULL DEFAULT 'English',
      read_time_minutes INTEGER NOT NULL DEFAULT 5,
      media_url TEXT,
      status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'pending', 'published', 'rejected'
      visibility TEXT NOT NULL DEFAULT 'public',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // 6. Resource Sources
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_sources (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL,
      source_title TEXT NOT NULL,
      source_url TEXT,
      author TEXT,
      publication_date TEXT,
      notes TEXT,
      FOREIGN KEY (resource_id) REFERENCES cultural_resources(id) ON DELETE CASCADE
    );
  `);

  // 7. Contributions
  db.exec(`
    CREATE TABLE IF NOT EXISTS contributions (
      id TEXT PRIMARY KEY,
      contributor_id TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      culture_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'English',
      source_references TEXT,
      media_url TEXT,
      permission_status TEXT NOT NULL DEFAULT 'granted',
      status TEXT NOT NULL DEFAULT 'pending', -- 'draft', 'pending', 'approved', 'rejected', 'revision_requested'
      review_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // 8. Courses
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      culture_id TEXT NOT NULL,
      instructor_id TEXT,
      difficulty TEXT NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      price REAL NOT NULL DEFAULT 0.0,
      currency TEXT NOT NULL DEFAULT 'NGN',
      cover_image TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE CASCADE
    );
  `);

  // 9. Course Modules
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  // 10. Lessons
  db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      media_url TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 10,
      position INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
    );
  `);

  // 11. Course Enrolments
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_enrolments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'completed',
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  // 12. Lesson Progress
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  // 13. Saved Resources
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_resources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, resource_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resource_id) REFERENCES cultural_resources(id) ON DELETE CASCADE
    );
  `);

  // 14. Knowledge Gaps
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_gaps (
      id TEXT PRIMARY KEY,
      submitted_by TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      culture_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      why_it_matters TEXT,
      status TEXT NOT NULL DEFAULT 'open', -- 'open', 'claimed', 'resolved'
      votes_count INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // 15. Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  // 16. Payments
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'alatpay',
      provider_reference TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'successful', 'failed'
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // 17. Notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default data if empty
  seedInitialData();
}

function seedInitialData() {
  const countStmt = db.prepare('SELECT count(*) as count FROM cultures');
  const count = (countStmt.get() as { count: number }).count;
  if (count > 0) return;

  console.log('[Database] Seeding initial cultures and core resources...');

  // 1. Seed Cultures
  const insertCulture = db.prepare(`
    INSERT INTO cultures (id, name, slug, greeting, description, hero_subtitle, cover_image, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  insertCulture.run(
    'cult_yoruba',
    'Yoruba Culture',
    'yoruba',
    'Ẹ káàbọ̀! Welcome to Yoruba Heritage.',
    'Discover Yoruba history, language, food, craftsmanship, oral traditions, festivals, and cultural knowledge from West Africa with rich regional lineages.',
    'An ancient civilization rooted in Ilé-Ifẹ̀, philosophical wisdom through Òwe, vibrant textiles of Àṣọ-Òkè, and living oral histories.',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop'
  );

  insertCulture.run(
    'cult_igbo',
    'Igbo Culture',
    'igbo',
    'Nnọọ! Welcome to Igbo Heritage.',
    'Explore Igbo history, language, food, arts, oral traditions, festivals, and community heritage across southeastern Nigeria and diaspora.',
    'Celebrated egalitarian democratic governance, intricate Akwete textile weaving, the sacred rhythm of the Iri Ji New Yam festival, and rich proverb traditions.',
    'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1200&auto=format&fit=crop'
  );

  insertCulture.run(
    'cult_hausa',
    'Hausa Culture',
    'hausa',
    'Sannu da zuwa! Welcome to Hausa Heritage.',
    'Discover Hausa history, language, food, architecture, oral traditions, festivals, and cultural craftsmanship originating across the Sahel and northern savannahs.',
    'Magnificent Tubali earthen architecture, the millennium-old indigo dye pits of Kofar Mata in Kano, poetic oral wisdom, and the historic Durbar festivals.',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop'
  );

  // 2. Seed Users: Admin & Cultural Contributors
  const passwordHash = bcrypt.hashSync('cultureverse123', 10);
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, preferred_culture_id, biography, profile_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'usr_admin',
    'Adebayo Ogunlesi',
    'admin@cultureverse.org',
    passwordHash,
    'admin',
    'cult_yoruba',
    'Curator and Archival Historian specializing in West African cultural preservation and oral history digitization.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  );

  insertUser.run(
    'usr_contributor_yoruba',
    'Mama Olufunmilayo Adeleke',
    'adeleke@cultureverse.org',
    passwordHash,
    'user',
    'cult_yoruba',
    'Master weaver of Àṣọ-Òkè in Iseyin, Oyo State, with over 38 years preserving traditional loom techniques and dye formulas.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'
  );

  insertUser.run(
    'usr_contributor_igbo',
    'Dr. Chukwudi Nwachukwu',
    'nwachukwu@cultureverse.org',
    passwordHash,
    'user',
    'cult_igbo',
    'Linguist, folklorist, and researcher of Igbo oral literature, proverbs, and pre-colonial indigenous institutions.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
  );

  insertUser.run(
    'usr_contributor_hausa',
    'Mallam Ibrahim Danbatta',
    'danbatta@cultureverse.org',
    passwordHash,
    'user',
    'cult_hausa',
    'Traditional architect and historian from Old Kano City, preserving Tubali earthen construction and decorative relief motifs.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
  );

  // 3. Seed Categories
  const insertCat = db.prepare(`
    INSERT INTO categories (id, culture_id, name, slug, description, icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Yoruba Categories
  insertCat.run('cat_yo_history', 'cult_yoruba', 'History and Origins', 'history', 'From Ilé-Ifẹ̀ cosmology and the Ọ̀yọ́ Empire to modern historical documents.', 'Landmark');
  insertCat.run('cat_yo_language', 'cult_yoruba', 'Language and Expressions', 'language', 'Tonal dynamics, polite address (Ẹ̀bẹ́), and idiomatic linguistic expressions.', 'Languages');
  insertCat.run('cat_yo_proverbs', 'cult_yoruba', 'Proverbs and Wisdom', 'proverbs', 'Òwe Yorùbá: The horses of speech used to unlock complex dilemmas.', 'Quote');
  insertCat.run('cat_yo_food', 'cult_yoruba', 'Food and Cuisine', 'food', 'Traditional preparations of Àmàlà, Gbẹ̀gìrì, Ẹ̀fọ́ Rírò, and celebratory feasts.', 'Utensils');
  insertCat.run('cat_yo_textiles', 'cult_yoruba', 'Textiles and Àṣọ-Òkè', 'textiles', 'Sányán, Àlàárì, Ẹtù looms, dyeing methods, and cultural dress etiquette.', 'Shirt');
  insertCat.run('cat_yo_crafts', 'cult_yoruba', 'Arts and Craftsmanship', 'crafts', 'Lost-wax bronze casting, wood carving, and beadwork of crown makers.', 'Hammer');
  insertCat.run('cat_yo_stories', 'cult_yoruba', 'Oral Stories and Folktales', 'stories', 'Àlọ́ Àpamọ̀ and folktales of Ìjàpá the tortoise teaching moral wisdom.', 'Scroll');
  insertCat.run('cat_yo_festivals', 'cult_yoruba', 'Festivals and Celebrations', 'festivals', 'Osun Osogbo sacred grove, Ojúde Ọba, Ọlọ́jọ́, and Ẹ̀yọ̀ celebrations.', 'Sparkles');
  insertCat.run('cat_yo_music', 'cult_yoruba', 'Music and Dance', 'music', 'Talking drum (Dùndún), Bàtá rhythms, and sacred court poetry.', 'Music');
  insertCat.run('cat_yo_naming', 'cult_yoruba', 'Naming Practices and Oríkì', 'naming', 'Circumstantial names, lineage praise poetry (Oríkì), and child dedication.', 'UserCheck');

  // Igbo Categories
  insertCat.run('cat_ig_history', 'cult_igbo', 'History and Origins', 'history', 'The Nri Kingdom, Igbo-Ukwu bronzes, and village democracy.', 'Landmark');
  insertCat.run('cat_ig_language', 'cult_igbo', 'Language and Expressions', 'language', 'Asụsụ Igbo dialects, central standard, idioms, and tonal greetings.', 'Languages');
  insertCat.run('cat_ig_proverbs', 'cult_igbo', 'Proverbs and Wisdom', 'proverbs', 'Ilu Igbo: Palm oil with which words are eaten.', 'Quote');
  insertCat.run('cat_ig_food', 'cult_igbo', 'Food and Cuisine', 'food', 'Ofe Owerri, Oha soup, Ji (yam) traditions, and culinary rituals.', 'Utensils');
  insertCat.run('cat_ig_textiles', 'cult_igbo', 'Traditional Textiles and Attire', 'textiles', 'Akwete woven cloth, Isiagu motifs, and sacred ceremonial wrappers.', 'Shirt');
  insertCat.run('cat_ig_crafts', 'cult_igbo', 'Arts and Craftsmanship', 'crafts', 'Igbo-Ukwu metallurgy, Uli body and wall art motifs, and mask carving.', 'Hammer');
  insertCat.run('cat_ig_stories', 'cult_igbo', 'Oral Stories and Folktales', 'stories', 'Akụkọ Ifo told around firesides exploring tortoise, spirit world, and morality.', 'Scroll');
  insertCat.run('cat_ig_festivals', 'cult_igbo', 'Festivals and Celebrations', 'festivals', 'Iri Ji (New Yam Festival), masquerade traditions, and community gatherings.', 'Sparkles');

  // Hausa Categories
  insertCat.run('cat_ha_history', 'cult_hausa', 'History and Origins', 'history', 'The Hausa Bakwai states, historic city walls of Kano, and trans-Saharan trade.', 'Landmark');
  insertCat.run('cat_ha_language', 'cult_hausa', 'Language and Expressions', 'language', 'Harshen Hausa, Ajami manuscript traditions, and honorific forms.', 'Languages');
  insertCat.run('cat_ha_proverbs', 'cult_hausa', 'Proverbs and Wisdom', 'proverbs', 'Karin Magana: The concise philosophical foundations of everyday life.', 'Quote');
  insertCat.run('cat_ha_food', 'cult_hausa', 'Food and Cuisine', 'food', 'Tuwo Shinkafa, Miyan Kuka, Dan Wake, and culinary heritage of the Savannah.', 'Utensils');
  insertCat.run('cat_ha_architecture', 'cult_hausa', 'Architecture and Craftsmanship', 'architecture', 'Tubali sun-dried earth buildings, engraved facade murals, and leatherwork.', 'Home');
  insertCat.run('cat_ha_crafts', 'cult_hausa', 'Textiles and Dyeing', 'textiles', 'Kofar Mata indigo pits in Kano, embroidery on Babban Riga, and cap weaving.', 'Shirt');
  insertCat.run('cat_ha_festivals', 'cult_hausa', 'Festivals and Celebrations', 'festivals', 'The grand Durbar cavalry parades, Hawan Daushe, and musical pageantry.', 'Sparkles');

  // 4. Seed Cultural Resources
  const insertResource = db.prepare(`
    INSERT INTO cultural_resources (
      id, title, slug, summary, content, culture_id, category_id, contributor_id,
      content_type, language, read_time_minutes, media_url, status, visibility, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 'public', CURRENT_TIMESTAMP)
  `);

  const insertSource = db.prepare(`
    INSERT INTO resource_sources (id, resource_id, source_title, source_url, author, publication_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Yoruba Resources
  insertResource.run(
    'res_yo_asooke',
    'Understanding Àṣọ-Òkè: The Sacred Threads of Prestige',
    'understanding-aso-oke',
    'A comprehensive study of the traditional hand-loomed cloth of the Yoruba people, examining its three classical varieties: Sányán, Àlàárì, and Ẹtù.',
    `Àṣọ-Òkè (literally meaning "top cloth" or "prestige cloth") is a hand-woven fabric created by the Yoruba people of southwestern Nigeria. Originating centuries ago in historic textile centres such as Iseyin, Oyo, and Osogbo, Àṣọ-Òkè represents far more than festive attire; it is an enduring archive of social history, family lineage, and artistic mastery.

The Three Classical Varieties:
1. Sányán: Woven from natural wild raw silk gathered from the cocoons of the Anaphe silkworm, producing an earthy beige or ecru tone. Sányán is considered the premier cloth of royalty and deep dignity.
2. Àlàárì: Characterized by rich magenta or crimson threads, historically achieved through vegetable and mineral dyes, often combined with cotton accents.
3. Ẹtù: Named after the guinea fowl because of its deep indigo base patterned with subtle white pinstripes, signifying solemn nobility and seniority.

The Weaving Process:
Woven on narrow horizontal treadle looms (primarily operated by men in traditional guilds) or vertical broad looms (traditionally operated by women), weavers execute intricate patterns using supplementary floating wefts. The resulting strips (ọ̀já or ìbòsí) are carefully matched and stitched together by skilled tailors into majestic Agbádá for men and Ìró, Bùbá, and Gèlè for women.

Today, while modern synthetic threads have expanded the color palette, the foundational principles of hand-looming remain a living art preserved by generational families across Yoruba communities.`,
    'cult_yoruba',
    'cat_yo_textiles',
    'usr_contributor_yoruba',
    'article',
    'English / Yoruba',
    7,
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop'
  );
  insertSource.run('src_yo_1', 'res_yo_asooke', 'Cloth of the Elders: Yoruba Textiles and History', 'https://jstor.org/stable/example', 'Clarke, Duncan', '1997', 'Fieldwork in Iseyin and Oyo royal palaces');

  insertResource.run(
    'res_yo_amala',
    'An Introduction to Àmàlà, Gbẹ̀gìrì, and Àtìkè: Gastronomy of the Ọ̀yọ́ Lineage',
    'introduction-to-amala-and-gbegiri',
    'Explore the agricultural origins, fermentation of yam tubers into èlùbọ́, and the communal warmth of eating Àmàlà with brown bean soup and ewédú.',
    `Food in Yoruba cosmology is not merely sustenance; it is a communion between soil, lineage, and hospitality. Among the varied delicacies of the Yoruba, none carries as much cultural weight in Oyo, Ibadan, and Osun as Àmàlà.

The Creation of Èlùbọ́:
Àmàlà begins with freshly harvested white yams (Iṣu). The yams are peeled, sliced, parboiled in water, and sun-dried on clean mats or concrete courtyards over several days until completely dehydrated. This drying turns the yam slices dark brown or near-black through natural enzyme oxidation. The dried pieces, known as gbòdògí, are subsequently milled into a fine flour called èlùbọ́.

The Culinary Symphony (Abula):
Àmàlà is best eaten hot, expertly turned with a wooden spatula (omorógun) into a velvety, lump-free texture. It is classically served with:
- Gbẹ̀gìrì: A silky, slow-cooked soup made from peeled brown beans, infused with pure palm oil and locust beans (iru).
- Ewédú: Jute leaves blended and cooked with a pinch of potash and seasoned with ground crayfish and iru.
- Ọbẹ̀ Ata: A spicy pepper stew containing goat meat or assorted tripe.

When Gbẹ̀gìrì and Ewédú are combined over the dark Àmàlà, the dish is known as 'Àbùlà'. It represents harmony, generosity, and the celebratory spirit of Yoruba social life.`,
    'cult_yoruba',
    'cat_yo_food',
    'usr_contributor_yoruba',
    'recipe',
    'English / Yoruba',
    6,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop'
  );
  insertSource.run('src_yo_2', 'res_yo_amala', 'Yoruba Culinary Heritage and Food Ethnomedicine', 'https://example.org/yoruba-food', 'Prof. B. O. Osuntokun', '2004', 'Monograph on dietary habits in southwest Nigeria');

  insertResource.run(
    'res_yo_proverbs',
    'Òwe Yorùbá: The Philosophy and Jurisprudence of Yoruba Proverbs',
    'owe-yoruba-philosophy',
    'A study of twenty essential Yoruba proverbs, how elders employ them in dispute arbitration, and their role as repositories of moral law.',
    `The Yoruba state: "Òwe lẹṣin ọ̀rọ̀, bí ọ̀rọ̀ bá sọnù, òwe la fi ń wá a" — Proverbs are the horses of speech; when communication is lost, it is a proverb we employ to retrieve it.

Proverbs in Yoruba society serve as shorthand for philosophical treaties. They are not merely ornamental sayings; they function as legal precedents in town meetings, pedagogical instruments for children, and diplomatic de-escalation tools in heated disputes.

Key Examples and Interpretations:
1. "Àì tètè mọ̀lẹ̀, olè ń mú olóko."
Literal: Because dawn was slow to break, the farm owner was seized and called a thief.
Cultural Application: Misunderstanding arises when timing and transparency are lacking. Caution against premature judgment.

2. "Ilé la ti ń kọ́ ẹ̀ṣọ́ ròde."
Literal: It is from home that one learns elegance and decorum before stepping into society.
Cultural Application: Character (Ìwà) is cultivated in the family unit; civic responsibility starts at the hearth.

3. "Àgbájọ ọwọ́ la fi ń sọ̀yà; ọwọ́ kan kò gbẹ́rù dé orí."
Literal: It is with all fingers together that one strikes their chest; a single hand cannot lift a heavy load onto the head.
Cultural Application: Collectivism and communal solidarity over isolated individualism.`,
    'cult_yoruba',
    'cat_yo_proverbs',
    'usr_admin',
    'article',
    'English / Yoruba',
    8,
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop'
  );
  insertSource.run('src_yo_3', 'res_yo_proverbs', 'Yoruba Proverbs: Their Structure, Meaning, and Usage', 'https://example.org/proverbs', 'Oyekan Owomoyela', '2005', 'University of Nebraska Press');

  insertResource.run(
    'res_yo_ogun',
    'Ògún in Yoruba Thought: Technology, Metallurgy, and Ethical Responsibility',
    'ogun-technology-and-ethics',
    'Beyond myth: Understanding Ògún as the archetypal patron of blacksmiths, engineers, clearing paths, and the solemn oath of justice sworn on iron.',
    `In Yoruba philosophical and religious history, Ògún occupies a unique position as the primordial pioneer who cut through impenetrable wilderness with his iron cutlass to open pathways for civilization.

Ògún is the patron of all who work with metals: blacksmiths (Àgbẹ̀dẹ), hunters (Ọdẹ), woodcarvers (Gbẹ́nàgbẹ́nà), farmers, and in contemporary times, automobile drivers and mechanical engineers.

The Ethical Compact of Iron:
Because iron has the power to both cultivate the earth (the hoe) and take life (the machete), devotion to Ògún is rooted in rigorous ethical accountability. In traditional Yoruba judicial courts, an oath sworn while biting iron (such as a gun barrel, machete blade, or iron talisman) was regarded with absolute finality; it was believed that Ògún never tolerated falsehood.

Today, cultural historians emphasize that Ògún is an allegory for human technological ingenuity — a reminder that technological mastery without ethical wisdom brings catastrophe.`,
    'cult_yoruba',
    'cat_yo_history',
    'usr_admin',
    'article',
    'English / Yoruba',
    9,
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop'
  );

  // Igbo Resources
  insertResource.run(
    'res_ig_akwete',
    'Akwete Cloth: The Indigenous Geometry and Weaving of Ndoki Women',
    'akwete-cloth-indigenous-geometry',
    'Discover the unique vertical loom techniques developed by women in Akwete, Abia State, producing symbolic geometric tapestries and ceremonial regalia.',
    `Akwete cloth is a distinctive hand-woven textile originating from the town of Akwete in Ukwa East, Abia State, southeastern Nigeria. Unlike many African weaving traditions where men operate narrow strip looms, Akwete weaving has historically been the exclusive domain of women working on upright vertical continuous-string looms.

Symbolism and Geometric Motifs:
The weavers invent motifs through inspiration, dreams, and historical events. Common motifs include:
- Ebe (The Cross / Protective charm): Symbolizing sacred balance and safety.
- Ikaki (The Tortoise): Representing endurance, ancient wisdom, and longevity.
- Nnadiekwe: A complex motif commemorating lineage agreement and family consensus.

Akwete cloth is prized throughout Igboland for chieftaincy installations, high-prestige weddings, and festive assemblies, reflecting the intellectual autonomy and economic agency of Igbo women.`,
    'cult_igbo',
    'cat_ig_textiles',
    'usr_contributor_igbo',
    'article',
    'English / Igbo',
    6,
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop'
  );
  insertSource.run('src_ig_1', 'res_ig_akwete', 'Nigerian Weaving: Akwete and Southern Traditions', 'https://example.org/akwete', 'Aronson, Lisa', '1980', 'African Arts research journal');

  insertResource.run(
    'res_ig_iriji',
    'Iri Ji Ndi Igbo: The Sacred Rites and Social Unity of the New Yam Festival',
    'iri-ji-new-yam-festival',
    'Examine the centrality of yam (Ji) as king of crops in Igbo cosmology, marking harvest, ancestral thanksgiving, and community reconciliation.',
    `In Igbo civilization, Yam (Ji) is regarded as the king of agricultural crops. It is not simply staple nutrition; it is an embodiment of manliness, agricultural discipline, and ancestral grace.

The festival of Iri Ji (or Iwa Ji) occurs between August and October across Igbo communities. Before any community member may consume the newly harvested yam, the chief elder or traditional ruler (Eze) must perform the ceremonial cutting and thanksgiving to Ala (the earth deity) and the ancestors who protected the planting season.

The roasted yam is dipped in fresh red palm oil seasoned with utazi leaves and eaten communally. The festival serves as an annual homecoming where disputes between kinsmen (Umunna) are reconciled and new developmental agendas for the village are declared.`,
    'cult_igbo',
    'cat_ig_festivals',
    'usr_contributor_igbo',
    'article',
    'English / Igbo',
    8,
    'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200&auto=format&fit=crop'
  );

  // Hausa Resources
  insertResource.run(
    'res_ha_tubali',
    'Tubali: Earthen Architecture and Façade Geometry of Hausaland',
    'tubali-hausa-earthen-architecture',
    'The engineering marvel of sun-dried pear-shaped mud bricks, vaulted domes (baka), and ornate plaster relief symbols across historic northern city walls.',
    `The traditional architecture of the Hausa people, known locally as Tubali, represents one of the most sophisticated vernacular building traditions in Africa. Developed over centuries in cities like Kano, Katsina, Zaria, and Daura, Tubali structures are engineered specifically for the harsh climate of the Sudan and Sahel savannahs.

Materials and Construction:
- Tubali bricks: Hand-molded conical or pear-shaped bricks made from clay mixed with grass, animal hair, and horse dung, dried in the dry-season sun.
- Azara timber: The termite-resistant trunk of the male deleb palm (Dum palm) is used to create cantilevered corbels and vaulted arches (baka) that support massive earthen flat roofs.
- Makuba: A water-resistant plaster made from locust bean pods that hardens to a smooth weather-proof skin.

Façade Relief Ornamentation (Zane):
Master builders create intricate carved relief symbols on the front walls of palaces and residences. These include geometric patterns, northern knots (Dagin Arewa), crescent shapes, and domestic emblems reflecting the owner's status and cultural heritage.`,
    'cult_hausa',
    'cat_ha_architecture',
    'usr_contributor_hausa',
    'article',
    'English / Hausa',
    8,
    'https://images.unsplash.com/photo-1548625361-195fe57876a3?q=80&w=1200&auto=format&fit=crop'
  );
  insertSource.run('src_ha_1', 'res_ha_tubali', 'Hausa Traditional Architecture', 'https://example.org/tubali', 'Dmochowski, Z. R.', '1990', 'Ethnographica London');

  insertResource.run(
    'res_ha_dyeing',
    'The Kofar Mata Dye Pits of Kano: 500 Years of Natural Indigo Alchemy',
    'kofar-mata-dye-pits-kano',
    'Step into Kano’s historic dye pits established in 1498 AD, exploring the natural fermentation of indigo leaves and potash still practiced today.',
    `Founded in 1498 during the reign of Sarkin Kano Muhammadu Rumfa, the Kofar Mata dye pits in Kano City are among the oldest surviving industrial craftsmanship centres in West Africa.

For over five centuries, master dyers have handed down the precise science of indigo coloration:
1. The Pits: Deep earthen cylinders sunk four to five meters into the ground.
2. The Fermentation: Fresh indigo plant leaves (Baba) are crushed and mixed with ash residue (Katsi) and potash water, allowed to ferment naturally over weeks until the broth develops a vibrant metallic sheen.
3. The Resist Techniques: White cotton cloth is tied, stitched with raffia, or folded into geometric repeat grids before immersion.

The resulting deep midnight blue cloth with bronze iridescent luster was traded along trans-Saharan camel caravans as far as Tripoli, Cairo, and Timbuktu. Today, the guild continues to preserve these pits against modern chemical dye competition.`,
    'cult_hausa',
    'cat_ha_crafts',
    'usr_contributor_hausa',
    'article',
    'English / Hausa',
    7,
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop'
  );

  // 5. Seed Courses
  const insertCourse = db.prepare(`
    INSERT INTO courses (
      id, title, slug, description, culture_id, instructor_id,
      difficulty, duration_minutes, price, currency, cover_image, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NGN', ?, 'published')
  `);

  const insertModule = db.prepare(`
    INSERT INTO course_modules (id, course_id, title, description, position)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, module_id, title, content, duration_minutes, position)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Course 1: Yoruba Heritage Intro (Free)
  insertCourse.run(
    'crs_yo_intro',
    'Foundations of Yoruba Heritage & Cultural Philosophy',
    'foundations-of-yoruba-heritage',
    'An immersive foundational course covering the origin cosmologies of Ilé-Ifẹ̀, sacred greetings, communal ethics (Ìwà Rere), and the significance of lineage praise (Oríkì).',
    'cult_yoruba',
    'usr_admin',
    'Beginner',
    90,
    0.0,
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop'
  );
  insertModule.run('mod_yo_1', 'crs_yo_intro', 'Module 1: Origins and Cosmogony of Ilé-Ifẹ̀', 'Understanding historical narratives and the sacred cradle of the Yoruba.', 1);
  insertLesson.run('les_yo_1', 'mod_yo_1', 'Lesson 1.1: The Sacred Soil and Obatala & Oduduwa Traditions', 'In Yoruba cosmology, Ilé-Ifẹ̀ is revered as the spiritual dawn of humanity where the earth was first formed from a handful of sacred soil spread upon primordial waters by a five-toed cockerel.\n\nHistorical analysis balances these cosmological traditions with archaeological findings that reveal ancient Ifẹ̀ as a flourishing urban and artistic metropolis between the 11th and 14th centuries.', 15, 1);
  insertLesson.run('les_yo_2', 'mod_yo_1', 'Lesson 1.2: Ìwà Rere — The Concept of Good Character as the Highest Virtue', 'Unlike systems centered strictly on doctrinal dogma, Yoruba indigenous ethics centers upon Ìwà (Character). The elders say: "Ìwà lẹwà ọmọ ènìyàn" — Good character is the true beauty of a human being.\n\nKey pillars include Òtítọ́ (Truthfulness), Sùúrù (Patience), Ọ̀wọ̀ (Respect for elders and reciprocity), and Ẹ̀tọ́ (Fairness in civic dealings).', 20, 2);

  insertModule.run('mod_yo_2', 'crs_yo_intro', 'Module 2: Living Traditions and Oríkì', 'Lineage praise poetry and societal rites.', 2);
  insertLesson.run('les_yo_3', 'mod_yo_2', 'Lesson 2.1: The Anatomy of Oríkì (Lineage Praise Poetry)', 'Oríkì is vocal poetry that records deeds of ancestors, virtues of families, and character of towns. Chanted at naming ceremonies, marriages, and festivals, it connects individuals with centuries of ancestral resilience.', 25, 1);

  // Course 2: Àṣọ-Òkè Masterclass (Paid)
  insertCourse.run(
    'crs_yo_asooke_craft',
    'Mastering Traditional Àṣọ-Òkè: Loom Techniques & Design',
    'mastering-aso-oke-weaving',
    'Learn directly from master weaver Mama Olufunmilayo Adeleke the mechanics of treadle looms, thread preparation, and authentic pattern generation.',
    'cult_yoruba',
    'usr_contributor_yoruba',
    'Intermediate',
    180,
    7500.0,
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop'
  );
  insertModule.run('mod_yo_aso_1', 'crs_yo_asooke_craft', 'Module 1: Fiber Selection and Dye Formulation', 'Natural silk cocoons, indigo vats, and cotton warping.', 1);
  insertLesson.run('les_yo_aso_1', 'mod_yo_aso_1', 'Lesson 1.1: Preparing the Warp (Tìràn) and Treadles', 'The warp threads are aligned along pegs stretched across the weaving yard. Tension is maintained with heavy stones dragging across the soil.', 30, 1);
  insertLesson.run('les_yo_aso_2', 'mod_yo_aso_1', 'Lesson 1.2: Weaving Supplementary Floating Wefts (Ọ̀nà)', 'How master weavers incorporate floating threads to create personalized family insignias and geometric windows within the woven strip.', 35, 2);

  // Course 3: Igbo Heritage Intro (Free)
  insertCourse.run(
    'crs_ig_intro',
    'Exploring Igbo Cultural Heritage: Language, Wisdom & Polity',
    'exploring-igbo-heritage',
    'Explore the philosophical worldview of Chi, the communal balance of Umunna democracy, and introductory Asụsụ Igbo proverbs.',
    'cult_igbo',
    'usr_contributor_igbo',
    'Beginner',
    75,
    0.0,
    'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1200&auto=format&fit=crop'
  );
  insertModule.run('mod_ig_1', 'crs_ig_intro', 'Module 1: The Igbo Worldview and Metaphysics', 'Chukwu, Chi, and Ala the mother earth.', 1);
  insertLesson.run('les_ig_1', 'mod_ig_1', 'Lesson 1.1: The Chi Concept: Personal Destiny and Resilience', 'In Igbo thought, every individual possesses a Chi — a personal spiritual counterpart granted by Chukwu (the Supreme Creator). "Onye kwe, Chi ya ekwe" (When a person affirms determination, their Chi affirms with them).', 20, 1);
  insertLesson.run('les_ig_2', 'mod_ig_1', 'Lesson 1.2: Umunna and Grassroots Village Democracy', 'Traditional Igbo political systems did not construct centralized autocratic monarchies; decisions were reached through vigorous participatory consensus in the Umunna assembly.', 25, 2);

  // Course 4: Hausa Architecture & Craft (Paid)
  insertCourse.run(
    'crs_ha_arch',
    'Tubali Architecture: Sustainable Earthen Engineering of Northern Nigeria',
    'tubali-hausa-architecture-course',
    'An architectural masterclass on earth-brick masonry, natural thermo-regulation, dome construction, and facade ornamentation in ancient Hausa cities.',
    'cult_hausa',
    'usr_contributor_hausa',
    'Intermediate',
    120,
    6000.0,
    'https://images.unsplash.com/photo-1548625361-195fe57876a3?q=80&w=1200&auto=format&fit=crop'
  );
  insertModule.run('mod_ha_1', 'crs_ha_arch', 'Module 1: The Chemistry and Craft of Mud Construction', 'Soil blending, fibrous binders, and solar curing.', 1);
  insertLesson.run('les_ha_1', 'mod_ha_1', 'Lesson 1.1: Clay Formulation and Pear-Brick Curing', 'Understanding why conical Tubali bricks lock together with mortared mud to create earth walls that breathe and maintain interior coolness during 42°C heat.', 30, 1);

  // 6. Seed Knowledge Gaps
  const insertGap = db.prepare(`
    INSERT INTO knowledge_gaps (id, submitted_by, title, description, culture_id, category_id, why_it_matters, status, votes_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)
  `);

  insertGap.run(
    'gap_1',
    'usr_admin',
    'Documenting the Sacred Herbal Medicine Preparation of Awori Lineages',
    'Comprehensive oral documentation of endangered plant names and traditional healing preparations preserved in rural Awori settlements around Lagos state.',
    'cult_yoruba',
    'cat_yo_history',
    'Rapid urban sprawl is displacing elder herbalists before their botanical taxonomy is recorded for younger generations.',
    24
  );

  insertGap.run(
    'gap_2',
    'usr_admin',
    'Oral Histories of the Igbo-Ukwu Bronze Smelters',
    'Local accounts and familial oral histories of metalsmith families in Anambra tracing metallurgy back to 9th century copper-alloy casting.',
    'cult_igbo',
    'cat_ig_crafts',
    'Pre-colonial metallurgical techniques are rarely recorded in textbooks and risk fading from living memory.',
    19
  );

  insertGap.run(
    'gap_3',
    'usr_admin',
    'The Musical Poetics of the Hausa Kalangu (Talking Drum)',
    'Rhythm notations and speech surrogate phrases played during harvest ceremonies and royal greetings across Sokoto and Kano.',
    'cult_hausa',
    'cat_ha_festivals',
    'Preserves the endangered tonal vocabulary of savannah percussionists.',
    16
  );

  // Default enrolment for Admin in the free Yoruba intro course to demonstrate progress immediately
  const insertEnrol = db.prepare(`
    INSERT INTO course_enrolments (id, user_id, course_id, payment_status, enrolled_at)
    VALUES (?, ?, ?, 'completed', CURRENT_TIMESTAMP)
  `);
  insertEnrol.run('enr_admin_yo', 'usr_admin', 'crs_yo_intro');

  const insertProgress = db.prepare(`
    INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, completed_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  insertProgress.run('prg_1', 'usr_admin', 'les_yo_1', 'crs_yo_intro');

  console.log('[Database] Seed data successfully populated!');
}
