BEGIN;

-- This fixture is intentionally destructive and is meant for local testing.
TRUNCATE TABLE votes, answers, questions, users RESTART IDENTITY CASCADE;

INSERT INTO users (google_id, email, display_name)
SELECT
    'seed-user-' || user_number,
    'tester' || user_number || '@example.test',
    'Test User ' || user_number
FROM generate_series(1, 10) AS user_number;

CREATE TEMP TABLE seed_question_data (
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    answers TEXT[] NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_question_data (question_number, question_text, answers)
VALUES
    (1, 'Which social platform has the strongest daily trend momentum?', ARRAY['TikTok', 'Instagram', 'YouTube', 'Reddit']),
    (2, 'What is the most popular way to discover new music?', ARRAY['Short-form videos', 'Streaming playlists', 'Music blogs', 'Live shows']),
    (3, 'Which weekend getaway sounds most appealing right now?', ARRAY['Road trip', 'Budget flight', 'Train journey', 'Local staycation']),
    (4, 'Which food trend belongs on more menus?', ARRAY['Smash burgers', 'Korean street food', 'Plant-based dishes', 'Loaded desserts']),
    (5, 'Which everyday footwear style is having the biggest moment?', ARRAY['Chunky sneakers', 'Retro runners', 'Clogs', 'Loafers']),
    (6, 'What is the trendiest way to stay active?', ARRAY['Walking challenges', 'Pickleball', 'Home workouts', 'Group cycling']),
    (7, 'Which entertainment format is easiest to binge?', ARRAY['Short episodes', 'Streaming series', 'Live streams', 'Video podcasts']),
    (8, 'Which home design style feels most current?', ARRAY['Japandi', 'Vintage eclectic', 'Minimalist', 'Color-drenched']),
    (9, 'What is the best way to spend a free evening?', ARRAY['New restaurant', 'Board game night', 'Pop-up event', 'Livestream']),
    (10, 'Which technology is becoming essential at home?', ARRAY['Wearable devices', 'AI assistants', 'Smart sensors', 'Electric vehicles']),
    (11, 'Which coffee order has the most cultural staying power?', ARRAY['Cold brew', 'Matcha latte', 'Cortado', 'Classic drip']),
    (12, 'What is the best kind of city break?', ARRAY['Museum weekend', 'Food tour', 'Concert trip', 'Outdoor adventure']),
    (13, 'Which color is the boldest choice for an outfit?', ARRAY['Cobalt blue', 'Cherry red', 'Lime green', 'Soft lavender']),
    (14, 'What is the most useful desk accessory?', ARRAY['Desk lamp', 'Wireless charger', 'Monitor stand', 'Mechanical keyboard']),
    (15, 'Which party activity gets people talking fastest?', ARRAY['Trivia', 'Karaoke', 'Card games', 'Photo booth']),
    (16, 'What is the most satisfying kind of organization?', ARRAY['Closet reset', 'Digital cleanup', 'Pantry labels', 'Calendar planning']),
    (17, 'Which snack deserves a comeback?', ARRAY['Fruit leather', 'Trail mix', 'Popcorn', 'Rice crackers']),
    (18, 'What is the ideal first meal of the day?', ARRAY['Avocado toast', 'Breakfast burrito', 'Yogurt bowl', 'Pancakes']),
    (19, 'Which reading format fits modern life best?', ARRAY['Printed book', 'E-reader', 'Audiobook', 'Serialized newsletter']),
    (20, 'What makes a neighborhood feel lively?', ARRAY['Cafes', 'Street markets', 'Public art', 'Live music']),
    (21, 'Which creative hobby is easiest to start?', ARRAY['Sketching', 'Pottery', 'Photography', 'Journaling']),
    (22, 'What is the most useful travel item?', ARRAY['Packing cubes', 'Portable battery', 'Travel pillow', 'Reusable bottle']),
    (23, 'Which weather is best for a productive day?', ARRAY['Cool and cloudy', 'Bright and sunny', 'Rainy', 'Crisp and windy']),
    (24, 'What is the best format for a casual hangout?', ARRAY['Brunch', 'Coffee walk', 'Game night', 'Park picnic']),
    (25, 'Which dessert is most worth sharing?', ARRAY['Cheesecake', 'Ice cream sundae', 'Brownies', 'Fruit tart']),
    (26, 'What is the most exciting kind of local event?', ARRAY['Night market', 'Art opening', 'Food festival', 'Outdoor cinema']),
    (27, 'Which plant is best for a beginner?', ARRAY['Snake plant', 'Pothos', 'Succulent', 'Peace lily']),
    (28, 'What is the most enjoyable way to commute?', ARRAY['Walking', 'Cycling', 'Train', 'Carpool']),
    (29, 'Which breakfast drink deserves more attention?', ARRAY['Chai', 'Fresh juice', 'Iced tea', 'Smoothie']),
    (30, 'What is the most stylish kind of jacket?', ARRAY['Bomber', 'Denim', 'Trench coat', 'Utility jacket']),
    (31, 'Which room benefits most from a redesign?', ARRAY['Kitchen', 'Bedroom', 'Living room', 'Home office']),
    (32, 'What is the best way to make a playlist?', ARRAY['By mood', 'By decade', 'By activity', 'By genre']),
    (33, 'Which type of documentary is most compelling?', ARRAY['Nature', 'True crime', 'Biography', 'Science']),
    (34, 'What is the ideal length for a podcast episode?', ARRAY['Under 20 minutes', '30 minutes', 'One hour', 'Two hours']),
    (35, 'Which outdoor activity makes the best group plan?', ARRAY['Hiking', 'Beach day', 'Camping', 'Mini golf']),
    (36, 'What is the most memorable kind of restaurant?', ARRAY['Tiny counter', 'Rooftop dining', 'Food hall', 'Chef tasting menu']),
    (37, 'Which phone feature matters most day to day?', ARRAY['Camera', 'Battery life', 'Screen quality', 'Durability']),
    (38, 'What is the best way to learn a skill?', ARRAY['Online course', 'Practice project', 'Private coach', 'Community group']),
    (39, 'Which kind of photo belongs in a shared album?', ARRAY['Travel moments', 'Food shots', 'Pet photos', 'Unplanned candids']),
    (40, 'What is the most relaxing evening ritual?', ARRAY['Reading', 'Cooking', 'Stretching', 'Watching a series']),
    (41, 'Which office perk would people use most?', ARRAY['Flexible hours', 'Free lunch', 'Learning budget', 'Four-day week']),
    (42, 'What is the best souvenir from a trip?', ARRAY['Local food', 'Handmade object', 'Postcard', 'Photograph']),
    (43, 'Which style of movie night is best?', ARRAY['Classic film', 'New release', 'Cult favorite', 'Documentary double feature']),
    (44, 'What is the strongest reason to visit a museum?', ARRAY['History', 'Design', 'Science', 'Special exhibition']),
    (45, 'Which kind of bag is most practical?', ARRAY['Tote', 'Backpack', 'Crossbody', 'Belt bag']),
    (46, 'What is the best way to make a room feel warmer?', ARRAY['Lighting', 'Textiles', 'Artwork', 'Plants']),
    (47, 'Which sandwich filling is the most versatile?', ARRAY['Grilled vegetables', 'Turkey', 'Tofu', 'Egg salad']),
    (48, 'What is the ideal pace for a vacation?', ARRAY['Slow and local', 'Packed itinerary', 'One activity daily', 'Spontaneous']),
    (49, 'Which kind of market is most fun to browse?', ARRAY['Farmers market', 'Flea market', 'Book market', 'Night market']),
    (50, 'What makes a coffee shop worth returning to?', ARRAY['Great drinks', 'Quiet tables', 'Friendly staff', 'Good music']),
    (51, 'Which app category saves the most time?', ARRAY['Calendar', 'Notes', 'Maps', 'Task manager']),
    (52, 'What is the best kind of gift?', ARRAY['Useful', 'Personalized', 'Handmade', 'An experience']),
    (53, 'Which fitness class sounds most enjoyable?', ARRAY['Dance', 'Yoga', 'Strength', 'Spin']),
    (54, 'What is the most appealing kind of street food?', ARRAY['Tacos', 'Dumplings', 'Noodles', 'Grilled skewers']),
    (55, 'Which design detail changes a space fastest?', ARRAY['Paint', 'Rug', 'Mirror', 'Curtains']),
    (56, 'What is the best way to spend a rainy afternoon?', ARRAY['Bake something', 'Visit a bookstore', 'Play games', 'Watch movies']),
    (57, 'Which kind of news format is easiest to follow?', ARRAY['Daily briefing', 'Weekly magazine', 'Explainer video', 'Email digest']),
    (58, 'What is the most useful kitchen gadget?', ARRAY['Air fryer', 'Immersion blender', 'Rice cooker', 'Food processor']),
    (59, 'Which type of art is best experienced in person?', ARRAY['Sculpture', 'Painting', 'Installation', 'Photography']),
    (60, 'What makes a great first date?', ARRAY['Coffee', 'Mini golf', 'Dinner', 'Museum visit']),
    (61, 'Which type of vacation photo is most iconic?', ARRAY['Landscape', 'Architecture', 'Food', 'Portrait']),
    (62, 'What is the best way to support a local business?', ARRAY['Visit often', 'Leave a review', 'Share online', 'Buy gift cards']),
    (63, 'Which kind of notebook is most satisfying?', ARRAY['Lined', 'Grid', 'Blank', 'Planner']),
    (64, 'What is the best low-cost weekend plan?', ARRAY['Hike', 'Cook together', 'Free concert', 'Neighborhood walk']),
    (65, 'Which type of bread is most versatile?', ARRAY['Sourdough', 'Focaccia', 'Brioche', 'Pita']),
    (66, 'What is the most fun way to explore a new city?', ARRAY['Walking tour', 'Bike rental', 'Transit adventure', 'Local guide']),
    (67, 'Which kind of live event has the best energy?', ARRAY['Concert', 'Sports match', 'Comedy show', 'Theater']),
    (68, 'What is the best upgrade for a morning routine?', ARRAY['Better coffee', 'Earlier start', 'Morning walk', 'No-phone time']),
    (69, 'Which type of shoes works for the most occasions?', ARRAY['White sneakers', 'Chelsea boots', 'Sandals', 'Running shoes']),
    (70, 'What is the most enjoyable way to exercise outdoors?', ARRAY['Trail run', 'Long walk', 'Cycling', 'Kayaking']),
    (71, 'Which kind of content is best for a quick break?', ARRAY['Short video', 'Comic strip', 'Puzzle', 'Music track']),
    (72, 'What is the best centerpiece for a dinner table?', ARRAY['Flowers', 'Candles', 'Fruit bowl', 'Ceramic piece']),
    (73, 'Which type of restaurant is best for groups?', ARRAY['Shared plates', 'Pizza place', 'Food hall', 'Diner']),
    (74, 'What is the best way to make a workspace calmer?', ARRAY['Declutter', 'Add plants', 'Use headphones', 'Change lighting']),
    (75, 'Which hobby produces the best handmade gifts?', ARRAY['Baking', 'Knitting', 'Candle making', 'Painting']),
    (76, 'What is the most exciting type of announcement?', ARRAY['New product', 'Tour dates', 'Menu change', 'Collaboration']),
    (77, 'Which type of tea is best for an afternoon break?', ARRAY['Green tea', 'Earl Grey', 'Oolong', 'Herbal tea']),
    (78, 'What is the best way to discover a new neighborhood?', ARRAY['Follow locals', 'Browse a map', 'Try every cafe', 'Attend an event']),
    (79, 'Which kind of furniture adds the most character?', ARRAY['Vintage chair', 'Bookshelf', 'Coffee table', 'Statement lamp']),
    (80, 'What is the most satisfying thing to declutter?', ARRAY['Inbox', 'Closet', 'Kitchen drawer', 'Photo library']),
    (81, 'Which kind of game is best for a group?', ARRAY['Strategy game', 'Party game', 'Trivia game', 'Cooperative game']),
    (82, 'What is the most useful item to keep in a car?', ARRAY['Blanket', 'First-aid kit', 'Umbrella', 'Phone charger']),
    (83, 'Which kind of festival sounds most appealing?', ARRAY['Music', 'Food', 'Film', 'Design']),
    (84, 'What is the best way to personalize a rental?', ARRAY['Lighting', 'Removable art', 'Textiles', 'Furniture']),
    (85, 'Which type of creative work is easiest to share?', ARRAY['Illustration', 'Short story', 'Song', 'Photo essay']),
    (86, 'What is the best thing to do before a long trip?', ARRAY['Plan meals', 'Download media', 'Pack early', 'Find local tips']),
    (87, 'Which type of weather makes the best photos?', ARRAY['Golden hour', 'Fog', 'Storm clouds', 'Fresh snow']),
    (88, 'What is the most underrated lunch?', ARRAY['Soup', 'Salad', 'Leftovers', 'Sandwich']),
    (89, 'Which kind of public space needs more attention?', ARRAY['Parks', 'Libraries', 'Plazas', 'Bike lanes']),
    (90, 'What is the best way to celebrate a small win?', ARRAY['Favorite meal', 'Call a friend', 'Buy a book', 'Take the day off']),
    (91, 'Which kind of local business is most valuable?', ARRAY['Bakery', 'Hardware store', 'Bookshop', 'Cafe']),
    (92, 'What is the ideal size for a group chat?', ARRAY['Three people', 'Small group', 'Whole team', 'Big community']),
    (93, 'Which type of personal project is most rewarding?', ARRAY['Home upgrade', 'Creative portfolio', 'Garden', 'Side business']),
    (94, 'What is the best kind of reusable item?', ARRAY['Water bottle', 'Shopping bag', 'Food container', 'Coffee cup']),
    (95, 'Which trend should become a permanent habit?', ARRAY['Repairing items', 'Buying local', 'Walking more', 'Sharing resources']),
    (96, 'What is the best way to end a busy week?', ARRAY['Dinner out', 'Quiet night', 'Day trip', 'Friends gathering']),
    (97, 'Which type of visual style feels most optimistic?', ARRAY['Bright color', 'Natural texture', 'Playful pattern', 'Clean lines']),
    (98, 'What is the best reason to learn another language?', ARRAY['Travel', 'Culture', 'Family', 'Career']),
    (99, 'Which kind of weekend breakfast feels most special?', ARRAY['Waffles', 'Shakshuka', 'Bagels', 'French toast']),
    (100, 'What makes an online community feel welcoming?', ARRAY['Good moderation', 'Shared interests', 'Helpful guides', 'Regular events']);

CREATE TEMP TABLE seed_questions (
    id INT NOT NULL,
    question_number INT NOT NULL
) ON COMMIT DROP;

WITH inserted_questions AS (
    INSERT INTO questions (question_text)
    SELECT question_text
    FROM seed_question_data
    RETURNING id, question_text
)
INSERT INTO seed_questions (id, question_number)
SELECT inserted_questions.id, seed_question_data.question_number
FROM inserted_questions
JOIN seed_question_data USING (question_text);

INSERT INTO answers (question_id, answer_text)
SELECT seed_questions.id, answer.answer_text
FROM seed_questions
JOIN seed_question_data ON seed_question_data.question_number = seed_questions.question_number
CROSS JOIN LATERAL unnest(seed_question_data.answers) AS answer(answer_text);

-- Add one deterministic vote per test user per seeded question.
INSERT INTO votes (user_id, question_id, answer_id)
SELECT users.id, seed_questions.id, selected_answer.id
FROM users
CROSS JOIN seed_questions
CROSS JOIN LATERAL (
    SELECT answers.id
    FROM answers
    WHERE answers.question_id = seed_questions.id
    ORDER BY answers.id
    OFFSET ((users.id + seed_questions.question_number) % 4)
    LIMIT 1
) AS selected_answer;

COMMIT;
